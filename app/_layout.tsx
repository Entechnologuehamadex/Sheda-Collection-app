import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import "../global.css";

// Held open until Inter is in memory, so the first frame is not the system
// font being swapped out underneath the reader.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // The four weights components/Text.tsx exposes, under the same family
  // names the rental app registers. A screen moved between the two apps
  // keeps its typography; a name that does not resolve falls back to the
  // platform serif, which is how this was missed until it reached a browser.
  const [fontsLoaded, fontError] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter_24pt-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter_24pt-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter_24pt-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_24pt-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // On a font failure the app still renders. Wrong type is a blemish; a
  // blank screen is a product that does not open.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.primaryText,
          headerTitleStyle: { fontFamily: "Inter-SemiBold", fontSize: 16 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Invest" }} />
        <Stack.Screen name="project/[id]" options={{ title: "Project" }} />
        <Stack.Screen name="project/[id]/units" options={{ title: "Choose a unit" }} />
        <Stack.Screen name="holdings" options={{ title: "Your holdings" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
