// Configuration file for application settings
const config = {
    // Backend API base URL
    API_BASE_URL: 'http://localhost:5000',

    // Image base URL (can be different from API if using CDN)
    IMAGE_BASE_URL: 'http://localhost:5000',

    // Default image for missing photos
    DEFAULT_IMAGE: 'https://via.placeholder.com/150x150?text=No+Image',

    // Image sizes for different components
    IMAGE_SIZES: {
        THUMBNAIL: { width: 60, height: 60 },
        SMALL: { width: 40, height: 40 },
        MEDIUM: { width: 150, height: 150 },
        LARGE: { width: 300, height: 300 }
    }
};

// Helper function to get full image URL
export const getImageUrl = (photoPath, size = 'MEDIUM') => {
    if (!photoPath) {
        return config.DEFAULT_IMAGE;
    }

    // If already a full URL, return as is
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
    }

    // If starts with /uploads, construct full URL
    if (photoPath.startsWith('/uploads')) {
        return `${config.IMAGE_BASE_URL}${photoPath}`;
    }

    // If starts with uploads (without leading slash), add the slash
    if (photoPath.startsWith('uploads')) {
        return `${config.IMAGE_BASE_URL}/${photoPath}`;
    }

    // If doesn't start with uploads, add it
    return `${config.IMAGE_BASE_URL}/uploads/${photoPath}`;
};

// Helper function to get API URL
export const getApiUrl = (endpoint) => {
    return `${config.API_BASE_URL}/api${endpoint}`;
};

export default config;