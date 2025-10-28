import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Gemini client with API key from environment
api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment variables. Please create a .env file with your API key.")

client = genai.Client(api_key=api_key)

def generate_recommendations(user_data):
    """
    Generate AI recommendations based on user data
    
    Args:
        user_data (dict): Dictionary containing:
            - personal: {age, height, weight}
            - healthAverages: {heartBeat, tension, temperature, fatigue, cough, ambiance}
    
    Returns:
        str: AI-generated recommendations
    """
    # Extract data
    age = user_data['personal']['age']
    height = user_data['personal']['height']
    weight = user_data['personal']['weight']
    gender = user_data['personal'].get('gender', 'male')  # Default to 'male' if not provided
    
    health = user_data['healthAverages']
    heart_rate = health['heartBeat']
    blood_pressure = health['tension']
    temperature = health['temperature']
    fatigue = health['fatigue']
    cough = health['cough']
    ambient_noise = health['ambiance']
    
    # Calculate BMI
    height_m = height / 100
    bmi = weight / (height_m ** 2)
    
    # Gender-specific normal ranges
    gender_label = "Male" if gender == 'male' else "Female"
    heart_rate_normal = "60-100 bpm" if gender == 'male' else "65-105 bpm (slightly higher for females)"
    
    # Build comprehensive prompt
    prompt = f"""Based on the following user data and comparing it to normal adult population averages:

USER PROFILE:
- Gender: {gender_label}
- Age: {age} years old
- Height: {height} cm
- Weight: {weight} kg
- BMI: {bmi:.1f}

AVERAGE HEALTH METRICS (collected from user monitoring):
- Heart Rate: {heart_rate} bpm (Normal: {heart_rate_normal})
- Blood Pressure: {blood_pressure} mmHg (Normal: 90-120 mmHg)
- Body Temperature: {temperature}°C (Normal: 36.5-37.5°C)
- Fatigue Level: {fatigue}% (Lower is better)
- Cough Frequency: {cough}% (Lower is better)
- Ambient Noise Exposure: {ambient_noise} dB (Normal: <60 dB)

IMPORTANT CONTEXT:
- Consider gender-specific health needs and fitness recommendations
- {"Women typically need more iron, calcium, and specific hormonal health considerations" if gender == 'female' else "Men typically need more cardiovascular focus and muscle mass maintenance"}
- Adjust exercise intensity recommendations based on gender and age

TASK:
Please provide personalized health and fitness recommendations in THREE categories.

IMPORTANT: This is for a vehicle dashboard display (1800x720px), so be CONCISE.
- Maximum 3-4 bullet points per category
- Each bullet point should be ONE short, actionable sentence (max 15 words)
- Be direct and specific
- Consider the user's gender in your recommendations

Format your response EXACTLY like this:

HEALTH RECOMMENDATIONS:
• [Short actionable health advice]
• [Short actionable health advice]
• [Short actionable health advice]

FITNESS RECOMMENDATIONS:
• [Short actionable exercise advice]
• [Short actionable exercise advice]
• [Short actionable exercise advice]

LIFESTYLE RECOMMENDATIONS:
• [Short actionable lifestyle advice]
• [Short actionable lifestyle advice]
• [Short actionable lifestyle advice]

Keep it concise and impactful. No extra text."""

    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt
    )
    
    return response.text


# Example usage / test
if __name__ == "__main__":
    # Test data
    test_data = {
        "personal": {
            "age": 30,
            "height": 175,
            "weight": 70,
            "gender": "male"
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
    
    print("Generating AI recommendations...")
    print("-" * 50)
    recommendations = generate_recommendations(test_data)
    print(recommendations)
