"""
Google Fit OAuth Proxy
Handles OAuth flow and fetches real Google Fit data
"""
from flask import Flask, request, jsonify, redirect, session
from flask_cors import CORS
import requests
import os
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app, supports_credentials=True, origins=['http://localhost:8080'])

# Google OAuth Configuration - Use environment variables for security
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', 'your-client-id')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', 'your-client-secret')
REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5001/oauth/callback')

# Google OAuth URLs
GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_FIT_API = 'https://www.googleapis.com/fitness/v1'

# Scopes for Google Fit
SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.sleep.read'
]

# In-memory token storage (use database in production)
user_tokens = {}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'Google Fit OAuth Proxy'}), 200

@app.route('/oauth/start', methods=['GET'])
def oauth_start():
    """
    Start OAuth flow - redirect to Google
    """
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'Missing userId'}), 400
    
    # Store userId in session
    session['userId'] = user_id
    
    # Build authorization URL
    params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'response_type': 'code',
        'scope': ' '.join(SCOPES),
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = f"{GOOGLE_AUTH_URL}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    return redirect(auth_url)

@app.route('/oauth/callback', methods=['GET'])
def oauth_callback():
    """
    OAuth callback - exchange code for token
    """
    code = request.args.get('code')
    user_id = session.get('userId')
    
    if not code:
        return jsonify({'error': 'Missing authorization code'}), 400
    
    if not user_id:
        return jsonify({'error': 'Missing userId in session'}), 400
    
    # Exchange code for tokens
    token_data = {
        'code': code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': REDIRECT_URI,
        'grant_type': 'authorization_code'
    }
    
    try:
        response = requests.post(GOOGLE_TOKEN_URL, data=token_data)
        response.raise_for_status()
        tokens = response.json()
        
        # Store tokens for this user
        user_tokens[user_id] = {
            'access_token': tokens['access_token'],
            'refresh_token': tokens.get('refresh_token'),
            'expires_at': datetime.now() + timedelta(seconds=tokens.get('expires_in', 3600))
        }
        
        print(f"✅ OAuth successful for user {user_id}")
        
        # Redirect back to web app
        return redirect(f'http://localhost:8080?oauth=success')
        
    except Exception as e:
        print(f"❌ OAuth error: {str(e)}")
        return redirect(f'http://localhost:8080?oauth=error')

