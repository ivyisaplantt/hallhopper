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
  FlatList,
} from "react-native";
import { supabase } from '../../lib/supabase';
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";

const LogoImage = require("@/assets/images/hallhopperlogo.png");

interface Bookmark {
  id: number;
  user_id: string;
  location: string;
}

export default function MyBookmarks() {
  const [newLocation, setNewLocation] = useState("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Create bookmarks table if it doesn't exist
    const createBookmarksTable = async () => {
      const { error } = await supabase
        .from('bookmarks')
        .select()
        .limit(1)
        .catch(async () => {
          // If table doesn't exist, create it
          return await supabase.query(`
            CREATE TABLE IF NOT EXISTS public.bookmarks (
              id SERIAL PRIMARY KEY,
              user_id UUID NOT NULL,
              location TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
              FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
            );
          `);
        });
    };

    createBookmarksTable();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as any);
      if (session?.user) {
        fetchBookmarks(session.user.id);
      }
    });
  }, []);

  const fetchBookmarks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setBookmarks(data || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarks');
    }
  };

  const handleAddBookmark = async () => {
    if (!newLocation) {
      setError('Please enter a location');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Please log in first');
        return;
      }

      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          location: newLocation
        });

      if (error) throw error;

      setNewLocation('');
      setError('');
      fetchBookmarks(user.id);
    } catch (err) {
      setError('Failed to save bookmark');
      console.error('Error adding bookmark:', err);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: number) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchBookmarks(user.id);
      }
    } catch (err) {
      setError('Failed to delete bookmark');
      console.error('Error deleting bookmark:', err);
    }
  };

  if (!session) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.text}>Please log in to manage your bookmarks</Text>
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
          <Text style={styles.text}>My Bookmarks</Text>
          <Image source={LogoImage} style={styles.image} />
        </View>

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Enter location to bookmark"
            onChangeText={setNewLocation}
            value={newLocation}
            style={styles.input}
          />
          
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.addButton} onPress={handleAddBookmark}>
            <Text style={styles.buttonText}>Add Bookmark</Text>
          </TouchableOpacity>

          <View style={styles.bookmarksList}>
            {bookmarks.map((bookmark) => (
              <View key={bookmark.id} style={styles.bookmarkItem}>
                <Text style={styles.bookmarkText}>{bookmark.location}</Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteBookmark(bookmark.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

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
  },
  bookmarkItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookmarkText: {
    fontSize: 16,
    fontFamily: "Cormorant Garamond",
    color: "#000000",
    flex: 1,
  },
  deleteButton: {
    backgroundColor: "#FFE5E5",
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "#FF0000",
    fontSize: 14,
    fontFamily: "Cormorant Garamond",
  }
});
