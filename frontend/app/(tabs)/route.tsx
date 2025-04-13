import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useRouter,
  useLocalSearchParams,
  Stack,
  useFocusEffect,
} from "expo-router";
import * as Location from "expo-location";
import MapView, { Polyline, Marker } from "react-native-maps";

const ADDRESS_MAP = {
  "iribe": "8125 Paint Branch Drive",
  "esj": "4131 Campus Dr",
  "mckeldin": "7649 S Library Ln",
  "physics": "4150 Campus Dr",
  "hjp": "4065 Campus Dr",
  "kirwan": "4176 Campus Dr",
  "martin": "4298 Campus Dr"
};

export default function Route() {
  const { destination: initialDestination } = useLocalSearchParams();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [originCoords, setOriginCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        handleGeocoding();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [origin, destination]);

  useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination as string);
      handleGeocoding(undefined, initialDestination as string);
    }
  }, [initialDestination]);

  const handleGeocoding = async (newOrigin?: string, newDest?: string) => {
    const originToGeocode = newOrigin !== undefined ? newOrigin : origin;
    const destToGeocode = newDest !== undefined ? newDest : destination;

    if (originToGeocode) {
      try {
        const mappedOrigin = ADDRESS_MAP[originToGeocode.toLowerCase()] || originToGeocode;
        const originResults = await Location.geocodeAsync(mappedOrigin);
        if (originResults.length > 0) {
          setOriginCoords({
            latitude: originResults[0].latitude,
            longitude: originResults[0].longitude
          });
        }
      } catch (error) {
        console.error("Error geocoding origin:", error);
      }
    }
    
    if (destToGeocode) {
      try {
        const mappedDest = ADDRESS_MAP[destToGeocode.toLowerCase()] || destToGeocode;
        const destResults = await Location.geocodeAsync(mappedDest);
        if (destResults.length > 0) {
          setDestinationCoords({
            latitude: destResults[0].latitude,
            longitude: destResults[0].longitude
          });
        }
      } catch (error) {
        console.error("Error geocoding destination:", error);
      }
    }
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setOriginCoords({ latitude, longitude });

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
    const tempCoords = originCoords;
    setOriginCoords(destinationCoords);
    setDestinationCoords(tempCoords);
  };

  const handleClose = () => {
    setOrigin("");
    router.replace("/");
  };

  const openNativeMap = () => {
    if (!originCoords || !destinationCoords) return;

    const scheme = Platform.select({ ios: 'maps:0,0?saddr=', android: 'geo:0,0?q=' });
    const latLngOrigin = `${originCoords.latitude},${originCoords.longitude}`;
    const latLngDest = `${destinationCoords.latitude},${destinationCoords.longitude}`;
    
    const url = Platform.select({
      ios: `maps:0,0?saddr=${latLngOrigin}&daddr=${latLngDest}`,
      android: `google.navigation:q=${latLngDest}&saddr=${latLngOrigin}`
    });

    Linking.openURL(url as string);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={20} color="black" />
      </TouchableOpacity>

      <MapView
        style={[styles.map, isKeyboardVisible && { height: Dimensions.get("window").height * 0.1 }]}
        initialRegion={{
          latitude: 38.9869,
          longitude: -76.9426,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        }}
      >
        {originCoords && (
          <Marker
            coordinate={originCoords}
            title="Origin"
          />
        )}
        {destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            title="Destination"
          />
        )}
        {originCoords && destinationCoords && (
          <Polyline
            coordinates={[originCoords, destinationCoords]}
            strokeColor="#000"
            strokeWidth={2}
          />
        )}
      </MapView>

      <TouchableOpacity 
        activeOpacity={1} 
        onPress={Keyboard.dismiss} 
        style={styles.bottomSheet}
      >
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
          {[1].map((route, index) => (
            <View key={index} style={styles.routeCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTime}>Navigate to Destination</Text>
                <Text style={styles.routeDetails}>Opens in Maps app</Text>
              </View>
              <TouchableOpacity 
                style={styles.goButton}
                onPress={openNativeMap}
                disabled={!originCoords || !destinationCoords}
              >
                <Text style={styles.goText}>Go</Text>
              </TouchableOpacity>
            </View>
          ))}

          {originCoords && destinationCoords && [1].map((route, index) => (
            <View key={`internal-${index}`} style={[styles.routeCard, styles.lastCard]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTime}>Get Indoor Directions</Text>
                <Text style={styles.routeDetails}>Uses internal navigation</Text>
              </View>
              <TouchableOpacity 
                style={styles.goButton}
                onPress={() => {
                  // TODO: Call internal Flask API endpoint
                  console.log("Will call internal API");
                }}
                disabled={!originCoords || !destinationCoords}
              >
                <Text style={styles.goText}>Go</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F3",
  },
  map: {
    width: "100%",
    height: Dimensions.get("window").height * 0.5,
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
