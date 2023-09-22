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
          // 以下の行を追加: レスポンスデータをログ出力
          console.log('APIからのレスポンスデータ:', res.data);

          setImages([]);
          // 以下の行を修正: レスポンスデータを直接セットしないで、dataプロパティから取得
          const sortedImages = res.data.sort((a, b) => a.id - b.id);
          setImages(sortedImages);
          setLoading(false);
          console.log(selectedFile.name);
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
      <section>
        <div className="Icons">
          <img src="/PDFIcon.png" alt="PDFIcon" />
          <img src="/PowrPointIcon.png" alt="PowrPointIcon" />
        </div>
        <label className="onFile" id="onFileChange">
          <div id="uploadIcon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.65 68.87">
              <g>
                <path
                  className="cls-1"
                  d="m62.56,48.99h-5.89c-1.15,0-2.09.93-2.09,2.09v7.74H10.06v-7.74c0-1.15-.93-2.09-2.09-2.09H2.09c-1.15,0-2.09.93-2.09,2.09v12.77c0,2.78,2.25,5.03,5.03,5.03h54.59c2.78,0,5.03-2.25,5.03-5.03v-12.77c0-1.15-.93-2.09-2.09-2.09Z"
                />
                <path
                  className="cls-1"
                  d="m15.98,21.6h7.59c1.71,0,3.09,1.38,3.09,3.09v22.57c0,.95.91,1.72,2.04,1.72h7.08c1.13,0,2.04-.77,2.04-1.72v-22.57c0-1.71,1.38-3.09,3.09-3.09h7.74c1.69,0,2.65-1.63,1.63-2.76L33.95.68c-.82-.91-2.44-.91-3.26,0L14.36,18.84c-1.02,1.13-.06,2.76,1.63,2.76Z"
                />
              </g>
            </svg>
          </div>
          <input type="file" onChange={onFileChange} />
          <p>ファイルを選択してください</p>
        </label>

        {!selectedFile && !uploadError && (
          <p className="selectedFile" style={{ color: 'red' }}>
            ファイル名：ファイルが選択されていません。
            <br />
            PDFファイルまたはPPTXファイルを選択してください。
          </p>
        )}
        {selectedFile && <p className="selectedFile">ファイル名：{selectedFile.name}</p>}

        <button className="onFile" id="onFileUpload" onClick={onFileUpload} disabled={selectedFile === null || uploadError !== null}>
          アップロード
        </button>

        {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
      </section>
    </div>
  );
};
