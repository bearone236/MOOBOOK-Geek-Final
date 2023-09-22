import { useState } from 'react';

import '../styles/operate.css';
import Camera from './Camera';

export const Gesture = () => {
  return (
    <div id="gesture">
      <div>
        <p>ページ進める</p>
        <img id="ges-1" src="./asset0005.png" alt="" />
      </div>
      <div>
        <p>ページ戻り</p>
        <img id="ges-2" src="./asset0006.png" alt="" />
      </div>
      {/* <div>
        <p>決定</p>
        <img id="ges-3" src="./asset0003.png" alt="" />
      </div>
      <div>
        <p>homeに戻る</p>
        <img id="ges-4" src="./asset0004.png" alt="" />
      </div> */}
    </div>
  );
};

export const Modal = ({ content, closeModal }) => {
  return (
    <div id="overlay" onClick={closeModal}>
      <div id="content" onClick={(e) => e.stopPropagation()}>
        <h2>{content}</h2>
        <section id="A">
          <Gesture />
          <Camera />
        </section>
        <button id="closeButton" className="purpleButton" onClick={closeModal}>
          close
        </button>
      </div>
    </div>
  );
};

export const Operate = () => {
  const [show, setShow] = useState(false);

  const openModal = () => {
    setShow(true);
  };

  const closeModal = () => {
    setShow(false);
  };

  return (
    <div id="operateButton">
      <button className="purpleButton" onClick={openModal}>
        操作説明
      </button>

      {show && <Modal content="MOOBOOK　操作説明" closeModal={closeModal} />}
    </div>
  );
};
