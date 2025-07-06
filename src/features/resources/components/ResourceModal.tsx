import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { ResourceService } from '../services/resourceService';
import { RESOURCE_FEATURES } from '../types/resource.types';
import type { Resource, ResourceFormData, ResourceType } from '../types/resource.types';

interface ResourceModalProps {
  resource?: Resource;
  onClose: () => void;
  onSave: () => void;
  defaultType?: ResourceType;
}

export function ResourceModal({ resource, onClose, onSave, defaultType }: ResourceModalProps) {
  const [formData, setFormData] = useState<ResourceFormData>({
    resource_type: resource?.resource_type || defaultType || 'physical_room',
    name: resource?.name || '',
    code: resource?.code || '',
    description: resource?.description || '',
    capacity: resource?.capacity || 1,
    is_active: resource?.is_active !== false,
    min_booking_duration: resource?.min_booking_duration || 30,
    max_booking_duration: resource?.max_booking_duration || 480,
    buffer_time_before: resource?.buffer_time_before || 0,
    buffer_time_after: resource?.buffer_time_after || 15,
    advance_booking_days: resource?.advance_booking_days || 90,
    features: resource?.features || {},
    // Physical location fields
    building: resource?.building || '',
    floor: resource?.floor || '',
    room_number: resource?.room_number || '',
    address: resource?.address || '',
    // Online resource fields
    platform: resource?.platform || '',
    account_email: resource?.account_email || '',
    account_password_hint: resource?.account_password_hint || '',
    meeting_url: resource?.meeting_url || '',
    meeting_id: resource?.meeting_id || '',
    passcode: resource?.passcode || '',
    license_limit: resource?.license_limit || undefined,
    // Availability fields
    available_from: resource?.available_from || '',
    available_until: resource?.available_until || '',
    days_available: resource?.days_available || [],
    // Other fields
    hourly_rate: resource?.hourly_rate || undefined,
    currency: resource?.currency || '',
    image_url: resource?.image_url || '',
    notes: resource?.notes || '',
    requires_approval: resource?.requires_approval || false,
    approval_roles: resource?.approval_roles || []
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'online' | 'rules' | 'features'>('basic');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get available features for selected resource type
  const availableFeatures = RESOURCE_FEATURES[formData.resource_type] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      
      if (resource) {
        await ResourceService.updateResource(resource.id, formData);
      } else {
        await ResourceService.createResource(formData);
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving resource:', error);
      alert(error.message || 'Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [feature]: !formData.features?.[feature]
      }
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {resource ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'basic'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Basic Info
            </button>
            
            {['physical_room', 'sports_facility', 'vehicle'].includes(formData.resource_type) && (
              <button
                type="button"
                onClick={() => setActiveTab('location')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'location'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Location
              </button>
            )}
            
            {['online_meeting', 'software_license'].includes(formData.resource_type) && (
              <button
                type="button"
                onClick={() => setActiveTab('online')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'online'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Online Details
              </button>
            )}
            
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rules'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Booking Rules
            </button>
            
            <button
              type="button"
              onClick={() => setActiveTab('features')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'features'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Features
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resource Type *
                    </label>
                    <select
                      value={formData.resource_type}
                      onChange={(e) => setFormData({ ...formData, resource_type: e.target.value as ResourceType })}
                      disabled={!!resource}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      <option value="physical_room">Physical Room</option>
                      <option value="online_meeting">Online Meeting</option>
                      <option value="equipment">Equipment</option>
                      <option value="sports_facility">Sports Facility</option>
                      <option value="instrument">Instrument</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="software_license">Software License</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Code
                    </label>
                    <input
                      type="text"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., ROOM-101, ZOOM-01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.capacity || 1}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.capacity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.capacity && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.capacity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Building
                    </label>
                    <input
                      type="text"
                      value={formData.building || ''}
                      onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                      placeholder="e.g., Main Building, Building A"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Floor
                    </label>
                    <input
                      type="text"
                      value={formData.floor || ''}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      placeholder="e.g., 1st Floor, Ground Floor"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={formData.room_number || ''}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    placeholder="e.g., 101, Lab-A"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address (for off-site locations)
                  </label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    placeholder="Full address if this is an off-site location"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Online Details Tab */}
            {activeTab === 'online' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Platform
                  </label>
                  <select
                    value={formData.platform || ''}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select platform</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="webex">Webex</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      value={formData.account_email || ''}
                      onChange={(e) => setFormData({ ...formData, account_email: e.target.value })}
                      placeholder="account@example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      License Limit
                    </label>
                    <input
                      type="number"
                      value={formData.license_limit || ''}
                      onChange={(e) => setFormData({ ...formData, license_limit: parseInt(e.target.value) || undefined })}
                      placeholder="Max participants"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Meeting URL
                  </label>
                  <input
                    type="url"
                    value={formData.meeting_url || ''}
                    onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meeting ID
                    </label>
                    <input
                      type="text"
                      value={formData.meeting_id || ''}
                      onChange={(e) => setFormData({ ...formData, meeting_id: e.target.value })}
                      placeholder="123-456-7890"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Passcode
                    </label>
                    <input
                      type="text"
                      value={formData.passcode || ''}
                      onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                      placeholder="Meeting passcode"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Booking Rules Tab */}
            {activeTab === 'rules' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Minimum Booking Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.min_booking_duration || 30}
                      onChange={(e) => setFormData({ ...formData, min_booking_duration: parseInt(e.target.value) || 30 })}
                      min="15"
                      step="15"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Maximum Booking Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.max_booking_duration || 480}
                      onChange={(e) => setFormData({ ...formData, max_booking_duration: parseInt(e.target.value) || 480 })}
                      min="30"
                      step="30"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Buffer Time Before (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.buffer_time_before || 0}
                      onChange={(e) => setFormData({ ...formData, buffer_time_before: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                      min="0"
                      step="5"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Buffer Time After (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.buffer_time_after ?? 15}
                      onChange={(e) => setFormData({ ...formData, buffer_time_after: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                      min="0"
                      step="5"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Advance Booking Days
                  </label>
                  <input
                    type="number"
                    value={formData.advance_booking_days || 90}
                    onChange={(e) => setFormData({ ...formData, advance_booking_days: parseInt(e.target.value) || 90 })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    How many days in advance can this resource be booked
                  </p>
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select the features available for this resource
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {availableFeatures.map(feature => (
                    <label key={feature} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.features?.[feature] === true}
                        onChange={() => handleFeatureToggle(feature)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>

                {availableFeatures.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No specific features available for this resource type
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : resource ? 'Update Resource' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}