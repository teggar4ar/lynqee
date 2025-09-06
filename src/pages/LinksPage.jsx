/**
 * LinksPage - Dedicated page for link management
 * 
 * Features:
 * - Mobile-first design optimized for link management
 * - Real-time link updates
 * - Add, edit, delete, and reorder links
 * - Search and filter functionality
 * - Bulk operations
 * - Touch-optimized interface
 */

import React, { useEffect, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical, Info, Link, Plus, Search, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useUserLinks } from '../hooks/useUserLinks.js';
import { useLinkReordering } from '../hooks/useLinkReordering.js';
import { useAlerts } from '../hooks/useAlerts.js';
import { Button, ErrorState, ProfileSetupGuard, ProtectedRoute } from '../components/common';
import { LinksSkeleton, RefreshIndicator } from '../components/common/ModernLoading.jsx';
import { DashboardLayout } from '../components/dashboard';
import { AddLinkModal, DeleteLinkModal, DraggableLink, EditLinkModal } from '../components/links';
import { getErrorType } from '../utils/errorUtils';

const LinksPage = () => {
  const { user } = useAuth();
  const { showWarning } = useAlerts();
  const { 
    data: links, 
    publicLinks,
    privateLinks,
    stats,
    loading, 
    refreshing,
    error, 
    refetch,
    removeOptimistic,
    toggleVisibility
  } = useUserLinks(user?.id);

  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [showDeleteLinkModal, setShowDeleteLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [deletingLink, setDeletingLink] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'public', 'private'
  const [localLinks, setLocalLinks] = useState(links || []);
  const [showDndBanner, setShowDndBanner] = useState(true);

  // Drag and drop functionality
  const {
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useLinkReordering(links, setLocalLinks);

  // Set up sensors for drag and drop with mobile optimization
  const sensors = useSensors(
    // TouchSensor for mobile devices - handles touch events directly
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay prevents conflicts with scrolling
        tolerance: 8, // 8px tolerance for touch drift
      },
    }),
    // PointerSensor for desktop and hybrid devices
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts (prevents accidental drags)
      },
    }),
    // KeyboardSensor for accessibility
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use local links for display when reordering, otherwise use real-time links
  const displayLinks = (localLinks.length > 0 && isDragging) ? localLinks : (links || []);

  // Filter links based on view mode
  const getFilteredLinksByMode = (linksToFilter) => {
    switch (viewMode) {
      case 'public':
        return linksToFilter.filter(link => link.is_public);
      case 'private':
        return linksToFilter.filter(link => !link.is_public);
      default:
        return linksToFilter;
    }
  };

  // Apply view mode filter first, then search filter
  const modeFilteredLinks = getFilteredLinksByMode(displayLinks);
  const filteredLinks = modeFilteredLinks.filter(link =>
    (link.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (link.url?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Update local links when real-time links change (but preserve optimistic updates during dragging)
  useEffect(() => {
    if (!isDragging && links && links.length > 0) {
      // Only update if we're not dragging and we have real-time data
      // This will overwrite optimistic updates with real server data
      setLocalLinks(links);
    } else if (!links || links.length === 0) {
      // Clear local links if no real-time data
      setLocalLinks([]);
    }
  }, [links, isDragging]);

  // Handle Add Link Modal
  const handleOpenAddLinkModal = () => {
    setShowAddLinkModal(true);
  };

  const handleCloseAddLinkModal = () => {
    setShowAddLinkModal(false);
  };

  const handleLinkAdded = (_newLink) => {
    // Real-time subscription will handle the update automatically
    // No need to refetch since real-time updates are working
  };

  // Handle Edit Link Modal
  const handleOpenEditLinkModal = (link) => {
    setEditingLink(link);
    setShowEditLinkModal(true);
  };

  const handleCloseEditLinkModal = () => {
    setShowEditLinkModal(false);
    setEditingLink(null);
  };

  const handleLinkUpdated = (_updatedLink) => {
    // Real-time subscription will handle the update automatically
    // No need to refetch since real-time updates are working
  };

  // Handle Delete Link Modal
  const handleOpenDeleteLinkModal = (link) => {
    setDeletingLink(link);
    setShowDeleteLinkModal(true);
  };

  const handleCloseDeleteLinkModal = () => {
    setShowDeleteLinkModal(false);
    setDeletingLink(null);
  };

  const handleLinkDeleted = (deletedLink) => {
    // Manual state update: Remove the link immediately from UI
    // This provides instant feedback while real-time catches up
    if (deletedLink?.id) {
      removeOptimistic(deletedLink.id);
    }
  };

  // Handle visibility toggle
  const handleToggleVisibility = async (link, isPublic) => {
    try {
      await toggleVisibility(link.id, isPublic);
    } catch (error) {
      console.error('Failed to toggle link visibility:', error);
      
      // Show specific error message for public links limit
      if (error.message && error.message.includes('Maximum number of public links')) {
        showWarning({
          title: 'Public Links Limit Reached',
          message: error.message
        }, {
          duration: 5000 // Show for 5 seconds
        });
      } else {
        // Show generic error for other failures
        showWarning({
          title: 'Failed to Toggle Visibility',
          message: 'Unable to change link visibility. Please try again.'
        }, {
          duration: 5000
        });
      }
      // The hook already handles optimistic update reversal on error
    }
  };

  return (
    <ProtectedRoute>
      <ProfileSetupGuard>
        <DashboardLayout title="Your Links">
          {/* Background refresh indicator */}
          <RefreshIndicator isVisible={refreshing} />
          
          {/* Search and Add Link Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex space-x-3 items-center">
              {/* Search Box */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    block w-full pl-10 pr-3 py-2
                    border border-gray-300 rounded-lg
                    placeholder-gray-500 text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-golden-yellow focus:border-golden-yellow
                    sm:text-sm
                  "
                />
              </div>
              
              {/* Add Link Button */}
              <div className="flex-shrink-0">
                <Button
                  variant="primary"
                  onClick={handleOpenAddLinkModal}
                  disabled={loading}
                  className="px-3 py-2 text-sm font-medium min-h-[40px] whitespace-nowrap"
                  title="Add a new link to your profile"
                >
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Link</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Tabs and Stats */}
          <div className="bg-white rounded-lg shadow-sm mb-4">
            {/* Stats Display */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {stats.total} total link{stats.total !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center space-x-4 text-xs">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-forest-green rounded-full mr-1"></div>
                    {stats.public} public
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                    {stats.private} private
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-3">
              <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                {[
                  { key: 'all', label: 'All Links', count: stats.total },
                  { key: 'public', label: 'Public', count: stats.public },
                  { key: 'private', label: 'Private', count: stats.private }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key)}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      min-h-[44px] flex items-center justify-center flex-shrink-0
                      ${viewMode === key
                        ? 'bg-golden-yellow text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-lg shadow-sm">
            {loading ? (
              <div className="p-4">
                <LinksSkeleton count={5} />
              </div>
            ) : error ? (
              // Error State
              <div className="p-6">
                <ErrorState
                  type={getErrorType(error)}
                  error={error}
                  onRetry={refetch}
                  className="!p-4 !bg-white !border-red-200"
                  context={{
                    operation: 'Load Links',
                    component: 'LinksPage'
                  }}
                />
              </div>
            ) : filteredLinks.length === 0 ? (
              // Empty State
              <div className="text-center py-12 px-6">
                {searchQuery ? (
                  // No search results
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No links found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      No {viewMode === 'all' ? '' : viewMode + ' '}links match your search for "{searchQuery}"
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2"
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (links || []).length === 0 ? (
                  // No links at all
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 bg-golden-yellow/20 rounded-full flex items-center justify-center">
                      <Link className="w-8 h-8 text-golden-yellow" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Start building your link collection
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                      Add your first link to share with your audience. You can add social media profiles, websites, or any important links.
                    </p>
                    <Button
                      variant="primary"
                      onClick={handleOpenAddLinkModal}
                      className="px-6 py-3 text-base font-medium min-h-[44px]"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Your First Link
                    </Button>
                  </>
                ) : (
                  // No links for current filter
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      {viewMode === 'public' ? (
                        <Eye className="w-8 h-8 text-gray-400" />
                      ) : (
                        <EyeOff className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No {viewMode} links
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {viewMode === 'public' 
                        ? "You don't have any public links yet. Make some links public to share them on your profile."
                        : "You don't have any private links yet. Private links won't appear on your public profile."
                      }
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="primary"
                        onClick={handleOpenAddLinkModal}
                        className="px-4 py-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Link
                      </Button>
                      {viewMode !== 'all' && (
                        <Button
                          variant="outline"
                          onClick={() => setViewMode('all')}
                          className="px-4 py-2 ml-2"
                        >
                          View All Links
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Drag and Drop Information Banner + Links List
              <>
                {filteredLinks.length > 1 && showDndBanner && (
                  <div className="bg-mint-cream border-l-4 border-golden-yellow p-4 mx-4 mt-4 rounded-r-lg relative">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Info className="w-5 h-5 text-golden-yellow" />
                      </div>
                      <div className="ml-3 pr-8">
                        <h3 className="text-sm font-medium text-forest-green">
                          Drag to Reorder Links
                        </h3>
                        <div className="mt-1 text-sm text-sage-gray">
                          <p>
                            Use the <span className="inline-flex items-center px-1">
                              <GripVertical className="w-3 h-3 text-sage-gray" />
                            </span> handle to drag and drop links to change their order. 
                            On mobile, press and hold the handle to start dragging.
                            Changes will be saved automatically and appear on your public profile in real-time.
                          </p>
                        </div>
                      </div>
                      {/* Close Button */}
                      <button
                        onClick={() => setShowDndBanner(false)}
                        className="
                          absolute top-3 right-3
                          p-1 rounded-full
                          text-sage-gray hover:text-forest-green
                          transition-colors duration-200
                          
                        "
                        aria-label="Close drag and drop information"
                        title="Close this message"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Links List with Drag and Drop */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                  // Mobile-specific optimizations
                  autoScroll={{
                    enabled: true,
                    threshold: {
                      x: 0.2,
                      y: 0.2
                    },
                    acceleration: 0.5
                  }}
                >
                <SortableContext 
                  items={filteredLinks.map(link => link.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="divide-y divide-gray-100">
                    {filteredLinks.map((link, index) => (
                      <DraggableLink
                        key={link.id}
                        link={link}
                        position={index + 1}
                        showEditButton={true}
                        showDeleteButton={true}
                        showSelection={false}
                        isSelected={false}
                        isDragging={isDragging}
                        onEdit={(link) => {
                          handleOpenEditLinkModal(link);
                        }}
                        onDelete={(link) => {
                          handleOpenDeleteLinkModal(link);
                        }}
                        onToggleVisibility={handleToggleVisibility}
                        className="border-0 rounded-none hover:bg-gray-50"
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              </>
            )}
          </div>

        </DashboardLayout>

        {/* Add Link Modal */}
        <AddLinkModal
          isOpen={showAddLinkModal}
          onClose={handleCloseAddLinkModal}
          onLinkAdded={handleLinkAdded}
          existingLinksCount={links?.length || 0}
          existingLinks={links || []}
        />

        {/* Edit Link Modal */}
        <EditLinkModal
          isOpen={showEditLinkModal}
          onClose={handleCloseEditLinkModal}
          onLinkUpdated={handleLinkUpdated}
          link={editingLink}
          existingLinks={links || []}
        />

        {/* Delete Link Modal */}
        <DeleteLinkModal
          isOpen={showDeleteLinkModal}
          onClose={handleCloseDeleteLinkModal}
          onLinkDeleted={handleLinkDeleted}
          link={deletingLink}
        />
      </ProfileSetupGuard>
    </ProtectedRoute>
  );
};

export default LinksPage;
