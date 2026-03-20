import { toast } from 'react-toastify';

// Default toast configuration
const defaultToastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

/**
 * Show a success toast notification
 * @param {string} message - The success message to display
 * @param {object} options - Optional custom toast configuration
 */
export const notifySuccess = (message, options = {}) => {
    toast.success(message, {
        ...defaultToastConfig,
        ...options
    });
};

/**
 * Show an error toast notification
 * @param {string} message - The error message to display
 * @param {object} options - Optional custom toast configuration
 */
export const notifyError = (message, options = {}) => {
    toast.error(message, {
        ...defaultToastConfig,
        ...options
    });
};

/**
 * Show an info toast notification
 * @param {string} message - The info message to display
 * @param {object} options - Optional custom toast configuration
 */
export const notifyInfo = (message, options = {}) => {
    toast.info(message, {
        ...defaultToastConfig,
        ...options
    });
};

/**
 * Show a warning toast notification
 * @param {string} message - The warning message to display
 * @param {object} options - Optional custom toast configuration
 */
export const notifyWarning = (message, options = {}) => {
    toast.warning(message, {
        ...defaultToastConfig,
        ...options
    });
};

/**
 * Show a custom toast notification with any type
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('success', 'error', 'info', 'warning')
 * @param {object} options - Optional custom toast configuration
 */
export const notifyCustom = (message, type = 'info', options = {}) => {
    toast[type](message, {
        ...defaultToastConfig,
        ...options
    });
};

/**
 * Clear all toasts
 */
export const clearToasts = () => {
    toast.dismiss();
};

/**
 * Show a loading toast that can be updated
 * @param {string} message - The loading message
 * @param {object} options - Optional custom toast configuration
 * @returns {string} - The toast ID for updating later
 */
export const notifyLoading = (message, options = {}) => {
    return toast.loading(message, {
        ...defaultToastConfig,
        autoClose: false,
        ...options
    });
};

/**
 * Update a loading toast to success
 * @param {string} toastId - The ID of the toast to update
 * @param {string} message - The success message
 */
export const updateToastSuccess = (toastId, message) => {
    toast.update(toastId, {
        render: message,
        type: "success",
        isLoading: false,
        autoClose: 3000
    });
};

/**
 * Update a loading toast to error
 * @param {string} toastId - The ID of the toast to update
 * @param {string} message - The error message
 */
export const updateToastError = (toastId, message) => {
    toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 5000
    });
};