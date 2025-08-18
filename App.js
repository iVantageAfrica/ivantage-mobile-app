import React, { useEffect, useState } from "react";
import { NativeBaseProvider, Box } from "native-base";
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Routes from './src/common/route'
import Landing from './src/views/landing';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Theme from './src/themes'
import { LinearGradient } from 'expo-linear-gradient';
import {UserContextProvider} from './src/context/usercontext'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from "react-native-gesture-handler";

const MyTheme = {
  ...DefaultTheme,
  backgroundColor: Theme.Colors.backgroundColor,
  colors: {
    ...DefaultTheme.colors,
    backgroundColor: Theme.Colors.backgroundColor,
    background: Theme.Colors.backgroundColor,
  },
};
const config = {
  dependencies: {
    "linear-gradient": LinearGradient
  },
  strictMode: true
};

const cacheFonts = async(fonts) => {
  return fonts.map(font => Font.loadAsync(font));
}


export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();
        await cacheFonts([FontAwesome.font])
      } catch (error) {
        console.error('Error loading fonts:', error);
      } finally {
        SplashScreen.hideAsync()
        setAppIsReady(true)
      }
    }
    loadResourcesAndDataAsync()
  }, [])
  
  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer theme={MyTheme}>
      <StatusBar style={'light'} />
      <NativeBaseProvider config={config}>
        <UserContextProvider>
          <BottomSheetModalProvider>
            <Routes />
          </BottomSheetModalProvider>
        </UserContextProvider>
      </NativeBaseProvider>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}

