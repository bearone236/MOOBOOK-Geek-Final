import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { useRecoilState } from 'recoil';
import { poseState } from '../recoil/Atom';
import "../styles/operate.css";

const Camera: React.FC = React.memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setPose] = useRecoilState(poseState);
  const [isDetecting, setIsDetecting] = useState(false);

  const setPoseCallback = useCallback(
    (pose: string) => {
      setPose(pose);
    },
    [setPose]
  );

  useEffect(() => {
    let prevX: number | null = null;
    let prevY: number | null = null;
    const threshold = 20;
    const distThreshold = 150;
    const detectionInterval = 1000; // ジェスチャー検出の間隔（ミリ秒）

    const setupCamera = async (): Promise<HTMLVideoElement> => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            resolve(videoRef.current as HTMLVideoElement);
          };
        }
      });
    };

    const main = async () => {
      await tf.ready();

      const video = await setupCamera();
      video.play();

      const model = await handpose.load();

      setInterval(async () => {
        if (!isDetecting) {
          setIsDetecting(true);
          const predictions = await model.estimateHands(video, true);

          predictions.forEach((prediction) => {
            const landmarks = prediction.landmarks;
            const tip0 = landmarks[5];
            const tip1 = landmarks[6];
            const tip2 = landmarks[7];

            const angle =
              (((tip0[0] - tip1[0]) * (tip2[0] - tip1[0]) + (tip0[1] - tip1[1]) * (tip2[1] - tip1[1]) + (tip0[2] - tip1[2]) * (tip2[2] - tip1[2])) /
                (Math.sqrt((tip0[0] - tip1[0]) ** 2 + (tip0[1] - tip1[1]) ** 2 + (tip0[2] - tip1[2]) ** 2) *
                  Math.sqrt((tip2[0] - tip1[0]) ** 2 + (tip2[1] - tip1[1]) ** 2 + (tip2[2] - tip1[2]) ** 2))) *
              -1;
            const radian = Math.acos(angle);
            const degree = radian * (180 / Math.PI);

            if (degree > 60) {
              if (prevX == null) {
                prevX = 0;
              }
              if (prevY == null) {
                prevY = 0;
              }
              const x_dist = landmarks[0][0] - prevX;
              const y_dist = landmarks[0][1] - prevY;
              prevX = null;
              prevY = null;
              setPose(''); // リセット

              if (x_dist > threshold) {
                // console.log('手が右に移動しました');
                prevX = null;
                prevY = null;
                setPose(''); // リセット
                setPose('toleft');

                // setTimeout(timeout);
              } else if (x_dist < -1 * threshold) {
                // console.log('手が左に移動しました');
                prevX = null;
                setPose(''); // リセット
                setPose('toright');
              } else if (y_dist < -1 * distThreshold) {
                // console.log('手が上に移動しました');
                prevX = null;
                prevY = null;
                setPose(''); // リセット
                setPose('back');
              } else {
                prevX = null;
                prevY = null;
                setPose(''); // リセット
              }
            }

            //-------------------------------------------------------------
            else {
              // console.log('手が空いています');
              if (prevX && prevY) {
                const x_dist = landmarks[0][0] - prevX;
                const y_dist = landmarks[0][1] - prevY;
                if (x_dist < -1 * threshold) {
                  // console.log('手が左に移動しました');
                  prevX = null;
                  setPose('');
                } else if (x_dist > threshold) {
                  // console.log('手が右に移動しました');
                  prevX = null;
                  setPose('');
                } else {
                  // console.log('手は左右には動いていません');
                  prevX = null;
                  prevY = null;
                  setPose('');
                }

                if (y_dist < -1 * distThreshold) {
                  // console.log('手が上に移動しました');
                  prevX = null;
                  prevY = null;
                  setPose(''); // リセット
                  setPose('enter');
                } else if (y_dist > distThreshold) {
                  // console.log('手が下に移動しました');
                  prevX = null;
                  prevY = null;
                  setPose(''); // リセット
                } else {
                  // console.log('手は上下に動いていません');
                }
              }

              prevX = landmarks[0][0];
              prevY = landmarks[0][1];
            }
          });
        }
      }, detectionInterval);
    };

    main();
  }, [setPoseCallback, isDetecting]);

  return (
    <div>
      <video ref={videoRef} id="video" height='70%'  autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }}></video>
    </div>
  );
});

export default Camera;
