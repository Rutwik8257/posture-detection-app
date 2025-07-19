import React from 'react';
import { User, UserCheck } from 'lucide-react';
import { PostureMode } from '../types/pose';

interface ModeSelectorProps {
  selectedMode: PostureMode;
  onModeChange: (mode: PostureMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onModeChange
}) => {
  const modes = [
    {
      value: PostureMode.SQUAT,
      label: 'Squat Analysis',
      description: 'Detect knee-over-toe and back angle issues',
      icon: User
    },
    {
      value: PostureMode.DESK_SITTING,
      label: 'Desk Sitting',
      description: 'Monitor neck angle and back straightness',
      icon: UserCheck
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Mode</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.value;
          
          return (
            <button
              key={mode.value}
              onClick={() => onModeChange(mode.value)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon
                  className={`h-6 w-6 mt-1 ${
                    isSelected ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <div className="flex-1">
                  <div
                    className={`font-medium ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {mode.label}
                  </div>
                  <div
                    className={`text-sm mt-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-500'
                    }`}
                  >
                    {mode.description}
                  </div>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};