import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RoomMediaProvider } from './src/context/RoomMediaContext';
import RootStack from './src/navigation/RootStack';

export default function App() {
  return (
    <RoomMediaProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </SafeAreaProvider>
    </RoomMediaProvider>
  );
}
