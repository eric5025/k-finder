import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import LanguageSelectionScreen from "./src/screens/LanguageSelectionScreen";
import HomeScreen from "./src/screens/HomeScreen";
import LoadingScreen from "./src/screens/LoadingScreen";
import DetailScreen from "./src/screens/DetailScreen";
import SearchResultsScreen from "./src/screens/SearchResultsScreen";
import HistoryScreen from "./src/screens/HistoryScreen";

export type RootStackParamList = {
  LanguageSelection: undefined;
  Home: undefined;
  Loading: { imageUri: string };
  Detail: { analysisResult: any };
  SearchResults: { searchResults: any[]; searchQuery: string };
  History: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="LanguageSelection"
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        >
          <Stack.Screen
            name="LanguageSelection"
            component={LanguageSelectionScreen}
          />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Loading" component={LoadingScreen} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
