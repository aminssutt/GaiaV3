import AppleHealthKit, {
  HealthKitPermissions,
  HealthInputOptions,
  HealthValue,
} from 'react-native-health';

export interface HealthMetrics {
  heartRate: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  steps: number | null;
  sleepDuration: number | null;
  oxygenSaturation: number | null;
  stressLevel: number | null;
}

class HealthKitService {
  private initialized = false;

  /**
   * Initialize HealthKit and request permissions
   */
  async initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      const permissions: HealthKitPermissions = {
        permissions: {
          read: [
            AppleHealthKit.Constants.Permissions.HeartRate,
            AppleHealthKit.Constants.Permissions.StepCount,
            AppleHealthKit.Constants.Permissions.SleepAnalysis,
            AppleHealthKit.Constants.Permissions.BloodPressureSystolic,
            AppleHealthKit.Constants.Permissions.BloodPressureDiastolic,
            AppleHealthKit.Constants.Permissions.OxygenSaturation,
          ],
          write: [],
        },
      };

      AppleHealthKit.initHealthKit(permissions, (error) => {
        if (error) {
          console.log('❌ HealthKit initialization error:', error);
          this.initialized = false;
          resolve(false);
          return;
        }

        console.log('✅ HealthKit initialized successfully');
        this.initialized = true;
        resolve(true);
      });
    });
  }

  /**
   * Get latest heart rate
   */
  async getHeartRate(): Promise<number | null> {
    if (!this.initialized) return null;

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 1,
      };

      AppleHealthKit.getHeartRateSamples(
        options,
        (error, results: HealthValue[]) => {
          if (error || !results || results.length === 0) {
            console.log('⚠️ No heart rate data');
            resolve(null);
            return;
          }

          const heartRate = Math.round(results[0].value);
          console.log('💓 Heart Rate:', heartRate, 'bpm');
          resolve(heartRate);
        }
      );
    });
  }

  /**
   * Get today's total steps
   */
  async getSteps(): Promise<number | null> {
    if (!this.initialized) return null;

    return new Promise((resolve) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const options: HealthInputOptions = {
        startDate: today.toISOString(),
        endDate: new Date().toISOString(),
      };

      AppleHealthKit.getStepCount(options, (error, results) => {
        if (error || !results) {
          console.log('⚠️ No steps data');
          resolve(null);
          return;
        }

        const steps = Math.round(results.value);
        console.log('🚶 Steps:', steps);
        resolve(steps);
      });
    });
  }

  /**
   * Get latest blood pressure
   */
  async getBloodPressure(): Promise<{
    systolic: number | null;
    diastolic: number | null;
  }> {
    if (!this.initialized) return {systolic: null, diastolic: null};

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 1,
      };

      AppleHealthKit.getBloodPressureSamples(
        options,
        (error, results: any[]) => {
          if (error || !results || results.length === 0) {
            console.log('⚠️ No blood pressure data');
            resolve({systolic: null, diastolic: null});
            return;
          }

          const latest = results[0];
          const systolic = Math.round(latest.bloodPressureSystolicValue);
          const diastolic = Math.round(latest.bloodPressureDiastolicValue);
          console.log('🩺 Blood Pressure:', `${systolic}/${diastolic}`, 'mmHg');
          resolve({systolic, diastolic});
        }
      );
    });
  }

  /**
   * Get last sleep duration in hours
   */
  async getSleepDuration(): Promise<number | null> {
    if (!this.initialized) return null;

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 1,
      };

      AppleHealthKit.getSleepSamples(options, (error, results: any[]) => {
        if (error || !results || results.length === 0) {
          console.log('⚠️ No sleep data');
          resolve(null);
          return;
        }

        const latest = results[0];
        const durationMs =
          new Date(latest.endDate).getTime() -
          new Date(latest.startDate).getTime();
        const hours = durationMs / (1000 * 60 * 60);
        console.log('😴 Sleep:', hours.toFixed(1), 'hours');
        resolve(parseFloat(hours.toFixed(1)));
      });
    });
  }

  /**
   * Get latest oxygen saturation (SpO2)
   */
  async getOxygenSaturation(): Promise<number | null> {
    if (!this.initialized) return null;

    return new Promise((resolve) => {
      const options: HealthInputOptions = {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 1,
      };

      AppleHealthKit.getOxygenSaturationSamples(
        options,
        (error, results: HealthValue[]) => {
          if (error || !results || results.length === 0) {
            console.log('⚠️ No SpO2 data');
            resolve(null);
            return;
          }

          const spo2 = Math.round(results[0].value * 100); // Convert to percentage
          console.log('🫁 SpO2:', spo2, '%');
          resolve(spo2);
        }
      );
    });
  }

  /**
   * Calculate stress level from heart rate
   */
  calculateStress(heartRate: number | null): number | null {
    if (!heartRate) return null;

    if (heartRate < 60) return 20;
    if (heartRate < 70) return 30;
    if (heartRate < 80) return 50;
    if (heartRate < 90) return 65;
    if (heartRate < 100) return 75;
    return 85;
  }

  /**
   * Collect all health metrics
   */
  async collectAllMetrics(): Promise<HealthMetrics> {
    console.log('📊 Collecting health metrics...');

    const [heartRate, steps, bloodPressure, sleep, spo2] = await Promise.all([
      this.getHeartRate(),
      this.getSteps(),
      this.getBloodPressure(),
      this.getSleepDuration(),
      this.getOxygenSaturation(),
    ]);

    const stress = this.calculateStress(heartRate);

    const metrics: HealthMetrics = {
      heartRate,
      bloodPressureSystolic: bloodPressure.systolic,
      bloodPressureDiastolic: bloodPressure.diastolic,
      steps,
      sleepDuration: sleep,
      oxygenSaturation: spo2,
      stressLevel: stress,
    };

    console.log('✅ Metrics collected:', metrics);
    return metrics;
  }
}

export default new HealthKitService();
