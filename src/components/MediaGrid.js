import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  View,
  Pressable,
} from 'react-native';
import EmptyState from './EmptyState';

const screenWidth = Dimensions.get('window').width;

export default function MediaGrid({
  media,
  onPressImage,
  onEndReached,
  loadingMore,
}) {
  return (
    <FlatList
      data={media}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      numColumns={3}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<EmptyState message="No Media Yet" />}
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
        <Pressable onPress={() => onPressImage?.(item)}>
          <Image
            source={{ uri: item.image, cache: 'force-cache' }}
            style={styles.mediaImage}
          />
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
    width: '100%',
  },

  mediaImage: {
    width: screenWidth / 3 - 10,
    height: screenWidth / 3 - 10,
    margin: 3,
    borderRadius: 3,
  },
});