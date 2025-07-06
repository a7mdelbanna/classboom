import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MapPin, Monitor, Package, Calendar, Users, Check, X } from 'lucide-react';
import { ResourceService } from '../services/resourceService';
import { ResourceBookingService } from '../services/bookingService';
import type { 
  Resource, 
  ResourceType, 
  ResourceWithAvailability,
  ResourceConflict 
} from '../types/resource.types';

interface ResourceSelectorProps {
  courseId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isOnline: boolean;
  selectedResources: Resource[];
  onResourcesChange: (resources: Resource[]) => void;
  requiredResourceTypes?: ResourceType[];
}

export function ResourceSelector({
  courseId,
  sessionDate,
  startTime,
  endTime,
  capacity,
  isOnline,
  selectedResources,
  onResourcesChange,
  requiredResourceTypes = []
}: ResourceSelectorProps) {
  const [availableResources, setAvailableResources] = useState<ResourceWithAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [conflicts, setConflicts] = useState<ResourceConflict[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  // Resource type icons
  const resourceTypeIcons: Record<ResourceType, React.ReactNode> = {
    physical_room: <MapPin className="w-4 h-4" />,
    online_meeting: <Monitor className="w-4 h-4" />,
    equipment: <Package className="w-4 h-4" />,
    vehicle: <MapPin className="w-4 h-4" />,
    sports_facility: <MapPin className="w-4 h-4" />,
    instrument: <Package className="w-4 h-4" />,
    software_license: <Monitor className="w-4 h-4" />
  };

  // Load available resources
  useEffect(() => {
    loadAvailableResources();
  }, [sessionDate, startTime, endTime]);

  const loadAvailableResources = async () => {
    try {
      setLoading(true);
      
      // Get all active resources
      const resources = await ResourceService.getResourcesWithAvailability({
        is_active: true,
        capacity_min: isOnline ? 1 : capacity
      });

      // Filter by availability for the session time
      const availableResourcesForSession = await Promise.all(
        resources.map(async (resource) => {
          const availability = await ResourceService.checkAvailability({
            resource_id: resource.id,
            start_datetime: `${sessionDate}T${startTime}`,
            end_datetime: `${sessionDate}T${endTime}`
          });

          return {
            ...resource,
            is_available_now: availability.is_available,
            conflicting_bookings: availability.conflicting_bookings
          };
        })
      );

      setAvailableResources(availableResourcesForSession.filter(r => r.is_available_now));
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check conflicts when selection changes
  const handleResourceToggle = async (resource: Resource) => {
    const isSelected = selectedResources.some(r => r.id === resource.id);
    
    if (isSelected) {
      // Remove resource
      onResourcesChange(selectedResources.filter(r => r.id !== resource.id));
    } else {
      // Add resource - check for conflicts first
      setCheckingConflicts(true);
      try {
        const newSelection = [...selectedResources, resource];
        const resourceIds = newSelection.map(r => r.id);
        
        const conflicts = await ResourceBookingService.checkMultipleResourceConflicts(
          resourceIds,
          `${sessionDate}T${startTime}`,
          `${sessionDate}T${endTime}`
        );

        if (conflicts.length > 0) {
          setConflicts(conflicts);
        } else {
          onResourcesChange(newSelection);
        }
      } catch (error) {
        console.error('Error checking conflicts:', error);
      } finally {
        setCheckingConflicts(false);
      }
    }
  };

  // Smart resource suggestion
  const suggestResources = async () => {
    try {
      setLoading(true);
      const suggestions = await ResourceBookingService.smartResourceAssignment({
        course_id: courseId,
        capacity: capacity,
        is_online: isOnline,
        start_datetime: `${sessionDate}T${startTime}`,
        end_datetime: `${sessionDate}T${endTime}`,
        preferred_resources: selectedResources.map(r => r.id)
      });

      onResourcesChange(suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter resources
  const filteredResources = availableResources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.building?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || resource.resource_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Group resources by type
  const groupedResources = filteredResources.reduce((acc, resource) => {
    const type = resource.resource_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(resource);
    return acc;
  }, {} as Record<ResourceType, ResourceWithAvailability[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Select Resources
        </h3>
        <button
          onClick={suggestResources}
          disabled={loading}
          className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-50"
        >
          Smart Suggest
        </button>
      </div>

      {/* Required Resources Alert */}
      {requiredResourceTypes.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This course requires: {requiredResourceTypes.join(', ')}
          </p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
      </div>

      {/* Selected Resources */}
      {selectedResources.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
          <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
            Selected Resources ({selectedResources.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedResources.map(resource => (
              <div
                key={resource.id}
                className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {resourceTypeIcons[resource.resource_type]}
                <span className="text-gray-700 dark:text-gray-300">{resource.name}</span>
                <button
                  onClick={() => handleResourceToggle(resource)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
            Resource Conflicts
          </h4>
          {conflicts.map((conflict, index) => (
            <p key={index} className="text-sm text-red-700 dark:text-red-300">
              {conflict.message}
            </p>
          ))}
        </div>
      )}

      {/* Resource List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading resources...</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedResources).map(([type, resources]) => (
            <div key={type} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                {resourceTypeIcons[type as ResourceType]}
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <span className="text-gray-400">({resources.length})</span>
              </h4>
              <div className="grid gap-2">
                {resources.map(resource => {
                  const isSelected = selectedResources.some(r => r.id === resource.id);
                  
                  return (
                    <div
                      key={resource.id}
                      onClick={() => handleResourceToggle(resource)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {resource.name}
                            </h5>
                            {resource.code && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({resource.code})
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            {resource.building && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {resource.building} {resource.room_number}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Capacity: {resource.capacity}
                            </span>
                          </div>

                          {/* Features */}
                          {resource.features && Object.keys(resource.features).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {Object.entries(resource.features)
                                .filter(([_, value]) => value === true)
                                .map(([feature]) => (
                                  <span
                                    key={feature}
                                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-400"
                                  >
                                    {feature.replace(/_/g, ' ')}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          {isSelected ? (
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No resources message */}
      {!loading && filteredResources.length === 0 && (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No available resources found for this time slot
          </p>
        </div>
      )}
    </div>
  );
}