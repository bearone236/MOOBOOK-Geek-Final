import '../styles/loading.css';
// import Lottie from 'react-lottie';
// import animationData from '../data/animation_lmd6b8zt.json';

export const Loading = () => {
  // const defaultOptions = {
  //   loop: true,
  //   autoplay: true,
  //   animationData,
  //   rendererSettings: {
  //     preserveAspectRatio: 'xMidYMid slice',
  //   },
  // };

  return (
    <div className="loading">
      <div className="loader"></div>
      {/* <Lottie options={defaultOptions} height={500} width={500} /> */}
      <p>スライドを生成中です。表示まで少々お待ちください。</p>
    </div>
  );
};
