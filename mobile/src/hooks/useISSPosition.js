import { useState, useEffect, useRef, useCallback } from 'react';
import { issAPI } from '../services/api';

const useISSPosition = (intervalMs = 5000) => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);

  const fetchPosition = useCallback(async () => {
    try {
      const response = await issAPI.getPosition();
      if (response.success) {
        const newPos = response.data;
        setPosition(newPos);
        setHistory((prev) => {
          const updated = [...prev, { lat: newPos.latitude, lng: newPos.longitude, time: Date.now() }];
          return updated.slice(-100); // Keep last 100 positions for orbit trail
        });
        setError(null);
      }
    } catch (err) {
      console.warn('ISS position fetch failed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosition();
    intervalRef.current = setInterval(fetchPosition, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPosition, intervalMs]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchPosition();
  }, [fetchPosition]);

  return { position, loading, error, history, refresh };
};

export default useISSPosition;
