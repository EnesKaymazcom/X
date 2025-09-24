import type { Spot, AdminSpotFilters, PaginatedSpots } from '@fishivo/types';

// Web-specific spots implementation
export const spotsServiceWeb = {
  // Admin spots list with filters
  async getAdminSpots(page = 1, limit = 20, filters?: AdminSpotFilters): Promise<PaginatedSpots> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.status) params.append('status', filters.status);
    if (filters?.spot_type) params.append('spot_type', filters.spot_type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.user_id) params.append('user_id', filters.user_id);

    const response = await fetch(`/api/admin/spots?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch spots');
    }

    return response.json();
  },

  // Get single spot details
  async getAdminSpot(id: number): Promise<Spot> {
    const response = await fetch(`/api/admin/spots/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch spot');
    }

    return response.json();
  },

  // Approve spot
  async approveSpot(id: number, adminNotes?: string): Promise<Spot> {
    const response = await fetch(`/api/admin/spots/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ admin_notes: adminNotes }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve spot');
    }

    return response.json();
  },

  // Reject spot
  async rejectSpot(id: number, reason: string): Promise<Spot> {
    const response = await fetch(`/api/admin/spots/${id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject spot');
    }

    return response.json();
  },

  // Update spot status
  async updateSpotStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<Spot> {
    const response = await fetch(`/api/admin/spots/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update spot status');
    }

    return response.json();
  },

  // Delete spot
  async deleteSpot(id: number, reason?: string): Promise<void> {
    const response = await fetch(`/api/admin/spots/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete spot');
    }
  },

  // Get user spots
  async getUserSpots(userId: string, page = 1, limit = 10): Promise<PaginatedSpots> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      user_id: userId,
    });

    const response = await fetch(`/api/spots?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user spots');
    }

    return response.json();
  },

  // Create new spot
  async createSpot(spotData: Partial<Spot>): Promise<Spot> {
    const response = await fetch('/api/spots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spotData),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create spot');
    }

    return response.json();
  },

  // Update spot
  async updateSpot(id: number, spotData: Partial<Spot>): Promise<Spot> {
    const response = await fetch(`/api/spots/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(spotData),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update spot');
    }

    return response.json();
  },
};