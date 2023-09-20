import axios from 'axios';
import { ImageInfo } from '../pages/Slider';

// サーバーから画像データを取得する関数api
export const fetchImages = (formData: FormData) => {
  return axios.post<ImageInfo[]>(`${process.env.REACT_APP_API_ENDPOINT}/upload`, formData);
};
