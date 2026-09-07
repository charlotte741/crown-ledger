/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClientBackend';

// Types
interface ProfileData {
  isAdmin: boolean;
  profilePhoto: any;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  country: string;
  currency: string;
  accountType: string;
  photoUrl?: string;
  dateOfBirth?: string;
  createdAt: string;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phoneNumber?: string;
  country?: string;
  currency?: string;
  accountType?: string;
}

interface UpdateProfileDetailsData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  country?: string;
  currency?: string;
  accountType?: string;
}

interface UploadProfilePhotoData {
  photoUrl: string;
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: ProfileData;
}

interface PhotoUploadResponse {
  success: boolean;
  message: string;
  data?: {
    profilePhoto: any;
    photoUrl: string;
  };
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: ProfileData;
}

// Get Profile Hook
export const useGetProfile = () => {
  return useQuery<ProfileResponse>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient('settings/profile', {
        method: 'GET',
      });
      return response;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('accessToken'),
  });
};

// Update Profile Hook (Legacy - for backward compatibility)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateProfileData) => {
      const response = await apiClient('settings/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate profile query after successful update
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Update Profile Details Hook (PUT - /api/settings/profile)
export const useUpdateProfileDetails = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse, Error, UpdateProfileDetailsData>({
    mutationFn: async (updateData: UpdateProfileDetailsData) => {
      const response = await apiClient('settings/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }) as UpdateProfileResponse;
      return response;
    },
    onSuccess: () => {
      // Invalidate profile query after successful update
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Upload Profile Photo Hook (POST - /api/settings/profile-photo)
export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation<PhotoUploadResponse, Error, UploadProfilePhotoData>({
    mutationFn: async (photoData: UploadProfilePhotoData) => {
      const response = await apiClient('settings/profile-photo', {
        method: 'POST',
        body: JSON.stringify(photoData),
      }) as PhotoUploadResponse;
      return response;
    },
    onSuccess: () => {
      // Invalidate profile query after successful photo upload
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

// Get Current User Hook (from localStorage)
export const useCurrentUser = () => {
  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  return user ? JSON.parse(user) : null;
};
