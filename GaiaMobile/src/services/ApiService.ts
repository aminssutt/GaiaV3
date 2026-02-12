import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {HealthMetrics} from './HealthKitService';

const API_URL = 'http://192.168.225.51:5000/api';

class ApiService {
  /**
   * Verify pairing code with backend
   */
  async verifyPairing(
    pairingCode: string,
    userId: string,
  ): Promise<{success: boolean; message: string}> {
    try {
      console.log('🔄 Verifying pairing code:', pairingCode);

      const response = await axios.post(`${API_URL}/verify-pairing`, {
        pairingCode,
        userId,
      });

      if (response.data.success) {
        // Save pairing info locally
        await AsyncStorage.setItem('pairing_code', pairingCode);
        await AsyncStorage.setItem('user_id', userId);
        console.log('✅ Pairing verified and saved');
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Pairing verification error:', error.message);
      return {
        success: false,
        message: error.response?.data?.error || 'Connection failed',
      };
    }
  }

  /**
   * Sync health data to backend
   */
  async syncHealthData(metrics: HealthMetrics): Promise<boolean> {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        console.error('❌ No user ID found');
        return false;
      }

      console.log('📤 Syncing health data to backend...');

      const payload = {
        userId,
        heartRate: metrics.heartRate,
        bloodPressureSystolic: metrics.bloodPressureSystolic,
        bloodPressureDiastolic: metrics.bloodPressureDiastolic,
        steps: metrics.steps,
        sleepDuration: metrics.sleepDuration,
        oxygenSaturation: metrics.oxygenSaturation,
        stressLevel: metrics.stressLevel,
      };

      const response = await axios.post(`${API_URL}/sync-health`, payload);

      if (response.data.success) {
        console.log('✅ Health data synced successfully');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ Sync error:', error.message);
      return false;
    }
  }

  /**
   * Get saved pairing info
   */
  async getSavedPairing(): Promise<{
    pairingCode: string | null;
    userId: string | null;
  }> {
    const pairingCode = await AsyncStorage.getItem('pairing_code');
    const userId = await AsyncStorage.getItem('user_id');
    return {pairingCode, userId};
  }

  /**
   * Clear saved pairing
   */
  async clearPairing(): Promise<void> {
    await AsyncStorage.removeItem('pairing_code');
    await AsyncStorage.removeItem('user_id');
    console.log('🗑️ Pairing cleared');
  }
}

export default new ApiService();
