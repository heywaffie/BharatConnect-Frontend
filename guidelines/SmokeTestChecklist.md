# BharatLink Dashboard Smoke Test Checklist

## Pre-check
- Start backend and frontend services.
- Confirm `.env` has valid `VITE_API_BASE_URL` and (if used) `VITE_GOOGLE_CLIENT_ID`.

## Auth And Onboarding
- Sign in with email/password as citizen and verify redirect to dashboard.
- Sign in with Google and verify onboarding is shown if profile is incomplete.
- Complete onboarding and verify role-appropriate dashboard access.

## Role Dashboards
- Citizen: open quick complaint entry (`/citizen?quick=complaint`) and confirm issue modal appears.
- Moderator: open queue shortcut (`/moderator?quick=queue`) and verify flagged tab is active.
- Politician: open quick announcement (`/politician?quick=announcement`) and verify announcement modal appears.
- Admin: open user management shortcut (`/admin?quick=users`) and verify users tab is active.

## Dashboard Hub
- Verify panel search and reset work.
- Verify compact mode and high contrast toggles persist after refresh.
- Verify profile edit modal updates name/phone.
- Verify copy-email button shows success toast.

## Responsive And Accessibility
- Check admin user management at mobile width: cards are shown and actions remain usable.
- Verify dashboard entry animation appears on route load.
- Verify icon-only buttons have accessible names (notifications/settings).

## Localization
- Change language and verify dashboard date/time formatting updates by locale.

## Build Verification
- Run `npm run build` and confirm success.
