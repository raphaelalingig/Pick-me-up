// navigation/drawers/RiderDrawer.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';
import { navigationTheme } from '../theme';
import { ROUTES } from '../routes';
import CustomDrawerContent from '../CustomDrawerContent';
import AvatarRider from '../../rider/avatarDropdown/AvatarRider';

const Drawer = createDrawerNavigator();

export const RiderDrawerNavigation = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      ...navigationTheme,
      headerRight: () => <AvatarRider />,
    }}
  >
    <Drawer.Screen
      name={ROUTES.RIDER.HOME}
      component={RiderHome}
      options={{
        drawerIcon: ({ color, size }) => (
          <Icon name="home-outline" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name={ROUTES.RIDER.VERIFICATION}
      component={GetVerified}
      options={{
        drawerIcon: ({ color, size }) => (
          <Icon name="checkmark-circle-outline" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name={ROUTES.RIDER.HISTORY}
      component={RiderHistory}
      options={{
        drawerIcon: ({ color, size }) => (
          <Icon name="time-outline" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name={ROUTES.RIDER.SETTINGS}
      component={RiderSettings}
      options={{
        drawerIcon: ({ color, size }) => (
          <Icon name="settings-outline" color={color} size={size} />
        ),
      }}
    />
  </Drawer.Navigator>
);
