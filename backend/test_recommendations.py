"""
Test script for GAIA AI Recommendations
Run this to test the recommendation system without starting the full server
"""

from recommandations import generate_recommendations

# Test cases with different health profiles

print("=" * 60)
print("🧪 GAIA AI RECOMMENDATIONS - TEST SUITE")
print("=" * 60)

# Test 1: Normal healthy adult
print("\n📋 TEST 1: Normal Healthy Adult")
print("-" * 60)
test_data_1 = {
    "personal": {
        "age": 30,
        "height": 175,
        "weight": 70
    },
    "healthAverages": {
        "heartBeat": 72,
        "tension": 115,
        "temperature": 36.8,
        "fatigue": 30,
        "cough": 10,
        "ambiance": 50
    }
}
print("\n🤖 AI Recommendations:")
print(generate_recommendations(test_data_1))

# Test 2: High stress profile
print("\n" + "=" * 60)
print("📋 TEST 2: High Stress Profile")
print("-" * 60)
test_data_2 = {
    "personal": {
        "age": 45,
        "height": 168,
        "weight": 85
    },
    "healthAverages": {
        "heartBeat": 95,
        "tension": 135,
        "temperature": 37.1,
        "fatigue": 75,
        "cough": 40,
        "ambiance": 80
    }
}
print("\n🤖 AI Recommendations:")
print(generate_recommendations(test_data_2))

# Test 3: Young athletic profile
print("\n" + "=" * 60)
print("📋 TEST 3: Young Athletic Profile")
print("-" * 60)
test_data_3 = {
    "personal": {
        "age": 25,
        "height": 180,
        "weight": 75
    },
    "healthAverages": {
        "heartBeat": 58,
        "tension": 105,
        "temperature": 36.5,
        "fatigue": 20,
        "cough": 5,
        "ambiance": 45
    }
}
print("\n🤖 AI Recommendations:")
print(generate_recommendations(test_data_3))

print("\n" + "=" * 60)
print("✅ All tests completed!")
print("=" * 60)
