import API from '../api/api';
import { ENDPOINTS, ROOM_ID } from '../config/apiConfig';
import { buildFileUrl, buildImageUrl } from './fileUrl';

export const ROOM_PAGE_SIZE = 20;

const emptyOverview = {
  members: [],
  media: [],
  pins: [],
  links: [],
  files: [],
};

const toArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.messages)) {
    return payload.messages;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

const normalizeId = (item, index) =>
  String(item.id || item._id || item.shieldedID || `${Date.now()}-${index}`);

const normalizeAuthorName = (author) =>
  author
    ? [author.firstName, author.lastName].filter(Boolean).join(' ') ||
      author.name ||
      author.username ||
      ''
    : '';

const normalizeImage = (item, index) => ({
  id: normalizeId(item, index),
  image: buildImageUrl({
    shieldedID: item.content,
  }),
  shieldedID: item.content,
  authorName: normalizeAuthorName(item.author),
  date: item.date,
});

const normalizeFile = (item, index) => {
  const file = item.file || item.attachment || item;

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
    name: file.name || file.filename || file.originalName || file.content || 'Untitled file',
    url: buildFileUrl(file),
    authorName: normalizeAuthorName(item.author),
    date: item.date || file.date,
  };
};

const normalizeLink = (item, index) => ({
  ...item,
  id: normalizeId(item, index),
  title: item.title || item.url || 'Link',
  url: item.url || item.link || item.text,
});

const normalizeMember = (item, index) => ({
  ...item,
  id: normalizeId(item, index),
  name:
    item.name ||
    item.username ||
    [item.firstName, item.lastName].filter(Boolean).join(' ') ||
    'Unknown member',
});

const searchRoom = async (type, roomId = ROOM_ID, page = 1, limit = ROOM_PAGE_SIZE) => {
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

const normalizeByType = (type, item, index) => {
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

export const loadRoomPage = async ({
  type,
  roomId = ROOM_ID,
  page = 1,
  limit = ROOM_PAGE_SIZE,
}) => {
  const items = await searchRoom(type, roomId, page, limit);
  const normalizedItems = items.map((item, index) => normalizeByType(type, item, index));

  return {
    items:
      type === 'link'
        ? normalizedItems.filter((item) => item.url)
        : normalizedItems,
    hasMore: items.length === limit,
  };
};

export const loadRoomOverview = async (roomId = ROOM_ID) => {
  const [imageMessages, fileMessages, linkMessages, pinnedMessages] =
    await Promise.all([
      searchRoom('image', roomId),
      searchRoom('file', roomId),
      searchRoom('link', roomId),
      searchRoom('pinned', roomId),
    ]);

  return {
    ...emptyOverview,
    media: imageMessages.map(normalizeImage),
    files: fileMessages.map(normalizeFile),
    links: linkMessages.map(normalizeLink).filter((item) => item.url),
    pins: pinnedMessages,
  };
};
