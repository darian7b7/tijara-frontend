import { ListingFieldSchema } from '@/types/listings';

export const constructionSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: 'equipmentType',
    label: 'listings.equipmentType',
    type: 'select',
    options: [
      'Excavator',
      'Bulldozer',
      'Crane',
      'Forklift',
      'Loader',
      'Backhoe',
      'Dump Truck',
      'Other'
    ],
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Equipment type is required' : null,
  },
  {
    name: 'condition',
    label: 'listings.condition',
    type: 'select',
    options: ['new', 'likeNew', 'excellent', 'good', 'fair', 'poor', 'salvage'],
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Condition is required' : null,
  },
  {
    name: 'operatingWeight',
    label: 'listings.operatingWeight',
    type: 'text',
    section: 'essential',
    required: true,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid weight format'
  },
  {
    name: 'enginePower',
    label: 'listings.enginePower',
    type: 'text',
    section: 'essential',
    required: true,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid power format'
  },
  {
    name: 'hoursUsed',
    label: 'listings.hoursUsed',
    type: 'text',
    section: 'essential',
    required: true,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid hours format'
  },
  {
    name: 'previousOwners',
    label: 'listings.previousOwners',
    type: 'number',
    section: 'essential',
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null) return 'Previous owners is required';
      if (value < 0) return 'Previous owners must be 0 or greater';
      return null;
    },
  },
  {
    name: 'registrationStatus',
    label: 'listings.registrationStatus',
    type: 'select',
    options: ['registered', 'unregistered', 'expired'],
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Registration status is required' : null,
  },
  {
    name: 'serviceHistory',
    label: 'listings.serviceHistory',
    type: 'select',
    options: ['full', 'partial', 'none'],
    section: 'essential',
    required: true,
    validate: (value: string) => !value ? 'Service history is required' : null,
  },

  // Advanced Section
  {
    name: 'maxLiftingCapacity',
    label: 'listings.maxLiftingCapacity',
    type: 'text',
    section: 'advanced',
    required: false,
    validate: (value: string) => /^\d+$/.test(value) ? null : 'Invalid capacity format'
  },
  {
    name: 'maintenanceHistory',
    label: 'listings.maintenanceHistory',
    type: 'textarea',
    section: 'advanced',
    required: false
  },
  {
    name: 'attachments',
    label: 'listings.attachments',
    type: 'multiselect',
    options: [
      'Bucket',
      'Hammer',
      'Auger',
      'Grapple',
      'Fork',
      'Blade',
      'Other'
    ],
    section: 'advanced',
    required: false
  },
  {
    name: 'hydraulicSystem',
    label: 'listings.hydraulicSystem',
    type: 'text',
    section: 'advanced',
    required: false
  },
  {
    name: 'safetyFeatures',
    label: 'listings.safetyFeatures',
    type: 'multiselect',
    options: [
      'ROPS',
      'FOPS',
      'Backup Camera',
      'Safety Sensors',
      'Emergency Stop',
      'Fire Suppression',
      'Other'
    ],
    section: 'advanced',
    required: false
  }
];
