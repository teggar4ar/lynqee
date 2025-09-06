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
import { GripVertical, Info, Link, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useUserLinks } from '../hooks/useUserLinks.js';
import { useLinkReordering } from '../hooks/useLinkReordering.js';
import { Button, ErrorState, ProfileSetupGuard, ProtectedRoute } from '../components/common';
import { LinksSkeleton, RefreshIndicator } from '../components/common/ModernLoading.jsx';
import { DashboardLayout } from '../components/dashboard';
import { AddLinkModal, DeleteLinkModal, DraggableLink, EditLinkModal } from '../components/links';
import { getErrorType } from '../utils/errorUtils';

const LinksPage = () => {
  const { user } = useAuth();
  const { 
    data: links, 
    loading, 
    refreshing,
    error, 
    refetch,
    removeOptimistic
  } = useUserLinks(user?.id);

  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [showDeleteLinkModal, setShowDeleteLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [deletingLink, setDeletingLink] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter links based on search query
  const filteredLinks = displayLinks.filter(link =>
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

  return (
    <ProtectedRoute>
      <ProfileSetupGuard>
        <DashboardLayout title="Your Links">
          {/* Background refresh indicator */}
          <RefreshIndicator isVisible={refreshing} />
          
          {/* Search and Add Link Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3 md:items-center">
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
                  className="w-full px-4 py-2 text-sm font-medium min-h-[40px] md:w-auto md:px-6"
                  title="Add a new link to your profile"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
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
                      No links match your search for "{searchQuery}"
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
                ) : null}
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
