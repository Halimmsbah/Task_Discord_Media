import { useRef } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/RootStack';

const { width, height } = Dimensions.get('window');
const DISMISS_THRESHOLD = 120;

type Props = NativeStackScreenProps<RootStackParamList, 'MediaPreview'>;

export default function MediaPreviewScreen({ route, navigation }: Props) {
  const { uris, index } = route.params;
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      // only take over on a mostly-vertical drag (horizontal stays the gallery)
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > Math.abs(gesture.dx) && Math.abs(gesture.dy) > 12,
      onPanResponderMove: (_, gesture) => {
        translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dy) > DISMISS_THRESHOLD) {
          navigation.goBack();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="white" />
      </Pressable>

      <Animated.View
        style={[styles.flex, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <FlatList
          data={uris}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={index}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          renderItem={({ item }) => (
            <View style={styles.page}>
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    left: 14,
    position: 'absolute',
    top: 42,
    width: 44,
    zIndex: 2,
  },

  page: {
    alignItems: 'center',
    height,
    justifyContent: 'center',
    width,
  },

  image: {
    height: '100%',
    width: '100%',
  },
});
