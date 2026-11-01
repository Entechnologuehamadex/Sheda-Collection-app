import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import "../global.css";

export default function RootLayout() {
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
