import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MapPin, Monitor, Package } from 'lucide-react';
import { ResourceService } from '../services/resourceService';
import { ResourceCard } from './ResourceCard';
import type { Resource, ResourceType, ResourceFilters } from '../types/resource.types';

interface ResourceListProps {
  onAddResource?: () => void;
  onEditResource?: (resource: Resource) => void;
}

export function ResourceList({ onAddResource, onEditResource }: ResourceListProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ResourceFilters>({
    is_active: true
  });
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');

  useEffect(() => {
    loadResources();
  }, [filters, selectedType]);

  const loadResources = async () => {
    try {
      setLoading(true);
      
      const resourceFilters: ResourceFilters = {
        ...filters,
        search: searchQuery,
        ...(selectedType !== 'all' && { resource_type: selectedType })
      };

      const data = await ResourceService.getResources(resourceFilters);
      setResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`Are you sure you want to delete "${resource.name}"?`)) {
      return;
    }

    try {
      await ResourceService.deleteResource(resource.id);
      await loadResources();
    } catch (error: any) {
      alert(error.message || 'Failed to delete resource');
    }
  };

  const handleToggleActive = async (resource: Resource) => {
    try {
      await ResourceService.updateResource(resource.id, {
        is_active: !resource.is_active
      });
      await loadResources();
    } catch (error) {
      console.error('Error toggling resource status:', error);
    }
  };

  // Group resources by type
  const groupedResources = resources.reduce((acc, resource) => {
    const type = resource.resource_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(resource);
    return acc;
  }, {} as Record<ResourceType, Resource[]>);

  // Resource type counts
  const typeCounts = Object.entries(groupedResources).reduce((acc, [type, items]) => {
    acc[type as ResourceType] = items.length;
    return acc;
  }, {} as Record<ResourceType, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resources</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your rooms, equipment, and online resources
          </p>
        </div>
        {onAddResource && (
          <button
            onClick={onAddResource}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadResources()}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ResourceType | 'all')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="physical_room">Physical Rooms</option>
            <option value="online_meeting">Online Meeting</option>
            <option value="equipment">Equipment</option>
            <option value="sports_facility">Sports Facility</option>
            <option value="instrument">Instruments</option>
            <option value="vehicle">Vehicles</option>
            <option value="software_license">Software</option>
          </select>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.is_active === undefined}
                onChange={(e) => setFilters({
                  ...filters,
                  is_active: e.target.checked ? undefined : true
                })}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Show inactive</span>
            </label>
          </div>
        </div>

        {/* Type Counts */}
        {Object.keys(typeCounts).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(typeCounts).map(([type, count]) => (
              <span
                key={type}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-400"
              >
                {type.replace(/_/g, ' ')}: {count}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Resources */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No resources found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery || selectedType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first resource'
            }
          </p>
          {onAddResource && !searchQuery && selectedType === 'all' && (
            <button
              onClick={onAddResource}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Resource
            </button>
          )}
        </div>
      ) : selectedType === 'all' ? (
        // Grouped view
        <div className="space-y-8">
          {Object.entries(groupedResources).map(([type, typeResources]) => (
            <div key={type}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                {type === 'physical_room' && <MapPin className="w-5 h-5 text-blue-600" />}
                {type === 'online_meeting' && <Monitor className="w-5 h-5 text-purple-600" />}
                {type === 'equipment' && <Package className="w-5 h-5 text-orange-600" />}
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <span className="text-sm font-normal text-gray-500">({typeResources.length})</span>
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {typeResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={onEditResource}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Single type view
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onEdit={onEditResource}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}