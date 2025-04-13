import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarStyle: { display: "none" } }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="nav" options={{ title: "Navigation" }} />
      <Tabs.Screen name="route" options={{ title: "Route" }} />
      <Tabs.Screen name="login" options={{ title: "Login" }} />
      <Tabs.Screen name="signup" options={{ title: "Sign Up" }} />
    </Tabs>
  );
}