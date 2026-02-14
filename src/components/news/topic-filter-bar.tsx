import React from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {TopicChip} from './topic-chip';
import {AVAILABLE_TOPICS} from '@/constants/topics';
import {useNewsStore} from '@/store/news-store';
import {spacing} from '@/constants/theme';
import type {NewsTopic} from '@/types/settings';

export function TopicFilterBar() {
  const selectedTopics = useNewsStore(s => s.selectedTopics);
  const addTopic = useNewsStore(s => s.addTopic);
  const removeTopic = useNewsStore(s => s.removeTopic);

  const handleToggle = (topic: NewsTopic) => {
    if (selectedTopics.includes(topic)) {
      removeTopic(topic);
    } else {
      addTopic(topic);
    }
  };

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={AVAILABLE_TOPICS}
      keyExtractor={item => item.value}
      contentContainerStyle={styles.container}
      renderItem={({item}) => (
        <TopicChip
          label={item.label}
          selected={selectedTopics.includes(item.value)}
          onPress={() => handleToggle(item.value)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
