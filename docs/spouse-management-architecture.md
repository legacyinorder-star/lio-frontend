# Spouse Management Architecture Analysis

## Current Problem

The `handleSpouseDataSave` function in `WillWizard` creates several issues:

1. **Prop Drilling** - Function passed down through multiple component layers
2. **Tight Coupling** - WillWizard knows too much about spouse management details
3. **Code Duplication** - Same logic used in both FamilyInfoStep and SpouseStep
4. **Testing Complexity** - Hard to test spouse logic in isolation

## Proposed Solution: Custom Hook

### ✅ **Benefits of `useSpouseManagement` Hook**

1. **Single Responsibility** - Hook only handles spouse-related operations
2. **Reusability** - Can be used in any component that needs spouse management
3. **Testability** - Easy to unit test spouse logic in isolation
4. **Clean Architecture** - Components focus on UI, hook handles business logic
5. **No Prop Drilling** - Each component imports the hook directly

### **Usage in Components**

```typescript
// FamilyInfoStep.tsx
import { useSpouseManagement } from "@/hooks/useSpouseManagement";

export default function FamilyInfoStep({ ... }) {
    const { saveSpouseData, spouseData, willOwnerData, isLoading } = useSpouseManagement();
    
    const handleSpouseData = async (data: SpouseData) => {
        const success = await saveSpouseData(data);
        if (success) {
            toast.success("Spouse information saved successfully");
        }
    };
    
    // ... rest of component
}

// SpouseStep.tsx  
import { useSpouseManagement } from "@/hooks/useSpouseManagement";

export default function SpouseStep({ ... }) {
    const { saveSpouseData, spouseData, willOwnerData, isLoading } = useSpouseManagement();
    
    const handleSpouseData = async (data: SpouseData) => {
        const success = await saveSpouseData(data);
        if (success) {
            toast.success("Spouse information saved successfully");
        }
    };
    
    // ... rest of component
}
```

### **WillWizard Simplification**

```typescript
// WillWizard.tsx - MUCH CLEANER
export default function WillWizard() {
    // Remove handleSpouseDataSave function entirely
    // Remove onSpouseDataSave prop passing
    
    return (
        <DisclaimerGuard>
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* ... */}
                <FamilyInfoStep
                    onNext={handleNext}
                    onBack={handleBack}
                    onUpdate={handleFormUpdate}
                    willOwnerData={willOwnerData}
                    spouseData={spouseData}
                    // ❌ Remove: onSpouseDataSave={handleSpouseDataSave}
                    isLoadingOwnerData={_isLoadingOwnerData}
                    initialData={formData}
                />
                {/* ... */}
            </div>
        </DisclaimerGuard>
    );
}
```

## Comparison: WillWizard vs FamilyInfoStep vs Custom Hook

| Aspect | WillWizard | FamilyInfoStep | Custom Hook |
|--------|------------|----------------|-------------|
| **Cohesion** | ❌ Low | ✅ High | ✅ High |
| **Reusability** | ❌ Poor | ❌ Poor | ✅ Excellent |
| **Testability** | ❌ Hard | ❌ Hard | ✅ Easy |
| **Prop Drilling** | ❌ Yes | ✅ No | ✅ No |
| **Single Responsibility** | ❌ No | ✅ Yes | ✅ Yes |
| **Code Duplication** | ❌ Yes | ❌ Yes | ✅ No |

## Implementation Plan

### Phase 1: Create Hook
- [x] Create `useSpouseManagement` hook
- [x] Move spouse logic from WillWizard to hook
- [x] Add proper error handling and loading states

### Phase 2: Update Components
- [ ] Update FamilyInfoStep to use hook
- [ ] Update SpouseStep to use hook
- [ ] Remove prop drilling from WillWizard

### Phase 3: Testing
- [ ] Unit tests for useSpouseManagement hook
- [ ] Integration tests for spouse saving flow
- [ ] E2E tests for complete spouse management

## Conclusion

**Moving to FamilyInfoStep would be better than WillWizard, but creating a custom hook is the best solution.**

The custom hook approach provides:
- ✅ **Better Architecture** - Separation of concerns
- ✅ **Easier Testing** - Isolated business logic
- ✅ **Code Reuse** - No duplication between components
- ✅ **Maintainability** - Single place to update spouse logic
- ✅ **Flexibility** - Can be used in any component that needs spouse management

This follows React best practices and makes the codebase more maintainable and testable.
