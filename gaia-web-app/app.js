// Configuration
const API_URL = 'http://192.168.225.51:5000/api';
const GOOGLE_FIT_PROXY = 'http://localhost:5001';
const GOOGLE_CLIENT_ID = '657185601304-olima0r17is2bct52jlhgfvio7sntjea.apps.googleusercontent.com';

// State
let state = {
    pairingCode: null,
    userId: null,
    isPaired: false,
    googleAccessToken: null,
    isGoogleConnected: false
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSavedState();
    
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('oauth') === 'success') {
        state.isGoogleConnected = true;
        state.googleAccessToken = 'connected';
        saveState();
        showStatus('✅ Google Fit connected!', 'connected');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('oauth') === 'error') {
        showStatus('❌ Google OAuth failed', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    updateUI();
});

// Load saved state from localStorage
function loadSavedState() {
    const saved = localStorage.getItem('gaiaState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('gaiaState', JSON.stringify(state));
}

// Update UI based on state
function updateUI() {
    const status = document.getElementById('status');
    const pairingSection = document.getElementById('pairingSection');
    const googleFitSection = document.getElementById('googleFitSection');
    const syncSection = document.getElementById('syncSection');
    const metricsSection = document.getElementById('metricsSection');

    if (!state.isPaired) {
        status.textContent = '⚠️ Not connected to dashboard';
        status.className = 'status';
        pairingSection.classList.remove('hidden');
        googleFitSection.classList.add('hidden');
        syncSection.classList.add('hidden');
    } else if (!state.isGoogleConnected) {
        status.textContent = `✅ Connected to dashboard (${state.pairingCode})`;
        status.className = 'status connected';
        pairingSection.classList.add('hidden');
        googleFitSection.classList.remove('hidden');
        syncSection.classList.add('hidden');
    } else {
        status.textContent = `✅ Dashboard & Google Fit connected`;
        status.className = 'status connected';
        pairingSection.classList.add('hidden');
        googleFitSection.classList.add('hidden');
        syncSection.classList.remove('hidden');
    }
}

// Handle pairing with dashboard
async function handlePairing() {
    const input = document.getElementById('pairingCode');
    const code = input.value.toUpperCase().trim();

    if (code.length !== 6) {
        showStatus('Please enter a 6-character code', 'error');
        return;
    }

    showStatus('🔄 Verifying pairing code...', '');

    try {
        const userId = `user_${Date.now()}`;
        const response = await fetch(`${API_URL}/verify-pairing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pairingCode: code,
                userId: userId
            })
        });

        const data = await response.json();

        if (data.success) {
            state.pairingCode = code;
            state.userId = userId;
            state.isPaired = true;
            saveState();
            updateUI();
            showStatus('✅ Connected to dashboard!', 'connected');
        } else {
            showStatus('❌ Invalid pairing code', 'error');
        }
    } catch (error) {
        console.error('Pairing error:', error);
        showStatus('❌ Connection error. Is the backend running?', 'error');
    }
}

// Handle Google Sign In
function handleGoogleSignIn() {
    if (!state.userId) {
        showStatus('❌ Please pair with dashboard first', 'error');
        return;
    }
    
    // Redirect to OAuth proxy
    showStatus('🔄 Redirecting to Google Sign-In...', '');
    window.location.href = `${GOOGLE_FIT_PROXY}/oauth/start?userId=${state.userId}`;
}

// Handle Google OAuth callback
async function handleGoogleCallback(response) {
    if (response.code) {
        showStatus('🔄 Connecting to Google Fit...', '');
        
        // Exchange code for access token (this should be done on your backend for security)
        try {
            // For now, we'll use the code directly
            // In production, send this code to your backend to exchange for access token
            state.googleAccessToken = response.code;
            state.isGoogleConnected = true;
            saveState();
            updateUI();
            showStatus('✅ Google Fit connected!', 'connected');
        } catch (error) {
            console.error('Google authentication error:', error);
            showStatus('❌ Google authentication failed', 'error');
        }
    }
}

// Fetch Google Fit data via proxy
async function fetchGoogleFitData() {
    const response = await fetch(`${GOOGLE_FIT_PROXY}/api/google-fit/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            userId: state.userId
        })
    });

    if (!response.ok) {
        const error = await response.json();
        if (error.needsAuth) {
            throw new Error('Please sign in with Google first');
        }
        throw new Error(error.error || 'Failed to fetch Google Fit data');
    }

    const result = await response.json();
    return result.data;
}

