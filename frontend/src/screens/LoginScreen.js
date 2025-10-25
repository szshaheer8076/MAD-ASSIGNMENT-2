import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { TextInput, Button, Text, Title, HelperText } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async () => {
    setError('');
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword)
      return setError('Please fill in all required fields');
    if (!validateEmail(formData.email)) return setError('Please enter a valid email address');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters long');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    const result = await register(formData);
    setLoading(false);
    if (!result.success) setError(result.message);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Svg height={height} width={width} style={styles.bgSvg}>
        <Circle cx={width * 0.15} cy={height * 0.1} r={80} fill="#004a99" opacity="0.3" />
        <Circle cx={width * 0.9} cy={height * 0.2} r={100} fill="#007bff" opacity="0.35" />
        <Circle cx={width * 0.2} cy={height * 0.95} r={90} fill="#007bff" opacity="0.25" />
      </Svg>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
          <Title style={styles.title}>Create Account</Title>
          <Text style={styles.subtitle}>Sign up to start shopping</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" duration={1000} style={styles.formContainer}>
          <TextInput label="Full Name *" value={formData.name} onChangeText={(v) => handleChange('name', v)} mode="outlined" style={styles.input} left={<TextInput.Icon icon="account" />} />
          <TextInput label="Email *" value={formData.email} onChangeText={(v) => handleChange('email', v)} mode="outlined" style={styles.input} keyboardType="email-address" autoCapitalize="none" left={<TextInput.Icon icon="email" />} />
          <TextInput label="Password *" value={formData.password} onChangeText={(v) => handleChange('password', v)} mode="outlined" secureTextEntry={!showPassword} style={styles.input} left={<TextInput.Icon icon="lock" />} />
          <TextInput label="Confirm Password *" value={formData.confirmPassword} onChangeText={(v) => handleChange('confirmPassword', v)} mode="outlined" secureTextEntry={!showPassword} style={styles.input} right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />} left={<TextInput.Icon icon="lock-check" />} />
          <TextInput label="Address (Optional)" value={formData.address} onChangeText={(v) => handleChange('address', v)} mode="outlined" style={styles.input} multiline numberOfLines={2} left={<TextInput.Icon icon="map-marker" />} />
          <TextInput label="Phone (Optional)" value={formData.phone} onChangeText={(v) => handleChange('phone', v)} mode="outlined" style={styles.input} keyboardType="phone-pad" left={<TextInput.Icon icon="phone" />} />

          {error ? <HelperText type="error" visible>{error}</HelperText> : null}

          <Button mode="contained" onPress={handleRegister} loading={loading} disabled={loading} style={styles.button}>
            Register
          </Button>

          <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
            Already have an account? Login
          </Button>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eaf2ff' },
  bgSvg: { position: 'absolute', top: 0, left: 0 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#004a99', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#004a99' },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    elevation: 6,
    shadowColor: '#004a99',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  input: { marginBottom: 12 },
  button: { marginTop: 10, paddingVertical: 6, backgroundColor: '#004a99', borderRadius: 10 },
  linkButton: { marginTop: 15, alignSelf: 'center' },
});
