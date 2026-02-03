import {
  vendorSchema,
  type VendorFormData,
} from '@/utils/validations/vendorSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { useAddVendor } from './api/useVendors';

export const useAddNewVendor = () => {
  const navigation = useNavigation();
  const addVendorMutation = useAddVendor();

  const [servicePlacesInput, setServicePlacesInput] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      companyName: '',
      address: {
        line1: '',
        line2: '',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        code: '',
        latitude: undefined,
        longitude: undefined,
      },
      priority: 'MEDIUM',
      source: 'WALKIN',
      tags: [],
      pinPoint: {
        type: 'Point',
        coordinates: [78.4867, 17.385], // [longitude, latitude] - Hyderabad default
      },
      servicePlaces: [],
      serviceSpeciality: {
        speciality: [],
        brands: [],
        servicesOffered: [],
      },
      serviceArea: {
        radius: 10,
        location: {
          type: 'Point',
          coordinates: [78.4867, 17.385], // [longitude, latitude]
        },
      },
      isTechnicianAvailable: false,
      noOfTechnicians: 0,
      timeSetUp: {
        businessStartTime: 9,
        businessEndTime: 18,
      },
      note: '',
      followUps: [],
    },
    mode: 'onChange',
  });

  const tags = watch('tags') || [];
  const brands = watch('serviceSpeciality.brands') || [];
  const servicesOffered = watch('serviceSpeciality.servicesOffered') || [];

  const {
    fields: specialityFields,
    append: appendSpeciality,
    remove: removeSpeciality,
  } = useFieldArray({
    control,
    name: 'serviceSpeciality.speciality',
  });

  const {
    fields: followUpFields,
    append: appendFollowUp,
    remove: removeFollowUp,
  } = useFieldArray({
    control,
    name: 'followUps',
  });

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      const currentTags = tags || [];
      setValue('tags', [...currentTags, val]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setValue('tags', newTags);
  };

  const addBrand = () => {
    const val = brandInput.trim();
    if (val && !brands.includes(val)) {
      const currentBrands = brands || [];
      setValue('serviceSpeciality.brands', [...currentBrands, val], {
        shouldValidate: true,
      });
      setBrandInput('');
    }
  };

  const removeBrand = (index: number) => {
    const newBrands = brands.filter((_, i) => i !== index);
    setValue('serviceSpeciality.brands', newBrands, {
      shouldValidate: true,
    });
  };

  const addService = () => {
    const val = serviceInput.trim();
    if (val && !servicesOffered.includes(val)) {
      const currentServices = servicesOffered || [];
      setValue('serviceSpeciality.servicesOffered', [...currentServices, val], {
        shouldValidate: true,
      });
      setServiceInput('');
    }
  };

  const removeService = (index: number) => {
    const newServices = servicesOffered.filter((_, i) => i !== index);
    setValue('serviceSpeciality.servicesOffered', newServices, {
      shouldValidate: true,
    });
  };

  const onSubmit = handleSubmit(async data => {
    try {
      // Use pinPoint from form, or fallback to address coordinates, or default
      const pinPointCoords =
        data.pinPoint?.coordinates ||
        (data.address?.longitude && data.address?.latitude
          ? [data.address.longitude, data.address.latitude]
          : [78.4867, 17.385]);

      // Use serviceArea from form, or create from pinPoint/address
      const serviceAreaLocation = data.serviceArea?.location || {
        type: 'Point' as const,
        coordinates: pinPointCoords,
      };

      const vendorData = {
        ...data,
        email: data.email || undefined,
        companyName: data.companyName || undefined,
        servicePlaces: data.servicePlaces?.length
          ? data.servicePlaces
          : undefined,
        serviceSpeciality: {
          speciality: data.serviceSpeciality?.speciality?.length
            ? data.serviceSpeciality.speciality
            : undefined,
          brands: data.serviceSpeciality?.brands?.length
            ? data.serviceSpeciality.brands
            : undefined,
          servicesOffered: data.serviceSpeciality?.servicesOffered?.length
            ? data.serviceSpeciality.servicesOffered
            : undefined,
        },
        pinPoint: {
          type: 'Point' as const,
          coordinates: pinPointCoords,
        },
        serviceArea: {
          radius: data.serviceArea?.radius || 10,
          location: serviceAreaLocation,
        },
        priority: data.priority || 'MEDIUM',
        source: data.source || 'PHONE',
        tags: data.tags?.length ? data.tags : [],
        isTechnicianAvailable: data.isTechnicianAvailable || false,
        noOfTechnicians: data.noOfTechnicians || 0,
        timeSetUp:
          data.timeSetUp?.businessStartTime != null &&
          data.timeSetUp?.businessEndTime != null
            ? data.timeSetUp
            : undefined,
        note: data.note || undefined,
        followUps: data.followUps?.length ? data.followUps : undefined,
      };

      const result = await addVendorMutation.mutateAsync(vendorData as any);

      if (result.status === 'success') {
        Alert.alert('Success', result.message || 'Vendor added successfully!', [
          {
            text: 'OK',
            onPress: () => {
              try {
                if (
                  navigation &&
                  typeof (navigation as any).goBack === 'function'
                ) {
                  (navigation as any).goBack();
                }
              } catch (err) {
                console.warn('Navigation error:', err);
              }
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to add vendor');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to add vendor';
      Alert.alert('Error', message);
    }
  });

  return {
    control,
    errors,
    setValue,
    trigger,
    specialityFields,
    appendSpeciality,
    removeSpeciality,
    followUpFields,
    appendFollowUp,
    removeFollowUp,
    servicePlacesInput,
    setServicePlacesInput,
    brandInput,
    setBrandInput,
    serviceInput,
    setServiceInput,
    tagInput,
    setTagInput,
    tags,
    addTag,
    removeTag,
    brands,
    addBrand,
    removeBrand,
    servicesOffered,
    addService,
    removeService,
    onSubmit,
    addVendorMutation,
    navigation,
    watch,
  };
};
