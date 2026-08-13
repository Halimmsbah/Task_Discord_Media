import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'MediaPreview'>;

export default function MediaPreviewScreen({ route, navigation }: Props) {
  const { uri } = route.params;

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={30} color="white" />
      </Pressable>

      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
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

  image: {
    height: '90%',
    width: '100%',
  },
});
