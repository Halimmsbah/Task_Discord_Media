import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TextInput,
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

function filterBySearch(items: RoomItem[], term: string): RoomItem[] {
  const query = term.trim().toLowerCase();
  if (!query) {
    return items;
  }

  return items.filter((item) =>
    [item.name, item.title, item.url].some((field) =>
      field?.toLowerCase().includes(query),
    ),
  );
}

function useRoomTab(tabName: TabName) {
  const { tabState, searchTerm, ensureTabLoaded, loadMoreTab, handleRetry } =
    useRoomMedia();

  useEffect(() => {
    ensureTabLoaded(tabName);
  }, [tabName, ensureTabLoaded]);

  const state = tabState[tabName];

  return {
    state,
    items: filterBySearch(state.items, searchTerm),
    error: state.error,
    loadMore: () => loadMoreTab(tabName),
    retry: () => handleRetry(tabName),
  };
}

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
  const { state, items, error, loadMore, retry } = useRoomTab('Media');

  return (
    <TabShell
      loading={state.loading && !state.loaded}
      error={error}
      onRetry={retry}
    >
      <MediaGrid
        media={items}
        onPressImage={(item, index) =>
          item.image &&
          navigation.navigate('MediaPreview', {
            uris: items.map((media) => media.image ?? ''),
            index,
          })
        }
        loadingMore={state.loadingMore}
        onEndReached={loadMore}
      />
    </TabShell>
  );
}

function FilesTab() {
  const { state, items, error, loadMore, retry } = useRoomTab('Files');

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
        files={items}
        onPressFile={openFile}
        loadingMore={state.loadingMore}
        onEndReached={loadMore}
      />
    </TabShell>
  );
}

function LinksTab() {
  const { state, items, error, retry } = useRoomTab('Links');

  return (
    <TabShell
      loading={state.loading && !state.loaded}
      error={error}
      onRetry={retry}
    >
      <LinksList links={items} />
    </TabShell>
  );
}

function MembersTab() {
  const { state, items, error, retry } = useRoomTab('Members');

  return (
    <TabShell
      loading={state.loading && !state.loaded}
      error={error}
      onRetry={retry}
    >
      <MembersList members={items} />
    </TabShell>
  );
}

function PinsTab() {
  return <EmptyState message="No Pins Yet" />;
}

export default function RoomScreen() {
  const { setSearchTerm } = useRoomMedia();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchTerm]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onSearchPress={() => setSearchOpen((open) => !open)} />

      {searchOpen ? (
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#8f949b"
          value={searchInput}
          onChangeText={setSearchInput}
          autoFocus
        />
      ) : null}

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

  searchInput: {
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    color: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
