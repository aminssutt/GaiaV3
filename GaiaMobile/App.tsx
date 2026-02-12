import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import HealthKitService, {HealthMetrics} from './src/services/HealthKitService';
import ApiService from './src/services/ApiService';

function App(): React.JSX.Element {
  const [pairingCode, setPairingCode] = useState('');
  const [userId, setUserId] = useState('');
  const [isPaired, setIsPaired] = useState(false);
  const [isHealthKitReady, setIsHealthKitReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<HealthMetrics | null>(null);
  const [statusMessage, setStatusMessage] = useState('Not connected');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Check if already paired
    const saved = await ApiService.getSavedPairing();
    if (saved.pairingCode && saved.userId) {
      setPairingCode(saved.pairingCode);
      setUserId(saved.userId);
      setIsPaired(true);
      setStatusMessage('Connected to dashboard');
    }

    // Initialize HealthKit
    const healthReady = await HealthKitService.initialize();
    setIsHealthKitReady(healthReady);
    if (healthReady) {
      setStatusMessage(prev =>
        prev === 'Not connected'
          ? 'HealthKit ready - Enter pairing code'
          : prev + '\n✅ HealthKit ready',
      );
    } else {
      setStatusMessage(prev => prev + '\n❌ HealthKit not available');
    }
  };

  const handlePairing = async () => {
    if (!pairingCode || pairingCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-character pairing code');
      return;
    }

    if (!userId) {
      const generatedUserId = `user_${Date.now()}`;
      setUserId(generatedUserId);
    }

    setStatusMessage('Connecting to dashboard...');

    const result = await ApiService.verifyPairing(
      pairingCode.toUpperCase(),
      userId || `user_${Date.now()}`,
    );

    if (result.success) {
      setIsPaired(true);
      setStatusMessage('✅ Connected to dashboard!');
      Alert.alert('Success', 'Connected to GAIA Dashboard!');
    } else {
      setStatusMessage('❌ Pairing failed');
      Alert.alert('Pairing Failed', result.message);
    }
  };

  const handleDisconnect = async () => {
    await ApiService.clearPairing();
    setIsPaired(false);
    setPairingCode('');
    setUserId('');
    setStatusMessage('Disconnected');
    Alert.alert('Disconnected', 'You have been disconnected from the dashboard');
  };

  const handleSync = async () => {
    if (!isHealthKitReady) {
      Alert.alert('Error', 'HealthKit is not ready');
      return;
    }

    if (!isPaired) {
      Alert.alert('Error', 'Please pair with dashboard first');
      return;
    }

    setIsSyncing(true);
    setStatusMessage('Collecting health data...');

    try {
      // Collect metrics from HealthKit
      const metrics = await HealthKitService.collectAllMetrics();
      setLastMetrics(metrics);

      // Sync to backend
      setStatusMessage('Syncing to dashboard...');
      const synced = await ApiService.syncHealthData(metrics);

      if (synced) {
        setStatusMessage('✅ Health data synced successfully!');
        Alert.alert('Success', 'Health data synced to dashboard!');
      } else {
        setStatusMessage('❌ Sync failed');
        Alert.alert('Sync Failed', 'Could not sync data to dashboard');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setStatusMessage('❌ Error collecting data');
      Alert.alert('Error', 'Failed to collect health data');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>GAIA Mobile</Text>
          <Text style={styles.subtitle}>Health Data Sync</Text>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>

        {/* Pairing Section */}
        {!isPaired ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connect to Dashboard</Text>
            <Text style={styles.instructionText}>
              Enter the 6-character pairing code from your GAIA dashboard
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Pairing Code (e.g., ABC123)"
              value={pairingCode}
              onChangeText={text => setPairingCode(text.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                (!pairingCode || pairingCode.length !== 6) &&
                  styles.disabledButton,
              ]}
              onPress={handlePairing}
              disabled={!pairingCode || pairingCode.length !== 6}>
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connected</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pairing Code:</Text>
              <Text style={styles.infoValue}>{pairingCode}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID:</Text>
              <Text style={styles.infoValueSmall}>{userId}</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={handleDisconnect}>
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sync Button */}
        {isPaired && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.syncButton,
                (!isHealthKitReady || isSyncing) && styles.disabledButton,
              ]}
              onPress={handleSync}
              disabled={!isHealthKitReady || isSyncing}>
              {isSyncing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  📊 Sync Health Data
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Last Metrics */}
        {lastMetrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Sync Data</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Heart Rate"
                value={lastMetrics.heartRate}
                unit="bpm"
                icon="💓"
              />
              <MetricCard
                label="Steps"
                value={lastMetrics.steps}
                unit="steps"
                icon="🚶"
              />
              <MetricCard
                label="Blood Pressure"
                value={
                  lastMetrics.bloodPressureSystolic &&
                  lastMetrics.bloodPressureDiastolic
                    ? `${lastMetrics.bloodPressureSystolic}/${lastMetrics.bloodPressureDiastolic}`
                    : null
                }
                unit="mmHg"
                icon="🩺"
              />
              <MetricCard
                label="Sleep"
                value={lastMetrics.sleepDuration}
                unit="hours"
                icon="😴"
              />
              <MetricCard
                label="SpO2"
                value={lastMetrics.oxygenSaturation}
                unit="%"
                icon="🫁"
              />
              <MetricCard
                label="Stress"
                value={lastMetrics.stressLevel}
                unit="%"
                icon="🧘"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const MetricCard = ({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: number | string | null;
  unit: string;
  icon: string;
}) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricIcon}>{icon}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>
      {value !== null ? `${value} ${unit}` : 'N/A'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4f46e5',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
  },
  syncButton: {
    backgroundColor: '#10b981',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  infoValueSmall: {
    fontSize: 12,
    color: '#333',
    maxWidth: '60%',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default App;
