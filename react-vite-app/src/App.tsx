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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadButtonDisabled, setUploadButtonDisabled] = useState(false); // upload ボタンの無効/有効を制御

  useEffect(() => {
    console.log(images);
  }, [images]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.type !== 'application/pdf') {
        setUploadError('エラー：pdfファイル以外のファイルがアップロードされています。');
        setUploadButtonDisabled(true); // エラー時にボタンを無効にする
      } else {
        setUploadError(null);
        setSelectedFile(file);
        setUploadButtonDisabled(false); // エラーが解消されたらボタンを有効にする
      }
    }
  };

  const onFileUpload = () => {
    if (selectedFile) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      axios.post<ImageInfo[]>('http://localhost:8080/upload', formData).then((res) => {
        setImages([]);
        const sortedImages = res.data.sort((a, b) => a.id - b.id);
        setImages(sortedImages);
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
      <button onClick={onFileUpload} disabled={uploadButtonDisabled}>
        アップロード
      </button>
      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}

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
