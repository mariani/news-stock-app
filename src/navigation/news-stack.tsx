import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NewsFeedScreen} from '@/screens/news/news-feed-screen';
import {ArticleDetailScreen} from '@/screens/news/article-detail-screen';
import type {NewsStackParamList} from './types';

const Stack = createNativeStackNavigator<NewsStackParamList>();

export function NewsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NewsFeed"
        component={NewsFeedScreen}
        options={{title: 'News'}}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={({route}) => ({title: route.params.title})}
      />
    </Stack.Navigator>
  );
}
