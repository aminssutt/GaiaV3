import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthMetrics } from './HealthKitService';

const API_URL = 'http://192.168.225.51:5000/api';

class ApiService {
  /**
   * Verify pairing code with the backend
   */
  async verifyPairing(pairingCode: string, userId: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/verify-pairing`, {
        pairing_code: pairingCode,
        user_id: userId,
      });

      if (response.data.success) {
        // Save pairing info locally
        await AsyncStorage.setItem('pairing_code', pairingCode);
        await AsyncStorage.setItem('user_id', userId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying pairing:', error);
      return false;
    }
  }

  /**
   * Sync health data to backend
   */
  async syncHealthData(metrics: HealthMetrics): Promise<boolean> {
    try {
      const pairingCode = await AsyncStorage.getItem('pairing_code');
      const userId = await AsyncStorage.getItem('user_id');

      if (!pairingCode || !userId) {
        console.error('No pairing info found');
        return false;
      }

      const response = await axios.post(`${API_URL}/sync-health`, {
        pairing_code: pairingCode,
        userId: userId,
        heartRate: metrics.heartRate,
        steps: metrics.steps,
        bloodPressureSystolic: metrics.bloodPressureSystolic,
        bloodPressureDiastolic: metrics.bloodPressureDiastolic,
        sleepDuration: metrics.sleepDuration,
        oxygenSaturation: metrics.oxygenSaturation,
        stressLevel: metrics.stressLevel,
      });

      return response.data.success === true;
    } catch (error) {
      console.error('Error syncing health data:', error);
      return false;
    }
  }

  /**
   * Get saved pairing info
   */
  async getSavedPairing(): Promise<{ pairingCode: string; userId: string } | null> {
    try {
      const pairingCode = await AsyncStorage.getItem('pairing_code');
      const userId = await AsyncStorage.getItem('user_id');

      if (pairingCode && userId) {
        return { pairingCode, userId };
      }
      return null;
    } catch (error) {
      console.error('Error getting saved pairing:', error);
      return null;
    }
  }

  /**
   * Clear pairing info
   */
  async clearPairing(): Promise<void> {
    try {
      await AsyncStorage.removeItem('pairing_code');
      await AsyncStorage.removeItem('user_id');
    } catch (error) {
      console.error('Error clearing pairing:', error);
    }
  }
}

export default new ApiService();
