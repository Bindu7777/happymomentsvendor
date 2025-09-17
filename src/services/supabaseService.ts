// services/supabaseService.ts
import { supabase, Vendor, VendorMedia } from "../lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

// Test Supabase connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('count', { count: 'exact' });
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
    
    console.log("Supabase connection successful. Vendor count:", data);
    return true;
  } catch (error) {
    console.error("Supabase connection test error:", error);
    return false;
  }
};

export const getVendorByFieldId = async (
  vendorId: string
): Promise<Vendor | null> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();

    if (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }

    return data as Vendor;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
};

export const addVendor = async (vendorData: Omit<Vendor, 'created_at' | 'updated_at'>) => {
  try {
    console.log("Attempting to add vendor with data:", vendorData);
    
    // Remove vendor_id from the data to let the database auto-generate it
    const { vendor_id, ...dataWithoutVendorId } = vendorData;
    
    const { data, error } = await supabase
      .from('vendors')
      .insert([dataWithoutVendorId])
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding vendor:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to add vendor: ${error.message}`);
    }

    console.log("Vendor added successfully with ID:", data.vendor_id);
    return data.vendor_id;
  } catch (error) {
    console.error("Error adding vendor:", error);
    throw error;
  }
};

export const checkPhoneUnique = async (phone: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('vendor_id')
      .eq('phone_number', phone);

    if (error) {
      console.error('Error checking phone uniqueness:', error);
      return false;
    }

    return data.length === 0; // true if no vendor has this phone
  } catch (error) {
    console.error('Error checking phone uniqueness:', error);
    return false;
  }
};

// Get all vendors (for public display - only verified and available)
export const getAllVendors = async (): Promise<Vendor[]> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('verified', true)
      .eq('currently_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }

    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
};

// Get all vendors for admin (includes unverified and unavailable)
export const getAllVendorsForAdmin = async (): Promise<Vendor[]> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vendors for admin:', error);
      return [];
    }

    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors for admin:', error);
    return [];
  }
};

// Get vendors by category
export const getVendorsByCategory = async (category: string): Promise<Vendor[]> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('category', category)
      .eq('verified', true)
      .eq('currently_available', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching vendors by category:', error);
      return [];
    }

    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors by category:', error);
    return [];
  }
};

// Get vendor media
export const getVendorMedia = async (vendorId: string, category?: string): Promise<VendorMedia[]> => {
  try {
    let query = supabase
      .from('vendor_media')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('public', true)
      .order('order_index', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor media:', error);
      return [];
    }

    return data as VendorMedia[];
  } catch (error) {
    console.error('Error fetching vendor media:', error);
    return [];
  }
};

// Update vendor
export const updateVendor = async (vendorId: string, vendorData: Partial<Vendor>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendors')
      .update(vendorData)
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error updating vendor:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating vendor:', error);
    return false;
  }
};

// Delete vendor
export const deleteVendor = async (vendorId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error deleting vendor:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return false;
  }
};

// Add vendor media
export const addVendorMedia = async (mediaData: Omit<VendorMedia, 'id' | 'uploaded_at'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('vendor_media')
      .insert([mediaData])
      .select()
      .single();

    if (error) {
      console.error('Error adding vendor media:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error adding vendor media:', error);
    return null;
  }
};

// Delete vendor media
export const deleteVendorMedia = async (mediaId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendor_media')
      .delete()
      .eq('id', mediaId);

    if (error) {
      console.error('Error deleting vendor media:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting vendor media:', error);
    return false;
  }
};

// Update vendor catalog images
export const updateVendorCatalogImages = async (vendorId: string, imageUrls: string[]): Promise<boolean> => {
  try {
    // First, delete existing catalog images
    const { error: deleteError } = await supabase
      .from('vendor_media')
      .delete()
      .eq('vendor_id', vendorId)
      .eq('category', 'catalog');

    if (deleteError) {
      console.error('Error deleting existing catalog images:', deleteError);
      return false;
    }

    // Then, add new catalog images
    if (imageUrls.length > 0) {
      const mediaData = imageUrls.map((url, index) => ({
        vendor_id: vendorId,
        media_url: url,
        media_type: 'image' as const,
        category: 'catalog' as const,
        order_index: index,
        public: true
      }));

      const { error: insertError } = await supabase
        .from('vendor_media')
        .insert(mediaData);

      if (insertError) {
        console.error('Error adding new catalog images:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating vendor catalog images:', error);
    return false;
  }
};

// Vendor Authentication Functions
export const vendorLogin = async (username: string, password: string): Promise<{success: boolean, vendor?: Vendor, message?: string}> => {
  try {
    // Simple login check against vendor_credentials table
    const { data, error } = await supabase
      .from('vendor_credentials')
      .select(`
        vendor_id,
        username,
        vendors (*)
      `)
      .eq('username', username)
      .eq('password', password)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Update last login
    await supabase
      .from('vendor_credentials')
      .update({ last_login: new Date().toISOString() })
      .eq('vendor_id', data.vendor_id);

    return { 
      success: true, 
      vendor: data.vendors as Vendor,
      message: 'Login successful' 
    };
  } catch (error) {
    console.error('Error during vendor login:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
};

// Check if vendor is logged in (simple session check)
export const getLoggedInVendor = (): Vendor | null => {
  try {
    const vendorData = localStorage.getItem('loggedInVendor');
    return vendorData ? JSON.parse(vendorData) : null;
  } catch (error) {
    console.error('Error getting logged in vendor:', error);
    return null;
  }
};

// Vendor logout
export const vendorLogout = (): void => {
  localStorage.removeItem('loggedInVendor');
  localStorage.removeItem('vendorLoginTime');
};

// Save vendor session
export const saveVendorSession = (vendor: Vendor): void => {
  localStorage.setItem('loggedInVendor', JSON.stringify(vendor));
  localStorage.setItem('vendorLoginTime', new Date().toISOString());
};

// Refresh vendor session with fresh data from database
export const refreshVendorSession = async (): Promise<Vendor | null> => {
  try {
    const currentVendor = getLoggedInVendor();
    if (!currentVendor) {
      return null;
    }

    console.log('Refreshing vendor session data...');
    const freshVendorData = await getVendorByFieldId(currentVendor.vendor_id);
    
    if (freshVendorData) {
      // Update localStorage with fresh data
      saveVendorSession(freshVendorData);
      console.log('Vendor session refreshed with latest data');
      return freshVendorData;
    }
    
    return currentVendor; // Return current data if refresh fails
  } catch (error) {
    console.error('Error refreshing vendor session:', error);
    return getLoggedInVendor(); // Return current data if refresh fails
  }
};

// Vendor Profile Change Workflow Functions
export const submitVendorProfileChange = async (
  vendorId: number, 
  changeType: string, 
  currentData: any, 
  proposedChanges: any
): Promise<{success: boolean, changeId?: number, message?: string}> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profile_changes')
      .insert([{
        vendor_id: vendorId,
        change_type: changeType,
        current_data: currentData,
        proposed_changes: proposedChanges,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error submitting profile change:', error);
      return { success: false, message: 'Failed to submit changes for approval' };
    }

    return { 
      success: true, 
      changeId: data.id,
      message: 'Changes submitted for admin approval' 
    };
  } catch (error) {
    console.error('Error submitting profile change:', error);
    return { success: false, message: 'Failed to submit changes for approval' };
  }
};

// Get vendor's pending changes
export const getVendorPendingChanges = async (vendorId: number): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profile_changes')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending changes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching pending changes:', error);
    return [];
  }
};

// Get vendor notifications (approved/rejected changes)
export const getVendorNotifications = async (vendorId: number): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profile_changes')
      .select('*')
      .eq('vendor_id', vendorId)
      .in('status', ['approved', 'rejected'])
      .order('reviewed_at', { ascending: false })
      .limit(20); // Get latest 20 notifications

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark notification as read (optional - for future use)
export const markNotificationAsRead = async (changeId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendor_profile_changes')
      .update({ notification_read: true })
      .eq('id', changeId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Get all pending changes for admin review
export const getAllPendingChanges = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profile_changes')
      .select(`
        *,
        vendors (brand_name, category, spoc_name)
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });

    if (error) {
      console.error('Error fetching all pending changes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all pending changes:', error);
    return [];
  }
};

