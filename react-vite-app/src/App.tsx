import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './App.css';

interface ImageInfo {
  id: number;
  data: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(images);
  }, [images]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const onFileUpload = () => {
    if (selectedFile) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      axios.post<ImageInfo[]>('http://localhost:8080/upload', formData).then((res) => {
        // アップロード毎に画像情報をリセット
        setImages([]);

        const sortedImages = res.data.sort((a, b) => a.id - b.id);
        setImages(sortedImages);
        // setImages(res.data);
        setLoading(false);
      });
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    accessibility: true,
    arrows: false,
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Upload!</button>
      {loading ? (
        <div className="loading">
          <div className="loader"></div>
          <p>スライドを生成中です。表示まで少々お待ちください。</p>
        </div>
      ) : (
        <Slider {...settings}>
          {images.map((image) => (
            <div key={image.id}>
              <img src={`data:image/png;base64,${image.data}`} alt="" style={{ width: '90%', height: '100%', margin: '0 auto', marginTop: '30px' }} />
              <p style={{ textAlign: 'center', fontSize: '15px', fontWeight: '600', paddingTop: '10px' }}>{image.id}</p>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
}

export default App;
