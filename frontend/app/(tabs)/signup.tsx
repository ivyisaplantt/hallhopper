import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { supabase } from '../../lib/supabase';
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";

const LogoImage = require("@/assets/images/hallhopperlogo.png");

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: '',
        }
      });

      if (error) {
        setError(error.message);
        console.error('Signup error:', error.message);
      } else {
        console.log('Signup success:', data);
        setError('');
        setError('Please check your email for verification link');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Signup error:', err);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logo}>
          <Image source={LogoImage} style={styles.image} />
        </View>

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#000"
            onChangeText={setEmail}
            value={email}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#000"
            onChangeText={setPassword}
            value={password}
            style={styles.input}
            secureTextEntry
            autoComplete="new-password"
          />
          {error ? <Text style={[styles.error, error.includes('verification') ? styles.success : null]}>{error}</Text> : null}
          
          <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F3",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    alignItems: "center",
    marginBottom: 15,
  },
  text: {
    fontSize: 36,
    fontFamily: "Cormorant Garamond",
    color: "#000000",
    marginBottom: 10,
  },
  image: {
    height: 100,
    width: 143,
  },
  formContainer: {
    width: "80%",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    fontSize: 18,
    fontFamily: "Cormorant Garamond",
    color: "#000000",
  },
  error: {
    color: "red",
    fontFamily: "Cormorant Garamond",
    textAlign: "center",
    marginVertical: 10,
  },
  success: {
    color: "green",
  },
  signupButton: {
    backgroundColor: "#D6EABD",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000000",
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,
    fontFamily: "Cormorant Garamond",
  },
});

export default SignUp;