import React, { useState } from 'react';
import { Camera, Video, Activity } from 'lucide-react';
import { WebcamStream } from './components/WebcamStream';
import { VideoUpload } from './components/VideoUpload';
import { PostureAnalysisPanel } from './components/PostureAnalysisPanel';
import { ModeSelector } from './components/ModeSelector';
import { PostureAnalysis, PostureMode } from './types/pose';

function App() {
  const [activeTab, setActiveTab] = useState<'webcam' | 'video'>('webcam');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [postureMode, setPostureMode] = useState<PostureMode>(PostureMode.SQUAT);
  const [analysis, setAnalysis] = useState<PostureAnalysis | null>(null);

  const handlePostureAnalysis = (newAnalysis: PostureAnalysis) => {
    setAnalysis(newAnalysis);
  };

  const toggleWebcam = () => {
    setIsWebcamActive(!isWebcamActive);
    if (!isWebcamActive) {
      setAnalysis(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PostureGuard</h1>
            </div>
            <div className="text-sm text-gray-500">
              Real-time Posture Detection & Analysis
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Analysis Controls */}
          <div className="lg:col-span-1 space-y-6">
            <ModeSelector
              selectedMode={postureMode}
              onModeChange={setPostureMode}
            />
            
            <PostureAnalysisPanel
              analysis={analysis}
              isActive={isWebcamActive || activeTab === 'video'}
            />
          </div>

          {/* Right Column - Video Input */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('webcam')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'webcam'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Live Camera</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'video'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4" />
                      <span>Upload Video</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'webcam' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Live Camera Feed
                      </h3>
                      <button
                        onClick={toggleWebcam}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors duration-200 ${
                          isWebcamActive
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {isWebcamActive ? 'Stop Camera' : 'Start Camera'}
                      </button>
                    </div>
                    
                    <WebcamStream
                      isActive={isWebcamActive}
                      postureMode={postureMode}
                      onPostureAnalysis={handlePostureAnalysis}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Video Upload
                    </h3>
                    
                    <VideoUpload
                      postureMode={postureMode}
                      onPostureAnalysis={handlePostureAnalysis}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                {postureMode === PostureMode.SQUAT ? 'Squat Analysis Instructions' : 'Desk Sitting Instructions'}
              </h4>
              <ul className="text-sm text-blue-800 list-disc ml-4 space-y-1">
                {postureMode === PostureMode.SQUAT ? (
                  <>
                    <li>Stand facing the camera with your full body visible</li>
                    <li>Perform squats slowly and maintain proper form</li>
                    <li>Keep your knees behind your toes</li>
                    <li>Maintain a straight back with proper hip hinge</li>
                  </>
                ) : (
                  <>
                    <li>Sit facing the camera with your upper body visible</li>
                    <li>Keep your head in a neutral position</li>
                    <li>Maintain straight back alignment</li>
                    <li>Avoid slouching or leaning forward</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            PostureGuard - Rule-based posture detection using MediaPipe
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;