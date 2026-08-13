import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RoomScreen from '../screens/RoomScreen';
import MediaPreviewScreen from '../screens/MediaPreviewScreen';

export type RootStackParamList = {
  Room: undefined;
  MediaPreview: { uri: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Room" component={RoomScreen} />
      <Stack.Screen name="MediaPreview" component={MediaPreviewScreen} />
    </Stack.Navigator>
  );
}
