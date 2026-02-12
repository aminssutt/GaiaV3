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
            - personal: {age, height, weight} (optional)
            - healthAverages: {steps, calories, distance, sleepDuration, heartBeat}
            - googleFitData: {steps, calories, distance, sleepDuration, heartRate}
    
    Returns:
        str: AI-generated recommendations
    """
    # Extract data
    personal = user_data.get('personal', {})
    age = personal.get('age')
    height = personal.get('height')
    weight = personal.get('weight')
    gender = personal.get('gender', 'male')
    
    # Extract Google Fit data (prioritize googleFitData if available)
    google_fit = user_data.get('googleFitData', {})
    health = user_data.get('healthAverages', {})
    
    steps = google_fit.get('steps') or health.get('steps', 0)
    calories = google_fit.get('calories') or health.get('calories', 0)
    distance = google_fit.get('distance') or health.get('distance', 0)
    sleep_duration = google_fit.get('sleepDuration') or health.get('sleepDuration', 0)
    heart_rate = google_fit.get('heartRate') or health.get('heartBeat')
    
    # Calculate BMI if height and weight available
    bmi = None
    if height and weight:
        height_m = height / 100
        bmi = weight / (height_m ** 2)
    
    # Gender-specific normal ranges
    gender_label = "Male" if gender == 'male' else "Female"
    
    # Build profile section
    profile_lines = [f"- Gender: {gender_label}"]
    if age:
        profile_lines.append(f"- Age: {age} years old")
    if height:
        profile_lines.append(f"- Height: {height} cm")
    if weight:
        profile_lines.append(f"- Weight: {weight} kg")
    if bmi:
        profile_lines.append(f"- BMI: {bmi:.1f}")
    
    profile_section = "\n".join(profile_lines) if profile_lines else "- Profile data from Google Fit"
    
    # Build comprehensive prompt
    prompt = f"""Based on the following user data from Google Fit:

USER PROFILE:
{profile_section}

GOOGLE FIT ACTIVITY METRICS (last 24 hours average):
- Daily Steps: {steps:,} steps (Recommended: 10,000 steps/day)
- Calories Burned: {calories} kcal
- Distance: {distance} km
- Sleep Duration: {sleep_duration} hours (Recommended: 7-9 hours)"""
    
    # Add heart rate if available
    if heart_rate:
        prompt += f"\n- Heart Rate: {heart_rate} bpm (Normal: 60-100 bpm)"
    
    # Continue the prompt
    gender_context = "Women typically need more iron, calcium, and specific hormonal health considerations" if gender == 'female' else "Men typically need more cardiovascular focus and muscle mass maintenance"
    
    prompt += f"""

IMPORTANT CONTEXT:
- Consider gender-specific health needs and fitness recommendations
- {gender_context}
- Focus on improving daily activity levels, sleep quality, and overall wellness

TASK:
Please provide personalized health and fitness recommendations in THREE categories based on the Google Fit data above.

IMPORTANT: This is for a vehicle dashboard display (1800x720px), so be CONCISE.
- Maximum 3-4 bullet points per category
- Each bullet point should be ONE short, actionable sentence (max 15 words)
- Be direct and specific
- Base recommendations on the actual activity data (steps, sleep, calories)

Format your response EXACTLY like this:

HEALTH RECOMMENDATIONS:
• [Short actionable health advice]
• [Short actionable health advice]
• [Short actionable health advice]

FITNESS RECOMMENDATIONS:
• [Short actionable exercise advice based on steps/distance]
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
