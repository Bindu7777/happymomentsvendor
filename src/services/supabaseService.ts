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
      
      const { error: vendorUpdateError } = await supabase
        .from('vendors')
        .update({
          ...proposedChanges,
          updated_at: new Date().toISOString()
        })
        .eq('vendor_id', changeRecord.vendor_id);

      if (vendorUpdateError) {
        console.error('Error applying approved changes:', vendorUpdateError);
        return { success: false, message: 'Failed to apply approved changes' };
      }
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
