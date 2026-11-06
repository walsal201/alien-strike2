import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const session = sessionStorage.getItem('tactical_session');
      const authTime = sessionStorage.getItem('tactical_auth_time');

      if (session && authTime) {
        const elapsed = Date.now() - parseInt(authTime);
        if (elapsed < SESSION_TIMEOUT) {
          setIsAuthenticated(true);
          setSessionId(session);
        } else {
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('tactical_session');
    sessionStorage.removeItem('tactical_auth_time');
    setIsAuthenticated(false);
    setSessionId(null);
  }, []);

  const logActivity = useCallback(async (action: string, details: Record<string, any>) => {
    if (!sessionId) return;

    try {
      await supabase.functions.invoke('auth-access-code', {
        body: {
          action: 'log_activity',
          sessionId,
          data: { activityAction: action, details }
        }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [sessionId]);

  const logDeployment = useCallback(async (
    mode: string,
    droneType: string,
    count: number,
    targetLat: number,
    targetLon: number
  ) => {
    if (!sessionId) return;

    try {
      await supabase.functions.invoke('auth-access-code', {
        body: {
          action: 'log_deployment',
          sessionId,
          data: { mode, droneType, count, targetLat, targetLon }
        }
      });
    } catch (error) {
      console.error('Failed to log deployment:', error);
    }
  }, [sessionId]);

  const logDroneStatus = useCallback(async (
    droneId: string,
    droneType: string,
    previousStatus: string | null,
    newStatus: string,
    lat?: number,
    lon?: number,
    battery?: number
  ) => {
    try {
      await supabase.functions.invoke('auth-access-code', {
        body: {
          action: 'log_drone_status',
          sessionId,
          data: { droneId, droneType, previousStatus, newStatus, lat, lon, battery }
        }
      });
    } catch (error) {
      console.error('Failed to log drone status:', error);
    }
  }, [sessionId]);

  return {
    isAuthenticated,
    isLoading,
    sessionId,
    logout,
    logActivity,
    logDeployment,
    logDroneStatus
  };
};
