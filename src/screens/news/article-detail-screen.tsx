import React, {useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {colors} from '@/constants/theme';
import type {NewsStackParamList} from '@/navigation/types';

type Props = NativeStackScreenProps<NewsStackParamList, 'ArticleDetail'>;

export function ArticleDetailScreen({route}: Props) {
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <WebView
        source={{uri: route.params.articleUrl}}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    zIndex: 1,
  },
  webview: {
    flex: 1,
  },
});
