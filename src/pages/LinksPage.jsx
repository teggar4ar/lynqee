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

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useUserLinks } from '../hooks/useUserLinks.js';
import { Button, ErrorState, ProfileSetupGuard, ProtectedRoute } from '../components/common';
import { LinksSkeleton, RefreshIndicator } from '../components/common/ModernLoading.jsx';
import { DashboardLayout } from '../components/dashboard';
import { AddLinkModal, DeleteLinkModal, EditLinkModal, LinkManagerCard } from '../components/links';
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

  // Filter links based on search query
  const filteredLinks = (links || []).filter(link =>
    (link.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (link.url?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

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
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
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
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
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
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
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
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
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
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
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
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Your First Link
                    </Button>
                  </>
                ) : null}
              </div>
            ) : (
              // Links List
              <div className="divide-y divide-gray-100">
                {filteredLinks.map((link, index) => (
                  <div key={link.id} className="relative">
                    <LinkManagerCard
                      link={link}
                      position={index + 1}
                      showEditButton={true}
                      showDeleteButton={true}
                      showDragHandle={true}
                      showSelection={false}
                      isSelected={false}
                      onEdit={(link) => {
                        handleOpenEditLinkModal(link);
                      }}
                      onDelete={(link) => {
                        handleOpenDeleteLinkModal(link);
                      }}
                      className="border-0 rounded-none hover:bg-gray-50"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </DashboardLayout>

        {/* Add Link Modal */}
        <AddLinkModal
          isOpen={showAddLinkModal}
          onClose={handleCloseAddLinkModal}
          onLinkAdded={handleLinkAdded}
          existingLinksCount={links?.length || 0}
        />

        {/* Edit Link Modal */}
        <EditLinkModal
          isOpen={showEditLinkModal}
          onClose={handleCloseEditLinkModal}
          onLinkUpdated={handleLinkUpdated}
          link={editingLink}
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
