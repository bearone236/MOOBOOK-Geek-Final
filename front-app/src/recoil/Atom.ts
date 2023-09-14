import { atom } from 'recoil';
import { ImageInfo } from '../pages/Slider';

// 選択されたファイルを保持するAtom
export const selectedFileState = atom<File | null>({
  key: 'selectedFile',
  default: null,
});

// 画像情報を保持するAtom
export const imagesState = atom<ImageInfo[]>({
  key: 'images',
  default: [],
});

// アップロードエラーを管理するAtom
export const uploadErrorState = atom<string | null>({
  key: 'uploadError',
  default: null,
});

// ローディング状態を管理するAtom (Bool値)
export const loadingState = atom<boolean>({
  key: 'loading',
  default: false,
});

// アップロードボタンが押されたかの状態を管理するAtom (Bool値)
export const isButtonPressedState = atom({
  key: 'isButtonPressedState',
  default: false,
});

// カメラで読み取った状態を管理するAtom
export const poseState = atom<string>({
  key: 'poseState',
  default: '',
});
