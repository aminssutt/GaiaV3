import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HealthKitService, { HealthMetrics } from './src/services/HealthKitService';
import ApiService from './src/services/ApiService';

export default function App() {
  const [pairingCode, setPairingCode] = useState('');
  const [userId, setUserId] = useState('');
  const [isPaired, setIsPaired] = useState(false);
  const [isHealthKitReady, setIsHealthKitReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<HealthMetrics | null>(null);
  const [statusMessage, setStatusMessage] = useState('Initializing...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Check for saved pairing
    const savedPairing = await ApiService.getSavedPairing();
    if (savedPairing) {
      setPairingCode(savedPairing.pairingCode);
      setUserId(savedPairing.userId);
      setIsPaired(true);
      setStatusMessage('✅ Connected to dashboard');
    } else {
      // Generate a unique user ID if not paired
      const newUserId = `user_${Date.now()}`;
      setUserId(newUserId);
      setStatusMessage('⚠️ Not paired with dashboard');
    }

    // Initialize HealthKit (iOS only)
    if (Platform.OS === 'ios') {
      const initialized = await HealthKitService.initialize();
      setIsHealthKitReady(initialized);
      if (initialized) {
        console.log('HealthKit initialized successfully');
      } else {
        Alert.alert(
          'HealthKit Not Available',
          'HealthKit is not available on this device or permissions were denied.'
        );
      }
    } else {
      setStatusMessage('⚠️ Health data only available on iOS');
    }
  };

  const handlePairing = async () => {
    if (pairingCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-character pairing code');
      return;
    }

    setStatusMessage('🔄 Verifying pairing code...');
    const success = await ApiService.verifyPairing(pairingCode.toUpperCase(), userId);

    if (success) {
      setIsPaired(true);
      setStatusMessage('✅ Connected to dashboard!');
      Alert.alert('Success', 'Successfully paired with dashboard!');
    } else {
      setStatusMessage('❌ Pairing failed');
      Alert.alert('Pairing Failed', 'Invalid code or connection error. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    await ApiService.clearPairing();
    setIsPaired(false);
    setPairingCode('');
    setStatusMessage('⚠️ Disconnected from dashboard');
    const newUserId = `user_${Date.now()}`;
    setUserId(newUserId);
  };

  const handleSync = async () => {
    if (!isHealthKitReady) {
      Alert.alert('HealthKit Not Ready', 'Please allow HealthKit permissions first.');
      return;
    }

    if (!isPaired) {
      Alert.alert('Not Paired', 'Please pair with dashboard first.');
      return;
    }

    setIsSyncing(true);
    setStatusMessage('📊 Collecting health data...');

    try {
      // Collect all health metrics
      const metrics = await HealthKitService.collectAllMetrics();
      setLastMetrics(metrics);

      setStatusMessage('☁️ Syncing to dashboard...');

      // Send to backend
      const success = await ApiService.syncHealthData(metrics);

      if (success) {
        setStatusMessage('✅ Health data synced successfully!');
        Alert.alert('Success', 'Health data synced to dashboard!');
      } else {
        setStatusMessage('❌ Sync failed');
        Alert.alert('Sync Failed', 'Failed to sync data. Please try again.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setStatusMessage('❌ Error collecting data');
      Alert.alert('Error', 'Failed to collect health data.');
    } finally {
      setIsSyncing(false);
    }
  };

  const MetricCard = ({ label, value, unit }: { label: string; value: any; unit: string }) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>
        {value !== null && value !== undefined ? `${value} ${unit}` : 'No data'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🚗 GAIA Mobile</Text>
          <Text style={styles.subtitle}>Real-time health sync for your dashboard</Text>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>

        {/* Pairing Section */}
        {!isPaired ? (
          <View style={styles.pairingSection}>
            <Text style={styles.sectionTitle}>📱 Pair with Dashboard</Text>
            <Text style={styles.helperText}>
              Enter the 6-character code from your vehicle dashboard
            </Text>
            <TextInput
              style={styles.input}
              placeholder="ABC123"
              value={pairingCode}
              onChangeText={(text) => setPairingCode(text.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handlePairing}>
              <Text style={styles.primaryButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.connectedSection}>
            <Text style={styles.sectionTitle}>✅ Connected</Text>
            <Text style={styles.pairingInfo}>
              Code: {pairingCode} • User: {userId.substring(0, 12)}...
            </Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleDisconnect}>
              <Text style={styles.secondaryButtonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sync Section */}
        {isPaired && isHealthKitReady && (
          <View style={styles.syncSection}>
            <TouchableOpacity
              style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
              onPress={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.syncButtonText}>📊 Sync Health Data</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Metrics Display */}
        {lastMetrics && (
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>📈 Last Sync</Text>
            <View style={styles.metricsGrid}>
              <MetricCard label="Heart Rate" value={lastMetrics.heartRate} unit="BPM" />
              <MetricCard label="Steps" value={lastMetrics.steps} unit="steps" />
              <MetricCard
                label="Blood Pressure"
                value={
                  lastMetrics.bloodPressureSystolic && lastMetrics.bloodPressureDiastolic
                    ? `${lastMetrics.bloodPressureSystolic}/${lastMetrics.bloodPressureDiastolic}`
                    : null
                }
                unit="mmHg"
              />
              <MetricCard label="Sleep" value={lastMetrics.sleepDuration} unit="hours" />
              <MetricCard label="SpO2" value={lastMetrics.oxygenSaturation} unit="%" />
              <MetricCard label="Stress" value={lastMetrics.stressLevel} unit="%" />
            </View>
          </View>
        )}

        {/* iOS Only Notice */}
        {Platform.OS !== 'ios' && (
          <View style={styles.noticeContainer}>
            <Text style={styles.noticeText}>
              ⚠️ Health data collection is only available on iOS devices with HealthKit
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  pairingSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectedSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pairingInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  secondaryButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  syncSection: {
    marginBottom: 20,
  },
  syncButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  syncButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricsSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  noticeContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
});
