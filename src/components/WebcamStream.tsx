import React, { useRef, useEffect, useState } from 'react';
import { CameraPermissionHandler } from './CameraPermissionHandler';
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
  const [hasPermission, setHasPermission] = useState(false);
  const poseRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      if (hasPermission) {
        initializePose();
      }
    } else {
      cleanup();
    }

    return cleanup;
  }, [isActive, hasPermission]);

  const handlePermissionGranted = () => {
    setHasPermission(true);
  };

  const handlePermissionDenied = (errorMsg: string) => {
    setError(errorMsg);
    setHasPermission(false);
  };

  const initializePose = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load MediaPipe scripts dynamically
      await loadMediaPipeScripts();
      
      // Initialize MediaPipe Pose
      const pose = new (window as any).Pose({
        locateFile: (file: string) => {
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

      // Initialize webcam
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        });

        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            // Wait a bit for video to start playing
            setTimeout(() => {
              startProcessing();
            }, 500);
          }
        };
      }

      setIsLoading(false);
    } catch (err) {
      setError(`Failed to initialize pose detection: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
      console.error('Pose initialization error:', err);
    }
  };

  const loadMediaPipeScripts = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if ((window as any).Pose) {
        resolve();
        return;
      }

      const scripts = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'
      ];

      let loadedCount = 0;
      const totalScripts = scripts.length;

      scripts.forEach((src) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          loadedCount++;
          if (loadedCount === totalScripts) {
            resolve();
          }
        };
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    });
  };

  const startProcessing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(async () => {
      if (poseRef.current && videoRef.current && !videoRef.current.paused && videoRef.current.readyState >= 2) {
        try {
          await poseRef.current.send({ image: videoRef.current });
        } catch (err) {
          console.warn('Frame processing error:', err);
        }
      }
    }, 150); // Process every 150ms (6-7 FPS for better performance)
  };

  const onResults = (results: any) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the video frame first
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
      // Draw pose connections and landmarks
      if ((window as any).drawConnectors && (window as any).POSE_CONNECTIONS) {
        (window as any).drawConnectors(ctx, results.poseLandmarks, (window as any).POSE_CONNECTIONS, {
          color: '#00ff00',
          lineWidth: 2
        });
      }

      if ((window as any).drawLandmarks) {
        (window as any).drawLandmarks(ctx, results.poseLandmarks, {
          color: '#ff0000',
          lineWidth: 1,
          radius: 3
        });
      }

      // Analyze posture
      const landmarks: PoseLandmark[] = results.poseLandmarks;
      const analysis = analyzePosture(landmarks, postureMode);
      onPostureAnalysis(analysis);
    }
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
  };

  // Show permission handler if camera is active but no permission
  if (isActive && !hasPermission) {
    return (
      <CameraPermissionHandler onPermissionGranted={handlePermissionGranted} onPermissionDenied={handlePermissionDenied} />
    );
  }

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
          className="absolute inset-0 w-full h-auto max-h-96 object-contain"
          autoPlay
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }}
        />
        
        <canvas
          ref={canvasRef}
          className="relative w-full h-auto max-h-96 object-contain"
          style={{ transform: 'scaleX(-1)' }}
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
