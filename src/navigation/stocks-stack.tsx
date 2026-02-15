import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {WatchlistScreen} from '@/screens/stocks/watchlist-screen';
import {StockDetailScreen} from '@/screens/stocks/stock-detail-screen';
import type {StocksStackParamList} from './types';

const Stack = createStackNavigator<StocksStackParamList>();

export function StocksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{title: 'Stocks'}}
      />
      <Stack.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={({route}) => ({title: route.params.symbol})}
      />
    </Stack.Navigator>
  );
}
