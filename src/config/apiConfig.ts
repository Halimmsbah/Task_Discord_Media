export const API_BASE_URL = 'https://mdev.tapi.co';

export const DEV_PHONE = '+201000260660';

export const ROOM_ID = '6a536fc3507c0259289f777d';

export const ENDPOINTS = {
  roomSearch: (roomId: string) => `/api/room/${roomId}/search`,
  testToken: (phone: string) =>
    `/api/dev/test-token?phone=${encodeURIComponent(phone)}`,
  image: (shieldedID: string) => `/api/images/${shieldedID}`,
  file: (shieldedID: string) => `/api/files/${shieldedID}`,
};
