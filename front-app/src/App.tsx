import { useRecoilValue } from 'recoil';
import { imagesState, isButtonPressedState } from './recoil/Atom';
import { isLoadingSelector } from './recoil/Selector';
import ImageSlider from './pages/Slider';
import { Header } from './components/Header';
import { Loading } from './pages/Loading';
import { Upload } from './pages/Upload';

export const App = () => {
  const images = useRecoilValue(imagesState);
  const isLoading = useRecoilValue(isLoadingSelector);
  const isButtonPressed = useRecoilValue(isButtonPressedState);

  return (
    <div>
      <Header />
      <div>{isButtonPressed ? isLoading ? <Loading /> : <ImageSlider images={images} /> : <Upload />}</div>
    </div>
  );
};
