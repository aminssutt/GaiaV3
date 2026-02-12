"""
Supabase Database Client for GAIA Backend
Handles all database operations for user data, health metrics, and sync history
"""

import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==================== USER OPERATIONS ====================

def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user profile by ID"""
    try:
        response = supabase.table('users').select('*').eq('id', user_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None

def get_user_by_email(email: str) -> Optional[Dict]:
    """Get user by email"""
    try:
        response = supabase.table('users').select('*').eq('email', email).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error fetching user by email: {e}")
        return None

def create_user(email: str, password_hash: str, user_data: Dict) -> Optional[Dict]:
    """Create new user"""
    try:
        user_record = {
            'email': email,
            'password_hash': password_hash,
            'age': user_data.get('age'),
            'height': user_data.get('height'),
            'weight': user_data.get('weight'),
            'gender': user_data.get('gender', 'male'),
            'created_at': datetime.utcnow().isoformat(),
            'last_login': datetime.utcnow().isoformat()
        }
        response = supabase.table('users').insert(user_record).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error creating user: {e}")
        return None

def update_user_profile(user_id: str, updates: Dict) -> bool:
    """Update user profile"""
    try:
        supabase.table('users').update(updates).eq('id', user_id).execute()
        return True
    except Exception as e:
        print(f"Error updating user: {e}")
        return False

# ==================== HEALTH DATA OPERATIONS ====================

def save_health_data(user_id: str, health_data: Dict, timestamp: int) -> bool:
    """
    Save health data from mobile app sync
    
    Args:
        user_id: User UUID
        health_data: Dict with health metrics (heartRate, bloodPressure, etc.)
        timestamp: Unix timestamp in milliseconds
    """
    try:
        # Extract metrics from health_data
        record = {
            'user_id': user_id,
            'timestamp': timestamp,
            'synced_at': datetime.utcnow().isoformat(),
            
            # Core metrics (always present)
            'heart_rate': health_data.get('heartRate', {}).get('value'),
            'blood_pressure_systolic': health_data.get('bloodPressure', {}).get('systolic'),
            'blood_pressure_diastolic': health_data.get('bloodPressure', {}).get('diastolic'),
            'temperature': health_data.get('temperature', {}).get('value'),
            'steps': health_data.get('steps', {}).get('value'),
            
            # Extended metrics from Samsung Health / Google Fit
            'sleep_duration': health_data.get('sleep', {}).get('duration'),
            'sleep_quality': health_data.get('sleep', {}).get('quality'),
            'sleep_deep': health_data.get('sleep', {}).get('stages', {}).get('deep'),
            'sleep_light': health_data.get('sleep', {}).get('stages', {}).get('light'),
            'sleep_rem': health_data.get('sleep', {}).get('stages', {}).get('rem'),
            
            'oxygen_saturation': health_data.get('oxygenSaturation', {}).get('value'),
            'stress_level': health_data.get('stressLevel', {}).get('value'),
            'fatigue': health_data.get('fatigue', {}).get('value'),
            'respiratory_rate': health_data.get('respiratoryRate', {}).get('value'),
            
            # Vehicle-specific metrics (if available from mobile sensors)
            'ambient_noise': health_data.get('ambiance', {}).get('value'),
        }
        
        # Remove None values
        record = {k: v for k, v in record.items() if v is not None}
        
        response = supabase.table('health_data').insert(record).execute()
        print(f"✅ Health data saved for user {user_id}")
        return True
        
    except Exception as e:
        print(f"❌ Error saving health data: {e}")
        return False

def get_latest_health_data(user_id: str) -> Optional[Dict]:
    """Get most recent health data for a user"""
    try:
        response = supabase.table('health_data') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('timestamp', desc=True) \
            .limit(1) \
            .execute()
        
        if response.data:
            return response.data[0]
        return None
        
    except Exception as e:
        print(f"Error fetching latest health data: {e}")
        return None

def get_health_data_range(user_id: str, days: int = 7) -> List[Dict]:
    """
    Get health data for last N days
    Used for calculating averages and trends
    """
    try:
        cutoff_time = int((datetime.utcnow() - timedelta(days=days)).timestamp() * 1000)
        
        response = supabase.table('health_data') \
            .select('*') \
            .eq('user_id', user_id) \
            .gte('timestamp', cutoff_time) \
            .order('timestamp', desc=False) \
            .execute()
        
        return response.data if response.data else []
        
    except Exception as e:
        print(f"Error fetching health data range: {e}")
        return []

def get_health_averages(user_id: str, days: int = 7) -> Dict:
    """Calculate average health metrics over last N days"""
    try:
        data = get_health_data_range(user_id, days)
        
        if not data:
            return {}
        
        # Calculate averages
        totals = {
            'heart_rate': 0,
            'blood_pressure_systolic': 0,
            'temperature': 0,
            'steps': 0,
            'sleep_duration': 0,
            'oxygen_saturation': 0,
            'stress_level': 0,
            'fatigue': 0,
            'respiratory_rate': 0
        }
        
        counts = {k: 0 for k in totals.keys()}
        
        for record in data:
            for key in totals.keys():
                value = record.get(key)
                if value is not None:
                    totals[key] += value
                    counts[key] += 1
        
        # Calculate averages
        averages = {}
        for key in totals.keys():
            if counts[key] > 0:
                averages[key] = round(totals[key] / counts[key], 1)
        
        return averages
        
    except Exception as e:
        print(f"Error calculating averages: {e}")
        return {}

# ==================== SYNC HISTORY OPERATIONS ====================

def log_sync(user_id: str, sync_id: str, status: str, message: str = None) -> bool:
    """Log sync operation"""
    try:
        record = {
            'user_id': user_id,
            'sync_id': sync_id,
            'status': status,
            'message': message,
            'synced_at': datetime.utcnow().isoformat()
        }
        
        supabase.table('sync_history').insert(record).execute()
        return True
        
    except Exception as e:
        print(f"Error logging sync: {e}")
        return False

def get_last_sync_time(user_id: str) -> Optional[str]:
    """Get timestamp of last successful sync"""
    try:
        response = supabase.table('sync_history') \
            .select('synced_at') \
            .eq('user_id', user_id) \
            .eq('status', 'success') \
            .order('synced_at', desc=True) \
            .limit(1) \
            .execute()
        
        if response.data:
            return response.data[0]['synced_at']
        return None
        
    except Exception as e:
        print(f"Error fetching last sync time: {e}")
        return None

# ==================== PAIRING OPERATIONS ====================

def create_pairing_code(user_id: str) -> str:
    """Generate a 6-digit pairing code for mobile app connection"""
    import random
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    try:
        record = {
            'user_id': user_id,
            'code': code,
            'expires_at': (datetime.utcnow() + timedelta(minutes=10)).isoformat(),
            'created_at': datetime.utcnow().isoformat(),
            'used': False
        }
        
        supabase.table('pairing_codes').insert(record).execute()
        return code
        
    except Exception as e:
        print(f"Error creating pairing code: {e}")
        return None

def validate_pairing_code(code: str) -> Optional[str]:
    """Validate pairing code and return user_id if valid"""
    try:
        response = supabase.table('pairing_codes') \
            .select('*') \
            .eq('code', code) \
            .eq('used', False) \
            .execute()
        
        if not response.data:
            return None
        
        pairing = response.data[0]
        
        # Check expiration
        expires_at = datetime.fromisoformat(pairing['expires_at'])
        if datetime.utcnow() > expires_at:
            return None
        
        # Mark as used
        supabase.table('pairing_codes') \
            .update({'used': True}) \
            .eq('code', code) \
            .execute()
        
        return pairing['user_id']
        
    except Exception as e:
        print(f"Error validating pairing code: {e}")
        return None

# ==================== UTILITY FUNCTIONS ====================

def format_health_data_for_frontend(db_record: Dict) -> Dict:
    """Convert database record to frontend-expected format"""
    return {
        'heartBeat': db_record.get('heart_rate', 72),
        'tension': db_record.get('blood_pressure_systolic', 120),
        'temperature': db_record.get('temperature', 36.5),
        'fatigue': db_record.get('fatigue', 30),
        'steps': db_record.get('steps', 0),
        'sleep': {
            'duration': db_record.get('sleep_duration', 0),
            'quality': db_record.get('sleep_quality', 'unknown'),
            'stages': {
                'deep': db_record.get('sleep_deep', 0),
                'light': db_record.get('sleep_light', 0),
                'rem': db_record.get('sleep_rem', 0)
            }
        } if db_record.get('sleep_duration') else None,
        'oxygenSaturation': db_record.get('oxygen_saturation', 98),
        'stressLevel': db_record.get('stress_level', 30),
        'respiratoryRate': db_record.get('respiratory_rate', 16),
        'ambiance': db_record.get('ambient_noise', 45),
        'lastUpdated': db_record.get('timestamp')
    }

def test_connection():
    """Test Supabase connection"""
    try:
        response = supabase.table('users').select('count').execute()
        print("✅ Supabase connection successful!")
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

if __name__ == '__main__':
    # Test connection
    test_connection()
