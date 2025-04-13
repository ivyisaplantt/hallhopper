import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useRouter,
  useLocalSearchParams,
  Stack,
  useFocusEffect,
} from "expo-router";
import * as Location from "expo-location";
import MapView from "react-native-maps";

export default function Route() {
  const { destination: initialDestination } = useLocalSearchParams();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setDestination((initialDestination as string) || "");
  }, [initialDestination]);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address) {
        const locationString = `${address.name || ""}`.trim();
        setCurrentLocation(locationString);
        setOrigin(locationString);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getCurrentLocation();
    }, [])
  );

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleClose = () => {
    setDestination("");
    setOrigin("");
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={20} color="black" />
      </TouchableOpacity>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 38.9869,
          longitude: -76.9426,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        }}
      />

      <View style={styles.bottomSheet}>
        <View style={styles.inputSection}>
          <TextInput
            placeholder="Current Location"
            placeholderTextColor="#000"
            value={origin}
            onChangeText={setOrigin}
            style={[styles.input, { width: "95%" }]}
          />
          <TextInput
            placeholder="Destination"
            placeholderTextColor="#000"
            value={destination}
            onChangeText={setDestination}
            style={[styles.input, { width: "95%" }]}
          />
          <TouchableOpacity
            style={styles.swapIconContainer}
            onPress={swapLocations}
          >
            <Ionicons name="arrow-up" size={20} color="black" />
            <Ionicons name="arrow-down" size={20} color="black" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.routes}>
          {[1, 2].map((route, index) => (
            <View key={index} style={styles.routeCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTime}>XX mins</Text>
                <Text style={styles.routeDetails}>XX:XX ETA X miles</Text>
              </View>
              <TouchableOpacity style={styles.goButton}>
                <Text style={styles.goText}>Go</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F3",
  },
  map: {
    width: "100%",
    height: Dimensions.get("window").height * 0.6,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: "#FFF7F3",
  },
  closeButton: {
    position: "absolute",
    top: 45,
    right: 15,
    zIndex: 1,
    backgroundColor: "white",
    padding: 6,
    borderRadius: 999,
    elevation: 3,
  },
  inputSection: {
    backgroundColor: "#D6EABD",
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    position: "relative",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    fontFamily: "Cormorant Garamond",
    color: "#000",
  },
  swapIconContainer: {
    position: "absolute",
    right: 10,
    top: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    fontSize: 16,
    fontFamily: "Cormorant Garamond",
    marginRight: 5,
  },
  routes: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  routeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  routeTime: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Cormorant Garamond",
  },
  routeDetails: {
    fontSize: 14,
    color: "#555",
    fontFamily: "Cormorant Garamond",
  },
  goButton: {
    backgroundColor: "#D6EABD",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 15,
  },
  goText: {
    fontSize: 16,
    fontFamily: "Cormorant Garamond",
    color: "#000",
  },
});
