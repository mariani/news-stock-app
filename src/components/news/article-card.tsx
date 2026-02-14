import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors, spacing, fontSize} from '@/constants/theme';
import {timeAgo} from '@/utils/format-date';
import type {Article} from '@/types/article';

interface Props {
  article: Article;
  onPress: () => void;
}

export function ArticleCard({article, onPress}: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {article.imageUrl && (
        <Image source={{uri: article.imageUrl}} style={styles.image} />
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        {article.description && (
          <Text style={styles.description} numberOfLines={2}>
            {article.description}
          </Text>
        )}
        <View style={styles.meta}>
          <Text style={styles.source}>{article.source.name}</Text>
          <Text style={styles.time}>{timeAgo(article.publishedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  source: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  time: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
