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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setError('');
        router.replace('/'); // Using replace instead of push to prevent going back to login
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
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
            autoComplete="current-password"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
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
  loginButton: {
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
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Cormorant Garamond",
  }
});

export default Login;