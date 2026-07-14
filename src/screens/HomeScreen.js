import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Linking,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import EmptyState from '../components/EmptyState';
import FilesList from '../components/FilesList';
import Header from '../components/Header';
import LinksList from '../components/LinksList';
import MediaGrid from '../components/MediaGrid';
import MembersList from '../components/MembersList';
import { buildFileUrl } from '../services/fileUrl';
import { loadRoomPage, ROOM_PAGE_SIZE } from '../services/roomMediaService';

const RoomMediaContext = createContext(null);

const tabs = ['Members', 'Media', 'Pins', 'Links', 'Files'];

const tabRequestTypes = {
  Media: 'image',
  Links: 'link',
  Files: 'file',
};

const createEmptyTabState = () => ({
  items: [],
  page: 0,
  hasMore: true,
  loaded: false,
  loading: false,
  loadingMore: false,
});

const createInitialTabState = () => ({
  Members: createEmptyTabState(),
  Media: createEmptyTabState(),
  Pins: createEmptyTabState(),
  Links: createEmptyTabState(),
  Files: createEmptyTabState(),
});

const mergeById = (currentItems, nextItems) => {
  const seen = new Set(currentItems.map((item) => item.id));
  const merged = [...currentItems];

  nextItems.forEach((item) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  });

  return merged;
};

function RoomMediaProvider({ children }) {
  const [tabState, setTabState] = useState(createInitialTabState());
  const [error, setError] = useState('');

  const loadTabPage = useCallback(async (tabName, page, isLoadingMore) => {
    const requestType = tabRequestTypes[tabName];

    if (!requestType) {
      setTabState((currentState) => ({
        ...currentState,
        [tabName]: {
          ...currentState[tabName],
          loaded: true,
          loading: false,
          loadingMore: false,
          hasMore: false,
        },
      }));
      return;
    }

    setTabState((currentState) => ({
      ...currentState,
      [tabName]: {
        ...currentState[tabName],
        loading: !isLoadingMore,
        loadingMore: isLoadingMore,
      },
    }));

    try {
      const { items, hasMore } = await loadRoomPage({
        type: requestType,
        page,
        limit: ROOM_PAGE_SIZE,
      });

      setTabState((currentState) => {
        const currentTab = currentState[tabName];
        const nextItems = isLoadingMore
          ? mergeById(currentTab.items, items)
          : items;

        return {
          ...currentState,
          [tabName]: {
            ...currentTab,
            items: nextItems,
            page,
            hasMore,
            loaded: true,
            loading: false,
            loadingMore: false,
          },
        };
      });

      setError('');
    } catch (loadError) {
      setTabState((currentState) => ({
        ...currentState,
        [tabName]: {
          ...currentState[tabName],
          loading: false,
          loadingMore: false,
        },
      }));
      setError('Could not load room media.');
    }
  }, []);

  const ensureTabLoaded = useCallback(
    async (tabName) => {
      const currentTab = tabState[tabName];

      if (!currentTab || currentTab.loaded || currentTab.loading) {
        return;
      }

      await loadTabPage(tabName, 1, false);
    },
    [loadTabPage, tabState],
  );

  const loadMoreTab = useCallback(
    async (tabName) => {
      const requestType = tabRequestTypes[tabName];
      const currentTab = tabState[tabName];

      if (
        !requestType ||
        !currentTab ||
        !currentTab.loaded ||
        currentTab.loading ||
        currentTab.loadingMore ||
        !currentTab.hasMore
      ) {
        return;
      }

      await loadTabPage(tabName, currentTab.page + 1, true);
    },
    [loadTabPage, tabState],
  );

  const contextValue = useMemo(
    () => ({
      tabState,
      error,
      ensureTabLoaded,
      loadMoreTab,
    }),
    [ensureTabLoaded, error, loadMoreTab, tabState],
  );

  return (
    <RoomMediaContext.Provider value={contextValue}>
      {children}
    </RoomMediaContext.Provider>
  );
}

function useRoomMedia() {
  const context = useContext(RoomMediaContext);

  if (!context) {
    throw new Error('useRoomMedia must be used inside RoomMediaProvider.');
  }

  return context;
}

export default function HomeScreen() {
  return (
    <RoomMediaProvider>
      <HomeScreenContent />
    </RoomMediaProvider>
  );
}

function HomeScreenContent() {
  const [activeTab, setActiveTab] = useState('Media');
  const [previewImage, setPreviewImage] = useState(null);
  const { tabState, error, ensureTabLoaded, loadMoreTab } = useRoomMedia();

  useEffect(() => {
    ensureTabLoaded(activeTab);
  }, [activeTab, ensureTabLoaded]);

  const openFile = (file) => {
    const url = buildFileUrl(file);

    if (url) {
      Linking.openURL(url);
    }
  };

  const currentTabState = tabState[activeTab];

  const renderContent = () => {
    if (currentTabState?.loading && !currentTabState.loaded) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#5865F2" />
          <Text style={styles.statusText}>Loading media...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={() => ensureTabLoaded(activeTab)}>
            Try again
          </Text>
        </View>
      );
    }

    if (activeTab === 'Members') {
      return <MembersList members={[]} />;
    }

    if (activeTab === 'Media') {
      return (
        <MediaGrid
          media={currentTabState?.items || []}
          onPressImage={(item) => item.image && setPreviewImage(item.image)}
          loadingMore={currentTabState?.loadingMore}
          onEndReached={() => loadMoreTab('Media')}
        />
      );
    }

    if (activeTab === 'Pins') {
      return <EmptyState message="No Pins Yet" />;
    }

    if (activeTab === 'Links') {
      return <LinksList links={currentTabState?.items || []} />;
    }

    return (
      <FilesList
        files={currentTabState?.items || []}
        onPressFile={openFile}
        loadingMore={currentTabState?.loadingMore}
        onEndReached={() => loadMoreTab('Files')}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
      />

      {renderContent()}

      <Modal
        animationType="fade"
        transparent
        visible={Boolean(previewImage)}
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable
          style={styles.previewBackdrop}
          onPress={() => setPreviewImage(null)}
        >
          <Pressable
            style={styles.previewBackButton}
            onPress={() => setPreviewImage(null)}
          >
            <Ionicons name="arrow-back" size={30} color="white" />
          </Pressable>

          {previewImage ? (
            <Image
              source={{ uri: previewImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
    padding: 16,
  },

  centerContent: {
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

  previewBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },

  previewBackButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    left: 14,
    position: 'absolute',
    top: 42,
    width: 44,
    zIndex: 2,
  },

  previewImage: {
    height: '90%',
    width: '100%',
  },
});
