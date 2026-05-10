import React from 'react';
import { LogoState } from '../types';

interface ControlPanelProps {
  logoState: LogoState;
  onLogoStateChange: (newState: Partial<LogoState>) => void;
  onReset: () => void;
  onDownload: () => void;
  isLoading: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  logoState,
  onLogoStateChange,
  onReset,
  onDownload,
  isLoading
}) => {
  // Handle numeric input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    property: keyof LogoState
  ) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      onLogoStateChange({ [property]: value });
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Fine-tune Position</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="x-position" className="block text-sm font-medium text-gray-700 mb-1">
              X Position
            </label>
            <input
              id="x-position"
              type="number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={Math.round(logoState.x)}
              onChange={(e) => handleInputChange(e, 'x')}
            />
          </div>
          
          <div>
            <label htmlFor="y-position" className="block text-sm font-medium text-gray-700 mb-1">
              Y Position
            </label>
            <input
              id="y-position"
              type="number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={Math.round(logoState.y)}
              onChange={(e) => handleInputChange(e, 'y')}
            />
          </div>
          
          <div>
            <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
              Width
            </label>
            <input
              id="width"
              type="number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={Math.round(logoState.width)}
              onChange={(e) => handleInputChange(e, 'width')}
              min={30}
              max={logoState.constraintArea.width}
            />
          </div>
          
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
              Height
            </label>
            <input
              id="height"
              type="number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={Math.round(logoState.height)}
              onChange={(e) => handleInputChange(e, 'height')}
              min={30}
              max={logoState.constraintArea.height}
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <button
          className="flex items-center justify-center w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200"
          onClick={onReset}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Position
        </button>
        
        {/* <button
          className={`flex items-center justify-center w-full py-2 px-4 ${
            isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-md transition-colors duration-200`}
          onClick={onDownload}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Image
            </>
          )}
        </button> */}
      </div>
    </div>
  );
};

export default ControlPanel;