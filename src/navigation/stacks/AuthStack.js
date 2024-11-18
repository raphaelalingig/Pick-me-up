// navigation/stacks/AuthStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../routes';
import Login from '../../forms/Login';
import Register from '../../forms/Register';
import Confirmation from '../../forms/Confirmation';

const Stack = createNativeStackNavigator();

export const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={ROUTES.AUTH.LOGIN} component={Login} />
    <Stack.Screen name={ROUTES.AUTH.REGISTER} component={Register} />
    <Stack.Screen name={ROUTES.AUTH.CONFIRMATION} component={Confirmation} />
  </Stack.Navigator>
);