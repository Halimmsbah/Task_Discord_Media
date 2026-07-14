import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function EmptyState({ message }) {
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
