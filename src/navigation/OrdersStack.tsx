import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { OrderListScreen } from '../screens/orders/OrderListScreen'
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen'

export type OrdersStackParamList = {
  OrderList: undefined
  OrderDetail: { orderId: string }
}

const Stack = createNativeStackNavigator<OrdersStackParamList>()

export function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrderList" component={OrderListScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  )
}
