# Disclaimer System Documentation

## Overview

The disclaimer system ensures that users understand the legal limitations and terms of service before creating their will. It provides a robust, user-friendly way to present legal disclaimers and track user acceptance.

## Architecture

### Components

1. **`useDisclaimer` Hook** (`src/hooks/useDisclaimer.ts`)
   - Centralized state management for disclaimer acceptance
   - Handles localStorage persistence
   - Manages API calls for backend storage
   - Provides loading states and error handling

2. **`DisclaimerGuard` Component** (`src/components/will-wizard/DisclaimerGuard.tsx`)
   - Wraps the will wizard to enforce disclaimer acceptance
   - Shows disclaimer modal when needed
   - Handles error states and loading states
   - Provides fallback navigation

3. **`WillDisclaimerDialog` Component** (`src/components/will-wizard/WillDisclaimerDialog.tsx`)
   - The actual disclaimer modal UI
   - Non-dismissible (users must explicitly accept or decline)
   - Contains all legal text and terms

### Data Flow

```
User visits Will Wizard
    ↓
DisclaimerGuard checks acceptance status
    ↓
If not accepted: Show WillDisclaimerDialog
    ↓
User clicks "Agree & Continue"
    ↓
useDisclaimer.acceptDisclaimer() called
    ↓
Save to localStorage + API (if will exists)
    ↓
Update state: isAccepted = true
    ↓
DisclaimerGuard renders children (Will Wizard)
```

## Features

### ✅ Implemented Features

1. **Non-Dismissible Modal**
   - Users cannot close the dialog by clicking outside or pressing ESC
   - Must explicitly click "Accept" or "Decline"

2. **Persistent Storage**
   - Saves acceptance to localStorage as backup
   - Saves to backend API when will exists
   - Survives page refreshes and browser sessions

3. **Error Handling**
   - Graceful fallback if API calls fail
   - User-friendly error messages
   - Retry mechanisms

4. **Loading States**
   - Visual feedback during API calls
   - Prevents duplicate submissions
   - Clear loading indicators

5. **Legal Compliance**
   - Accurate legal text (fixed "does NOT offer" typo)
   - Clear terms and conditions
   - Proper acknowledgment flow

6. **Architecture Improvements**
   - Centralized logic in custom hook
   - Reusable DisclaimerGuard component
   - Clean separation of concerns
   - Removed duplicate code

### 🔄 State Management

The `useDisclaimer` hook manages the following state:

```typescript
interface DisclaimerState {
  isAccepted: boolean;        // Whether user has accepted
  isLoading: boolean;         // Whether API call is in progress
  error: string | null;       // Any error messages
  hasShown: boolean;         // Whether disclaimer has been shown
}
```

### 📱 User Experience

1. **First Visit**: User sees disclaimer immediately
2. **Acceptance**: User clicks "Agree & Continue" → proceeds to will creation
3. **Decline**: User clicks "Cancel" → redirected to dashboard
4. **Return Visit**: User who previously accepted bypasses disclaimer
5. **Error Recovery**: If API fails, localStorage ensures continuity

## API Integration

### Endpoints

- `POST /wills/{willId}/accept-disclaimer`
  - Saves disclaimer acceptance to backend
  - Includes timestamp and user information
  - Optional (localStorage provides fallback)

### Request Format

```json
{
  "agreed_disclaimer": true,
  "agreed_disclaimer_date": "2024-01-01T00:00:00.000Z"
}
```

## Storage Strategy

### localStorage Keys

- `legacy_in_order_disclaimer_accepted`: "true" | "false" | null
- `legacy_in_order_disclaimer_date`: ISO timestamp string

### Backend Storage

- Stored in `wills` table as `agreed_disclaimer` and `agreed_disclaimer_date` fields
- Linked to specific will instance
- Used for audit trails and compliance

## Testing

### Test Coverage

1. **Unit Tests** (`src/hooks/__tests__/useDisclaimer.test.ts`)
   - Hook state management
   - localStorage interactions
   - API error handling
   - Edge cases

2. **Integration Tests** (`src/components/will-wizard/__tests__/disclaimer.test.tsx`)
   - Full user flow
   - Component interactions
   - Error scenarios
   - Persistence across refreshes

### Test Scenarios

- ✅ New user sees disclaimer
- ✅ User accepts disclaimer
- ✅ User declines disclaimer
- ✅ Disclaimer persists across page refreshes
- ✅ API errors handled gracefully
- ✅ Concurrent acceptance prevented
- ✅ Malformed localStorage data handled
- ✅ Non-dismissible modal behavior

## Usage Examples

### Basic Usage

```tsx
import DisclaimerGuard from "@/components/will-wizard/DisclaimerGuard";

function App() {
  return (
    <DisclaimerGuard>
      <WillWizard />
    </DisclaimerGuard>
  );
}
```

