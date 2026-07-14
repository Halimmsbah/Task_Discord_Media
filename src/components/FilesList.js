import React from 'react';

import {
  ActivityIndicator,
  FlatList,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import EmptyState from './EmptyState';

export default function FilesList({
  files,
  onPressFile,
  onEndReached,
  loadingMore,
}) {

  return (

    <FlatList
      data={files}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyState message="No Files Yet" />}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color="#5865F2" />
          </View>
        ) : null
      }
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={5}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.35}

      renderItem={({ item }) => (

        <Pressable onPress={() => onPressFile?.(item)}>
          <View style={styles.fileCard}>

            <Text style={styles.fileText}>
              {item.name}
            </Text>

          </View>
        </Pressable>

      )}
    />

  );

}

const styles = StyleSheet.create({

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 16,
  },

  footer: {
    paddingVertical: 16,
  },

    fileCard: {
    backgroundColor: '#1c1c1e',
    padding: 15,
    marginTop: 10,
    borderRadius: 10,
  },
  fileText: {
    color: 'white',
  },

});