// Fetch data from Google Fit API
async function fetchFitnessData(dataSourceId, startTimeMillis, endTimeMillis) {
    const url = `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSourceId}/datasets/${startTimeMillis}000000-${endTimeMillis}000000`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${state.googleAccessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Google Fit API error: ${response.statusText}`);
    }

    return await response.json();
}

// Extract latest value from Google Fit response
function extractLatestValue(data) {
    if (!data.point || data.point.length === 0) return null;
    const latest = data.point[data.point.length - 1];
    return latest.value && latest.value[0] ? latest.value[0].fpVal || latest.value[0].intVal : null;
}

// Sum all values from Google Fit response
function sumValues(data) {
    if (!data.point || data.point.length === 0) return 0;
    return data.point.reduce((sum, point) => {
        const value = point.value && point.value[0] ? (point.value[0].fpVal || point.value[0].intVal) : 0;
        return sum + value;
    }, 0);
}

// Handle sync
async function handleSync() {
    const button = document.getElementById('syncButton');
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Syncing...';
    showStatus('📊 Collecting health data...', '');

    try {
        // Fetch Google Fit data
        const healthData = await fetchGoogleFitData();

        // Display metrics
        document.getElementById('heartRate').textContent = healthData.heartRate || '--';
        document.getElementById('steps').textContent = healthData.steps || '--';
        document.getElementById('calories').textContent = healthData.calories || '--';
        document.getElementById('distance').textContent = healthData.distance || '--';
        document.getElementById('metricsSection').classList.remove('hidden');

        showStatus('☁️ Syncing to dashboard...', '');

        // Calculate stress (simple algorithm based on heart rate)
        const stressLevel = healthData.heartRate 
            ? Math.min(85, 20 + (healthData.heartRate - 60) * 0.5)
            : null;

        // Send to backend with all Google Fit data
        const response = await fetch(`${API_URL}/sync-health`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pairingCode: state.pairingCode,
                userId: state.userId,
                timestamp: Date.now(),
                heartRate: healthData.heartRate,
                steps: healthData.steps,
                calories: healthData.calories,
                distance: healthData.distance,
                bloodPressureSystolic: healthData.bloodPressureSystolic,
                bloodPressureDiastolic: healthData.bloodPressureDiastolic,
                sleepDuration: healthData.sleepDuration,
                oxygenSaturation: healthData.oxygenSaturation,
                weight: healthData.weight,
                height: healthData.height,
                stressLevel: stressLevel
            })
        });

        const data = await response.json();

        if (data.success) {
            showStatus('✅ Health data synced successfully!', 'connected');
        } else {
            showStatus('❌ Sync failed', 'error');
        }
    } catch (error) {
        console.error('Sync error:', error);
        showStatus('❌ Error: ' + error.message, 'error');
    } finally {
        button.disabled = false;
        button.textContent = 'Sync Health Data to Dashboard';
    }
}

// Handle disconnect
function handleDisconnect() {
    if (confirm('Disconnect from dashboard and Google Fit?')) {
        state = {
            pairingCode: null,
            userId: null,
            isPaired: false,
            googleAccessToken: null,
            isGoogleConnected: false
        };
        saveState();
        updateUI();
        document.getElementById('metricsSection').classList.add('hidden');
        showStatus('Disconnected', '');
    }
}

// Show status message
function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status ' + type;
}
