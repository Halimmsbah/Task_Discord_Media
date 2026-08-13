import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type EmptyStateProps = { message: string };

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 50,
  },

  text: {
    color: 'gray',
    fontSize: 18,
  },
});
