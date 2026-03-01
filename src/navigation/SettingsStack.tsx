import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SettingsScreen } from '../screens/settings/SettingsScreen'
import { RestaurantInfoScreen } from '../screens/settings/RestaurantInfoScreen'
import { HoursScreen } from '../screens/settings/HoursScreen'
import { OrderSettingsScreen } from '../screens/settings/OrderSettingsScreen'
import { ChannelConfigScreen } from '../screens/settings/ChannelConfigScreen'
import { ChannelDetailScreen } from '../screens/settings/ChannelDetailScreen'
import { MenuScreen } from '../screens/settings/MenuScreen'
import { MenuItemDetailScreen } from '../screens/settings/MenuItemDetailScreen'

export type SettingsStackParamList = {
  SettingsHome: undefined
  RestaurantInfo: undefined
  Hours: undefined
  OrderSettings: undefined
  ChannelConfig: undefined
  ChannelDetail: { source: string; fulfillment: string }
  Menu: undefined
  MenuItemDetail: { itemId: string }
}

const Stack = createNativeStackNavigator<SettingsStackParamList>()

export function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
      <Stack.Screen name="RestaurantInfo" component={RestaurantInfoScreen} />
      <Stack.Screen name="Hours" component={HoursScreen} />
      <Stack.Screen name="OrderSettings" component={OrderSettingsScreen} />
      <Stack.Screen name="ChannelConfig" component={ChannelConfigScreen} />
      <Stack.Screen name="ChannelDetail" component={ChannelDetailScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="MenuItemDetail" component={MenuItemDetailScreen} />
    </Stack.Navigator>
  )
}
