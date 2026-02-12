from flask import Flask, request, jsonify
from flask_cors import CORS
from recommandations import generate_recommendations

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    Endpoint to generate AI recommendations
    
    Expected JSON body:
    {
        "personal": {
            "age": 30,
            "height": 175,
            "weight": 70
        },
        "healthAverages": {
            "heartBeat": 75,
            "tension": 118,
            "temperature": 36.8,
            "fatigue": 45,
            "cough": 15,
            "ambiance": 55
        }
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'personal' not in data or 'healthAverages' not in data:
            return jsonify({
                'error': 'Missing required data',
                'message': 'Please provide both personal and healthAverages data'
            }), 400
        
        # Generate recommendations
        recommendations_text = generate_recommendations(data)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations_text,
            'userProfile': data['personal']
        }), 200
        
    except Exception as e:
        print(f"Error generating recommendations: {str(e)}")
        return jsonify({
            'error': 'Failed to generate recommendations',
            'message': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'GAIA AI Recommendations API'
    }), 200

# ==================== MOBILE APP ENDPOINTS ====================

# In-memory storage for health data (replace with database in production)
health_data_store = {}
pairing_connections = {}  # Maps pairing codes to userIds

@app.route('/api/verify-pairing', methods=['POST'])
def verify_pairing():
    """
    Verify pairing code and establish connection
    Expected: { "pairingCode": "ABC123", "userId": "user_123" }
    """
    try:
        data = request.get_json()
        pairing_code = data.get('pairingCode')
        user_id = data.get('userId')
        
        if not pairing_code or not user_id:
            return jsonify({'success': False, 'message': 'Missing pairing code or user ID'}), 400
        
        # Store the connection
        pairing_connections[pairing_code] = user_id
        
        print(f"✅ Pairing established: {pairing_code} → {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Pairing successful',
            'userId': user_id
        }), 200
        
    except Exception as e:
        print(f"❌ Error verifying pairing: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/check-pairing', methods=['GET'])
def check_pairing():
    """
    Check if a device has paired with this code
    Query parameter: pairingCode
    """
    try:
        pairing_code = request.args.get('pairingCode')
        
        if not pairing_code:
            return jsonify({'success': False, 'message': 'Missing pairing code'}), 400
        
        user_id = pairing_connections.get(pairing_code)
        
        if user_id:
            return jsonify({
                'success': True,
                'connected': True,
                'userId': user_id
            }), 200
        else:
            return jsonify({
                'success': True,
                'connected': False
            }), 200
            
    except Exception as e:
        print(f"❌ Error checking pairing: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/sync-health', methods=['POST'])
def sync_health_data():
    """
    Endpoint to receive health data from GAIA Mobile app
    
    Accepts both formats:
    1. Old format (flat): { userId, timestamp, heartRate, bloodPressureSystolic, ... }
    2. New format (nested): { userId, timestamp, healthData: { heartRate: {...}, ... } }
    """
    try:
        data = request.get_json()
        
        print(f"📥 Received sync request: {data}")
        
        # Validate userId
        if not data or 'userId' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required data',
                'message': 'Please provide userId'
            }), 400
        
        user_id = data['userId']
        timestamp = data.get('timestamp')
        
        # Check if data is in flat format (from mobile app) or nested format
        if 'healthData' in data:
            # New nested format
            health_data = data['healthData']
        else:
            # Flat format from mobile - convert to nested format
            health_data = {
                'heartRate': {'value': data.get('heartRate'), 'unit': 'bpm', 'timestamp': timestamp} if data.get('heartRate') else None,
                'bloodPressure': {
                    'systolic': data.get('bloodPressureSystolic'),
                    'diastolic': data.get('bloodPressureDiastolic'),
                    'unit': 'mmHg',
                    'timestamp': timestamp
                } if data.get('bloodPressureSystolic') else None,
                'temperature': {'value': data.get('bodyTemperature'), 'unit': 'celsius', 'timestamp': timestamp} if data.get('bodyTemperature') else None,
                'steps': {'value': data.get('steps'), 'timestamp': timestamp} if data.get('steps') else None,
                'sleep': {'duration': data.get('sleepDuration'), 'unit': 'hours', 'timestamp': timestamp} if data.get('sleepDuration') else None,
                'oxygenSaturation': {'value': data.get('oxygenSaturation'), 'unit': 'percent', 'timestamp': timestamp} if data.get('oxygenSaturation') else None,
                'stressLevel': {'value': data.get('stressLevel'), 'unit': 'percent', 'timestamp': timestamp} if data.get('stressLevel') else None,
                'calories': {'value': data.get('calories'), 'unit': 'kcal', 'timestamp': timestamp} if data.get('calories') else None,
                'distance': {'value': data.get('distance'), 'unit': 'km', 'timestamp': timestamp} if data.get('distance') else None,
                'weight': {'value': data.get('weight'), 'unit': 'kg', 'timestamp': timestamp} if data.get('weight') else None,
                'height': {'value': data.get('height'), 'unit': 'meters', 'timestamp': timestamp} if data.get('height') else None
            }
            
            # Remove None values
            health_data = {k: v for k, v in health_data.items() if v is not None}
        
        # Store health data (in production, save to database)
        health_data_store[user_id] = {
            'healthData': health_data,
            'lastUpdated': timestamp,
            'syncTimestamp': timestamp
        }
        
        print(f"✅ Health data synced for user: {user_id}")
        
        # Log health metrics
        hr = health_data.get('heartRate', {}).get('value') if isinstance(health_data.get('heartRate'), dict) else None
        bp_sys = health_data.get('bloodPressure', {}).get('systolic') if isinstance(health_data.get('bloodPressure'), dict) else None
        bp_dia = health_data.get('bloodPressure', {}).get('diastolic') if isinstance(health_data.get('bloodPressure'), dict) else None
        steps = health_data.get('steps', {}).get('value') if isinstance(health_data.get('steps'), dict) else None
        
        print(f"📊 Data: HR={hr} bpm, BP={bp_sys}/{bp_dia} mmHg, Steps={steps}")
        
        return jsonify({
            'success': True,
            'message': 'Health data synced successfully',
            'syncId': f"sync_{user_id}_{timestamp}",
            'timestamp': timestamp
        }), 200
        
    except Exception as e:
        print(f"❌ Error syncing health data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to sync health data',
            'message': str(e)
        }), 500

