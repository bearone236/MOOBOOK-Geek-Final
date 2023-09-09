import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export interface ImageInfo {
  id: number;
  data: string;
}

interface SliderProps {
  images: ImageInfo[];
}

const settings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  accessibility: true,
  arrows: false,
};

const ImageSlider: React.FC<SliderProps> = ({ images }) => {
  return (
    <Slider {...settings}>
      {images.map((image) => (
        <div key={image.id}>
          <img src={`data:image/png;base64,${image.data}`} alt="" style={{ width: '90%', height: '100%', margin: '0 auto', marginTop: '30px' }} />
          <p style={{ textAlign: 'center', fontSize: '15px', fontWeight: '600', paddingTop: '10px' }}>{image.id}</p>
        </div>
      ))}
    </Slider>
  );
};

export default ImageSlider;
