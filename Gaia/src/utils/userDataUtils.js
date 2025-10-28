/**
 * Utility functions for managing user personal data
 * Used for personalized AI recommendations
 */

const USER_INFO_KEY = 'gaia:userInfo';

/**
 * Get user info from localStorage
 * @returns {Object|null} User info object or null if not found
 */
export const getUserInfo = () => {
  try {
    const data = localStorage.getItem(USER_INFO_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading user info:', error);
    return null;
  }
};

/**
 * Save user info to localStorage
 * @param {Object} userInfo - User information object
 * @param {number} userInfo.age - User's age in years
 * @param {number} userInfo.height - User's height in cm
 * @param {number} userInfo.weight - User's weight in kg
 * @param {string} userInfo.gender - User's gender ('male' or 'female')
 */
export const saveUserInfo = (userInfo) => {
  try {
    const dataToSave = {
      ...userInfo,
      timestamp: Date.now(),
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Error saving user info:', error);
    return false;
  }
};

/**
 * Check if user info exists
 * @returns {boolean}
 */
export const hasUserInfo = () => {
  return getUserInfo() !== null;
};

/**
 * Clear user info from localStorage
 */
export const clearUserInfo = () => {
  try {
    localStorage.removeItem(USER_INFO_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user info:', error);
    return false;
  }
};

/**
 * Calculate BMI (Body Mass Index)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number|null} BMI value or null if invalid input
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return null;
  }
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

/**
 * Get BMI category
 * @param {number} bmi - BMI value
 * @returns {string} BMI category
 */
export const getBMICategory = (bmi) => {
  if (!bmi) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Get user data summary for AI recommendations
 * Combines user info with health metrics
 * @param {Object} userInfo - User personal information
 * @param {Object} healthData - Current health metrics
 * @returns {Object} Complete user profile for AI analysis
 */
export const getUserDataForAI = (userInfo, healthData) => {
  if (!userInfo) return null;
  
  const bmi = calculateBMI(userInfo.weight, userInfo.height);
  
  return {
    personal: {
      age: userInfo.age,
      height: userInfo.height,
      weight: userInfo.weight,
      gender: userInfo.gender || 'male',
      bmi: bmi,
      bmiCategory: getBMICategory(bmi),
    },
    health: healthData || {},
    timestamp: Date.now(),
  };
};

/**
 * Format user info for display
 * @param {Object} userInfo - User information
 * @returns {Object} Formatted strings for display
 */
export const formatUserInfo = (userInfo) => {
  if (!userInfo) return null;
  
  return {
    age: `${userInfo.age} years`,
    height: `${userInfo.height} cm`,
    weight: `${userInfo.weight} kg`,
    gender: userInfo.gender === 'male' ? 'Male' : 'Female',
    bmi: calculateBMI(userInfo.weight, userInfo.height),
    bmiCategory: getBMICategory(calculateBMI(userInfo.weight, userInfo.height)),
  };
};
