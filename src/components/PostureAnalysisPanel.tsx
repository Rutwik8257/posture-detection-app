import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { PostureAnalysis } from '../types/pose';

interface PostureAnalysisPanelProps {
  analysis: PostureAnalysis | null;
  isActive: boolean;
}

export const PostureAnalysisPanel: React.FC<PostureAnalysisPanelProps> = ({
  analysis,
  isActive
}) => {
  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <Activity className="mx-auto h-12 w-12 mb-4 text-gray-400" />
          <div className="text-lg font-medium mb-2">Posture Analysis</div>
          <div className="text-sm">
            {isActive ? 'Stand in front of the camera to begin analysis' : 'Start camera or upload a video to analyze posture'}
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'bad':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Activity className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'bad':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'bad':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Posture Analysis</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon(analysis.overallStatus)}
          <span className="text-sm font-medium text-gray-600">
            Confidence: {analysis.confidence}%
          </span>
        </div>
      </div>

      <div className={`rounded-lg border p-4 mb-4 ${getStatusColor(analysis.overallStatus)}`}>
        <div className="flex items-center space-x-2 mb-2">
          {getStatusIcon(analysis.overallStatus)}
          <span className="font-medium">
            Overall Status: {analysis.overallStatus.charAt(0).toUpperCase() + analysis.overallStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Detailed Feedback:</h4>
        {analysis.alerts.map((alert, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 p-3 rounded-lg border ${getStatusColor(alert.type)}`}
          >
            {getAlertIcon(alert.type)}
            <div className="flex-1">
              <div className="text-sm font-medium">{alert.message}</div>
              <div className="text-xs text-gray-500 mt-1">Rule: {alert.rule}</div>
            </div>
          </div>
        ))}
      </div>

      {analysis.overallStatus !== 'good' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Tips for improvement:</strong>
            <ul className="mt-1 ml-4 list-disc">
              {analysis.overallStatus === 'bad' && (
                <>
                  <li>Keep your back straight and shoulders aligned</li>
                  <li>Ensure proper form to prevent injury</li>
                </>
              )}
              {analysis.overallStatus === 'warning' && (
                <>
                  <li>Make small adjustments to your posture</li>
                  <li>Focus on the highlighted areas for improvement</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};