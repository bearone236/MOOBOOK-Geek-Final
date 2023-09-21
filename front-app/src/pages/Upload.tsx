import React from 'react';
import { useRecoilState } from 'recoil';
import { selectedFileState, imagesState, uploadErrorState, loadingState, isButtonPressedState } from '../recoil/Atom';
import { fetchImages } from '../api/api';
import '../styles/upload.css';

export const Upload = () => {
  const [selectedFile, setSelectedFile] = useRecoilState(selectedFileState);
  const [, setImages] = useRecoilState(imagesState);
  const [uploadError, setUploadError] = useRecoilState(uploadErrorState);
  const [, setLoading] = useRecoilState(loadingState);
  const [, setIsButtonPressed] = useRecoilState(isButtonPressedState);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const allowedFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];

      if (!allowedFileTypes.includes(file.type)) {
        setUploadError('エラー：サポートされていないファイル形式です。PDFファイルまたはPPTXファイルを選択してください。');
        setSelectedFile(null);
      } else {
        setUploadError(null);
        setSelectedFile(file);
      }
    }
  };

  const onFileUpload = () => {
    if (selectedFile) {
      setIsButtonPressed(true);
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      // api.tsからAPI関数(fetchImages)を呼び出して画像データを取得
      fetchImages(formData)
        .then((res) => {
          setImages([]);
          if (Array.isArray(res.data)) {
            const sortedImages = res.data.sort((a, b) => a.id - b.id);
            setImages(sortedImages);
          } else {
            console.error('APIレスポンスが配列ではありません。', res);
            setUploadError('APIレスポンスが正しくありません。');
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('APIエラー:', error);
          setUploadError('APIリクエスト中にエラーが発生しました。');
          setLoading(false);
        });
    }
  };

  return (
    <div className="upload">
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload} disabled={selectedFile === null || uploadError !== null}>
        アップロード
      </button>

      {!selectedFile && !uploadError && <p style={{ color: 'orange' }}>ファイルが選択されていません。PDFファイルまたはPPTXファイルを選択してください。</p>}
      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
    </div>
  );
};
