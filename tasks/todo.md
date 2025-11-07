# Task: Remove Credit/Payment System and Hide Audit Options

## Overview
Remove all credit-related and payment-related features, and hide certain audit sections:
- Credit Packages section
- Developer Tool: Markup Calculator
- Buy Credits modal functionality
- Credits display in header
- Low credits warning
- Hide Keywords, Accessibility, and Backlinks sections (keep code)
- Remove Audit View section entirely

## Files Affected
- `app/login/page.tsx` - Remove CreditPackages and MarkupCalculator components
- `components/BuyCreditsModal.tsx` - Remove CreditPackages and MarkupCalculator from modal
- `components/UserHeader.tsx` - Remove credits display, buy credits button, and low credits warning
- `components/AuditForm.tsx` - Hide certain sections and remove Audit View section

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

### 4. Hide audit sections in components/AuditForm.tsx
- [ ] Comment out keywords section in AUDIT_SECTIONS array (lines 22-26)
- [ ] Comment out accessibility section in AUDIT_SECTIONS array (lines 27-32)
- [ ] Comment out backlinks section in AUDIT_SECTIONS array (lines 33-38)
- [ ] Remove entire Audit View section (lines 1548-1689)

### 5. Test the changes
- [ ] Verify login page loads without errors
- [ ] Verify dashboard UserHeader shows only username and logout
- [ ] Verify only Traffic and Performance sections show in audit form
- [ ] Verify Audit View section is gone
- [ ] Check no broken imports remain
- [ ] Verify app functions normally

## Notes
- Component files (CreditPackages.tsx, MarkupCalculator.tsx, BuyCreditsModal.tsx) will remain but won't be used
- Audit sections are commented out (not deleted) so they can be re-enabled later
- Audit View section is fully removed as requested
- This simplifies the app significantly
- All changes are simple removals/comments with no complex logic
