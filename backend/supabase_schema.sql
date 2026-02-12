-- GAIA v3 Supabase Database Schema
-- Run this SQL in Supabase SQL Editor to create all tables

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    age INTEGER,
    height INTEGER, -- cm
    weight INTEGER, -- kg
    gender TEXT CHECK (gender IN ('male', 'female')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ==================== HEALTH DATA TABLE ====================
CREATE TABLE IF NOT EXISTS health_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp BIGINT NOT NULL, -- Unix timestamp in milliseconds
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Core metrics (Samsung Health / Google Fit)
    heart_rate INTEGER, -- bpm
    blood_pressure_systolic INTEGER, -- mmHg
    blood_pressure_diastolic INTEGER, -- mmHg
    temperature NUMERIC(4,1), -- celsius
    steps INTEGER,
    
    -- Sleep metrics
    sleep_duration NUMERIC(4,1), -- hours
    sleep_quality TEXT CHECK (sleep_quality IN ('excellent', 'good', 'fair', 'poor', 'unknown')),
    sleep_deep NUMERIC(4,1), -- hours
    sleep_light NUMERIC(4,1), -- hours
    sleep_rem NUMERIC(4,1), -- hours
    
    -- Advanced health metrics
    oxygen_saturation INTEGER, -- SpO2 percentage
    stress_level INTEGER, -- 0-100 scale
    fatigue INTEGER, -- 0-100 scale
    respiratory_rate INTEGER, -- breaths per minute
    
    -- Vehicle-specific (if available)
    ambient_noise INTEGER -- dB
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_health_data_user_id ON health_data(user_id);
CREATE INDEX IF NOT EXISTS idx_health_data_timestamp ON health_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_health_data_user_timestamp ON health_data(user_id, timestamp DESC);

-- ==================== SYNC HISTORY TABLE ====================
CREATE TABLE IF NOT EXISTS sync_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sync_id TEXT NOT NULL,
    status TEXT CHECK (status IN ('success', 'failure', 'pending')),
    message TEXT,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sync_history_user_id ON sync_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_synced_at ON sync_history(synced_at DESC);

-- ==================== PAIRING CODES TABLE ====================
CREATE TABLE IF NOT EXISTS pairing_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Add index for code lookup
CREATE INDEX IF NOT EXISTS idx_pairing_codes_code ON pairing_codes(code);
CREATE INDEX IF NOT EXISTS idx_pairing_codes_user_id ON pairing_codes(user_id);

-- ==================== ROW LEVEL SECURITY (RLS) ====================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairing_codes ENABLE ROW LEVEL SECURITY;

-- Policies for users table (users can only read/update their own data)
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Policies for health_data table
CREATE POLICY "Users can view own health data"
    ON health_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data"
    ON health_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for sync_history
CREATE POLICY "Users can view own sync history"
    ON sync_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync history"
    ON sync_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for pairing_codes
CREATE POLICY "Users can view own pairing codes"
    ON pairing_codes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pairing codes"
    ON pairing_codes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ==================== FUNCTIONS & TRIGGERS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== SAMPLE DATA (for testing) ====================

-- Insert test user (password: 'test123' hashed with bcrypt)
-- Note: Replace with proper password hash in production
INSERT INTO users (email, password_hash, age, height, weight, gender)
VALUES (
    'test@gaia.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNJ0q0F3u', -- bcrypt hash of 'test123'
    30,
    175,
    70,
    'male'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample health data
WITH test_user AS (
    SELECT id FROM users WHERE email = 'test@gaia.com'
)
INSERT INTO health_data (
    user_id,
    timestamp,
    heart_rate,
    blood_pressure_systolic,
    blood_pressure_diastolic,
    temperature,
    steps,
    sleep_duration,
    sleep_quality,
    oxygen_saturation,
    stress_level,
    fatigue
)
SELECT
    id,
    EXTRACT(EPOCH FROM NOW())::BIGINT * 1000, -- current timestamp in ms
    72,
    120,
    80,
    36.8,
    8543,
    7.5,
    'good',
    98,
    45,
    30
FROM test_user;

-- ==================== VIEWS (optional, for analytics) ====================

-- View for daily health averages
CREATE OR REPLACE VIEW daily_health_averages AS
SELECT
    user_id,
    DATE(TO_TIMESTAMP(timestamp / 1000)) AS date,
    AVG(heart_rate) AS avg_heart_rate,
    AVG(blood_pressure_systolic) AS avg_bp_systolic,
    AVG(steps) AS avg_steps,
    AVG(sleep_duration) AS avg_sleep_duration,
    AVG(oxygen_saturation) AS avg_oxygen,
    AVG(stress_level) AS avg_stress
FROM health_data
GROUP BY user_id, DATE(TO_TIMESTAMP(timestamp / 1000))
ORDER BY date DESC;

-- ==================== CLEANUP (if needed) ====================

-- To drop all tables (USE WITH CAUTION):
-- DROP TABLE IF EXISTS pairing_codes CASCADE;
-- DROP TABLE IF EXISTS sync_history CASCADE;
-- DROP TABLE IF EXISTS health_data CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ==================== VERIFICATION QUERIES ====================

-- Check table structure
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name, ordinal_position;

-- Check row counts
-- SELECT 
--     (SELECT COUNT(*) FROM users) AS users_count,
--     (SELECT COUNT(*) FROM health_data) AS health_data_count,
--     (SELECT COUNT(*) FROM sync_history) AS sync_history_count,
--     (SELECT COUNT(*) FROM pairing_codes) AS pairing_codes_count;
