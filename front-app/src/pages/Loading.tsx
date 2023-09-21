import '../styles/loading.css';

export const Loading = () => {
  return (
    <div className="loading">
      <div className="loader"></div>
      <p>スライドを生成中です。表示まで少々お待ちください。</p>
    </div>
  );
};
