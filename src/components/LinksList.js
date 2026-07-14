import React from 'react';

import {
  FlatList,
  View,
  Text,
  Linking,
  Pressable,
  StyleSheet,
} from 'react-native';
import EmptyState from './EmptyState';

export default function LinksList({ links }) {

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (

    <FlatList
      data={links}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyState message="No Links Yet" />}

      renderItem={({ item }) => (

        <Pressable
          onPress={() => openLink(item.url)}
        >

          <View style={styles.linkCard}>

            <Text style={styles.linkTitle}>
              {item.title}
            </Text>

            <Text style={styles.linkUrl}>
              {item.url}
            </Text>

          </View>

        </Pressable>

      )}
    />

  );

}

const styles = StyleSheet.create({

  linkCard: {
    backgroundColor: '#1c1c1e',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  linkTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  linkUrl: {
    color: '#5865F2',
    marginTop: 5,
  },

});
