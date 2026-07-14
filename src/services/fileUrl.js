import { API_BASE_URL, ENDPOINTS, IMAGE_PREVIEW_SIZE } from '../config/apiConfig';

const trimSlashes = (value) => value.replace(/^\/+|\/+$/g, '');

export const buildApiUrl = (path) => {
  const base = API_BASE_URL.replace(/\/+$/g, '');
  const cleanPath = trimSlashes(path);

  return `${base}/${cleanPath}`;
};

export const buildImageUrl = (image, size = IMAGE_PREVIEW_SIZE) => {
  if (!image) {
    return '';
  }

  if (image.image || image.url) {
    return image.image || image.url;
  }

  const shieldedID = image.shieldedID || image.content || image.id;

  return shieldedID ? buildApiUrl(ENDPOINTS.image(shieldedID, size)) : '';
};

export const buildFileUrl = (file) => {
  if (!file) {
    return '';
  }

  if (file.url || file.uri) {
    return file.url || file.uri;
  }

  const shieldedID = file.shieldedID || file.content || file.id;

  return shieldedID ? buildApiUrl(ENDPOINTS.file(shieldedID)) : '';
};
