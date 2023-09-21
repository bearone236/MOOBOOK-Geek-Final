import axios from 'axios';
import { ImageInfo } from '../pages/Slider';

const apiEndpoint = process.env.VITE_API_URL;
console.log(apiEndpoint);
console.log(process.env.VITE_API_URL);
// サーバーから画像データを取得する関数api
export const fetchImages = (formData: FormData) => {
  return axios.post<ImageInfo[]>(`${apiEndpoint}/upload`, formData);
};
