import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from '@/navigation/root-navigator';
import {setNewsApiKey, setAlphaVantageApiKey} from '@/services/api-client';

// Globals injected by webpack DefinePlugin (web) or react-native-config (native)
declare const __NEWS_API_KEY__: string | undefined;
declare const __ALPHA_VANTAGE_API_KEY__: string | undefined;

if (typeof __NEWS_API_KEY__ !== 'undefined') {
  setNewsApiKey(__NEWS_API_KEY__);
}
if (typeof __ALPHA_VANTAGE_API_KEY__ !== 'undefined') {
  setAlphaVantageApiKey(__ALPHA_VANTAGE_API_KEY__);
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
