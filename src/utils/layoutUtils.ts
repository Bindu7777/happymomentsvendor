// Layout utility functions to prevent UI interference and improve user experience

/**
 * Prevent context menu on vendor cards and other interactive elements
 * This helps avoid browser context menus from overlapping content
 */
export const preventContextMenu = (event: React.MouseEvent) => {
  event.preventDefault();
};

/**
 * Ensure proper z-index stacking for different UI elements
 */
export const Z_INDEX = {
  HEADER: 9999,
  MODAL: 9998,
  DROPDOWN: 9997,
  TOOLTIP: 9996,
  VENDOR_CARD: 25,
  VENDOR_GRID: 20,
  MAIN_CONTENT: 10,
  BACKGROUND: 1
} as const;

/**
 * Add smooth scrolling behavior to the page
 */
export const enableSmoothScrolling = () => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.scrollBehavior = 'smooth';
  }
};

/**
 * Disable smooth scrolling (useful for programmatic scrolling)
 */
export const disableSmoothScrolling = () => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.scrollBehavior = 'auto';
  }
};

/**
 * Scroll to top of page smoothly
 */
export const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

/**
 * Scroll to element smoothly
 */
export const scrollToElement = (elementId: string) => {
  if (typeof document !== 'undefined') {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
};

/**
 * Get viewport dimensions
 */
export const getViewportDimensions = () => {
  if (typeof window !== 'undefined') {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
  return { width: 0, height: 0 };
};

/**
 * Check if element is in viewport
 */
export const isElementInViewport = (element: HTMLElement) => {
  if (typeof window !== 'undefined') {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }
  return false;
};

/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function to limit function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate unique IDs for elements
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (Indian)
 */
export const isValidIndianPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Format Indian phone number
 */
export const formatIndianPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};

/**
 * Share content using Web Share API or fallback
 */
export const shareContent = async (data: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    } else {
      // Fallback: copy to clipboard
      const shareText = `${data.title}\n${data.text}\n${data.url}`;
      return await copyToClipboard(shareText);
    }
  } catch (error) {
    console.error('Failed to share content:', error);
    return false;
  }
};

/**
 * Get device type
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * Check if device is touch-enabled
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export default {
  preventContextMenu,
  Z_INDEX,
  enableSmoothScrolling,
  disableSmoothScrolling,
  scrollToTop,
  scrollToElement,
  getViewportDimensions,
  isElementInViewport,
  debounce,
  throttle,
  generateId,
  formatFileSize,
  isValidEmail,
  isValidIndianPhone,
  formatIndianPhone,
  copyToClipboard,
  shareContent,
  getDeviceType,
  isTouchDevice
};
