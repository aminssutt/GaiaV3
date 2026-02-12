import * as ExpoHealth from 'expo-health';

export interface HealthMetrics {
  heartRate: number | null;
  steps: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  sleepDuration: number | null;
  oxygenSaturation: number | null;
  stressLevel: number | null;
}

class HealthKitService {
  private isInitialized = false;

  /**
   * Initialize HealthKit and request permissions
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if HealthKit is available on this device
      const isAvailable = await ExpoHealth.isHealthDataAvailable();
      if (!isAvailable) {
        console.log('HealthKit is not available on this device');
        return false;
      }

      // Request permissions for all health data types
      const permissions = [
        { type: ExpoHealth.HealthDataType.HeartRate, accessType: ExpoHealth.HealthPermission.Read },
        { type: ExpoHealth.HealthDataType.StepCount, accessType: ExpoHealth.HealthPermission.Read },
        { type: ExpoHealth.HealthDataType.SleepAnalysis, accessType: ExpoHealth.HealthPermission.Read },
        { type: ExpoHealth.HealthDataType.BloodPressureSystolic, accessType: ExpoHealth.HealthPermission.Read },
        { type: ExpoHealth.HealthDataType.BloodPressureDiastolic, accessType: ExpoHealth.HealthPermission.Read },
        { type: ExpoHealth.HealthDataType.OxygenSaturation, accessType: ExpoHealth.HealthPermission.Read },
      ];

      const granted = await ExpoHealth.requestHealthDataAccessAsync(permissions);
      console.log('HealthKit permissions granted:', granted);
      
      this.isInitialized = granted;
      return granted;
    } catch (error) {
      console.error('Error initializing HealthKit:', error);
      return false;
    }
  }

  /**
   * Get heart rate data from the last 24 hours
   */
  async getHeartRate(): Promise<number | null> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const samples = await ExpoHealth.queryHealthData([ExpoHealth.HealthDataType.HeartRate], {
        startDate: yesterday,
        endDate: now,
        limit: 1,
        ascending: false, // Get most recent first
      });

      if (samples.length > 0 && samples[0].value) {
        return Math.round(samples[0].value as number);
      }
      return null;
    } catch (error) {
      console.error('Error fetching heart rate:', error);
      return null;
    }
  }

  /**
   * Get step count for today
   */
  async getSteps(): Promise<number | null> {
    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const samples = await ExpoHealth.queryHealthData([ExpoHealth.HealthDataType.StepCount], {
        startDate: startOfDay,
        endDate: now,
      });

      // Sum all step counts for today
      const totalSteps = samples.reduce((sum, sample) => sum + (sample.value as number || 0), 0);
      return Math.round(totalSteps);
    } catch (error) {
      console.error('Error fetching steps:', error);
      return null;
    }
  }

  /**
   * Get blood pressure from the last 24 hours
   */
  async getBloodPressure(): Promise<{ systolic: number | null; diastolic: number | null }> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const systolicSamples = await ExpoHealth.queryHealthData(
        [ExpoHealth.HealthDataType.BloodPressureSystolic],
        {
          startDate: yesterday,
          endDate: now,
          limit: 1,
          ascending: false,
        }
      );

      const diastolicSamples = await ExpoHealth.queryHealthData(
        [ExpoHealth.HealthDataType.BloodPressureDiastolic],
        {
          startDate: yesterday,
          endDate: now,
          limit: 1,
          ascending: false,
        }
      );

      return {
        systolic: systolicSamples.length > 0 ? Math.round(systolicSamples[0].value as number) : null,
        diastolic: diastolicSamples.length > 0 ? Math.round(diastolicSamples[0].value as number) : null,
      };
    } catch (error) {
      console.error('Error fetching blood pressure:', error);
      return { systolic: null, diastolic: null };
    }
  }

  /**
   * Get sleep duration from the last 48 hours
   */
  async getSleepDuration(): Promise<number | null> {
    try {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      const samples = await ExpoHealth.queryHealthData([ExpoHealth.HealthDataType.SleepAnalysis], {
        startDate: twoDaysAgo,
        endDate: now,
      });

      if (samples.length === 0) return null;

      // Calculate total sleep duration in hours
      let totalMinutes = 0;
      samples.forEach((sample: any) => {
        if (sample.startDate && sample.endDate) {
          const start = new Date(sample.startDate).getTime();
          const end = new Date(sample.endDate).getTime();
          const durationMs = end - start;
          totalMinutes += durationMs / (1000 * 60);
        }
      });

      return Math.round((totalMinutes / 60) * 10) / 10; // Hours with 1 decimal
    } catch (error) {
      console.error('Error fetching sleep duration:', error);
      return null;
    }
  }

  /**
   * Get oxygen saturation from the last 24 hours
   */
  async getOxygenSaturation(): Promise<number | null> {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const samples = await ExpoHealth.queryHealthData([ExpoHealth.HealthDataType.OxygenSaturation], {
        startDate: yesterday,
        endDate: now,
        limit: 1,
        ascending: false,
      });

      if (samples.length > 0 && samples[0].value) {
        // Convert to percentage (0-100)
        const percentage = (samples[0].value as number) * 100;
        return Math.round(percentage);
      }
      return null;
    } catch (error) {
      console.error('Error fetching oxygen saturation:', error);
      return null;
    }
  }

  /**
   * Calculate stress level based on heart rate
   * This is a simplified algorithm - you might want to use more sophisticated methods
   */
  calculateStress(heartRate: number | null): number | null {
    if (!heartRate) return null;

    // Simplified stress calculation based on heart rate ranges
    // Normal resting: 60-100 bpm -> Low stress (20-40%)
    // Slightly elevated: 100-120 bpm -> Medium stress (40-60%)
    // Elevated: 120+ bpm -> High stress (60-85%)
    
    if (heartRate < 60) return 20;
    if (heartRate <= 80) return 25 + (heartRate - 60) * 0.5;
    if (heartRate <= 100) return 35 + (heartRate - 80) * 0.75;
    if (heartRate <= 120) return 50 + (heartRate - 100) * 0.5;
    return Math.min(85, 60 + (heartRate - 120) * 0.3);
  }

  /**
   * Collect all health metrics at once
   */
  async collectAllMetrics(): Promise<HealthMetrics> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Collect all metrics in parallel for better performance
    const [heartRate, steps, bloodPressure, sleepDuration, oxygenSaturation] = await Promise.all([
      this.getHeartRate(),
      this.getSteps(),
      this.getBloodPressure(),
      this.getSleepDuration(),
      this.getOxygenSaturation(),
    ]);

    const stressLevel = this.calculateStress(heartRate);

    return {
      heartRate,
      steps,
      bloodPressureSystolic: bloodPressure.systolic,
      bloodPressureDiastolic: bloodPressure.diastolic,
      sleepDuration,
      oxygenSaturation,
      stressLevel,
    };
  }
}

export default new HealthKitService();
