import { API_BASE_URL, ENDPOINTS } from '../config/apiConfig';

type ImageLike = {
  image?: string;
  url?: string;
  shieldedID?: string;
  content?: string;
  id?: string;
};

type FileLike = {
  url?: string;
  uri?: string;
  shieldedID?: string;
  content?: string;
  id?: string;
};

const trimSlashes = (value: string): string => value.replace(/^\/+|\/+$/g, '');

export const buildApiUrl = (path: string): string => {
  const base = API_BASE_URL.replace(/\/+$/g, '');
  const cleanPath = trimSlashes(path);

  return `${base}/${cleanPath}`;
};

export const buildImageUrl = (image?: ImageLike | null): string => {
  if (!image) {
    return '';
  }

  if (image.image || image.url) {
    return image.image || image.url || '';
  }

  const shieldedID = image.shieldedID || image.content || image.id;

  return shieldedID ? buildApiUrl(ENDPOINTS.image(shieldedID)) : '';
};

export const buildFileUrl = (file?: FileLike | null): string => {
  if (!file) {
    return '';
  }

  if (file.url || file.uri) {
    return file.url || file.uri || '';
  }

  const shieldedID = file.shieldedID || file.content || file.id;

  return shieldedID ? buildApiUrl(ENDPOINTS.file(shieldedID)) : '';
};
