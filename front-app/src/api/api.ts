import axios from 'axios';
import { ImageInfo } from '../pages/Slider';

const apiEndpoint = import.meta.env.VITE_API_URL;

export const fetchImages = (formData: FormData) => {
  return axios.post<ImageInfo[]>(`${apiEndpoint}/upload`, formData);
};
