import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {NewsStack} from './news-stack';
import {StocksStack} from './stocks-stack';
import {SettingsScreen} from '@/screens/settings/settings-screen';
import type {RootTabParamList} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}>
      <Tab.Screen
        name="NewsTab"
        component={NewsStack}
        options={{
          tabBarLabel: 'News',
          tabBarIcon: ({color, size}) => (
            <Icon name="newspaper-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="StocksTab"
        component={StocksStack}
        options={{
          tabBarLabel: 'Stocks',
          tabBarIcon: ({color, size}) => (
            <Icon name="trending-up-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          headerShown: true,
          title: 'Settings',
          tabBarIcon: ({color, size}) => (
            <Icon name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
