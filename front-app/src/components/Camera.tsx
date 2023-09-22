import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { useRecoilState } from 'recoil';
import { poseState } from '../recoil/Atom';
import {HandLandmarker, FilesetResolver} from '@mediapipe/tasks-vision';
import '../styles/camera.css';

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
    const threshold = 0.10;
    const distThreshold = 150;
    const detectionInterval = 40; // ジェスチャー検出の間隔（ミリ秒）

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
      
      // const model = await handpose.load();
      // モデル読み込み
      try{
      const myCanvas = document.getElementById('myCanvas') as HTMLCanvasElement;
      console.log(myCanvas);

      const tasks = await FilesetResolver.forVisionTasks('../../node_modules/@mediapipe/tasks-vision/wasm')
      console.log(tasks,"開始")


      const model = await HandLandmarker.createFromOptions(tasks,{
          baseOptions: {
            modelAssetPath: '/hand_landmarker_2.task',
            delegate: 'GPU'
          },
          runningMode:'VIDEO',
          canvas: myCanvas,
        });
        console.log('終了')
        

        setInterval(async () => {
          if (!isDetecting) {
            setIsDetecting(true);
            // const predictions = await model.estimateHands(video, true);
            // const predictions = await model.detectforvideo(video, true);
            const predictions = await model.detectForVideo(video,performance.now());
            // processResults(predictions);
            // console.log('Predictions:', predictions);
  
            if (predictions.landmarks && predictions.landmarks.length > 0) {
              predictions.landmarks.forEach((landmark) => {
                // ここでランドマークを処理します
                console.log(landmark)
                const landmarks = predictions.landmarks;
              const tip0 = landmarks[0][5];
              const tip1 = landmarks[0][6];
              const tip2 = landmarks[0][7];
              const wrist = landmarks[0][0]
              // console.log('tip0:', tip0['x'])
  
              const angle =
                (((tip0['x'] - tip1['x']) * (tip2['x'] - tip1['x']) + (tip0['y'] - tip1['y']) * (tip2['y'] - tip1['y']) + (tip0['z'] - tip1['z']) * (tip2['z'] - tip1['z'])) /
                  (Math.sqrt((tip0['x'] - tip1['x']) ** 2 + (tip0['y'] - tip1['y']) ** 2 + (tip0['z'] - tip1['z']) ** 2) *
                    Math.sqrt((tip2['x'] - tip1['x']) ** 2 + (tip2['y'] - tip1['y']) ** 2 + (tip2['z'] - tip1['z']) ** 2))) *
                -1;
              const radian = Math.acos(angle);
              const degree = radian * (180 / Math.PI);
              // console.log("degree: ",degree);
              if (degree > 60) {
                if (prevX == null) {
                  prevX = 0;
                }
                if (prevY == null) {
                  prevY = 0;
                }
                
                const x_dist = wrist['x'] - prevX;
                const y_dist = wrist['y'] - prevY;
                prevX = null;
                prevY = null;
                console.log("手が握られました",x_dist,'tip0:', wrist['x'])
                setPose(''); // リセット
  
                if (x_dist > threshold) {
                  console.log('手が左に移動しました',x_dist,'tip0:', wrist['x']);
                  prevX = null;
                  prevY = null;
                  setPose(''); // リセット
                  setPose('toright');
  
                  // setTimeout(timeout);
                } else if (x_dist < ((-1) *  threshold)) {
                  console.log('手が右に移動しました',x_dist,'tip0:', wrist['x']);
                  prevX = null;
                  setPose(''); // リセット
                  setPose('toleft');
                } else if (y_dist < -1 * distThreshold) {
                  // console.log('手が上に移動しました');
                  prevX = null;
                  prevY = null;
                  setPose(''); // リセット
                  setPose('back');
                } else {
                  console.log('x_dist:',x_dist)
                  prevX = null;
                  prevY = null;
                  setPose(''); // リセット
                }
                prevX = wrist['x'];
                prevY = wrist['y'];
                console.log("到達:","prevX:",prevX,"prevY:",prevY);
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
  
                prevX = wrist['x'];
                prevY = wrist['y'];
                console.log("到達:","prevX:",prevX,"prevY:",prevY);
              }
              });
            } else {
              // console.log('No landmarks detected');
            }
          }
        }, detectionInterval);
      }catch (error) {
        console.log(error);
        if (error.message.includes('ImageToTensorCalculator') && error.message.includes('ROI width and height must be > 0')) {
          console.error('ROI error:', error);
          location.reload()
          
          // このエラーに対する特定のエラーハンドリングを行う
          alert('Error processing the image. Please ensure the selected region is valid.');
        } else {
          // 他のエラーに対する一般的なエラーハンドリング
          console.error('An error occurred:', error);
          alert('An error occurred. Please try again.');
          location.reload()
        }
      }

      
    };

    main();
  },[])
  // }, [setPoseCallback, isDetecting]);

  return (
    <div>
         <video ref={videoRef} id="video" height="60%" autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }}></video>;
    </div>
  );
});

export default Camera;
