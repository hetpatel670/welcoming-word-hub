import React from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { tw } from '../lib/utils';

// Import Screens
import TaskListScreen from '../screens/TaskListScreen'; // Changed HomeScreen to TaskListScreen
import NewTaskScreen from '../screens/NewTaskScreen';
import ExploreScreen from '../screens/ExploreScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import Icons
import { Home, Plus, Users, BarChart2, UserCircle2 } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

// Define NavItem type similar to web version for structure
interface NavItem {
  path: string;
  name: string; // Screen name
  component: React.FC<any>;
  Icon: React.ElementType;
  label: string; // For display
}

const navItems: NavItem[] = [
  { path: '/home', name: 'HomeTab', Icon: Home, label: 'Home', component: TaskListScreen }, // Changed HomeScreen to TaskListScreen
  { path: '/add', name: 'NewTaskTab', Icon: Plus, label: 'Add', component: NewTaskScreen },
  { path: '/explore', name: 'ExploreTab', Icon: Users, label: 'Explore', component: ExploreScreen }, // Users icon for Explore as per web
  { path: '/dashboard', name: 'DashboardTab', Icon: BarChart2, label: 'Stats', component: DashboardScreen },
  { path: '/profile', name: 'ProfileTab', Icon: UserCircle2, label: 'Profile', component: ProfileScreen },
];

const AppTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide header for all tab screens
        tabBarStyle: tw`bg-white border-t border-slate-200 h-[${Platform.OS === 'ios' ? 90 : 70}] pt-2 pb-[${Platform.OS === 'ios' ? 10 : 5}]`,
        tabBarIcon: ({ focused, color, size }) => {
          const item = navItems.find(navItem => navItem.name === route.name);
          if (!item) return null;

          const { Icon, label } = item;
          // Animations can be driven by `focused` state.
          // For simplicity, direct style changes are used here.
          // Animated API can be wrapped around these for smoother transitions.
          
          const iconAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
          const labelAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

          useEffect(() => {
            Animated.spring(iconAnim, {
              toValue: focused ? 1 : 0,
              tension: 150,
              friction: 10,
              useNativeDriver: true,
            }).start();
            Animated.timing(labelAnim, {
              toValue: focused ? 1 : 0,
              duration: 200,
              easing: Easing.easeInOut,
              useNativeDriver: true,
            }).start();
          }, [focused, iconAnim, labelAnim]);

          const iconScale = iconAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });
          const iconTranslateY = iconAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
          
          const labelOpacity = labelAnim;
          const labelScale = labelAnim.interpolate({ inputRange: [0,1], outputRange: [0.8, 1]});


          return (
            <View style={tw`items-center justify-center relative`}>
              {/* Active Tab Indicator Dot */}
              {focused && (
                <Animated.View 
                  style={[
                    tw`w-1.5 h-1.5 bg-slate-700 rounded-full absolute -top-1`,
                    // Animation for dot can be added here if desired
                  ]}
                />
              )}
              <Animated.View style={{ transform: [{ scale: iconScale }, { translateY: iconTranslateY }] }}>
                <Icon
                  color={focused ? tw.color('slate-700') : tw.color('slate-400')}
                  size={focused ? 26 : 24}
                />
              </Animated.View>
              <Animated.Text
                style={[
                  tw`text-xs mt-1 ${focused ? 'font-semibold text-slate-700' : 'text-slate-400'}`,
                  { opacity: labelOpacity, transform: [{scale: labelScale}] }
                ]}
              >
                {label}
              </Animated.Text>
            </View>
          );
        },
        tabBarShowLabel: false, // We are rendering custom label inside tabBarIcon
      })}
    >
      {navItems.map((item) => (
        <Tab.Screen
          key={item.name}
          name={item.name}
          component={item.component}
        />
      ))}
    </Tab.Navigator>
  );
};

// Need to import Easing and useRef, useEffect from React for animations
import { Easing, useRef, useEffect } from 'react';

export default AppTabs;