// Admin approve/reject changes
export const reviewVendorProfileChange = async (
  changeId: number,
  status: 'approved' | 'rejected',
  adminUsername: string,
  adminComments?: string
): Promise<{success: boolean, message?: string}> => {
  try {
    // Get the change record first
    const { data: changeRecord, error: fetchError } = await supabase
      .from('vendor_profile_changes')
      .select('*')
      .eq('id', changeId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !changeRecord) {
      return { success: false, message: 'Change request not found or already processed' };
    }

    // Update the change record status
    const { error: updateError } = await supabase
      .from('vendor_profile_changes')
      .update({
        status: status,
        reviewed_by: adminUsername,
        reviewed_at: new Date().toISOString(),
        admin_comments: adminComments,
        updated_at: new Date().toISOString()
      })
      .eq('id', changeId);

    if (updateError) {
      console.error('Error updating change status:', updateError);
      return { success: false, message: 'Failed to update change status' };
    }

    // If approved, apply changes to vendors table
    if (status === 'approved') {
      const proposedChanges = changeRecord.proposed_changes;
      
      console.log('Applying changes to vendor:', changeRecord.vendor_id);
      console.log('Proposed changes:', proposedChanges);
      
      // First check if vendor exists and get current data
      const { data: existingVendor, error: fetchVendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_id', changeRecord.vendor_id)
        .single();

      if (fetchVendorError || !existingVendor) {
        console.error('Vendor not found:', fetchVendorError);
        return { success: false, message: 'Vendor not found for update' };
      }

      console.log('Existing vendor found:', existingVendor.brand_name);

      // Clean and validate the proposed changes
      const cleanedChanges = { ...proposedChanges };
      
      // Remove any fields that shouldn't be updated or don't exist
      delete cleanedChanges.id;
      delete cleanedChanges.vendor_id;
      delete cleanedChanges.created_at;
      
      // Convert arrays to proper format if needed
      if (cleanedChanges.deliverables && Array.isArray(cleanedChanges.deliverables)) {
        cleanedChanges.deliverables = cleanedChanges.deliverables.filter(item => item && item.trim() !== '');
      }

      console.log('Cleaned changes to apply:', cleanedChanges);

      const { error: vendorUpdateError } = await supabase
        .from('vendors')
        .update({
          ...cleanedChanges,
          updated_at: new Date().toISOString()
        })
        .eq('vendor_id', changeRecord.vendor_id); // Use 'vendor_id' as the primary key

      if (vendorUpdateError) {
        console.error('Error applying approved changes:', vendorUpdateError);
        console.error('Update payload:', { ...proposedChanges, updated_at: new Date().toISOString() });
        return { success: false, message: `Failed to apply approved changes: ${vendorUpdateError.message}` };
      }

      console.log('Vendor profile updated successfully');
    }

    return { 
      success: true, 
      message: `Changes ${status} successfully` 
    };
  } catch (error) {
    console.error('Error reviewing profile change:', error);
    return { success: false, message: 'Failed to review changes' };
  }
};

// Vendor CRM Leads Management Functions
export const getVendorLeads = async (vendorId: number, status?: string, priority?: string): Promise<any[]> => {
  try {
    let query = supabase
      .from('vendor_leads')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor leads:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching vendor leads:', error);
    return [];
  }
};

export const getVendorLeadStats = async (vendorId: number): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('vendor_leads')
      .select('status, converted_to_booking, final_booking_amount')
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error fetching lead stats:', error);
      return {
        total_leads: 0,
        new_leads: 0,
        contacted_leads: 0,
        negotiation_leads: 0,
        proposal_sent_leads: 0,
        customer_decision_pending_leads: 0,
        confirmed_bookings: 0,
        advance_received_leads: 0,
        completed_leads: 0,
        lost_leads: 0,
        conversion_rate: 0,
        total_revenue: 0
      };
    }

    const leads = data || [];
    const stats = {
      total_leads: leads.length,
      new_leads: leads.filter(l => l.status === 'new_lead').length,
      contacted_leads: leads.filter(l => l.status === 'contacted').length,
      negotiation_leads: leads.filter(l => l.status === 'negotiation').length,
      proposal_sent_leads: leads.filter(l => l.status === 'proposal_sent').length,
      customer_decision_pending_leads: leads.filter(l => l.status === 'customer_decision_pending').length,
      confirmed_bookings: leads.filter(l => l.status === 'confirmed_booking').length,
      advance_received_leads: leads.filter(l => l.status === 'advance_received').length,
      completed_leads: leads.filter(l => l.status === 'completed').length,
      lost_leads: leads.filter(l => l.status === 'lost').length,
      conversion_rate: leads.length > 0 ? 
        Math.round((leads.filter(l => l.converted_to_booking).length / leads.length) * 100 * 100) / 100 : 0,
      total_revenue: leads
        .filter(l => l.status === 'completed' && l.final_booking_amount)
        .reduce((sum, l) => sum + (l.final_booking_amount || 0), 0)
    };

    return stats;
  } catch (error) {
    console.error('Error calculating lead stats:', error);
    return {
      total_leads: 0,
      new_leads: 0,
      contacted_leads: 0,
      negotiation_leads: 0,
      proposal_sent_leads: 0,
      customer_decision_pending_leads: 0,
      confirmed_bookings: 0,
      advance_received_leads: 0,
      completed_leads: 0,
      lost_leads: 0,
      conversion_rate: 0,
      total_revenue: 0
    };
  }
};

