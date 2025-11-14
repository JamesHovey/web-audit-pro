# Task: Remove Credits System & Simplify User Authentication

## Overview
Remove the entire credits/payment system from the application (backend + frontend) and create a simple user authentication system. Users can create accounts, login, and save audits without any credit tracking.

**What stays:**
- User login/registration
- Save audit feature
- Auto-redirect to dashboard after registration (already working)

**What gets removed:**
- All credit tracking (UI, database, backend logic)
- Credit packages and pricing
- Payment-related features
- Keywords, Accessibility, Backlinks audit sections (hidden, not deleted)
- Audit View section

## Files to Modify

### Database Schema
- `prisma/schema.prisma` - Remove credits fields from User and Audit models

### Backend API Routes
- `app/api/auth/register/route.ts` - Remove credit assignment
- `app/api/audit/route.ts` - Remove credit checking/deduction logic

### Frontend Components
- `app/login/page.tsx` - Remove credit package displays
- `components/RegisterModal.tsx` - Remove credit mentions
- `components/UserHeader.tsx` - Remove credits display
- `components/AuditForm.tsx` - Hide sections, remove Audit View, remove cost estimates
- `components/BuyCreditsModal.tsx` - Clean up (component won't be used)

## Todo List

### 1. Database Schema Changes (prisma/schema.prisma)
- [ ] Remove `credits` field from User model (line 51)
- [ ] Remove `creditCost` field from Audit model (line 77)
- [ ] Remove `estimatedCost` field from Audit model (line 78)
- [ ] Remove `actualCost` field from Audit model (line 79)
- [ ] Create migration for these changes

### 2. Update Registration API (app/api/auth/register/route.ts)
- [ ] Remove credits from user creation (line 64)
- [ ] Update success message to remove credit mention (line 78)
- [ ] Remove credits from response object (line 76)

### 3. Update Registration Modal (components/RegisterModal.tsx)
- [ ] Remove "Get 100 free credits" text (line 105)
- [ ] Remove "100 free audit credits" from benefits list (line 181)
- [ ] Update benefits to remove credit mentions
- [ ] Keep auto-redirect to dashboard (already working at line 70)

### 4. Clean up Login Page (app/login/page.tsx)
- [ ] Remove CreditPackages import
- [ ] Remove MarkupCalculator import
- [ ] Remove markup state variable
- [ ] Remove MarkupCalculator component
- [ ] Remove CreditPackages component

### 5. Clean up BuyCreditsModal (components/BuyCreditsModal.tsx)
- [ ] Remove CreditPackages import
- [ ] Remove MarkupCalculator import
- [ ] Remove markup state variable
- [ ] Remove component usages

### 6. Update UserHeader (components/UserHeader.tsx)
- [ ] Remove BuyCreditsModal import
- [ ] Remove showBuyCreditsModal state
- [ ] Remove credits button display
- [ ] Remove low credits warning section
- [ ] Remove BuyCreditsModal component
- [ ] Keep only username and logout button

### 7. Update AuditForm (components/AuditForm.tsx)
- [ ] Comment out keywords section in AUDIT_SECTIONS array
- [ ] Comment out accessibility section in AUDIT_SECTIONS array
- [ ] Comment out backlinks section in AUDIT_SECTIONS array
- [ ] Remove entire Audit View section (lines 1548-1689)
- [ ] Remove/hide Estimated Cost section
- [ ] Remove credit-related calculations

### 8. Update Audit API (app/api/audit/route.ts)
- [ ] Remove credit checking logic
- [ ] Remove credit deduction logic
- [ ] Keep audit saving functionality
- [ ] Remove cost tracking

### 9. Update lib/auth.ts
- [ ] Remove credits from user session data if present

### 10. Test Everything
- [ ] New user registration works
- [ ] Auto-redirect to dashboard after registration
- [ ] Login works
- [ ] Logout works
- [ ] Users can run audits without credit checks
- [ ] Save audit feature works
- [ ] Only Traffic and Performance sections visible
- [ ] No credit-related UI anywhere
- [ ] No Audit View section

## Notes
- This is a comprehensive removal of the credits system
- Database migration will be needed
- Keep save audit feature fully functional
- Registration already redirects to dashboard (line 70 in RegisterModal.tsx)
- All changes are straightforward removals
- Component files stay in codebase but won't be imported/used
