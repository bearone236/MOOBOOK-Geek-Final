import React, { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { NextArrow } from '../components/NextArrow';
import { PrevArrow } from '../components/PrevArrow';
import { poseState } from '../recoil/Atom';

export interface ImageInfo {
  id: number;
  data: string;
}

interface SliderProps {
  images: ImageInfo[];
}

const ImageSlider: React.FC<SliderProps> = ({ images }) => {
  // console.log(images);
  const sliderRef = useRef<Slider | null>(null);
  const pose = useRecoilValue(poseState);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    accessibility: true,
    arrows: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  useEffect(() => {
    if (pose === 'toright') {
      if (sliderRef.current) {
        sliderRef.current.slickNext();
      }
    } else if (pose === 'toleft') {
      if (sliderRef.current) {
        sliderRef.current.slickPrev();
      }
    }
  }, [pose]);

  return (
    <Slider {...settings} ref={sliderRef}>
      {images.map((image) => (
        <div key={image.id}>
          <img src={`data:image/png;base64,${image.data}`} alt="" style={{ width: '90%', height: '100%', margin: '0 auto' }} />
          <p style={{ textAlign: 'center', fontSize: '15px', fontWeight: '600', paddingTop: '10px' }}>{image.id}</p>
        </div>
      ))}
    </Slider>
  );
};

export default ImageSlider;
