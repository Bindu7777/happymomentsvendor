import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

export const useSearchTracking = () => {
  const { customer, saveSearchHistory } = useCustomerAuth();

  const trackSearch = async (
    searchType: 'voice' | 'manual' | 'smart_request',
    searchQuery?: string,
    searchFilters?: any,
    resultsCount?: number
  ) => {
    if (!customer) {
      return; // Don't track searches for non-logged-in users
    }

    try {
      await saveSearchHistory(searchType, searchQuery, searchFilters, resultsCount);
    } catch (error) {
      console.error('Error tracking search:', error);
      // Don't throw error - search tracking should not break the user experience
    }
  };

  const trackVoiceSearch = async (query: string, filters?: any, resultsCount?: number) => {
    await trackSearch('voice', query, filters, resultsCount);
  };

  const trackManualSearch = async (query: string, filters?: any, resultsCount?: number) => {
    await trackSearch('manual', query, filters, resultsCount);
  };

  const trackSmartRequest = async (query: string, filters?: any, resultsCount?: number) => {
    await trackSearch('smart_request', query, filters, resultsCount);
  };

  return {
    trackSearch,
    trackVoiceSearch,
    trackManualSearch,
    trackSmartRequest,
    isTrackingEnabled: !!customer
  };
};
