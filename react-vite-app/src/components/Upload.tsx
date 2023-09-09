// upload.tsx
import React from 'react';
import { useRecoilState } from 'recoil';
import { selectedFileState, imagesState, uploadErrorState, loadingState } from '../recoil/Atom';
import { fetchImages } from '../api/api'; // API関数をインポート

export const Upload = () => {
  const [selectedFile, setSelectedFile] = useRecoilState(selectedFileState);
  const [, setImages] = useRecoilState(imagesState);
  const [uploadError, setUploadError] = useRecoilState(uploadErrorState);
  const [, setLoading] = useRecoilState(loadingState);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.type !== 'application/pdf') {
        setUploadError('エラー：pdfファイル以外のファイルがアップロードされています。');
        setSelectedFile(null);
      } else {
        setUploadError(null);
        setSelectedFile(file);
      }
    }
  };

  const onFileUpload = () => {
    if (selectedFile) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      // API関数を呼び出して画像データを取得
      fetchImages(formData)
        .then((res) => {
          setImages([]);
          const sortedImages = res.data.sort((a, b) => a.id - b.id);
          setImages(sortedImages);
          setLoading(false);
        })
        .catch((error) => {
          // エラーハンドリング
          console.error('APIエラー:', error);
          setUploadError('APIリクエスト中にエラーが発生しました。');
          setLoading(false);
        });
    }
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload} disabled={selectedFile === null || uploadError !== null}>
        アップロード
      </button>
      {!selectedFile && !uploadError && <p style={{ color: 'orange' }}>ファイルが選択されていません。PDFファイルを選択してください。</p>}
      {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
    </div>
  );
};
