# UI Style Guide

This document provides guidelines for the visual design and component usage in the Avolve platform interface.

## Design Principles

1. **Clarity**: Interfaces should be intuitive and self-explanatory
2. **Consistency**: Components should maintain consistent appearance and behavior
3. **Efficiency**: Interfaces should help users accomplish tasks with minimal effort
4. **Accessibility**: All components should be accessible to users with disabilities
5. **Delight**: The interface should provide a pleasant and engaging experience

## Color Palette

The Avolve platform uses a color palette inspired by the token system:

### Primary Colors

- **Primary**: `#3B82F6` (Blue)
- **Secondary**: `#10B981` (Green)
- **Accent**: `#8B5CF6` (Purple)
- **Destructive**: `#EF4444` (Red)

### Neutral Colors

- **Background**: `#FFFFFF` (White)
- **Foreground**: `#111827` (Near Black)
- **Muted**: `#F3F4F6` (Light Gray)
- **Muted Foreground**: `#6B7280` (Gray)

### Token-Specific Colors

Each token has its own gradient color scheme:

- **GEN (Supercivilization)**: Multi-color gradient
- **SPD (Sunday)**: Red-Green-Blue gradient
- **SHE (Monday)**: Rose-Red-Orange gradient
- **PSP (Tuesday)**: Amber-Yellow gradient
- **SSA (Wednesday)**: Lime-Green-Emerald gradient
- **BSP (Thursday)**: Teal-Cyan gradient
- **SGB (Friday)**: Sky-Blue-Indigo gradient
- **SMS (Saturday)**: Violet-Purple-Fuchsia-Pink gradient

## Typography

- **Headings**: Inter, sans-serif, bold
- **Body**: Inter, sans-serif, regular
- **Code**: Fira Code, monospace

## Component Library

The Avolve platform uses a component-based design system built with Tailwind CSS and shadcn/ui. The following components are available:

### Layout Components

- **Card**: Container for related content
- **Dialog**: Modal dialog for focused interactions
- **Tabs**: Organize content into separate views
- **Separator**: Visual divider between content sections

### Form Components

- **Button**: Trigger actions
- **Input**: Text input field
- **Textarea**: Multi-line text input
- **Checkbox**: Binary selection
- **Select**: Option selection from a dropdown
- **DatePicker**: Date selection
- **DateRangePicker**: Date range selection

### Display Components

- **Avatar**: User profile picture
- **Badge**: Status indicator
- **Alert**: Important information
- **Progress**: Visual indicator of progress
- **Skeleton**: Loading state placeholder

## New Components

### Governance Dashboard Component

The Governance Dashboard (`app/governance/governance-dashboard.tsx`) is a comprehensive interface for governance activities.

#### Usage

```tsx
import GovernanceDashboard from '@/app/governance/governance-dashboard';

export default function GovernancePage() {
  return <GovernanceDashboard />;
}
```

#### Features

- **Proposal Tabs**: Navigate between active, approved, and rejected proposals
- **Proposal Cards**: Display proposal information in a consistent format
- **Create Proposal Dialog**: Form for creating new proposals
- **Proposal Details Dialog**: Detailed view of a proposal with voting interface
- **Consent Checkboxes**: Explicit consent mechanisms for governance actions

#### Visual Guidelines

- Use the Card component for proposals with consistent padding and spacing
- Use Badge components to indicate proposal status with appropriate colors:
  - Active: `outline` variant
  - Approved: `secondary` variant
  - Rejected: `destructive` variant
- Implement Progress components to visualize voting progress
- Use Dialog components for detailed views and actions

### Consent History Component

The Consent History component (`app/governance/consent-history.tsx`) displays and manages user consent records.

#### Usage

```tsx
import ConsentHistory from '@/app/governance/consent-history';

export default function ConsentHistoryPage() {
  return <ConsentHistory />;
}
```

#### Features

- **Consent Record List**: Displays consent records in a table format
- **Filtering Options**: Filter records by date, type, and status
- **Date Range Picker**: Select a specific date range for filtering
- **Record Details**: View detailed information about each consent record
- **Consent Management**: Revoke consent for eligible records

#### Visual Guidelines

- Use a consistent table layout with alternating row colors for readability
- Implement the DateRangePicker component for date filtering
- Use Badge components to indicate consent status:
  - Approved: `secondary` variant
  - Revoked: `destructive` variant
- Use Dialog components for detailed views and confirmation actions

### Date Range Picker Component

The Date Range Picker (`components/ui/date-range-picker.tsx`) allows users to select a range of dates.

#### Usage

```tsx
import { DateRangePicker } from '@/components/ui/date-range-picker';

export default function MyComponent() {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });

  return (
    <DateRangePicker
      value={dateRange}
      onChange={setDateRange}
      placeholder="Select date range"
    />
  );
}
```

#### Features

- **Date Selection**: Select start and end dates
- **Calendar Interface**: Visual calendar for date selection
- **Preset Ranges**: Quick selection of common date ranges
- **Range Validation**: Prevent invalid date ranges

#### Visual Guidelines

- Use consistent styling with other form components
- Implement clear visual feedback for selected date range
- Ensure sufficient contrast for date numbers and month names
- Provide clear indicators for the current date and selected range

## Accessibility Guidelines

All components should follow these accessibility guidelines:

1. **Keyboard Navigation**: All interactive elements must be keyboard accessible
2. **Screen Reader Support**: Use appropriate ARIA attributes for screen readers
3. **Color Contrast**: Maintain sufficient contrast ratios for text and interactive elements
4. **Focus Indicators**: Provide clear visual indicators for keyboard focus
5. **Error States**: Clearly communicate errors and how to resolve them

## Responsive Design

All components should be responsive and adapt to different screen sizes:

1. **Mobile First**: Design for mobile screens first, then enhance for larger screens
2. **Breakpoints**: Use consistent breakpoints for responsive layouts
3. **Touch Targets**: Ensure interactive elements are large enough for touch input
4. **Simplified Views**: Provide simplified views for complex components on small screens

## Best Practices

1. **Consistent Spacing**: Use the spacing scale for margins and padding
2. **Component Composition**: Compose complex interfaces from simple components
3. **State Management**: Handle loading, error, and empty states consistently
4. **Animation**: Use subtle animations to enhance the user experience
5. **Feedback**: Provide immediate feedback for user actions

By following these guidelines, we ensure a consistent, accessible, and delightful user experience across the Avolve platform.
