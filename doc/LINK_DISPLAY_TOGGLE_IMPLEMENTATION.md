# Link Display Toggle Feature Implementation Plan

## 📋 Overview
This document outlines the implementation plan for adding a toggle feature that allows users to control which links are displayed on their public profile. The feature will include:

1. A boolean field to control link visibility on public profiles
2. UI toggle components in the links management interface
3. Filtering logic in public profile display
4. Configurable display limits for public links

## 🏗️ Database Schema Changes

### 1. Add `is_public` Column to Links Table
```sql
-- Add new column to existing links table
ALTER TABLE links 
ADD COLUMN is_public BOOLEAN DEFAULT true;

-- Update existing links to be public by default
UPDATE links SET is_public = true WHERE is_public IS NULL;

-- Add index for performance on public profile queries
CREATE INDEX IF NOT EXISTS idx_links_user_public 
ON links(user_id, is_public, position) 
WHERE is_public = true;
```

### 2. Update RLS Policies (if needed)
```sql
-- Ensure public access to public links only
-- This may already be covered by existing policies
CREATE POLICY "Public links are viewable by everyone" ON links
  FOR SELECT USING (is_public = true);
```

## 🔧 Service Layer Updates

### 1. Update LinksService Methods

#### Add to `src/services/LinksService.js`:
```javascript
/**
 * Toggle link visibility on public profile
 * @param {string} linkId - The link ID to update
 * @param {boolean} isPublic - Whether the link should be public
 * @returns {Promise<Object>} Standardized response
 */
static async toggleLinkVisibility(linkId, isPublic) {
  // Implementation will call updateLink with { is_public: isPublic }
}

/**
 * Get public links by username with limit
 * @param {string} username - The username to get links for
 * @param {number} limit - Maximum number of links to return (optional)
 * @returns {Promise<Object>} Standardized response with array of public link objects
 */
static async getPublicLinksByUsername(username, limit = null) {
  // Enhanced version of getLinksByUsername with is_public filter and limit
}

/**
 * Get link statistics for user (total, public, private)
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} Link statistics
 */
static async getLinkStats(userId) {
  // Returns { total, public, private, remaining_slots }
}
```

### 2. Update Existing Methods
- Modify `createLink()` to include `is_public: true` by default
- Update `getLinksByUsername()` to filter by `is_public = true`
- Enhance `updateLink()` to handle `is_public` field

## 🎨 UI Components

### 1. Create Toggle Component

#### New File: `src/components/common/Toggle.jsx`
```jsx
/**
 * Toggle - Reusable toggle/switch component
 * 
 * Features:
 * - Mobile-optimized touch targets
 * - Smooth animations
 * - Accessibility support
 * - Multiple sizes and variants
 */
```

**Props:**
- `checked: boolean` - Current state
- `onChange: function` - Callback when toggled
- `disabled: boolean` - Disabled state
- `label: string` - Accessible label
- `size: 'small' | 'medium' | 'large'` - Size variant
- `color: 'primary' | 'success' | 'warning'` - Color theme

### 2. Enhance LinkManagerCard Component

#### Update `src/components/links/LinkManagerCard.jsx`:
- Add toggle control for link visibility
- Show public/private status indicator
- Update action menu to include visibility toggle

**New Props:**
- `showVisibilityToggle: boolean` - Whether to show the toggle
- `onToggleVisibility: function` - Callback for visibility changes

### 3. Create LinkVisibilityManager Component

#### New File: `src/components/links/LinkVisibilityManager.jsx`
```jsx
/**
 * LinkVisibilityManager - Bulk visibility management
 * 
 * Features:
 * - Select multiple links for visibility changes
 * - Bulk toggle operations
 * - Display statistics (public/private counts)
 * - Mobile-optimized interface
 */
```

### 4. Add Public Link Limit Configuration

#### New File: `src/components/links/PublicLinkSettings.jsx`
```jsx
/**
 * PublicLinkSettings - Configure public link display settings
 * 
 * Features:
 * - Set maximum number of public links to display
 * - Reorder public links (separate from all links)
 * - Preview public profile appearance
 */
```

## 🔄 Hook Updates

### 1. Enhance useUserLinks Hook

#### Update `src/hooks/useUserLinks.js`:
```javascript
// Add computed properties for link visibility stats
return {
  data: links,
  loading,
  error,
  refetch,
  // New computed properties
  publicLinks: links?.filter(link => link.is_public) || [],
  privateLinks: links?.filter(link => !link.is_public) || [],
  stats: {
    total: links?.length || 0,
    public: links?.filter(link => link.is_public).length || 0,
    private: links?.filter(link => !link.is_public).length || 0,
  },
  // New actions
  toggleVisibility: async (linkId, isPublic) => { /* implementation */ },
  bulkToggleVisibility: async (linkIds, isPublic) => { /* implementation */ }
};
```

### 2. Update usePublicLinks Hook

#### Update `src/hooks/usePublicLinks.js`:
- Ensure it only fetches links where `is_public = true`
- Add optional limit parameter
- Add support for display ordering

### 3. Update usePublicRealtimeLinks Hook

#### Update `src/hooks/usePublicRealtimeLinks.js`:
- Filter real-time updates to only show public links
- Handle visibility toggle updates in real-time
- Respect display limits

## 🖥️ Page Updates

### 1. LinksPage Enhancements

#### Update `src/pages/LinksPage.jsx`:

**New Features:**
- Add visibility toggle controls to each link card
- Show public/private status indicators
- Add bulk visibility management section
- Display link statistics (X public, Y private)
- Add "Public Link Settings" section