@app.route('/api/health/latest', methods=['GET'])
def get_latest_health_data():
    """
    Endpoint to retrieve latest health data for a user
    Query parameter: userId
    """
    try:
        user_id = request.args.get('userId')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'Missing userId parameter'
            }), 400
        
        # Retrieve data from store
        user_data = health_data_store.get(user_id)
        
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'No health data found for this user',
                'message': 'User has not synced any health data yet'
            }), 404
        
        health_data = user_data['healthData']
        
        # Format response for frontend
        formatted_data = {
            'heartRate': health_data.get('heartRate', {}).get('value', 72),
            'bloodPressureSystolic': health_data.get('bloodPressure', {}).get('systolic', 120),
            'bloodPressureDiastolic': health_data.get('bloodPressure', {}).get('diastolic', 80),
            'bodyTemperature': health_data.get('temperature', {}).get('value', 36.5),
            'stressLevel': health_data.get('stressLevel', {}).get('value', 30),
            'steps': health_data.get('steps', {}).get('value', 0),
            'sleepDuration': health_data.get('sleep', {}).get('duration', 0),
            'oxygenSaturation': health_data.get('oxygenSaturation', {}).get('value', 98),
            'calories': health_data.get('calories', {}).get('value', 0),
            'distance': health_data.get('distance', {}).get('value', 0),
            'weight': health_data.get('weight', {}).get('value'),
            'height': health_data.get('height', {}).get('value'),
            'lastUpdated': user_data.get('lastUpdated')
        }
        
        return jsonify({
            'success': True,
            'data': formatted_data
        }), 200
        
    except Exception as e:
        print(f"❌ Error retrieving health data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve health data',
            'message': str(e)
        }), 500

@app.route('/api/auth/login', methods=['POST'])
def user_login():
    """
    Simple authentication endpoint (replace with proper auth in production)
    
    Expected JSON body:
    {
        "email": "user@example.com",
        "password": "secure_password"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing email or password'
            }), 400
        
        email = data['email']
        password = data['password']
        
        # Simple validation (replace with proper database auth)
        # In production: hash password, check against database, generate JWT token
        if len(password) < 6:
            return jsonify({
                'success': False,
                'error': 'Password too short'
            }), 400
        
        # Generate mock JWT token (replace with proper JWT library in production)
        user_id = f"user_{hash(email) % 10000}"
        token = f"mock_jwt_token_{user_id}"
        
        print(f"✅ User logged in: {email} (User ID: {user_id})")
        
        return jsonify({
            'success': True,
            'token': token,
            'userId': user_id,
            'expiresIn': 86400  # 24 hours
        }), 200
        
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Login failed',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # NOTE (Windows): avoid emoji characters in console output to prevent
    # UnicodeEncodeError on cp1252 terminals.
    print("Starting GAIA AI Recommendations Server...")
    print("Server running on http://localhost:5000")
    print("AI-powered recommendations ready!")
    print("Mobile app sync endpoints available!")
    app.run(debug=True, host='0.0.0.0', port=5000)
