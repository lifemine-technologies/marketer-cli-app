/**
 * Dashboard constants and configuration.
 */

export const quickActions = [
  {
    title: 'Add New Vendor',
    screen: 'NewVendor',
    icon: 'add-circle' as const,
    color: 'bg-blue-600',
    role: 'ALL' as const,
  },
  {
    title: 'All Vendors',
    screen: 'AllVendors',
    icon: 'list' as const,
    color: 'bg-blue-600',
    role: ['ADMIN'] as const,
  },
  {
    title: 'Add Coordinator',
    screen: 'AddMarketer',
    icon: 'person-add' as const,
    color: 'bg-blue-600',
    role: ['ADMIN', 'MANAGER'] as const,
  },
] as const;
