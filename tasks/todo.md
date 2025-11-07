# Task: Remove Credit/Payment System from App

## Overview
Remove all credit-related and payment-related features:
- Credit Packages section
- Developer Tool: Markup Calculator
- Buy Credits modal functionality
- Credits display in header
- Low credits warning

## Files Affected
- `app/login/page.tsx` - Remove CreditPackages and MarkupCalculator components
- `components/BuyCreditsModal.tsx` - Remove CreditPackages and MarkupCalculator from modal
- `components/UserHeader.tsx` - Remove credits display, buy credits button, and low credits warning

## Todo List

### 1. Clean up app/login/page.tsx
- [ ] Remove import for CreditPackages component
- [ ] Remove import for MarkupCalculator component
- [ ] Remove markup state variable (line 13)
- [ ] Remove MarkupCalculator component usage (line 86)
- [ ] Remove CreditPackages component usage (line 89)

### 2. Clean up components/BuyCreditsModal.tsx
- [ ] Remove import for CreditPackages component
- [ ] Remove import for MarkupCalculator component
- [ ] Remove markup state variable (line 14)
- [ ] Remove MarkupCalculator component usage (line 68)
- [ ] Remove CreditPackages component usage (line 71)

### 3. Clean up components/UserHeader.tsx
- [ ] Remove BuyCreditsModal import (line 6)
- [ ] Remove showBuyCreditsModal state (line 17)
- [ ] Remove credits button (lines 40-54)
- [ ] Remove low credits warning section (lines 70-84)
- [ ] Remove BuyCreditsModal component usage (lines 86-91)
- [ ] Keep username and logout button only

### 4. Test the changes
- [ ] Verify login page loads without errors
- [ ] Verify dashboard UserHeader shows only username and logout
- [ ] Check no broken imports remain
- [ ] Verify app functions normally without credit system

## Notes
- Component files (CreditPackages.tsx, MarkupCalculator.tsx, BuyCreditsModal.tsx) will remain but won't be used
- This simplifies the app by removing the entire payment/credit system
- User experience will be cleaner with just authentication
- All changes are simple removals with no complex logic
