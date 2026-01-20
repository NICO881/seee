
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  // Define the tabs configuration
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'appointments',
      route: '/(tabs)/appointments',
      icon: 'calendar_today',
      label: 'Appointments',
    },
    {
      name: 'referrals',
      route: '/(tabs)/referrals',
      icon: 'local_hospital',
      label: 'Referrals',
    },
    {
      name: 'emergency',
      route: '/(tabs)/emergency',
      icon: 'emergency',
      label: 'Emergency',
    },
    {
      name: 'records',
      route: '/(tabs)/records',
      icon: 'description',
      label: 'Records',
    },
    {
      name: 'chat',
      route: '/(tabs)/chat',
      icon: 'chat',
      label: 'Chat',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ];

  // For Android and Web, use Stack navigation with custom floating tab bar
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none', // Remove fade animation to prevent black screen flash
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="appointments" name="appointments" />
        <Stack.Screen key="referrals" name="referrals" />
        <Stack.Screen key="emergency" name="emergency" />
        <Stack.Screen key="records" name="records" />
        <Stack.Screen key="chat" name="chat" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} containerWidth={420} />
    </>
  );
}
