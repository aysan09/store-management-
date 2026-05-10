// Session Management Utilities
import { useEffect, useState } from 'react';

export const SESSION_KEYS = {
    CURRENT_USER: 'currentUser',
    LAST_ACTIVITY: 'lastActivity',
    SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutes in milliseconds
};

/**
 * Save user session to localStorage with timestamp
 */
export const saveSession = (user) => {
    if (!user) return;

    try {
        const sessionData = {
            user: user,
            timestamp: Date.now(),
            lastActivity: Date.now()
        };
        localStorage.setItem(SESSION_KEYS.CURRENT_USER, JSON.stringify(sessionData));
    } catch (error) {
        console.error('Failed to save session:', error);
    }
};

/**
 * Load user session from localStorage
 */
export const loadSession = () => {
    try {
        const sessionData = localStorage.getItem(SESSION_KEYS.CURRENT_USER);
        if (!sessionData) return null;

        const parsed = JSON.parse(sessionData);
        return parsed.user || null;
    } catch (error) {
        console.error('Failed to load session:', error);
        return null;
    }
};

/**
 * Clear user session from localStorage
 */
export const clearSession = () => {
    try {
        localStorage.removeItem(SESSION_KEYS.CURRENT_USER);
        localStorage.removeItem(SESSION_KEYS.LAST_ACTIVITY);
    } catch (error) {
        console.error('Failed to clear session:', error);
    }
};

/**
 * Check if session is still valid (not expired)
 */
export const isSessionValid = () => {
    try {
        const sessionData = localStorage.getItem(SESSION_KEYS.CURRENT_USER);
        if (!sessionData) return false;

        const parsed = JSON.parse(sessionData);
        const lastActivity = parsed.lastActivity || parsed.timestamp || 0;
        const now = Date.now();

        // Check if session has expired
        return (now - lastActivity) < SESSION_KEYS.SESSION_TIMEOUT;
    } catch (error) {
        console.error('Failed to validate session:', error);
        return false;
    }
};

/**
 * Update last activity timestamp
 */
export const updateLastActivity = () => {
    try {
        const sessionData = localStorage.getItem(SESSION_KEYS.CURRENT_USER);
        if (!sessionData) return;

        const parsed = JSON.parse(sessionData);
        parsed.lastActivity = Date.now();
        localStorage.setItem(SESSION_KEYS.CURRENT_USER, JSON.stringify(parsed));
    } catch (error) {
        console.error('Failed to update last activity:', error);
    }
};

/**
 * Session management hook for React components
 */
export const useSessionManagement = () => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Initialize session on mount
        const sessionUser = loadSession();
        if (sessionUser && isSessionValid()) {
            setCurrentUser(sessionUser);
            setIsSessionActive(true);
            updateLastActivity();
        } else {
            clearSession();
            setIsSessionActive(false);
            setCurrentUser(null);
        }

        // Set up activity tracking
        const handleActivity = () => {
            if (currentUser) {
                updateLastActivity();
            }
        };

        // Set up session timeout check
        const checkSessionTimeout = () => {
            if (!isSessionValid()) {
                clearSession();
                setIsSessionActive(false);
                setCurrentUser(null);
            }
        };

        // Add event listeners for user activity
        window.addEventListener('click', handleActivity);
        window.addEventListener('keypress', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('mousemove', handleActivity);

        // Check session timeout every minute
        const interval = setInterval(checkSessionTimeout, 60000);

        return () => {
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('keypress', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('mousemove', handleActivity);
            clearInterval(interval);
        };
    }, [currentUser]);

    const login = (user) => {
        saveSession(user);
        setCurrentUser(user);
        setIsSessionActive(true);
    };

    const logout = () => {
        clearSession();
        setCurrentUser(null);
        setIsSessionActive(false);
    };

    const refreshSession = () => {
        if (currentUser) {
            saveSession(currentUser);
            updateLastActivity();
        }
    };

    return {
        currentUser,
        isSessionActive,
        login,
        logout,
        refreshSession,
        isSessionValid: () => isSessionValid()
    };
};