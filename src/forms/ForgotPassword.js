import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import API_URL from '../services/api_url';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSendEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}password-reset/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      Alert.alert(
        'Success',
        'A verification code has been sent to your email.',
        [{ text: 'OK', onPress: () => setStep(2) }]
      );
    } catch (error) {
      console.error("ERROR", error.message)
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}password-reset/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, verification_code: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      Alert.alert(
        'Success',
        'Code verified successfully. Please set your new password.',
        [{ text: 'OK', onPress: () => setStep(3) }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      Alert.alert('Success', 'Your password has been reset successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.description}>
              Enter your email address and we'll send you a verification code.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <Button
              mode="contained"
              onPress={handleSendEmail}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Send Verification Code
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.title}>Verify Code</Text>
            <Text style={styles.description}>
              Enter the verification code sent to your email.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter verification code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              editable={!loading}
            />
            <Button
              mode="contained"
              onPress={handleVerifyCode}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Verify Code
            </Button>
            <Button
              mode="text"
              onPress={() => setStep(1)}
              style={styles.secondaryButton}
              disabled={loading}
            >
              Back to Email
            </Button>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.description}>
              Create a new password for your account.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Reset Password
            </Button>
            <Button
              mode="text"
              onPress={() => setStep(2)}
              style={styles.secondaryButton}
              disabled={loading}
            >
              Back to Verification
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#daa520" />
            </View>
          )}
          {renderStepContent()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f8f8ff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#daa520',
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
  },
  secondaryButton: {
    marginTop: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default ForgotPassword;