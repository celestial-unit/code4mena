import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import authService from '../../services/authService';
import type { LoginCredentials, AuthError } from '../../services/authService';

interface LoginFormProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: AuthError) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!credentials.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    // Password validation
    if (!credentials.password.trim()) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('[LoginForm] Attempting login...');
      const response = await authService.login(credentials);

      console.log('[LoginForm] Login successful:', response.user.email);

      // Show success message
      Alert.alert('تم تسجيل الدخول بنجاح', `مرحباً ${response.user.name}`, [
        { text: 'موافق', onPress: onLoginSuccess },
      ]);
    } catch (error) {
      console.error('[LoginForm] Login failed:', error);

      const authError = error as AuthError;
      const errorMessage = authError.message || 'فشل في تسجيل الدخول';

      Alert.alert('خطأ في تسجيل الدخول', errorMessage);

      if (onLoginError) {
        onLoginError(authError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateCredentials = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تسجيل الدخول</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>البريد الإلكتروني</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={credentials.email}
          onChangeText={value => updateCredentials('email', value)}
          placeholder="أدخل بريدك الإلكتروني"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          value={credentials.password}
          onChangeText={value => updateCredentials('password', value)}
          placeholder="أدخل كلمة المرور"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.demoNote}>
        ملاحظة: هذا نموذج تجريبي. يمكنك استخدام أي بريد إلكتروني وكلمة مرور
        للاختبار.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#34495e',
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    textAlign: 'right',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'right',
  },
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoNote: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});

export default LoginForm;
