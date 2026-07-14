export const API_BASE_URL = 'https://pseudomedical-irving-nonmythologically.ngrok-free.dev';

export const DEV_PHONE = '+201066809002';

export const ROOM_ID = '6a311b87d37443cb4eed7edc';

export const IMAGE_PREVIEW_SIZE = 512;

export const ENDPOINTS = {
  roomSearch: (roomId) => `/api/room/${roomId}/search`,
  testToken: (phone) => `/api/dev/test-token?phone=${encodeURIComponent(phone)}`,
  image: (shieldedID) =>
    `/api/images/${shieldedID}`,
  file: (shieldedID) => `/api/files/${shieldedID}`,
};
