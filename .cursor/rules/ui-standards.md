# UI/UX Standards

## Input Field Styling

All input fields must include the following Tailwind CSS classes for consistent focus styling:

```css
focus:ring-2 focus:ring-primary focus:border-primary
```

**Rationale**: Ensures a unified user experience across all forms and input components.

**Example**:
```tsx
<Input
  type="text"
  placeholder="Enter value"
  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
/>
```

**Applies to**:
- Text inputs
- Select dropdowns
- Textareas
- Date pickers
- Any form input element

---

**Last Updated**: October 11, 2025

