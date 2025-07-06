import React, { useState } from 'react';
import { 
  MapPin, 
  Monitor, 
  Package, 
  Calendar, 
  Users, 
  Clock, 
  DollarSign,
  Edit,
  Trash2,
  Power,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link2,
  Copy,
  Check
} from 'lucide-react';
import type { Resource, ResourceWithAvailability } from '../types/resource.types';
import { useToast } from '../../../context/ToastContext';

interface ResourceCardProps {
  resource: Resource | ResourceWithAvailability;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onToggleActive?: (resource: Resource) => void;
  showActions?: boolean;
}

export function ResourceCard({ 
  resource, 
  onEdit, 
  onDelete, 
  onToggleActive,
  showActions = true 
}: ResourceCardProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  // Resource type icons and colors
  const resourceTypeConfig = {
    physical_room: { 
      icon: MapPin, 
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    online_meeting: { 
      icon: Monitor, 
      color: 'purple',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    equipment: { 
      icon: Package, 
      color: 'orange',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    vehicle: { 
      icon: MapPin, 
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    sports_facility: { 
      icon: MapPin, 
      color: 'indigo',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600 dark:text-indigo-400'
    },
    instrument: { 
      icon: Package, 
      color: 'pink',
      bgColor: 'bg-pink-100 dark:bg-pink-900/20',
      textColor: 'text-pink-600 dark:text-pink-400'
    },
    software_license: { 
      icon: Monitor, 
      color: 'teal',
      bgColor: 'bg-teal-100 dark:bg-teal-900/20',
      textColor: 'text-teal-600 dark:text-teal-400'
    }
  };

  const config = resourceTypeConfig[resource.resource_type];
  const Icon = config.icon;

  // Check if resource has availability info
  const availabilityResource = resource as ResourceWithAvailability;
  const hasAvailabilityInfo = 'is_available_now' in availabilityResource;

  return (
    <div 
      onClick={() => onEdit && onEdit(resource)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`w-5 h-5 ${config.textColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {resource.name}
            </h3>
            {resource.code && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Code: {resource.code}
              </p>
            )}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {hasAvailabilityInfo && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              availabilityResource.is_available_now
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {availabilityResource.is_available_now ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Available
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  In Use
                </>
              )}
            </span>
          )}
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            resource.is_active
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {resource.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Description */}
      {resource.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {resource.description}
        </p>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Location */}
        {(resource.building || resource.room_number || resource.address) && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {resource.building && `${resource.building} `}
                {resource.room_number && `Room ${resource.room_number}`}
                {resource.address && (
                  <span className="block text-xs">{resource.address}</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Capacity */}
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Capacity</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {resource.capacity} {resource.capacity === 1 ? 'person' : 'people'}
            </p>
          </div>
        </div>

        {/* Online Meeting Details */}
        {resource.platform && (
          <div className="flex items-start gap-2">
            <Monitor className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {resource.platform.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        )}

        {/* Booking Duration */}
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Booking</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {resource.min_booking_duration}-{resource.max_booking_duration} min
            </p>
          </div>
        </div>

        {/* Cost */}
        {resource.hourly_rate && (
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Rate</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {resource.currency} {resource.hourly_rate}/hour
              </p>
            </div>
          </div>
        )}

        {/* Availability Schedule */}
        {resource.days_available && resource.days_available.length > 0 && (
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Available</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {resource.days_available.length === 7 ? 'Every day' : `${resource.days_available.length} days/week`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      {resource.features && Object.keys(resource.features).length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(resource.features)
              .filter(([_, value]) => value === true || (typeof value === 'number' && value > 0))
              .map(([feature, value]) => (
                <span
                  key={feature}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-400"
                >
                  {feature.replace(/_/g, ' ')}
                  {typeof value === 'number' && value > 1 && ` (${value})`}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Next Available (if in use) */}
      {hasAvailabilityInfo && !availabilityResource.is_available_now && availabilityResource.next_available && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Next available: {new Date(availabilityResource.next_available).toLocaleString()}
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Copy Link for Online Resources */}
          {resource.meeting_url && ['online_meeting', 'software_license'].includes(resource.resource_type) && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await navigator.clipboard.writeText(resource.meeting_url!);
                  setCopied(true);
                  showToast('Meeting link copied to clipboard!', 'success');
                  setTimeout(() => setCopied(false), 2000);
                } catch (error) {
                  showToast('Failed to copy link', 'error');
                }
              }}
              className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors relative"
              title={copied ? 'Copied!' : 'Copy meeting link'}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
            </button>
          )}
          
          {onToggleActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(resource);
              }}
              className={`p-2 rounded-lg transition-colors ${
                resource.is_active
                  ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  : 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
              }`}
              title={resource.is_active ? 'Deactivate' : 'Activate'}
            >
              <Power className="w-4 h-4" />
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(resource);
              }}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(resource);
              }}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}