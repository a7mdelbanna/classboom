# ClassBoom UI/UX Rules and Guidelines

## 🎯 Core Principles

### 1. **Clickable Cards Pattern**
All card components that display entity information (students, courses, classes, etc.) MUST follow these rules:

#### Implementation:
```tsx
<motion.div
  className="... cursor-pointer"
  onClick={() => handleEditEntity(entity)}
  whileHover={{ scale: 1.02 }}
>
  {/* Card Content */}
  <button onClick={(e) => {
    e.stopPropagation();
    handleSpecificAction();
  }}>
    Action Button
  </button>
</motion.div>
```

#### Rules:
- **Entire card is clickable** - Opens the edit/detail view
- **Add `cursor-pointer`** - Shows hand cursor on hover
- **Add scale animation** - `whileHover={{ scale: 1.02 }}` for visual feedback
- **Protect nested actions** - All buttons inside must use `e.stopPropagation()`
- **Primary action** - Card click should perform the most common action (usually edit)

### 2. **Modal/Popup Click-Outside Pattern**
All modals and popups MUST close when clicking outside the content area.

#### Implementation for Custom Modals:
```tsx
<div 
  className="fixed inset-0 bg-black/50 z-50"
  onClick={onClose}
>
  <div 
    className="modal-content"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Modal Content */}
  </div>
</div>
```

#### Implementation using Modal Component:
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  closeOnBackdropClick={true} // Default is true
>
  {/* Content */}
</Modal>
```

#### Rules:
- **Backdrop click closes modal** - Click on dark overlay area
- **Content click does nothing** - Click inside modal keeps it open
- **Escape key support** - ESC key should also close modals
- **Stop propagation** - Modal content must stop click events from bubbling

### 3. **Visual Feedback Standards**

#### Hover Effects:
- **Cards**: Scale to 1.02x + shadow enhancement
- **Buttons**: Brightness adjustment or color change
- **Links**: Underline or color change
- **Interactive elements**: Must have clear hover states

#### Transitions:
- **Duration**: 200-300ms for most transitions
- **Easing**: Use spring physics for natural motion
- **Consistency**: Similar elements use similar transitions

### 4. **Accessibility Requirements**

- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Focus Indicators**: Clear focus states for all interactive elements
- **ARIA Labels**: Proper labels for screen readers on icon buttons
- **Click Targets**: Minimum 44x44px click areas for touch devices

### 5. **Component-Specific Rules**

#### Entity Cards (Students, Courses, etc.):
- Primary action (card click) = Edit
- Secondary actions = Quick action buttons
- Destructive actions = Require confirmation
- Loading states = Show skeleton or spinner

#### Forms in Modals:
- Cancel/Close = Discard changes (with confirmation if dirty)
- Save = Validate and show loading state
- Click outside = Same as cancel (with confirmation if dirty)

#### Navigation Items:
- Active state = Clear visual distinction
- Expandable items = Chevron indicator
- Icons = Consistent size and alignment

## 🚫 Anti-Patterns to Avoid

1. **Don't make only part of a card clickable** - Entire card or nothing
2. **Don't use browser native alerts/confirms** - Always use custom modals
3. **Don't block modal closing without warning** - If form is dirty, ask first
4. **Don't forget loading states** - Every async action needs feedback
5. **Don't mix click behaviors** - Be consistent across similar components

## 📝 Implementation Checklist

When creating new components:

- [ ] Cards are fully clickable with cursor-pointer
- [ ] Hover effects are smooth and consistent
- [ ] Modals close on backdrop click
- [ ] All buttons have proper click handlers
- [ ] Nested actions use stopPropagation
- [ ] Loading states are implemented
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Transitions follow standards
- [ ] Mobile touch targets are adequate

## 🎨 Theme Consistency

### Colors:
- **Primary**: Orange (classboom-primary)
- **Secondary**: Blue
- **Dark mode**: All inputs use `dark:bg-gray-700`
- **Hover states**: Slightly darker/lighter variants

### Spacing:
- **Card padding**: p-6
- **Button padding**: px-4 py-2 (normal), px-3 py-2 (small)
- **Grid gaps**: gap-6 for cards, gap-4 for smaller items
- **Border radius**: rounded-lg for cards, rounded-xl for modals

### Typography:
- **Headings**: font-bold, larger sizes
- **Body text**: Normal weight
- **Muted text**: text-gray-600 dark:text-gray-400
- **Error text**: text-red-600 dark:text-red-400

## 🔄 Update Process

When adding new UI patterns:
1. Check if pattern exists in this document
2. If not, implement consistently with existing patterns
3. Update this document with new pattern
4. Apply pattern to all similar components
5. Update CLAUDE.md with any new requirements