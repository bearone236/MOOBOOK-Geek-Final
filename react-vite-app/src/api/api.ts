import axios from 'axios';
import { ImageInfo } from '../pages/Slider';

// サーバーから画像データを取得する関数
export const fetchImages = (formData: FormData) => {
  return axios.post<ImageInfo[]>('http://localhost:8080/upload', formData);
};