export const addVendorLead = async (leadData: any): Promise<{success: boolean, leadId?: number, message?: string}> => {
  try {
    console.log('Adding lead with data:', leadData);

    // Test if vendor_leads table exists
    const { data: tableTest, error: tableError } = await supabase
      .from('vendor_leads')
      .select('count', { count: 'exact' });
    
    if (tableError) {
      console.error('vendor_leads table does not exist or is not accessible:', tableError);
      return { 
        success: false, 
        message: 'vendor_leads table not found. Please run the SQL script to create it.' 
      };
    }

    const { data, error } = await supabase
      .from('vendor_leads')
      .insert([{
        ...leadData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error adding lead:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { 
        success: false, 
        message: `Failed to add lead: ${error.message}` 
      };
    }

    console.log('Lead added successfully:', data);
    return { 
      success: true, 
      leadId: data.id,
      message: 'Lead added successfully' 
    };
  } catch (error) {
    console.error('Error adding lead:', error);
    return { 
      success: false, 
      message: `Failed to add lead: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

export const updateVendorLead = async (leadId: number, updateData: any): Promise<{success: boolean, message?: string}> => {
  try {
    const { error } = await supabase
      .from('vendor_leads')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead:', error);
      return { success: false, message: 'Failed to update lead' };
    }

    return { success: true, message: 'Lead updated successfully' };
  } catch (error) {
    console.error('Error updating lead:', error);
    return { success: false, message: 'Failed to update lead' };
  }
};

export const updateLeadStatus = async (
  leadId: number, 
  newStatus: string, 
  notes?: string
): Promise<{success: boolean, message?: string}> => {
  try {
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      last_contact_date: new Date().toISOString()
    };

    if (notes) {
      updateData.follow_up_notes = notes;
    }

    if (newStatus === 'contacted') {
      // Increment contact count
      const { data: currentLead } = await supabase
        .from('vendor_leads')
        .select('contact_count')
        .eq('id', leadId)
        .single();
      
      updateData.contact_count = (currentLead?.contact_count || 0) + 1;
    }

    if (newStatus === 'confirmed_booking') {
      updateData.converted_to_booking = true;
      updateData.conversion_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('vendor_leads')
      .update(updateData)
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead status:', error);
      return { success: false, message: 'Failed to update lead status' };
    }

    return { success: true, message: 'Lead status updated successfully' };
  } catch (error) {
    console.error('Error updating lead status:', error);
    return { success: false, message: 'Failed to update lead status' };
  }
};

export const deleteVendorLead = async (leadId: number): Promise<{success: boolean, message?: string}> => {
  try {
    const { error } = await supabase
      .from('vendor_leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Error deleting lead:', error);
      return { success: false, message: 'Failed to delete lead' };
    }

    return { success: true, message: 'Lead deleted successfully' };
  } catch (error) {
    console.error('Error deleting lead:', error);
    return { success: false, message: 'Failed to delete lead' };
  }
};

// ===== VENDOR CALENDAR FUNCTIONS =====

// Get vendor events for a date range
export const getVendorEvents = async (vendorId: number, startDate?: string, endDate?: string) => {
  try {
    let query = supabase
      .from('vendor_events')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('start_datetime', { ascending: true });

    if (startDate && endDate) {
      query = query
        .gte('start_datetime', startDate)
        .lte('start_datetime', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVendorEvents:', error);
    return [];
  }
};

// Create new vendor event
export const createVendorEvent = async (eventData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Check for conflicts first
    const conflicts = await checkEventConflicts(
      eventData.vendor_id,
      eventData.start_datetime,
      eventData.end_datetime
    );

    if (conflicts.length > 0) {
      return { 
        success: false, 
        error: `Conflict detected with existing event: "${conflicts[0].title}"` 
      };
    }

    const { data, error } = await supabase
      .from('vendor_events')
      .insert([{
        ...eventData,
        created_by: 'vendor'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor event:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in createVendorEvent:', error);
    return { success: false, error: 'Failed to create event' };
  }
};

// Update vendor event
export const updateVendorEvent = async (eventId: number, eventData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Check for conflicts (excluding current event)
    if (eventData.start_datetime && eventData.end_datetime && eventData.vendor_id) {
      const conflicts = await checkEventConflicts(
        eventData.vendor_id,
        eventData.start_datetime,
        eventData.end_datetime,
        eventId
      );

      if (conflicts.length > 0) {
        return { 
          success: false, 
          error: `Conflict detected with existing event: "${conflicts[0].title}"` 
        };
      }
    }

    const { data, error } = await supabase
      .from('vendor_events')
      .update(eventData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor event:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateVendorEvent:', error);
    return { success: false, error: 'Failed to update event' };
  }
};

// Delete vendor event
export const deleteVendorEvent = async (eventId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('vendor_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting vendor event:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteVendorEvent:', error);
    return { success: false, error: 'Failed to delete event' };
  }
};

// Check for event conflicts
export const checkEventConflicts = async (
  vendorId: number,
  startDateTime: string,
  endDateTime: string,
  excludeEventId?: number
): Promise<any[]> => {
  try {
    let query = supabase
      .from('vendor_events')
      .select('id, title, start_datetime, end_datetime')
      .eq('vendor_id', vendorId)
      .not('status', 'in', '(cancelled,completed)')
      .or(`and(start_datetime.lte.${startDateTime},end_datetime.gt.${startDateTime}),and(start_datetime.lt.${endDateTime},end_datetime.gte.${endDateTime}),and(start_datetime.gte.${startDateTime},end_datetime.lte.${endDateTime})`);

    if (excludeEventId) {
      query = query.neq('id', excludeEventId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking event conflicts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in checkEventConflicts:', error);
    return [];
  }
};

// Get vendor availability for a specific date
export const getVendorAvailability = async (vendorId: number, date: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_vendor_availability', {
        p_vendor_id: vendorId,
        p_date: date
      });

    if (error) {
      console.error('Error getting vendor availability:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in getVendorAvailability:', error);
    return null;
  }
};

// Get calendar statistics for vendor
export const getVendorCalendarStats = async (vendorId: number) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 7);

    const { data, error } = await supabase
      .from('vendor_events')
      .select('event_type, status')
      .eq('vendor_id', vendorId)
      .gte('start_datetime', `${currentMonth}-01`)
      .lt('start_datetime', `${nextMonth}-01`);

    if (error) {
      console.error('Error getting calendar stats:', error);
      return null;
    }

    const stats = {
      total_events: data.length,
      confirmed_bookings: data.filter(e => e.status === 'confirmed' && e.event_type !== 'blocked').length,
      tentative_bookings: data.filter(e => e.status === 'tentative' && e.event_type !== 'blocked').length,
      blocked_days: data.filter(e => e.event_type === 'blocked').length,
      completed_events: data.filter(e => e.status === 'completed').length,
    };

    return stats;
  } catch (error) {
    console.error('Error in getVendorCalendarStats:', error);
    return null;
  }
};
