import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userId: string;
}

export default function VideoCallModal({ isOpen, onClose, userName, userId }: VideoCallModalProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Simulate connection after 2 seconds
      const connectTimer = setTimeout(() => {
        setIsConnected(true);
      }, 2000);

      return () => clearTimeout(connectTimer);
    } else {
      setIsConnected(false);
      setCallDuration(0);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setIsConnected(false);
    setCallDuration(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl h-96 flex flex-col relative overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative bg-gray-800">
          {!isConnected ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-lg font-medium mb-2">Calling {userName}...</p>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0">
              {/* Simulated video feed */}
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-lg font-medium">{userName}</p>
                  <p className="text-sm text-blue-200">Connected - {formatDuration(callDuration)}</p>
                </div>
              </div>
              
              {/* Self video (small corner) */}
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-white flex items-center justify-center">
                <span className="text-white text-sm">You</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-900 p-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full transition-colors ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isMuted ? (
                <MicOff className="h-5 w-5 text-white" />
              ) : (
                <Mic className="h-5 w-5 text-white" />
              )}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-full transition-colors ${
                !isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isVideoOn ? (
                <Video className="h-5 w-5 text-white" />
              ) : (
                <VideoOff className="h-5 w-5 text-white" />
              )}
            </button>

            <button
              onClick={handleEndCall}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
            >
              <Phone className="h-5 w-5 text-white transform rotate-135" />
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}