import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';

import { Colors } from '@/constants/Colors';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
}

export default function LoadingSpinner({ 
  text = 'Loading...', 
  size = 'large' 
}: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={Colors.primary} 
        style={styles.spinner}
      />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});