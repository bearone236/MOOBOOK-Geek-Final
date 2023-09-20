import axios from 'axios';
import { ImageInfo } from '../pages/Slider';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

// サーバーから画像データを取得する関数api
export const fetchImages = (formData: FormData) => {
  return axios.post<ImageInfo[]>(`${apiEndpoint}/upload`, formData);
};
