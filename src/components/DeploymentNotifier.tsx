import React, { useEffect, useState } from 'react';
import { X, MapPin } from 'lucide-react';

export interface DeploymentNotification {
  id: string;
  lat: string;
  lon: string;
  count: number;
  mode: string;
  timestamp: number;
}

interface DeploymentNotifierProps {
  notifications: DeploymentNotification[];
  onDismiss: (id: string) => void;
}

const DeploymentNotifier: React.FC<DeploymentNotifierProps> = ({ notifications, onDismiss }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationStyle = (timestamp: number) => {
    const age = currentTime - timestamp;
    const seconds = age / 1000;
    
    // Recent (< 10 seconds): RED
    if (seconds < 10) {
      return {
        border: 'border-red-500',
        bg: 'bg-red-900/80',
        text: 'text-red-400',
        glow: 'shadow-red-500/50',
        label: 'RECENT',
        labelBg: 'bg-red-600'
      };
    }
    // Medium (10-30 seconds): YELLOW
    if (seconds < 30) {
      return {
        border: 'border-yellow-500',
        bg: 'bg-yellow-900/80',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/50',
        label: 'ACTIVE',
        labelBg: 'bg-yellow-600'
      };
    }
    // Old (> 30 seconds): GREEN
    return {
      border: 'border-green-500',
      bg: 'bg-green-900/80',
      text: 'text-green-400',
      glow: 'shadow-green-500/50',
      label: 'COMPLETED',
      labelBg: 'bg-green-600'
    };
  };

  const formatTime = (timestamp: number) => {
    const age = Math.floor((currentTime - timestamp) / 1000);
    if (age < 60) return `${age}s ago`;
    return `${Math.floor(age / 60)}m ${age % 60}s ago`;
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-h-[80vh] overflow-y-auto">
      {notifications.map((notification) => {
        const style = getNotificationStyle(notification.timestamp);
        return (
          <div
            key={notification.id}
            className={`${style.border} ${style.bg} border-2 rounded-lg p-3 min-w-[280px] shadow-lg ${style.glow} animate-in slide-in-from-right font-mono`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${style.labelBg} text-white text-xs px-2 py-0.5 rounded font-bold`}>
                    {style.label}
                  </span>
                  <span className="text-gray-400 text-xs">{formatTime(notification.timestamp)}</span>
                </div>
                <div className={`text-sm font-bold ${style.text} mb-1`}>
                  🚀 {notification.count.toLocaleString()} DRONES DEPLOYED
                </div>
                <div className="text-xs text-gray-300 mb-1">
                  Mode: {notification.mode.toUpperCase()}
                </div>
                <div className={`flex items-center gap-1 ${style.text} text-xs`}>
                  <MapPin className="w-3 h-3" />
                  <span className="font-bold">GPS:</span>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                  <div className="bg-black/50 rounded px-2 py-1">
                    <span className="text-gray-400">LAT:</span>{' '}
                    <span className={style.text}>{parseFloat(notification.lat).toFixed(6)}</span>
                  </div>
                  <div className="bg-black/50 rounded px-2 py-1">
                    <span className="text-gray-400">LON:</span>{' '}
                    <span className={style.text}>{parseFloat(notification.lon).toFixed(6)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DeploymentNotifier;
