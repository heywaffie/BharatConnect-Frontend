export const FEATURE_FLAGS = {
  dashboardAnalytics: true,
};

export function isFeatureEnabled(flag) {
  return Boolean(FEATURE_FLAGS[flag]);
}
