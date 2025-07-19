import React, { useState, useEffect } from 'react';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';

interface CameraPermissionHandlerProps {
  onPermissionGranted: () => void;
  onPermissionDenied: (error: string) => void;
}

export const CameraPermissionHandler: React.FC<CameraPermissionHandlerProps> = ({
  onPermissionGranted,
  onPermissionDenied
}) => {
  const [permissionState, setPermissionState] = useState<'checking' | 'granted' | 'denied' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionState('error');
        setErrorMessage('Camera access is not supported in this browser');
        onPermissionDenied('Camera access is not supported in this browser');
        return;
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      // Stop the stream immediately as we just needed to check permission
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState('granted');
      onPermissionGranted();
    } catch (error) {
      setPermissionState('denied');
      let errorMsg = 'Camera access denied';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMsg = 'Camera permission denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMsg = 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError') {
          errorMsg = 'Camera is already in use by another application.';
        } else {
          errorMsg = `Camera error: ${error.message}`;
        }
      }
      
      setErrorMessage(errorMsg);
      onPermissionDenied(errorMsg);
    }
  };

  const retryPermission = () => {
    setPermissionState('checking');
    setErrorMessage('');
    checkCameraPermission();
  };

  if (permissionState === 'checking') {
    return (
      <div className="flex items-center justify-center h-64 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-blue-800 font-medium">Checking camera permissions...</div>
          <div className="text-blue-600 text-sm mt-1">Please allow camera access when prompted</div>
        </div>
      </div>
    );
  }

  if (permissionState === 'denied' || permissionState === 'error') {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-800 font-medium mb-2">Camera Access Required</div>
          <div className="text-red-600 text-sm mb-4">{errorMessage}</div>
          <button
            onClick={retryPermission}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          <div className="text-xs text-red-500 mt-3">
            <strong>Troubleshooting:</strong>
            <ul className="text-left mt-1 space-y-1">
              <li>• Click the camera icon in your browser's address bar</li>
              <li>• Select "Allow" for camera permissions</li>
              <li>• Refresh the page and try again</li>
              <li>• Make sure no other apps are using your camera</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
