# Architecture Standards

## Component Reusability

Always create reusable components whenever possible.

### Guidelines

- ✅ Extract common UI patterns into reusable components
- ✅ Identify and refactor repeated code into shared components
- ✅ Create flexible, configurable components with proper props
- ✅ Follow DRY (Don't Repeat Yourself) principles
- ✅ Build component libraries for common UI patterns

### Component Design Principles

**1. Single Responsibility**
- Each component should have one clear purpose
- Avoid mixing multiple concerns in a single component

**2. Prop Interface Design**
- Use TypeScript interfaces for all props
- Provide sensible defaults
- Make props optional when appropriate
- Document complex props with JSDoc comments

**3. Composability**
- Design components to work together
- Use composition over inheritance
- Support children props when appropriate

### Examples

**✅ Good: Reusable DatePicker Component**
```tsx
<DatePicker
  value={field.value}
  onChange={field.onChange}
  maxDate={new Date()}
  placeholder="Select date"
/>
```

**❌ Bad: Repeated Code**
```tsx
// Same date input logic duplicated across multiple files
<Input type="date" max={...} onChange={...} />
```

### File Organization

- Place reusable components in `src/components/ui/`
- Place feature-specific components in appropriate feature folders
- Create index files for easier imports

**Rationale**: Improves maintainability, ensures consistency, and reduces code duplication.

---

**Last Updated**: October 11, 2025

