import { useRecoilValue } from 'recoil';
import { imagesState } from './recoil/Atom';
import { isLoadingSelector } from './recoil/Selector';
import { Loading } from './pages/Loading';
import ImageSlider from './pages/Slider';
import { Upload } from './components/Upload';

export const App = () => {
  const images = useRecoilValue(imagesState);
  const isLoading = useRecoilValue(isLoadingSelector);

  return (
    <div>
      <Upload />
      {isLoading ? <Loading /> : <ImageSlider images={images} />}
    </div>
  );
};
