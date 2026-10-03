import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from '@/navigation/root-navigator';
import {setNewsApiKey} from '@/services/api-client';

// Native only: the web build keeps its key on the server (api/news.js) and never ships one.
declare const __NEWS_API_KEY__: string | undefined;

if (typeof __NEWS_API_KEY__ !== 'undefined' && __NEWS_API_KEY__) {
  setNewsApiKey(__NEWS_API_KEY__);
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
