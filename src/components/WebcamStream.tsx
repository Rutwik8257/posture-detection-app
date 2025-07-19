import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import React, { useEffect, useRef, useState } from 'react';
import { PoseLandmark, PostureAnalysis, PostureMode } from '../types/pose';
import { analyzePosture } from '../utils/poseUtils';

interface WebcamStreamProps {
  isActive: boolean;
  postureMode: PostureMode;
  onPostureAnalysis: (analysis: PostureAnalysis) => void;
}

export const WebcamStream: React.FC<WebcamStreamProps> = ({
  isActive,
  postureMode,
  onPostureAnalysis
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    if (isActive) {
      initializePose();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isActive]);

  const initializePose = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize MediaPipe Pose
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults(onResults);
      poseRef.current = pose;

      // Initialize camera
if (videoRef.current) {
  // ⬇️ Add this line
  await navigator.mediaDevices.getUserMedia({ video: true });

  const camera = new Camera(videoRef.current, {
    onFrame: async () => {
      if (poseRef.current && videoRef.current) {
        await poseRef.current.send({ image: videoRef.current });
      }
    },
    width: 640,
    height: 480
  });

  await camera.start();
  cameraRef.current = camera;
}


      setIsLoading(false);
    } catch (err) {
      setError('Failed to initialize pose detection');
      setIsLoading(false);
      console.error('Pose initialization error:', err);
    }
  };

  const onResults = (results: any) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = results.image.width;
    canvas.height = results.image.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
      // Draw pose connections
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00ff00',
        lineWidth: 2
      });

      // Draw landmarks
      drawLandmarks(ctx, results.poseLandmarks, {
        color: '#ff0000',
        lineWidth: 1,
        radius: 3
      });

      // Analyze posture
      const landmarks: PoseLandmark[] = results.poseLandmarks;
      const analysis = analyzePosture(landmarks, postureMode);
      onPostureAnalysis(analysis);
    }
  };

  const cleanup = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Camera Error</div>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div>Initializing pose detection...</div>
          </div>
        </div>
      )}
      
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="hidden"
          autoPlay
          playsInline
          muted
        />
        
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-96 object-contain"
        />
        
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-white text-center">
              <div className="text-lg font-medium">Camera Inactive</div>
              <div className="text-sm text-gray-300">Click "Start Camera" to begin</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
