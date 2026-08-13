import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import {
  loadRoomPage,
  ROOM_PAGE_SIZE,
  type RoomItem,
  type RoomSearchType,
} from '../services/roomMediaService';

export type TabName = 'Members' | 'Media' | 'Pins' | 'Links' | 'Files';

export type TabState = {
  items: RoomItem[];
  page: number;
  hasMore: boolean;
  loaded: boolean;
  loading: boolean;
  loadingMore: boolean;
};

type TabStateMap = Record<TabName, TabState>;

const tabRequestTypes: Partial<Record<TabName, RoomSearchType>> = {
  Media: 'image',
  Links: 'link',
  Files: 'file',
};

const createEmptyTabState = (): TabState => ({
  items: [],
  page: 0,
  hasMore: true,
  loaded: false,
  loading: false,
  loadingMore: false,
});

const createInitialTabState = (): TabStateMap => ({
  Members: createEmptyTabState(),
  Media: createEmptyTabState(),
  Pins: createEmptyTabState(),
  Links: createEmptyTabState(),
  Files: createEmptyTabState(),
});

type RoomMediaContextValue = {
  tabState: TabStateMap;
  error: string;
  ensureTabLoaded: (tabName: TabName) => void;
  loadMoreTab: (tabName: TabName) => Promise<void>;
  handleRetry: (tabName: TabName) => void;
};

const RoomMediaContext = createContext<RoomMediaContextValue | null>(null);

export function RoomMediaProvider({ children }: { children: React.ReactNode }) {
  const [tabState, setTabState] = useState<TabStateMap>(createInitialTabState());
  const [error, setError] = useState('');
  const requestedTabs = useRef<Set<TabName>>(new Set());

  const mergeById = useCallback(
    (currentItems: RoomItem[], nextItems: RoomItem[]): RoomItem[] => {
      const seen = new Set(currentItems.map((item) => item.id));
      const merged = [...currentItems];

      nextItems.forEach((item) => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          merged.push(item);
        }
      });

      return merged;
    },
    [],
  );

  const loadTabPage = useCallback(
    async (tabName: TabName, page: number, isLoadingMore: boolean) => {
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
        // Allow a later retry/revisit, but do NOT auto-retry here: the load
        // effect only depends on activeTab, so a failed tab stays failed until
        // the user acts, instead of re-firing on every state change.
        requestedTabs.current.delete(tabName);
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
    },
    [mergeById],
  );

  const ensureTabLoaded = useCallback(
    (tabName: TabName) => {
      if (requestedTabs.current.has(tabName)) {
        return;
      }

      requestedTabs.current.add(tabName);
      loadTabPage(tabName, 1, false);
    },
    [loadTabPage],
  );

  const handleRetry = useCallback(
    (tabName: TabName) => {
      requestedTabs.current.delete(tabName);
      setError('');
      ensureTabLoaded(tabName);
    },
    [ensureTabLoaded],
  );

  const loadMoreTab = useCallback(
    async (tabName: TabName) => {
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

  const value: RoomMediaContextValue = {
    tabState,
    error,
    ensureTabLoaded,
    loadMoreTab,
    handleRetry,
  };

  return (
    <RoomMediaContext.Provider value={value}>
      {children}
    </RoomMediaContext.Provider>
  );
}

export function useRoomMedia(): RoomMediaContextValue {
  const context = useContext(RoomMediaContext);

  if (!context) {
    throw new Error('useRoomMedia must be used within a RoomMediaProvider');
  }

  return context;
}
