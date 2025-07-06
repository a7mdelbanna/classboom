import React, { useState } from 'react';
import { ResourceList } from '../components/ResourceList';
import { ResourceModal } from '../components/ResourceModal';
import type { Resource } from '../types/resource.types';

export function ResourcesPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>();

  const handleAddResource = () => {
    setSelectedResource(undefined);
    setShowModal(true);
  };

  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedResource(undefined);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <ResourceList
        onAddResource={handleAddResource}
        onEditResource={handleEditResource}
      />

      {showModal && (
        <ResourceModal
          resource={selectedResource}
          onClose={handleModalClose}
          onSave={() => {
            // ResourceList will automatically refresh when modal saves
            window.location.reload(); // Temporary solution
          }}
        />
      )}
    </div>
  );
}