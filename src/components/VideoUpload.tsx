import React, { useRef, useState } from 'react';
import { Upload, Play, Pause, Square } from 'lucide-react';
import { Pose } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import { PoseLandmark, PostureAnalysis, PostureMode } from '../types/pose';
import { analyzePosture } from '../utils/poseUtils';

interface VideoUploadProps {
  postureMode: PostureMode;
  onPostureAnalysis: (analysis: PostureAnalysis) => void;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  postureMode,
  onPostureAnalysis
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const poseRef = useRef<Pose | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file);
      }
      initializePose();
    }
  };

  const initializePose = async () => {
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

    // Draw the video frame
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

  const processFrame = async () => {
    if (poseRef.current && videoRef.current) {
      await poseRef.current.send({ image: videoRef.current });
    }
  };

  const handlePlay = () => {
    if (videoRef.current && poseRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      setIsAnalyzing(true);
      
      // Process frames at 30 FPS
      intervalRef.current = setInterval(processFrame, 33);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      setIsAnalyzing(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsAnalyzing(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Clear canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            Upload a video file
          </div>
          <div className="text-sm text-gray-500 mb-4">
            MP4, AVI, MOV files up to 100MB
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Choose File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Selected: {selectedFile.name}
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                handleStop();
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
          
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="hidden"
              onEnded={handleStop}
            />
            
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-h-96 object-contain"
            />
            
            {isAnalyzing && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                Analyzing...
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Play className="h-4 w-4 mr-1" />
              Play
            </button>
            
            <button
              onClick={handlePause}
              disabled={!isPlaying}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </button>
            
            <button
              onClick={handleStop}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Square className="h-4 w-4 mr-1" />
              Stop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};