**New State:**
```javascript
const [showVisibilityManager, setShowVisibilityManager] = useState(false);
const [selectedLinks, setSelectedLinks] = useState([]);
const [viewMode, setViewMode] = useState('all'); // 'all', 'public', 'private'
```

**New UI Sections:**
- Filter tabs (All Links | Public Links | Private Links)
- Bulk actions toolbar when links are selected
- Public link settings panel

### 2. PublicProfile Page Updates

#### Update `src/pages/PublicProfile.jsx`:
- Ensure it only displays public links
- Add support for configurable link limits
- Show "X of Y links displayed" indicator if limit is reached

## 📱 Mobile Optimization

### 1. Touch-Friendly Toggle Controls
- Minimum 44px touch targets for all toggles
- Clear visual feedback for state changes
- Swipe gestures for bulk selection (optional)

### 2. Responsive Design
- Collapsed view for mobile with expandable sections
- Simplified bulk actions on small screens
- Touch-optimized drag and drop for reordering

## 🔧 Constants and Configuration

### 1. Update App Configuration

#### Update `src/constants/index.js`:
```javascript
export const APP_CONFIG = {
  APP_NAME: 'Lynqee',
  APP_VERSION: '1.0.0',
  MAX_LINKS_PER_USER: 4,
  MAX_PUBLIC_LINKS_DISPLAY: 3, // New: Default limit for public display
  DEFAULT_LINK_VISIBILITY: true, // New: Default visibility for new links
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
};
```

### 2. Add Link Display Constants

#### New Section in `src/constants/index.js`:
```javascript
export const LINK_DISPLAY_CONFIG = {
  VISIBILITY_TOGGLES: {
    SHOW_IN_MANAGER: true,
    ALLOW_BULK_TOGGLE: true,
    DEFAULT_PUBLIC: true,
  },
  DISPLAY_LIMITS: {
    MIN_PUBLIC_LINKS: 1,
    MAX_PUBLIC_LINKS: 4,
    DEFAULT_PUBLIC_LINKS: 3,
  },
  UI_SETTINGS: {
    SHOW_VISIBILITY_STATS: true,
    SHOW_PUBLIC_LINK_PREVIEW: true,
    ENABLE_BULK_ACTIONS: true,
  }
};
```

## 🧪 Testing Requirements

### 1. Unit Tests
- [ ] Toggle component tests (`Toggle.test.jsx`)
- [ ] LinksService visibility methods tests
- [ ] Hook tests for visibility state management
- [ ] LinkManagerCard toggle functionality tests

### 2. Integration Tests
- [ ] End-to-end link visibility toggle flow
- [ ] Bulk visibility management
- [ ] Public profile filtering
- [ ] Real-time updates for visibility changes

### 3. Mobile Testing
- [ ] Touch interaction testing
- [ ] Responsive design validation
- [ ] Performance on mobile devices

## 🚀 Implementation Phases

### Phase 1: Foundation (Database & Services)
**Priority:** P1 (High)  
**Estimated Time:** 4-6 hours

1. Database schema migration
2. Update LinksService methods
3. Basic service layer tests

### Phase 2: Core Components (Toggle & Manager)
**Priority:** P1 (High)  
**Estimated Time:** 6-8 hours

1. Create Toggle component
2. Update LinkManagerCard with visibility controls
3. Enhance useUserLinks hook
4. Component tests

### Phase 3: UI Integration (Pages & Bulk Actions)
**Priority:** P2 (Medium)  
**Estimated Time:** 8-10 hours

1. Update LinksPage with visibility features
2. Add bulk management capabilities
3. Update PublicProfile filtering
4. Mobile optimization

### Phase 4: Advanced Features (Settings & Limits)
**Priority:** P3 (Lower)  
**Estimated Time:** 4-6 hours

1. Public link settings component
2. Display limit configuration
3. Enhanced statistics
4. Polish and refinements

## 🔍 Acceptance Criteria

### Core Functionality
- [ ] Users can toggle individual link visibility
- [ ] Public profile only shows public links
- [ ] Real-time updates work with visibility changes
- [ ] Bulk visibility management works correctly

### UI/UX Requirements
- [ ] Toggle controls are touch-friendly (44px minimum)
- [ ] Clear visual indicators for public/private status
- [ ] Smooth animations and transitions
- [ ] Mobile-responsive design

### Performance Requirements
- [ ] Public profile loads only public links (no filtering client-side)
- [ ] Real-time updates are efficient
- [ ] Database queries are optimized with proper indexes

### Accessibility Requirements
- [ ] Toggle controls have proper ARIA labels
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] High contrast mode support

## 🛠️ Technical Considerations

### 1. Database Performance
- Add composite index on `(user_id, is_public, position)`
- Consider materialized view for public link counts
- Monitor query performance with new filtering

### 2. Real-time Updates
- Ensure Supabase subscriptions handle visibility changes
- Test real-time performance with filtered queries
- Handle edge cases when links become private/public

### 3. State Management
- Maintain consistency between local state and server state
- Handle optimistic updates for visibility toggles
- Proper error handling and rollback strategies

### 4. Backward Compatibility
- Default `is_public = true` for existing links
- Graceful handling of missing `is_public` field
- Migration strategy for production data

---

## 📝 Next Steps

1. **Review and approve** this implementation plan
2. **Create database migration** script
3. **Start with Phase 1** (Foundation layer)
4. **Set up feature branch** for development
5. **Create detailed tickets** for each component

This implementation maintains the existing architecture patterns while adding the requested visibility toggle functionality in a mobile-first, accessible manner.
