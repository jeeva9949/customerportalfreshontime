import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

/**
 * A custom hook to track and send an agent's GPS location.
 * @param {object | null} agent - The logged-in agent object. Must have an `id`.
 */
export const useLocationTracker = (agent) => {
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        // Only start tracking if we have a valid agent object.
        if (!agent || !agent.id) {
            return;
        }

        // 1. Ask for GPS permission
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        // 2. Connect to the server via Socket.IO
        socketRef.current = io(SOCKET_URL);

        const handleSuccess = (position) => {
            setIsTracking(true);
            const { latitude, longitude } = position.coords;
            
            const payload = {
                agentId: agent.id,
                latitude,
                longitude,
                status: 'En Route' // You can make this dynamic later
            };

            // 3. Send location update to the server
            if (socketRef.current) {
                socketRef.current.emit('agentLocationUpdate', payload);
            }
        };

        const handleError = (err) => {
            setIsTracking(false);
            setError(`ERROR(${err.code}): ${err.message}`);
            console.error(`Geolocation Error:`, err);
        };

        // Start watching the user's position
        watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });

        // Cleanup function: This runs when the component unmounts (e.g., agent logs out)
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            setIsTracking(false);
        };

    }, [agent]); // This effect re-runs only if the agent object changes

    return { isTracking, error };
};