### Custom Hook Usage

```tsx
import { useDisclaimer } from "@/hooks/useDisclaimer";

function MyComponent() {
  const {
    isAccepted,
    shouldShowDisclaimer,
    acceptDisclaimer,
    declineDisclaimer,
  } = useDisclaimer();

  if (shouldShowDisclaimer) {
    return <DisclaimerModal onAccept={acceptDisclaimer} onDecline={declineDisclaimer} />;
  }

  return <div>User has accepted disclaimer</div>;
}
```

## Configuration

### Customization Options

1. **Fallback Path**: Where to redirect when disclaimer is declined
   ```tsx
   <DisclaimerGuard fallbackPath="/custom-path">
     <MyComponent />
   </DisclaimerGuard>
   ```

2. **Storage Keys**: Customize localStorage keys (if needed)
   ```typescript
   const DISCLAIMER_STORAGE_KEY = "custom_disclaimer_key";
   ```

3. **API Endpoint**: Customize backend endpoint
   ```typescript
   const { error } = await apiClient(`/custom-endpoint/${willId}/disclaimer`, {
     method: "POST",
     body: JSON.stringify(data),
   });
   ```

## Security Considerations

1. **Client-Side Storage**: localStorage can be modified by users
   - Backend validation ensures data integrity
   - localStorage is backup, not primary source

2. **API Security**: Disclaimer acceptance should be verified server-side
   - Validate user permissions
   - Log acceptance for audit trails
   - Prevent unauthorized modifications

3. **Legal Compliance**: Ensure disclaimer text is legally accurate
   - Regular review of legal content
   - Jurisdiction-specific requirements
   - Version control for disclaimer changes

## Troubleshooting

### Common Issues

1. **Disclaimer Not Showing**
   - Check localStorage for existing acceptance
   - Verify `shouldShowDisclaimer` logic
   - Ensure DisclaimerGuard is properly wrapping content

2. **API Errors**
   - Check network connectivity
   - Verify API endpoint exists
   - Review error logs for specific issues

3. **State Not Persisting**
   - Check localStorage permissions
   - Verify storage keys are correct
   - Ensure no conflicting state management

### Debug Tools

```typescript
// Check disclaimer state
const { isAccepted, shouldShowDisclaimer, error } = useDisclaimer();
console.log({ isAccepted, shouldShowDisclaimer, error });

// Check localStorage
console.log(localStorage.getItem('legacy_in_order_disclaimer_accepted'));

// Clear disclaimer (for testing)
const { clearDisclaimer } = useDisclaimer();
clearDisclaimer();
```

## Future Enhancements

### Planned Features

1. **Jurisdiction-Specific Disclaimers**
   - Different legal text for different regions
   - Automatic detection based on user location
   - Compliance with local regulations

2. **Disclaimer Versioning**
   - Track disclaimer version acceptance
   - Re-prompt users for updated disclaimers
   - Historical acceptance records

3. **Analytics Integration**
   - Track acceptance/decline rates
   - Monitor user behavior patterns
   - A/B test different disclaimer formats

4. **Accessibility Improvements**
   - Screen reader optimization
   - Keyboard navigation
   - High contrast mode support

5. **Multi-Language Support**
   - Translated disclaimer text
   - RTL language support
   - Cultural adaptation

## Migration Guide

### From Old System

If migrating from the previous disclaimer implementation:

1. **Remove Old Code**:
   - Remove disclaimer logic from `PersonalInfoStep`
   - Remove unused `NameStep` disclaimer code
   - Clean up old state management

2. **Update Components**:
   - Wrap with `DisclaimerGuard`
   - Remove manual disclaimer handling
   - Update button states

3. **Test Migration**:
   - Verify existing users don't see disclaimer again
   - Test new user flow
   - Validate localStorage migration

### Breaking Changes

- `PersonalInfoStep` no longer handles disclaimer internally
- `NameStep` disclaimer logic removed
- API endpoint format may have changed
- localStorage keys updated

## Support

For issues or questions about the disclaimer system:

1. Check the test files for usage examples
2. Review the hook documentation
3. Check browser console for errors
4. Verify localStorage and API connectivity

## Changelog

### v2.0.0 (Current)
- ✅ Fixed legal typo ("does NOT offer")
- ✅ Made dialog non-dismissible
- ✅ Added localStorage persistence
- ✅ Created centralized useDisclaimer hook
- ✅ Added DisclaimerGuard component
- ✅ Improved error handling and loading states
- ✅ Added comprehensive test coverage
- ✅ Removed duplicate code

### v1.0.0 (Previous)
- Basic disclaimer modal
- Manual state management
- API-only persistence
- Escapable dialog
- Limited error handling
