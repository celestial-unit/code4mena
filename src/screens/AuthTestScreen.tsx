import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LoginForm } from '../components/auth';
import { useAuth } from '../hooks';
import type { AuthError } from '../services/authService';

const AuthTestScreen: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    // Show login form if not authenticated
    if (!isAuthenticated && !isLoading) {
      setShowLoginForm(true);
    } else {
      setShowLoginForm(false);
    }
  }, [isAuthenticated, isLoading]);

  const handleLoginSuccess = () => {
    setShowLoginForm(false);
    Alert.alert('نجح تسجيل الدخول', 'تم تسجيل الدخول بنجاح!');
  };

  const handleLoginError = (error: AuthError) => {
    console.error('Login error:', error);
  };

  const handleLogout = async () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من أنك تريد تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تسجيل الخروج',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            Alert.alert('تم تسجيل الخروج', 'تم تسجيل الخروج بنجاح');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>اختبار نظام المصادقة</Text>
        <Text style={styles.subtitle}>
          هذه الشاشة تختبر وظائف تسجيل الدخول والخروج
        </Text>
      </View>

      {isAuthenticated && user ? (
        <View style={styles.userSection}>
          <Text style={styles.sectionTitle}>معلومات المستخدم</Text>

          <View style={styles.userInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الاسم:</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>المعرف:</Text>
              <Text style={styles.infoValue}>{user.id}</Text>
            </View>

            {user.role && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>الدور:</Text>
                <Text style={styles.infoValue}>{user.role}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginSection}>
          <Text style={styles.sectionTitle}>تسجيل الدخول مطلوب</Text>

          {showLoginForm ? (
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onLoginError={handleLoginError}
            />
          ) : (
            <TouchableOpacity
              style={styles.showLoginButton}
              onPress={() => setShowLoginForm(true)}
            >
              <Text style={styles.showLoginButtonText}>
                عرض نموذج تسجيل الدخول
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>حالة المصادقة</Text>

        <View style={styles.statusInfo}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>مصادق:</Text>
            <Text
              style={[
                styles.statusValue,
                isAuthenticated ? styles.statusSuccess : styles.statusError,
              ]}
            >
              {isAuthenticated ? 'نعم' : 'لا'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>جاري التحميل:</Text>
            <Text style={styles.statusValue}>{isLoading ? 'نعم' : 'لا'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.instructionsSection}>
        <Text style={styles.sectionTitle}>تعليمات الاختبار</Text>
        <Text style={styles.instructionText}>
          • يمكنك استخدام أي بريد إلكتروني وكلمة مرور للاختبار
        </Text>
        <Text style={styles.instructionText}>
          • كلمة المرور يجب أن تكون 6 أحرف على الأقل
        </Text>
        <Text style={styles.instructionText}>
          • سيتم حفظ بيانات المصادقة في التخزين المحلي
        </Text>
        <Text style={styles.instructionText}>
          • يمكنك تسجيل الخروج لاختبار إزالة البيانات
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d',
  },
  loadingText: {
    fontSize: 18,
    color: '#6c757d',
  },
  userSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    textAlign: 'center',
  },
  userInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  infoValue: {
    fontSize: 16,
    color: '#6c757d',
    flex: 1,
    textAlign: 'left',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  showLoginButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    margin: 20,
  },
  showLoginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusInfo: {
    marginTop: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusSuccess: {
    color: '#28a745',
  },
  statusError: {
    color: '#dc3545',
  },
  instructionsSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#e7f3ff',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  instructionText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    textAlign: 'right',
  },
});

export default AuthTestScreen;
