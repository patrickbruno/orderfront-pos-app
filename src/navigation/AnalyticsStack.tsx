import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { DashboardScreen } from '../screens/analytics/DashboardScreen'
import { ItemAnalyticsScreen } from '../screens/analytics/ItemAnalyticsScreen'

export type AnalyticsStackParamList = {
  Dashboard: undefined
  ItemAnalytics: undefined
}

const Stack = createNativeStackNavigator<AnalyticsStackParamList>()

export function AnalyticsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ItemAnalytics" component={ItemAnalyticsScreen} />
    </Stack.Navigator>
  )
}
