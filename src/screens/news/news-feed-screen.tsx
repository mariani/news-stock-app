import React, {useCallback, useEffect} from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useNewsStore} from '@/store/news-store';
import {ArticleCard} from '@/components/news/article-card';
import {TopicFilterBar} from '@/components/news/topic-filter-bar';
import {LoadingSpinner} from '@/components/common/loading-spinner';
import {ErrorBanner} from '@/components/common/error-banner';
import {LiveScoreBanner} from '@/components/sports/live-score-banner';
import {EmptyState} from '@/components/common/empty-state';
import {colors} from '@/constants/theme';
import type {NewsStackParamList} from '@/navigation/types';
import type {Article} from '@/types/article';

type Props = NativeStackScreenProps<NewsStackParamList, 'NewsFeed'>;

export function NewsFeedScreen({navigation}: Props) {
  const articles = useNewsStore(s => s.articles);
  const isLoading = useNewsStore(s => s.isLoading);
  const error = useNewsStore(s => s.error);
  const fetchArticles = useNewsStore(s => s.fetchArticles);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleRefresh = useCallback(() => {
    fetchArticles(true);
  }, [fetchArticles]);

  const handleArticlePress = useCallback(
    (article: Article) => {
      navigation.navigate('ArticleDetail', {
        articleUrl: article.url,
        title: article.source.name,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item}: {item: Article}) => (
      <ArticleCard article={item} onPress={() => handleArticlePress(item)} />
    ),
    [handleArticlePress],
  );

  if (isLoading && articles.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <TopicFilterBar />
      <LiveScoreBanner />
      {error && <ErrorBanner message={error} onRetry={handleRefresh} />}
      <FlatList
        data={articles}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No articles"
            subtitle="Select some topics or add RSS feeds in Settings"
          />
        }
        contentContainerStyle={articles.length === 0 && styles.emptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyList: {
    flex: 1,
  },
});
