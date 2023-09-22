import axios from 'axios';
import { ImageInfo } from '../pages/Slider';

const apiEndpoint = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({
  baseURL: apiEndpoint,
});

// 画像データの取得リクエストを行う関数
export const fetchImages = (formData: FormData) => {
  return axiosInstance.post<ImageInfo[]>('/upload', formData);
};
