import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import EmptyState from '../components/EmptyState';
import FilesList from '../components/FilesList';
import Header from '../components/Header';
import LinksList from '../components/LinksList';
import MediaGrid from '../components/MediaGrid';
import MembersList from '../components/MembersList';
import { useRoomMedia, type TabName } from '../context/RoomMediaContext';
import type { RootStackParamList } from '../navigation/RootStack';
import { buildFileUrl } from '../services/fileUrl';
import type { RoomItem } from '../services/roomMediaService';

const Tab = createMaterialTopTabNavigator();

// Loads the tab once and exposes its slice of the shared state.
function useRoomTab(tabName: TabName) {
  const { tabState, error, ensureTabLoaded, loadMoreTab, handleRetry } =
    useRoomMedia();

  useEffect(() => {
    ensureTabLoaded(tabName);
  }, [tabName, ensureTabLoaded]);

  return {
    state: tabState[tabName],
    error,
    loadMore: () => loadMoreTab(tabName),
    retry: () => handleRetry(tabName),
  };
}

// Shared loading / error wrapper for a tab's content.
function TabShell({
  loading,
  error,
  onRetry,
  children,
}: {
  loading: boolean;
  error: string;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5865F2" />
        <Text style={styles.statusText}>Loading media...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={onRetry}>
          Try again
        </Text>
      </View>
    );
  }

  return <View style={styles.tabContent}>{children}</View>;
}

function MediaTab() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state, error, loadMore, retry } = useRoomTab('Media');

  return (
    <TabShell
      loading={state.loading && !state.loaded}
      error={error}
      onRetry={retry}
    >
      <MediaGrid
        media={state.items}
        onPressImage={(item) =>
          item.image && navigation.navigate('MediaPreview', { uri: item.image })
        }
        loadingMore={state.loadingMore}
        onEndReached={loadMore}
      />
    </TabShell>
  );
}

function FilesTab() {
  const { state, error, loadMore, retry } = useRoomTab('Files');

  const openFile = (file: RoomItem) => {
    const url = buildFileUrl(file);
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <TabShell
      loading={state.loading && !state.loaded}
      error={error}
      onRetry={retry}
    >
      <FilesList
        files={state.items}
        onPressFile={openFile}
        loadingMore={state.loadingMore}
        onEndReached={loadMore}
      />
    </TabShell>
  );
}

function LinksTab() {
  const { state, error, retry } = useRoomTab('Links');

  return (
    <TabShell
      loading={state.loading && !state.loaded}
      error={error}
      onRetry={retry}
    >
      <LinksList links={state.items} />
    </TabShell>
  );
}

function MembersTab() {
  const { state, error, retry } = useRoomTab('Members');

  return (
    <TabShell
      loading={state.loading && !state.loaded}
      error={error}
      onRetry={retry}
    >
      <MembersList members={state.items} />
    </TabShell>
  );
}

function PinsTab() {
  return <EmptyState message="No Pins Yet" />;
}

export default function RoomScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      <Tab.Navigator
        initialRouteName="Media"
        screenOptions={{
          lazy: true,
          sceneStyle: styles.scene,
          tabBarScrollEnabled: true,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: 'gray',
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        }}
      >
        <Tab.Screen name="Members" component={MembersTab} />
        <Tab.Screen name="Media" component={MediaTab} />
        <Tab.Screen name="Pins" component={PinsTab} />
        <Tab.Screen name="Links" component={LinksTab} />
        <Tab.Screen name="Files" component={FilesTab} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
  },

  scene: {
    backgroundColor: '#000',
  },

  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  statusText: {
    color: '#b8b8b8',
    fontSize: 18,
    marginTop: 12,
  },

  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },

  retryText: {
    color: '#5865F2',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },

  tabBar: {
    backgroundColor: '#000',
    elevation: 0,
    shadowOpacity: 0,
  },

  tabIndicator: {
    backgroundColor: '#5865F2',
    height: 3,
    borderRadius: 1.5,
  },

  tabLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'none',
  },

  tabItem: {
    width: 'auto',
  },
});
