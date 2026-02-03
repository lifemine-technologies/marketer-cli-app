import { z } from 'zod';
import { phoneNumberSchema } from './primitive';

export const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  phone: phoneNumberSchema(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  companyName: z.string().optional(),
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    code: z.string().min(1, 'Pincode is required'),
  }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  source: z.enum(['PHONE', 'EMAIL', 'WALKIN', 'DRIVEIN']).optional(),
  tags: z.array(z.string()).optional(),
  servicePlaces: z.array(z.string()).optional(),
  serviceSpeciality: z
    .object({
      speciality: z
        .array(
          z.object({
            label: z.string().min(1, 'Label is required'),
            experience: z.number().int().max(100).nonnegative(),
          })
        )
        .optional(),
      brands: z.array(z.string()).optional(),
      servicesOffered: z.array(z.string()).optional(),
    })
    .optional(),
  noOfTechnicians: z.number().int().nonnegative().optional(),
  timeSetUp: z
    .object({
      businessStartTime: z.number().min(0).max(24).optional(),
      businessEndTime: z.number().min(0).max(24).optional(),
    })
    .optional(),
  note: z.string().optional(),
  followUps: z
    .array(
      z.object({
        date: z.string().min(1, 'Date is required'),
        note: z.string().min(1, 'Note is required'),
      })
    )
    .optional(),
});

export type VendorFormData = z.infer<typeof vendorSchema>;
