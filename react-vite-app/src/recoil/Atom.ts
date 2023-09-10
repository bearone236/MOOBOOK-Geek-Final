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

// ローディング状態を管理するAtom
export const loadingState = atom<boolean>({
  key: 'loading',
  default: false,
});

// アップロードエラーを管理するAtom
export const uploadErrorState = atom<string | null>({
  key: 'uploadError',
  default: null,
});

// アップロードボタンが押されたかの状態を管理するAtom
export const isButtonPressedState = atom({
  key: 'isButtonPressedState',
  default: false, // ボタンが初期状態では押されていない状態とします
});

// カメラで読み取った状態を管理するAtom
export const poseState = atom<string>({
  key: 'poseState', // ユニークなキーを指定
  default: '',
});
