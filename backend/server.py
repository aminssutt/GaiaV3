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

if __name__ == '__main__':
    print("🚀 Starting GAIA AI Recommendations Server...")
    print("📍 Server running on http://localhost:5000")
    print("🤖 AI-powered recommendations ready!")
    app.run(debug=True, host='0.0.0.0', port=5000)
