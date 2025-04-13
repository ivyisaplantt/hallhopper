import React, { useState, useEffect } from "react";
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

export default function SetHome() {
  const [homeLocation, setHomeLocation] = useState("");
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as any);
      if (session?.user) {
        fetchHomeLocation(session.user.id);
      }
    });
  }, []);

  const fetchHomeLocation = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_homes')
        .select('location')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setHomeLocation(data.location);
      }
    } catch (err) {
      console.error('Error fetching home location:', err);
      setError('Failed to load home location');
    }
  };

  const handleSetHome = async () => {
    if (!homeLocation) {
      setError('Please enter a location');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please log in first');
        return;
      }

      // First check if user already has a home location
      const { data: existingHome } = await supabase
        .from('user_homes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingHome) {
        const { error } = await supabase
          .from('user_homes')
          .update({ location: homeLocation })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_homes')
          .insert({
            user_id: user.id,
            location: homeLocation
          });

        if (error) throw error;
      }

      setError('');
      router.push('/nav');
    } catch (err) {
      setError('Failed to save home location');
      console.error('Error setting home:', err);
    }
  };

  if (!session) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.text}>Please log in to set your home location</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logo}>
          <Text style={styles.text}>Set Home Location</Text>
          <Image source={LogoImage} style={styles.image} />
        </View>

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Enter your home location"
            onChangeText={setHomeLocation}
            value={homeLocation}
            style={styles.input}
          />
          
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.addButton} onPress={handleSetHome}>
            <Text style={styles.buttonText}>Set Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
    paddingVertical: 20,
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
  addButton: {
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

