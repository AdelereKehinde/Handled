import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors } from '../theme';
import DecisionInputScreen from '../screens/DecisionInputScreen';
import DecisionOutputScreen from '../screens/DecisionOutputScreen';
import DecisionHistoryScreen from '../screens/DecisionHistoryScreen';

const Stack = createNativeStackNavigator();

export default function DecisionStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}
    >
      <Stack.Screen name="DecisionInput" component={DecisionInputScreen} />
      <Stack.Screen name="DecisionOutput" component={DecisionOutputScreen} />
      <Stack.Screen name="DecisionHistory" component={DecisionHistoryScreen} />
    </Stack.Navigator>
  );
}