@app.route('/api/google-fit/data', methods=['POST'])
def get_google_fit_data():
    """
    Fetch Google Fit data for a user
    """
    data = request.get_json()
    user_id = data.get('userId')
    
    if not user_id:
        return jsonify({'error': 'Missing userId'}), 400
    
    if user_id not in user_tokens:
        return jsonify({'error': 'User not authenticated', 'needsAuth': True}), 401
    
    access_token = user_tokens[user_id]['access_token']
    
    try:
        # Calculate time range (last 24 hours)
        end_time = int(datetime.now().timestamp() * 1000000000)  # nanoseconds
        start_time = int((datetime.now() - timedelta(hours=24)).timestamp() * 1000000000)
        
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # Fetch data sources with error handling
        heart_rate_data = None
        steps_data = None
        calories_data = None
        distance_data = None
        weight_data = None
        height_data = None
        oxygen_data = None
        blood_pressure_data = None
        sleep_data = None
        
        try:
            heart_rate_data = fetch_data_source(
                'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
                start_time,
                end_time,
                headers
            )
        except Exception as e:
            print(f"⚠️  Heart rate data not available: {str(e)}")
        
        try:
            steps_data = fetch_data_source(
                'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
                start_time,
                end_time,
                headers
            )
        except Exception as e:
            print(f"⚠️  Steps data not available: {str(e)}")
        
        try:
            calories_data = fetch_data_source(
                'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
                start_time,
                end_time,
                headers
            )
        except Exception as e:
            print(f"⚠️  Calories data not available: {str(e)}")
        
        try:
            distance_data = fetch_data_source(
                'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta',
                start_time,
                end_time,
                headers
            )
        except Exception as e:
            print(f"⚠️  Distance data not available: {str(e)}")
        
        try:
            weight_data = fetch_data_source(
                'derived:com.google.weight:com.google.android.gms:merge_weight',
                start_time,
                end_time,
                headers
            )
        except Exception as e:
            print(f"⚠️  Weight data not available: {str(e)}")
        
        try:
            height_data = fetch_data_source(
                'derived:com.google.height:com.google.android.gms:merge_height',
                start_time,
                end_time,
                headers
            )
        except Exception as e:
            print(f"⚠️  Height data not available: {str(e)}")
        
        try:
            oxygen_data = fetch_data_source(
                'derived:com.google.oxygen_saturation:com.google.android.gms:merged',
                start_time,
                end_time,
                headers
            )
        except Exception as e:
            print(f"⚠️  Oxygen saturation data not available: {str(e)}")
        
        try:
            blood_pressure_data = fetch_data_source(
                'derived:com.google.blood_pressure:com.google.android.gms:merged',
                start_time,
                end_time,
                headers
            )
        except Exception as e:
            print(f"⚠️  Blood pressure data not available: {str(e)}")
        
        try:
            sleep_data = fetch_data_source(
                'derived:com.google.sleep.segment:com.google.android.gms:merged',
                start_time,
                end_time,
                headers
            )
        except Exception as e:
            print(f"⚠️  Sleep data not available: {str(e)}")
        
        # Process data
        health_data = {
            'heartRate': extract_latest_value(heart_rate_data) if heart_rate_data else 72,
            'steps': sum_values(steps_data) if steps_data else 0,
            'calories': round(sum_values(calories_data)) if calories_data else 0,
            'distance': round(sum_values(distance_data) / 1000, 2) if distance_data else 0,  # Convert to km
            'weight': extract_latest_value(weight_data) if weight_data else None,  # kg
            'height': extract_latest_value(height_data) if height_data else None,  # meters
            'oxygenSaturation': extract_latest_value(oxygen_data) if oxygen_data else None,  # %
            'bloodPressureSystolic': extract_blood_pressure(blood_pressure_data, 'systolic') if blood_pressure_data else 120,
            'bloodPressureDiastolic': extract_blood_pressure(blood_pressure_data, 'diastolic') if blood_pressure_data else 80,
            'sleepDuration': calculate_sleep_hours(sleep_data) if sleep_data else 0  # hours
        }
        
        print(f"✅ Fetched Google Fit data for {user_id}")
        print(f"   Steps: {health_data['steps']}, Calories: {health_data['calories']}, Distance: {health_data['distance']}km")
        if health_data['weight']:
            print(f"   Weight: {health_data['weight']}kg, Height: {health_data['height']}m")
        
        return jsonify({
            'success': True,
            'data': health_data
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching Google Fit data: {str(e)}")
        return jsonify({'error': str(e)}), 500

def fetch_data_source(data_source_id, start_time, end_time, headers):
    """
    Fetch data from a specific Google Fit data source
    """
    url = f"{GOOGLE_FIT_API}/users/me/dataSources/{data_source_id}/datasets/{start_time}-{end_time}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

def extract_latest_value(data):
    """
    Extract the latest value from Google Fit response
    """
    if not data.get('point'):
        return None
    points = data['point']
    if not points:
        return None
    latest = points[-1]
    if 'value' in latest and latest['value']:
        return round(latest['value'][0].get('fpVal') or latest['value'][0].get('intVal') or 0)
    return None

def sum_values(data):
    """
    Sum all values from Google Fit response
    """
    if not data.get('point'):
        return 0
    total = 0
    for point in data['point']:
        if 'value' in point and point['value']:
            total += point['value'][0].get('fpVal') or point['value'][0].get('intVal') or 0
    return total

def extract_blood_pressure(data, type_key):
    """
    Extract blood pressure (systolic or diastolic) from Google Fit response
    """
    if not data or not data.get('point'):
        return None
    points = data['point']
    if not points:
        return None
    latest = points[-1]
    if 'value' in latest and latest['value']:
        # Blood pressure has 3 values: systolic, diastolic, position
        if type_key == 'systolic' and len(latest['value']) > 0:
            return round(latest['value'][0].get('fpVal') or latest['value'][0].get('intVal') or 0)
        elif type_key == 'diastolic' and len(latest['value']) > 1:
            return round(latest['value'][1].get('fpVal') or latest['value'][1].get('intVal') or 0)
    return None

def calculate_sleep_hours(data):
    """
    Calculate total sleep hours from Google Fit sleep segments
    """
    if not data or not data.get('point'):
        return 0
    total_sleep_ms = 0
    for point in data['point']:
        if 'startTimeNanos' in point and 'endTimeNanos' in point:
            duration_ms = (int(point['endTimeNanos']) - int(point['startTimeNanos'])) / 1000000
            total_sleep_ms += duration_ms
    return round(total_sleep_ms / 3600000, 1)  # Convert to hours

if __name__ == '__main__':
    print("🚀 Starting Google Fit OAuth Proxy...")
    print(f"📍 Server running on http://localhost:5001")
    print(f"🔐 OAuth redirect URI: {REDIRECT_URI}")
    if GOOGLE_CLIENT_SECRET == 'YOUR_CLIENT_SECRET':
        print("⚠️  WARNING: GOOGLE_CLIENT_SECRET not configured!")
    else:
        print("✅ Google OAuth configured")
    app.run(host='0.0.0.0', port=5001, debug=True)
