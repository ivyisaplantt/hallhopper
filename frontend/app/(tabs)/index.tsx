import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const LogoImage = require("@/assets/images/hallhopperlogo.png");
const SearchImage = require("@/assets/images/Magnifier.png");

export default function Index() {
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleSearchPress = () => {
    router.push("/nav");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleBookmarks = () => {
    router.push("/mybookmarks");
  };

  const handleHomeLocation = () => {
    router.push("/sethome");
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logo}>
          <Text style={styles.text}>Hall Hopper</Text>
          <Image source={LogoImage} style={styles.image} />
        </View>

        <TouchableOpacity
          onPress={handleSearchPress}
          style={styles.searchButton}
        >
          <View style={styles.searchContainer}>
            <Text style={styles.searchText}>Where To?</Text>
            <Image source={SearchImage} style={styles.searchImage} />
          </View>
        </TouchableOpacity>

        {!session ? (
          <View style={styles.authButtons}>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.userButtons}>
            <TouchableOpacity style={styles.bookmarksButton} onPress={handleBookmarks}>
              <Text style={styles.buttonText}>My Bookmarks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeLocationButton} onPress={handleHomeLocation}>
              <Text style={styles.buttonText}>Set Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF7F3",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#000000",
    fontFamily: "Cormorant Garamond",
    fontWeight: "700",
    fontSize: 40,
  },
  image: {
    height: 150,
    width: 217,
  },
  logo: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  searchButton: {
    backgroundColor: "#D6EABD",
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  searchText: {
    fontSize: 24,
    color: "#000000",
    fontFamily: "Cormorant Garamond",
  },
  searchImage: {
    width: 25,
    height: 25,
    marginLeft: 10,
  },
  authButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  userButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: "#000000",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  signupButton: {
    backgroundColor: "#D6EABD",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookmarksButton: {
    backgroundColor: "#D6EABD",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  homeLocationButton: {
    borderWidth: 1,
    borderColor: "#000000",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  loginText: {
    color: "#000000",
    fontSize: 18,
    fontFamily: "Cormorant Garamond",
  },
  signupText: {
    color: "#000000",
    fontSize: 18,
    fontFamily: "Cormorant Garamond",
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,
    fontFamily: "Cormorant Garamond",
  }
});
