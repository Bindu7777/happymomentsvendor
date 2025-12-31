const express = require('express');
const { supabase } = require('../config/supabase');
const router = express.Router();

// Admin endpoint: Send customer to vendor
router.post('/admin-send-customer', async (req, res) => {
  try {
    const { vendor_id, customer_name, customer_phone } = req.body;

    // Validate input
    if (!vendor_id || !customer_name || !customer_phone) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID, customer name, and phone number are required'
      });
    }

    console.log(`Admin sending customer ${customer_name} (${customer_phone}) to vendor ${vendor_id}`);

    // Check if vendor exists
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('vendor_id, brand_name')
      .eq('vendor_id', parseInt(vendor_id))
      .single();

    if (vendorError || !vendorData) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    // For admin-sent customers, use a unique negative customer_id
    // This avoids the unique constraint on (customer_id, vendor_id)
    const customerId = -(Date.now() % 1000000); // Use timestamp to ensure uniqueness
    console.log(`Using admin-sent customer ID: ${customerId}`);

    // Admin can send multiple customers to the same vendor, so no duplicate check needed

    // Create notification message
    const notificationMessage = `Admin sent customer ${customer_name} to you!`;

    // Insert new contact record
    const { data: newContact, error: insertError } = await supabase
      .from('contacted_vendors')
      .insert({
        customer_id: customerId,
        vendor_id: vendor_id.toString(),
        status: 'Contacted',
        vendor_status: 'Contacted',
        vendor_notified: true,  // Vendor is notified about this contact
        customer_notified: false, // Customer doesn't need notification for admin action
        notification_message: notificationMessage,
        notes: `Admin-sent customer: ${customer_name} (${customer_phone})`
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating contact:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create contact record'
      });
    }

    console.log('Admin contact created successfully:', newContact);
    console.log('Vendor notified about admin-sent customer:', vendor_id);

    res.json({
      success: true,
      message: `Customer ${customer_name} successfully sent to ${vendorData.brand_name}`,
      data: {
        contact_id: newContact.contact_id,
        customer_id: customerId,
        vendor_id: vendor_id,
        customer_name: customer_name,
        customer_phone: customer_phone,
        vendor_name: vendorData.brand_name,
        notification_message: notificationMessage
      }
    });

  } catch (error) {
    console.error('Error in admin-send-customer:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Save contacted vendor - when customer successfully contacts vendor via WhatsApp
router.post('/save-contact', async (req, res) => {
  try {
    const { customer_id, vendor_id } = req.body;

    if (!customer_id || !vendor_id) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and Vendor ID are required'
      });
    }

    console.log(`Saving contact: Customer ${customer_id} contacted Vendor ${vendor_id}`);

    // Check if contact already exists
    const { data: existingContact, error: checkError } = await supabase
      .from('contacted_vendors')
      .select('contact_id')
      .eq('customer_id', customer_id)
      .eq('vendor_id', vendor_id)
      .single();

    if (existingContact) {
      console.log('Contact already exists, returning existing record');
      return res.json({
        success: true,
        message: 'Contact already recorded',
        data: existingContact,
        already_contacted: true
      });
    }

    // Get vendor details for customer notification message
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('brand_name')
      .eq('vendor_id', parseInt(vendor_id))
      .single();

    // Get customer details for vendor notification message
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('full_name')
      .eq('id', parseInt(customer_id))
      .single();

    const vendorName = vendorData?.brand_name || 'the event vendor';
    const customerName = customerData?.full_name || 'A customer';
    
    // Notification message for vendor: "Customer Name contacted you"
    const vendorNotificationMessage = `${customerName} contacted you`;
    
    // Notification message for customer: "You contacted Vendor Name"
    const customerNotificationMessage = `You contacted ${vendorName}`;

    // Insert new contact record with notification fields
    // Using vendor notification message since vendor_notified is true
    const { data: newContact, error: insertError } = await supabase
      .from('contacted_vendors')
      .insert({
        customer_id: parseInt(customer_id),
        vendor_id: vendor_id.toString(),
        status: 'Contacted',
        vendor_notified: true,  // Vendor is notified about this contact
        customer_notified: false, // Customer hasn't been notified yet
        notification_message: vendorNotificationMessage  // Message for vendor
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving contact:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to save contact'
      });
    }

    console.log('Contact saved successfully:', newContact);
    console.log('Vendor notified about new contact:', vendor_id);

    res.json({
      success: true,
      message: 'Contact recorded successfully',
      data: newContact
    });

  } catch (error) {
    console.error('Error in save-contact:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get contacted vendors for a customer
router.get('/get-contacted-vendors/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      });
    }

    console.log(`Getting contacted vendors for customer: ${customer_id}`);

    // Get contacted vendors
    const { data: contactedData, error: contactedError } = await supabase
      .from('contacted_vendors')
      .select('*')
      .eq('customer_id', parseInt(customer_id))
      .order('contacted_at', { ascending: false });

    if (contactedError) {
      console.error('Error fetching contacted vendors:', contactedError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch contacted vendors'
      });
    }

    if (!contactedData || contactedData.length === 0) {
      console.log('No contacted vendors found for customer:', customer_id);
      return res.json({
        success: true,
        message: 'No contacted vendors found',
        data: [],
        contacted_vendor_ids: []
      });
    }

    console.log('Contacted data:', contactedData);

    // Get vendor details for each contacted vendor
    const vendorIds = contactedData.map(item => item.vendor_id);
    console.log('Fetching details for vendor IDs:', vendorIds);

    // Filter out non-integer vendor IDs (vendor_id is integer in database)
    const validVendorIds = vendorIds.filter(id => {
      const numId = parseInt(id);
      return !isNaN(numId) && numId > 0;
    }).map(id => parseInt(id));

    console.log('Valid vendor IDs (integers only):', validVendorIds);

    if (validVendorIds.length === 0) {
      console.log('No valid vendor IDs found');
      return res.json({
        success: true,
        message: 'No valid contacted vendors found',
        data: [],
        contacted_vendor_ids: []
      });
    }

    // Try different query approaches
    console.log('Attempting to fetch vendors with IDs:', validVendorIds);
    
    // Method 1: Using .in() with integers
    let { data: vendorsData, error: vendorsError } = await supabase
      .from('vendors')
      .select('*')
      .in('vendor_id', validVendorIds);
    
    console.log('Method 1 result:', { vendorsData, vendorsError });
    
    // If that fails, try individual queries
    if (vendorsError || !vendorsData || vendorsData.length === 0) {
      console.log('Method 1 failed, trying individual queries');
      const individualResults = [];
      for (const vendorId of validVendorIds) {
        const { data: singleVendor, error: singleError } = await supabase
          .from('vendors')
          .select('*')
          .eq('vendor_id', vendorId)
          .single();
        
        if (!singleError && singleVendor) {
          individualResults.push(singleVendor);
        }
      }
      vendorsData = individualResults;
      vendorsError = null;
      console.log('Individual queries result:', { vendorsData, count: vendorsData?.length });
    }

    if (vendorsError) {
      console.error('Error fetching vendor details:', vendorsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor details'
      });
    }

    console.log('Vendors data from database:', vendorsData);
    console.log('Number of vendors found:', vendorsData?.length || 0);
    
    if (!vendorsData || vendorsData.length === 0) {
      console.log('No vendor data found, returning contacted data with placeholder info');
      const dataWithPlaceholders = contactedData.map(contacted => ({
        vendor_id: contacted.vendor_id,
        brand_name: `Vendor ${contacted.vendor_id}`,
        category: 'Unknown',
        subcategory: '',
        phone_number: '',
        email: '',
        address: '',
        starting_price: 0,
        rating: 0,
        review_count: 0,
        verified: false,
        avatar_url: null,
        cover_image_url: null,
        quick_intro: '',
        contacted_at: contacted.contacted_at
      }));
      
      return res.json({
        success: true,
        message: `Found ${contactedData.length} contacted vendors`,
        data: dataWithPlaceholders,
        contacted_vendor_ids: validVendorIds.map(id => id.toString())
      });
    }

    // Combine contacted data with vendor details
    const combinedData = contactedData.map(contacted => {
      const vendor = vendorsData?.find(v => v.vendor_id.toString() === contacted.vendor_id.toString());
      if (vendor) {
        return {
          ...vendor,
          status: contacted.status || 'Contacted', // Include customer status
          vendor_status: contacted.vendor_status || 'Contacted', // Include vendor status
          contacted_at: contacted.contacted_at,
          contact_id: contacted.contact_id // Include contact_id for updates
        };
      } else {
        console.log(`Warning: Vendor ${contacted.vendor_id} not found in database`);
        return {
          vendor_id: contacted.vendor_id,
          brand_name: 'Unknown Vendor',
          category: 'Unknown',
          status: contacted.status || 'Contacted', // Include customer status
          vendor_status: contacted.vendor_status || 'Contacted', // Include vendor status
          contacted_at: contacted.contacted_at,
          contact_id: contacted.contact_id // Include contact_id for updates
        };
      }
    });

    console.log(`Found ${combinedData.length} contacted vendors for customer ${customer_id}`);

    res.json({
      success: true,
      message: `Found ${combinedData.length} contacted vendors`,
      data: combinedData,
      contacted_vendor_ids: validVendorIds.map(id => id.toString()) // Convert back to strings for frontend
    });

  } catch (error) {
    console.error('Error in get-contacted-vendors:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Check if customer has contacted a specific vendor
router.get('/check-contact/:customer_id/:vendor_id', async (req, res) => {
  try {
    const { customer_id, vendor_id } = req.params;

    if (!customer_id || !vendor_id) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and Vendor ID are required'
      });
    }

    console.log(`Checking if customer ${customer_id} has contacted vendor ${vendor_id}`);

    const { data: contact, error } = await supabase
      .from('contacted_vendors')
      .select('*')
      .eq('customer_id', parseInt(customer_id))
      .eq('vendor_id', vendor_id.toString())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking contact:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to check contact status'
      });
    }

    const is_contacted = !!contact;
    console.log(`Customer ${customer_id} has contacted vendor ${vendor_id}:`, is_contacted);

    res.json({
      success: true,
      is_contacted,
      data: contact || null
    });

  } catch (error) {
    console.error('Error in check-contact:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Remove contact (if needed)
router.delete('/remove-contact', async (req, res) => {
  try {
    const { customer_id, vendor_id } = req.body;

    if (!customer_id || !vendor_id) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and Vendor ID are required'
      });
    }

    console.log(`Removing contact: Customer ${customer_id} removes Vendor ${vendor_id}`);

    const { error } = await supabase
      .from('contacted_vendors')
      .delete()
      .eq('customer_id', parseInt(customer_id))
      .eq('vendor_id', vendor_id.toString());

    if (error) {
      console.error('Error removing contact:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to remove contact'
      });
    }

    console.log('Contact removed successfully');

    res.json({
      success: true,
      message: 'Contact removed successfully'
    });

  } catch (error) {
    console.error('Error in remove-contact:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update vendor status
router.put('/update-status', async (req, res) => {
  try {
    const { customer_id, vendor_id, status, notes, feedback, userType } = req.body;

    console.log('Update status request:', { customer_id, vendor_id, status, notes, feedback, userType });

    if (!customer_id || !vendor_id || !status) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID, Vendor ID, and Status are required'
      });
    }

    if (!userType || (userType !== 'customer' && userType !== 'vendor')) {
      return res.status(400).json({
        success: false,
        error: 'userType is required and must be either "customer" or "vendor"'
      });
    }

    // Normalize vendor_id to string
    const normalizedVendorId = vendor_id.toString();
    const normalizedCustomerId = parseInt(customer_id);

    if (isNaN(normalizedCustomerId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid customer ID'
      });
    }

    // Validate status values based on userType
    let validStatuses = [];
    let statusField = 'status'; // Default field name
    
    if (userType === 'customer') {
      // Customer-specific statuses
      validStatuses = [
        'Contacted',
        'Discussion in Progress',
        'Discussion going on',
        'Negotiation Ongoing',
        'Deal Finalised',
        'Advance Paid',
        'Event Scheduled',
        'Service in Progress',
        'Event Completed',
        'Not Interested',
        // Legacy statuses (for backward compatibility)
        'In Discussion', 
        'Deal Agreed',
        'Request Discount Coupon',
        'Discount Applied',
        'Closed - Successful',
        'Closed - Not Proceeding'
      ];
      statusField = 'status'; // Customer status goes in 'status' field
    } else {
      // Vendor-specific statuses
      validStatuses = [
        'Customer Contacted',
        'Discussion in Progress',
        'Quotation Shared',
        'Negotiation Ongoing',
        'Deal Confirmed',
        'Advance Received',
        'Event Scheduled',
        'Service in Progress',
        'Service Completed',
        'Payment Settled',
        'Lost'
      ];
      statusField = 'vendor_status'; // Vendor status goes in 'vendor_status' field
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid ${userType} status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    console.log(`Updating status: Customer ${normalizedCustomerId}, Vendor ${normalizedVendorId}, Status: ${status}`);
    
    // Check if contact exists
    const { data: existingContacts, error: checkError } = await supabase
      .from('contacted_vendors')
      .select('contact_id')
      .eq('customer_id', normalizedCustomerId)
      .eq('vendor_id', normalizedVendorId)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing contact:', checkError);
      return res.status(500).json({
        success: false,
        error: `Failed to check existing contact: ${checkError.message}`
      });
    }

    if (!existingContacts || existingContacts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found. Please contact the vendor first.'
      });
    }

    const existingContact = existingContacts[0];

    // Get customer details for notification message
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('full_name')
      .eq('id', normalizedCustomerId)
      .single();

    const customerName = customerData?.full_name || `Customer ${customer_id}`;
    
    // Prepare update data - save to the correct field based on userType
    const updateData = {};
    
    if (userType === 'customer') {
      // Customer is updating their status
      updateData.status = status;
      updateData.vendor_notified = true;  // Vendor is notified about customer status change
      updateData.customer_notified = false; // Customer doesn't need to be notified about their own change
      updateData.notification_message = `${customerName} updated their status to: ${status}`;
    } else {
      // Vendor is updating their status
      // Get vendor details for better notification message
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('brand_name')
        .eq('vendor_id', normalizedVendorId)
        .single();
      
      const vendorName = vendorData?.brand_name || `Vendor ${normalizedVendorId}`;
      
      updateData.vendor_status = status;
      updateData.customer_notified = true;  // Set to true so customer sees it as unread notification
      updateData.vendor_notified = false; // Vendor doesn't need to be notified about their own change
      updateData.notification_message = `${vendorName} updated your status to: ${status}`; // Use "your status" for customer context
      updateData.contacted_at = new Date().toISOString(); // Update timestamp so it appears at the top
    }

    // Add notes/feedback if provided
    if (notes || feedback) {
      updateData.notes = notes || feedback;
    }

    // Update the status in the correct field
    const { data, error } = await supabase
      .from('contacted_vendors')
      .update(updateData)
      .eq('contact_id', existingContact.contact_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating status:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        success: false,
        error: `Failed to update status: ${error.message || 'Database error'}`
      });
    }

    if (!data) {
      console.error('No data returned after update');
      return res.status(500).json({
        success: false,
        error: 'Status update completed but no data returned'
      });
    }

    // For vendor updates, customer_notified is already set to true in updateData above
    if (userType === 'vendor') {
      console.log('Customer notification set to unread for vendor status update');
    }

    console.log('Status updated successfully:', data);
    if (userType === 'customer') {
      console.log('Vendor notified about customer status change:', vendor_id);
    } else {
      console.log('Customer will be notified about vendor status change:', normalizedCustomerId);
    }
    res.json({
      success: true,
      message: 'Status updated successfully',
      data
    });

  } catch (error) {
    console.error('Error in update-status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get customers who contacted a specific vendor
router.get('/get-vendor-customers/:vendor_id', async (req, res) => {
  try {
    const { vendor_id } = req.params;

    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID is required'
      });
    }

    console.log(`Getting customers who contacted vendor: ${vendor_id}`);

    // Get customers who contacted this vendor
    const { data: contactedData, error: contactedError } = await supabase
      .from('contacted_vendors')
      .select('*')
      .eq('vendor_id', vendor_id.toString())
      .order('contacted_at', { ascending: false });

    if (contactedError) {
      console.error('Error fetching vendor customers:', contactedError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch vendor customers'
      });
    }

    if (!contactedData || contactedData.length === 0) {
      console.log('No customers found for vendor:', vendor_id);
      return res.json({
        success: true,
        message: 'No customers found',
        data: []
      });
    }

    console.log('Contacted data:', contactedData);

    // Get customer details for each contacted customer (excluding admin-sent customers with negative IDs)
    const customerIds = contactedData.map(item => item.customer_id).filter(id => id > 0);
    console.log('Fetching details for customer IDs:', customerIds);

    // Get flag information for these customers from this vendor
    let flagDataMap = {};
    if (customerIds.length > 0) {
      const { data: flagsData, error: flagsError } = await supabase
        .from('customer_flags')
        .select('customer_id, vendor_id')
        .eq('vendor_id', vendor_id.toString())
        .in('customer_id', customerIds);

      if (!flagsError && flagsData) {
        flagsData.forEach(flag => {
          flagDataMap[flag.customer_id] = true;
        });
      }
    }

    let customersData = [];
    if (customerIds.length > 0) {
      // Get customer details from customers table using correct column names
      const { data: customersDataResult, error: customersError } = await supabase
        .from('customers')
        .select('id, full_name, email, mobile_number, gender, flag_count, is_blocked')
        .in('id', customerIds);

      if (customersError) {
        console.error('Error fetching customer details:', customersError);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch customer details'
        });
      }

      customersData = customersDataResult || [];
    }

    console.log('Customers data from database:', customersData);
    console.log('Number of customers found:', customersData?.length || 0);

    // Combine contacted data with customer details
    const combinedData = contactedData.map(contacted => {
      // Handle admin-sent customers (customer_id < 0)
      if (contacted.customer_id < 0) {
        // Extract customer name and phone from notes for admin-sent customers
        const notes = contacted.notes || '';
        const nameMatch = notes.match(/Admin-sent customer: ([^(]+)/);
        const phoneMatch = notes.match(/\(([^)]+)\)/);
        
        return {
          contact_id: contacted.contact_id,
          customer_id: contacted.customer_id,
          vendor_id: contacted.vendor_id,
          status: contacted.status,
          vendor_status: contacted.vendor_status || 'Contacted',
          contacted_at: contacted.contacted_at,
          created_at: contacted.created_at,
          // Notification fields
          vendor_notified: contacted.vendor_notified,
          customer_notified: contacted.customer_notified,
          notification_message: contacted.notification_message,
          notes: contacted.notes,
          // Customer details extracted from notes
          customer_name: nameMatch ? nameMatch[1].trim() : 'Admin-sent Customer',
          customer_phone: phoneMatch ? phoneMatch[1] : '',
          customer_email: '',
          customer_location: '',
          customer_gender: '',
          is_admin_sent: true
        };
      }

      // Handle regular customers
      const customer = customersData?.find(c => c.id === contacted.customer_id);
      if (customer) {
        return {
          contact_id: contacted.contact_id,
          customer_id: contacted.customer_id,
          vendor_id: contacted.vendor_id,
          status: contacted.status,
          vendor_status: contacted.vendor_status || 'Contacted',
          contacted_at: contacted.contacted_at,
          created_at: contacted.created_at,
          // Notification fields
          vendor_notified: contacted.vendor_notified,
          customer_notified: contacted.customer_notified,
          notification_message: contacted.notification_message,
          notes: contacted.notes,
          // Customer details from customers table
          customer_name: customer.full_name || 'Unknown Customer',
          customer_phone: customer.mobile_number || '',
          customer_email: customer.email || '',
          customer_location: '',
          customer_gender: customer.gender || '',
          is_admin_sent: false,
          // Flag information
          flag_count: customer.flag_count || 0,
          is_blocked: customer.is_blocked || false,
          is_flagged_by_vendor: flagDataMap[contacted.customer_id] || false
        };
      } else {
        console.log(`Warning: Customer ${contacted.customer_id} not found in database`);
        return {
          contact_id: contacted.contact_id,
          customer_id: contacted.customer_id,
          vendor_id: contacted.vendor_id,
          status: contacted.status,
          vendor_status: contacted.vendor_status || 'Contacted',
          contacted_at: contacted.contacted_at,
          created_at: contacted.created_at,
          // Notification fields
          vendor_notified: contacted.vendor_notified,
          customer_notified: contacted.customer_notified,
          notification_message: contacted.notification_message,
          notes: contacted.notes,
          customer_name: `Customer ${contacted.customer_id}`,
          customer_phone: '',
          customer_email: '',
          customer_location: '',
          customer_gender: '',
          is_admin_sent: false
        };
      }
    });

    console.log(`Found ${combinedData.length} customers for vendor ${vendor_id}`);

    res.json({
      success: true,
      message: `Found ${combinedData.length} customers`,
      data: combinedData
    });

  } catch (error) {
    console.error('Error in get-vendor-customers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Report a customer (vendor reports a customer - requires reason)
router.post('/flag-customer', async (req, res) => {
  try {
    const { vendor_id, customer_id, reason } = req.body;

    if (!vendor_id || !customer_id) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID and Customer ID are required'
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Reason is required for reporting a customer'
      });
    }

    console.log(`Vendor ${vendor_id} reporting customer ${customer_id} with reason: ${reason}`);

    // Check if customer exists
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id, full_name, flag_count, is_blocked')
      .eq('id', parseInt(customer_id))
      .single();

    if (customerError || !customerData) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Check if already flagged by this vendor
    const { data: existingFlag, error: checkError } = await supabase
      .from('customer_flags')
      .select('flag_id')
      .eq('customer_id', parseInt(customer_id))
      .eq('vendor_id', vendor_id.toString())
      .single();

    if (existingFlag) {
      return res.status(400).json({
        success: false,
        error: 'Customer already flagged by this vendor'
      });
    }

    // Insert flag record
    const { data: newFlag, error: insertError } = await supabase
      .from('customer_flags')
      .insert({
        customer_id: parseInt(customer_id),
        vendor_id: vendor_id.toString(),
        reason: reason || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error flagging customer:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to flag customer'
      });
    }

    // Get updated customer data (flag_count and is_blocked should be updated by trigger)
    const { data: updatedCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('id, full_name, flag_count, is_blocked')
      .eq('id', parseInt(customer_id))
      .single();

    console.log(`Customer ${customer_id} flagged. New flag_count: ${updatedCustomer?.flag_count}, is_blocked: ${updatedCustomer?.is_blocked}`);

    res.json({
      success: true,
      message: 'Customer flagged successfully',
      data: {
        flag_id: newFlag.flag_id,
        customer_id: parseInt(customer_id),
        vendor_id: vendor_id.toString(),
        flag_count: updatedCustomer?.flag_count || 0,
        is_blocked: updatedCustomer?.is_blocked || false
      }
    });

  } catch (error) {
    console.error('Error in flag-customer:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Unflag a customer (vendor removes their flag)
router.delete('/unflag-customer', async (req, res) => {
  try {
    const { vendor_id, customer_id } = req.body;

    if (!vendor_id || !customer_id) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID and Customer ID are required'
      });
    }

    console.log(`Vendor ${vendor_id} unflagging customer ${customer_id}`);

    // Delete flag record
    const { error: deleteError } = await supabase
      .from('customer_flags')
      .delete()
      .eq('customer_id', parseInt(customer_id))
      .eq('vendor_id', vendor_id.toString());

    if (deleteError) {
      console.error('Error unflagging customer:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to unflag customer'
      });
    }

    // Get updated customer data (flag_count and is_blocked should be updated by trigger)
    const { data: updatedCustomer, error: fetchError } = await supabase
      .from('customers')
      .select('id, full_name, flag_count, is_blocked')
      .eq('id', parseInt(customer_id))
      .single();

    console.log(`Customer ${customer_id} unflagged. New flag_count: ${updatedCustomer?.flag_count}, is_blocked: ${updatedCustomer?.is_blocked}`);

    res.json({
      success: true,
      message: 'Customer unflagged successfully',
      data: {
        customer_id: parseInt(customer_id),
        vendor_id: vendor_id.toString(),
        flag_count: updatedCustomer?.flag_count || 0,
        is_blocked: updatedCustomer?.is_blocked || false
      }
    });

  } catch (error) {
    console.error('Error in unflag-customer:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get status options
router.get('/status-options', (req, res) => {
  const { userType } = req.query; // 'customer' or 'vendor' or undefined (default to vendor)
  
  let statusOptions;
  
  if (userType === 'customer') {
    // Customer-specific status options
    statusOptions = [
      { value: 'Contacted', label: 'Contacted', description: 'Initial contact made', color: 'blue' },
      { value: 'Discussion in Progress', label: 'Discussion in Progress', description: 'Ongoing conversation', color: 'yellow' },
      { value: 'Discussion going on', label: 'Discussion going on', description: 'Price quote received', color: 'purple' },
      { value: 'Negotiation Ongoing', label: 'Negotiation Ongoing', description: 'Negotiating terms', color: 'orange' },
      { value: 'Deal Finalised', label: 'Deal Finalised', description: 'Agreement reached', color: 'green' },
      { value: 'Advance Paid', label: 'Advance Paid', description: 'Payment made', color: 'indigo' },
      { value: 'Event Scheduled', label: 'Event Scheduled', description: 'Date confirmed', color: 'pink' },
      { value: 'Service in Progress', label: 'Service in Progress', description: 'Service ongoing', color: 'blue' },
      { value: 'Event Completed', label: 'Event Completed', description: 'Service delivered', color: 'emerald' },
      { value: 'Not Interested', label: 'Not Interested', description: 'No longer interested', color: 'red' }
    ];
  } else {
    // Vendor-specific status options (default)
    statusOptions = [
      { value: 'Customer Contacted', label: 'Customer Contacted', description: 'Initial contact made', color: 'blue' },
      { value: 'Discussion in Progress', label: 'Discussion in Progress', description: 'Ongoing conversation', color: 'yellow' },
      { value: 'Quotation Shared', label: 'Quotation Shared', description: 'Price quote sent', color: 'purple' },
      { value: 'Negotiation Ongoing', label: 'Negotiation Ongoing', description: 'Negotiating terms', color: 'orange' },
      { value: 'Deal Confirmed', label: 'Deal Confirmed', description: 'Agreement reached', color: 'green' },
      { value: 'Advance Received', label: 'Advance Received', description: 'Payment received', color: 'indigo' },
      { value: 'Event Scheduled', label: 'Event Scheduled', description: 'Date confirmed', color: 'pink' },
      { value: 'Service in Progress', label: 'Service in Progress', description: 'Service ongoing', color: 'blue' },
      { value: 'Service Completed', label: 'Service Completed', description: 'Service delivered', color: 'emerald' },
      { value: 'Payment Settled', label: 'Payment Settled', description: 'Full payment received', color: 'green' },
      { value: 'Lost', label: 'Lost', description: 'Deal lost', color: 'red' }
    ];
  }

  res.json({
    success: true,
    data: statusOptions
  });
});

// Update vendor status for a contacted customer
router.put('/update-vendor-status/:contact_id', async (req, res) => {
  try {
    const { contact_id } = req.params;
    const { vendor_status } = req.body;

    // Validate input
    if (!contact_id) {
      return res.status(400).json({
        success: false,
        error: 'Contact ID is required'
      });
    }

    if (!vendor_status) {
      return res.status(400).json({
        success: false,
        error: 'Vendor status is required'
      });
    }

    // Validate vendor status values - updated to match new status options
    const validStatuses = [
      // New vendor status options
      'Customer Contacted',
      'Discussion in Progress',
      'Quotation Shared',
      'Negotiation Ongoing',
      'Deal Confirmed',
      'Advance Received',
      'Event Scheduled',
      'Service in Progress',
      'Service Completed',
      'Payment Settled',
      'Lost',
      // Legacy statuses (for backward compatibility)
      'Contacted',
      'Customer Interested',
      'Deal Made',
      'Event Completed',
      'Full Amount Settled',
      'Closed'
    ];

    if (!validStatuses.includes(vendor_status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid vendor status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    console.log(`Updating vendor status for contact ${contact_id} to: ${vendor_status}`);

    // First get the current contact record to get vendor_id
    const { data: currentContact, error: fetchError } = await supabase
      .from('contacted_vendors')
      .select('vendor_id')
      .eq('contact_id', contact_id)
      .single();

    if (fetchError || !currentContact) {
      return res.status(404).json({
        success: false,
        error: 'Contact record not found'
      });
    }

    // Get vendor details for notification message
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('brand_name')
      .eq('vendor_id', currentContact.vendor_id)
      .single();

    const vendorName = vendorData?.brand_name || `Vendor ${currentContact.vendor_id}`;
    const notificationMessage = `${vendorName} updated your status to: ${vendor_status}`; // Use "your status" for customer context

    // Update the vendor status and notify customer
    // Set customer_notified to true so customer sees it as unread notification
    const { data, error } = await supabase
      .from('contacted_vendors')
      .update({ 
        vendor_status,
        customer_notified: true,  // Set to true so customer sees it as unread notification
        vendor_notified: false,   // Vendor doesn't need notification for their own change
        notification_message: notificationMessage,
        contacted_at: new Date().toISOString() // Update timestamp so it appears at the top
      })
      .eq('contact_id', contact_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor status:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update vendor status'
      });
    }

    if (!data) {
      return res.status(500).json({
        success: false,
        error: 'Status update completed but no data returned'
      });
    }

    console.log('Customer notification set to unread for vendor status update');

    if (error) {
      console.error('Error updating vendor status:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update vendor status'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Contact record not found'
      });
    }

    console.log('Vendor status updated successfully:', data);
    console.log('Customer notified about status change:', data.customer_id);

    res.json({
      success: true,
      message: 'Vendor status updated successfully',
      data: {
        contact_id: data.contact_id,
        vendor_status: data.vendor_status,
        customer_id: data.customer_id,
        vendor_id: data.vendor_id,
        customer_notified: data.customer_notified,
        notification_message: data.notification_message
      }
    });

  } catch (error) {
    console.error('Error in update-vendor-status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update notes for a contact
router.put('/update-notes/:contact_id', async (req, res) => {
  try {
    const { contact_id } = req.params;
    const { notes } = req.body;

    // Validate input
    if (!contact_id) {
      return res.status(400).json({
        success: false,
        error: 'Contact ID is required'
      });
    }

    if (notes === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Notes field is required'
      });
    }

    console.log(`Updating notes for contact ${contact_id}:`, notes);

    // Update the notes
    const { data, error } = await supabase
      .from('contacted_vendors')
      .update({ notes: notes || '' })
      .eq('contact_id', contact_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating notes:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update notes'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Contact record not found'
      });
    }

    console.log('Notes updated successfully:', data);

    res.json({
      success: true,
      message: 'Notes updated successfully',
      data: {
        contact_id: data.contact_id,
        notes: data.notes,
        customer_id: data.customer_id,
        vendor_id: data.vendor_id
      }
    });

  } catch (error) {
    console.error('Error in update-notes:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
