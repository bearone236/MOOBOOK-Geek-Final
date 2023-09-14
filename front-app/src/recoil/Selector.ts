import { selector } from 'recoil';
import { loadingState } from './Atom';

// ローディング中かどうかを取得するSelector
export const isLoadingSelector = selector<boolean>({
  key: 'isLoading',
  get: ({ get }) => {
    const loading = get(loadingState);
    return loading;
  },
});
