import { useCallback } from 'react';

import { isFeatureEnabled } from '../config/featureFlags';

const STORAGE_KEY = 'cc_dashboard_analytics_events';
const MAX_EVENTS = 60;

export function useDashboardAnalytics() {
  const trackEvent = useCallback((event, metadata = {}) => {
    if (!isFeatureEnabled('dashboardAnalytics')) return;

    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const next = [
        {
          event,
          metadata,
          at: new Date().toISOString(),
        },
        ...current,
      ].slice(0, MAX_EVENTS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Keep analytics non-blocking; UI actions should never fail due to tracking.
    }
  }, []);

  return { trackEvent };
}
