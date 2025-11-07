# Task: Remove Credit Packages and Markup Calculator Sections

## Overview
Remove the "Credit Packages" section and "Developer Tool: Markup Calculator" section from the application.

## Files Affected
- `app/login/page.tsx` - Remove both components from login page
- `components/BuyCreditsModal.tsx` - Remove both components from modal
- Component files themselves can remain (not imported anywhere else after cleanup)

## Todo List

### 1. Clean up app/login/page.tsx
- [ ] Remove import for CreditPackages component
- [ ] Remove import for MarkupCalculator component
- [ ] Remove markup state variable (line 13)
- [ ] Remove setMarkup function usage
- [ ] Remove MarkupCalculator component usage (line 86)
- [ ] Remove CreditPackages component usage (line 89)

### 2. Clean up components/BuyCreditsModal.tsx
- [ ] Remove import for CreditPackages component
- [ ] Remove import for MarkupCalculator component
- [ ] Remove markup state variable (line 14)
- [ ] Remove setMarkup function usage
- [ ] Remove MarkupCalculator component usage (line 68)
- [ ] Remove CreditPackages component usage (line 71)

### 3. Test the changes
- [ ] Verify the login page loads correctly without errors
- [ ] Verify the Buy Credits modal opens correctly
- [ ] Check that no broken imports or references remain

## Notes
- The component files themselves (CreditPackages.tsx and MarkupCalculator.tsx) will remain in the codebase but won't be used
- This is a simple removal task with no complex logic changes
- All changes are isolated to 2 files
