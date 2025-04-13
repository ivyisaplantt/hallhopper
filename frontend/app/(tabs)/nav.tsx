import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SearchBar } from "@rneui/themed";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";

const HomeImage = require("@/assets/images/Home.png");
const BookmarkImage = require("@/assets/images/Star.png");
const CloseImage = require("@/assets/images/Cancel.png");

export default function Nav() {
  const [search, setSearch] = useState("");
  const homeAddress = "8300 Baltimore Ave";
  const router = useRouter();

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const navigateToRoute = (destination: string) => {
    setSearch("");
    router.replace({
      pathname: "/route",
      params: { destination },
    });
  };

  const handleClose = () => {
    setSearch("");
    router.push("/");
  };

  const handleSubmitSearch = () => {
    if (search.trim()) {
      navigateToRoute(search);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.top}>
        <SearchBar
          placeholder="Destination"
          placeholderTextColor="#000"
          searchIcon={{ color: "black", size: 25 }}
          clearIcon={false}
          onChangeText={updateSearch}
          value={search}
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.searchInput}
          inputStyle={styles.searchText}
          onSubmitEditing={handleSubmitSearch}
        />

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Image source={CloseImage} style={styles.closeIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          onPress={() => navigateToRoute(homeAddress)}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <Image source={HomeImage} style={styles.icon} />
            <Text style={styles.buttonText}>Home</Text>
          </View>
        </TouchableOpacity>

        {["Bookmark 1", "Bookmark 2", "Bookmark 3"].map((bookmark, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigateToRoute(bookmark)}
            style={styles.button}
          >
            <View style={styles.buttonContent}>
              <Image source={BookmarkImage} style={styles.icon} />
              <Text style={styles.buttonText}>{bookmark}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F3",
  },
  top: {
    backgroundColor: "#D6EABD",
    paddingTop: 75,
    paddingHorizontal: 20,
    paddingBottom: 15,
    position: "relative",
  },
  searchContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    height: 45,
  },
  searchText: {
    fontSize: 20,
    color: "#000000",
    fontFamily: "Cormorant Garamond",
  },
  closeButton: {
    position: "absolute",
    top: 82,
    right: 30,
    padding: 5,
  },
  content: {
    padding: 10,
  },
  button: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  buttonText: {
    color: "#000000",
    fontSize: 20,
    fontFamily: "Cormorant Garamond",
  },
});
