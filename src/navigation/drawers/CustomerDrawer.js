// navigation/drawers/CustomerDrawer.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import { navigationTheme } from '../theme';
import { ROUTES } from '../routes';
import CustomDrawerContent from '../CustomDrawerContent';
import AvatarCustomer from '../../customer/pages/AvatarCustomer';

import MainComponent from '../../customer/pages/Home';
import History from "../../customer/pages/History";
import Settings from "../../customer/pages/Settings";

import { useAuth } from '../../services/useAuth';

const Drawer = createDrawerNavigator();

export const CustomerDrawerNavigation = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      ...navigationTheme,
      headerRight: () => useAuth.userRole === 4 ? null : <AvatarCustomer />,
    }}
  >
    <Drawer.Screen
      name={ROUTES.CUSTOMER.HOME}
      component={MainComponent}
      options={{
        drawerIcon: ({ color, size }) => (
          <Icon name="home-outline" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name={ROUTES.CUSTOMER.HISTORY}
      component={History}
      options={{
        drawerIcon: ({ color, size }) => (
          <Icon name="time-outline" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name={ROUTES.CUSTOMER.SETTINGS}
      component={Settings}
      options={{
        drawerIcon: ({ color, size }) => (
          <Icon name="settings-outline" color={color} size={size} />
        ),
      }}
    />
  </Drawer.Navigator>
);