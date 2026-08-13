import API from '../api/api';
import { ENDPOINTS, ROOM_ID } from '../config/apiConfig';
import { buildFileUrl, buildImageUrl } from './fileUrl';

export const ROOM_PAGE_SIZE = 20;

export type RoomSearchType = 'image' | 'file' | 'link' | 'member' | 'pinned';

type ApiFile = {
  name?: string;
  filename?: string;
  originalName?: string;
  content?: string;
  shieldedID?: string;
  date?: string;
};

type RoomMessage = {
  _id?: string;
  id?: string;
  content?: string;
  date?: string;
  file?: ApiFile | string;
  attachment?: ApiFile | string;
  title?: string;
  url?: string;
  link?: string;
  text?: string;
  name?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
};

export type RoomItem = {
  id: string;
  image?: string;
  shieldedID?: string;
  name?: string;
  url?: string;
  title?: string;
  date?: string;
};

const toArray = (payload: unknown): RoomMessage[] => {
  if (Array.isArray(payload)) {
    return payload as RoomMessage[];
  }

  const messages = (payload as { messages?: unknown })?.messages;
  if (Array.isArray(messages)) {
    return messages as RoomMessage[];
  }

  return [];
};

const normalizeId = (item: RoomMessage, index: number): string =>
  String(item._id || item.id || index);

const normalizeImage = (item: RoomMessage, index: number): RoomItem => ({
  id: normalizeId(item, index),
  image: buildImageUrl({
    shieldedID: item.content,
  }),
  shieldedID: item.content,
  date: item.date,
});

const normalizeFile = (item: RoomMessage, index: number): RoomItem => {
  const file = (item.file || item.attachment || item) as ApiFile | string;

  if (typeof file === 'string') {
    return {
      id: normalizeId(item, index),
      name: file,
      url: buildFileUrl({ shieldedID: file }),
    };
  }

  return {
    ...file,
    id: normalizeId(item, index),
    name:
      file.name || file.filename || file.originalName || file.content || 'Untitled file',
    url: buildFileUrl(file),
    date: item.date || file.date,
  };
};

const normalizeLink = (item: RoomMessage, index: number): RoomItem => ({
  ...item,
  id: normalizeId(item, index),
  title: item.title || item.url || 'Link',
  url: item.url || item.link || item.text,
});

const normalizeMember = (item: RoomMessage, index: number): RoomItem => ({
  ...item,
  id: normalizeId(item, index),
  name:
    item.name ||
    item.username ||
    [item.firstName, item.lastName].filter(Boolean).join(' ') ||
    'Unknown member',
});

const searchRoom = async (
  type: RoomSearchType,
  roomId: string = ROOM_ID,
  page: number = 1,
  limit: number = ROOM_PAGE_SIZE,
): Promise<RoomMessage[]> => {
  if (!roomId || roomId === 'room-id-here') {
    return [];
  }

  const response = await API.post(ENDPOINTS.roomSearch(roomId), {
    roomId,
    page,
    limit,
    type,
  });

  return toArray(response.data);
};

const normalizeByType = (
  type: RoomSearchType,
  item: RoomMessage,
  index: number,
): RoomItem => {
  if (type === 'image') {
    return normalizeImage(item, index);
  }

  if (type === 'file') {
    return normalizeFile(item, index);
  }

  if (type === 'link') {
    return normalizeLink(item, index);
  }

  if (type === 'member') {
    return normalizeMember(item, index);
  }

  return {
    ...item,
    id: normalizeId(item, index),
  };
};

type ApiRoomPerson = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  phone?: string;
};

export const loadRoomMembers = async (
  roomId: string = ROOM_ID,
): Promise<RoomItem[]> => {
  const response = await API.post(ENDPOINTS.roomsList, { limit: 4000 });
  const rooms = (response.data?.rooms ?? []) as {
    _id?: string;
    people?: ApiRoomPerson[];
  }[];
  const people = rooms.find((room) => room._id === roomId)?.people ?? [];

  return people.map((person, index) => ({
    id: String(person._id || index),
    name:
      person.name ||
      [person.firstName, person.lastName].filter(Boolean).join(' ') ||
      person.username ||
      person.phone ||
      'Unknown member',
  }));
};

export const loadRoomPage = async ({
  type,
  roomId = ROOM_ID,
  page = 1,
  limit = ROOM_PAGE_SIZE,
}: {
  type: RoomSearchType;
  roomId?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: RoomItem[]; hasMore: boolean }> => {
  const items = await searchRoom(type, roomId, page, limit);
  const normalizedItems = items.map((item, index) =>
    normalizeByType(type, item, index),
  );

  return {
    items:
      type === 'link'
        ? normalizedItems.filter((item) => Boolean(item.url))
        : normalizedItems,
    // no total from the API, so a full page means there may be more
    hasMore: items.length === limit,
  };
};
