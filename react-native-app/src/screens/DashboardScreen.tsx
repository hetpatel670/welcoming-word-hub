import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tw } from '../lib/utils';

const DashboardScreen: React.FC = () => {
  return (
    <View style={tw`flex-1 justify-center items-center bg-white`}>
      <Text style={tw`text-xl`}>Dashboard Screen</Text>
    </View>
  );
};

export default DashboardScreen;
