import "react-native-reanimated";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "react-native";
import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <ThemeProvider value={DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(index)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
              name="clients/add" 
              options={{ 
                headerShown: true,
                presentation: "modal" 
              }} 
            />
            <Stack.Screen 
              name="clients/[id]" 
              options={{ 
                headerShown: true,
                presentation: "card" 
              }} 
            />
            <Stack.Screen 
              name="projects/add" 
              options={{ 
                headerShown: true,
                presentation: "modal" 
              }} 
            />
            <Stack.Screen 
              name="invoices/add" 
              options={{ 
                headerShown: true,
                presentation: "modal" 
              }} 
            />
          </Stack>
          <SystemBars style="auto" />
        </GestureHandlerRootView>
      </ThemeProvider>
    </>
  );
}
