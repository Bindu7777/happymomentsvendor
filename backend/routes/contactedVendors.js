const express = require('express');
const { supabase } = require('../config/supabase');
const router = express.Router();

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

    // Insert new contact record
    const { data: newContact, error: insertError } = await supabase
      .from('contacted_vendors')
      .insert({
        customer_id: parseInt(customer_id),
        vendor_id: vendor_id.toString(),
        status: 'Contacted'
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
          contacted_at: contacted.contacted_at
        };
      } else {
        console.log(`Warning: Vendor ${contacted.vendor_id} not found in database`);
        return {
          vendor_id: contacted.vendor_id,
          brand_name: 'Unknown Vendor',
          category: 'Unknown',
          contacted_at: contacted.contacted_at
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
    const { customer_id, vendor_id, status } = req.body;

    if (!customer_id || !vendor_id || !status) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID, Vendor ID, and Status are required'
      });
    }

    // Validate status values
    const validStatuses = [
      'Contacted',
      'In Discussion', 
      'Deal Agreed',
      'Request Discount Coupon',
      'Discount Applied',
      'Advance Paid',
      'Event Scheduled',
      'Event Completed',
      'Closed - Successful',
      'Closed - Not Proceeding'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    console.log(`Updating status: Customer ${customer_id}, Vendor ${vendor_id}, Status: ${status}`);
    
    // Check if contact exists
    const { data: existingContact, error: checkError } = await supabase
      .from('contacted_vendors')
      .select('contact_id')
      .eq('customer_id', parseInt(customer_id))
      .eq('vendor_id', vendor_id.toString())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing contact:', checkError);
      return res.status(500).json({
        success: false,
        error: 'Failed to check existing contact'
      });
    }

    if (!existingContact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    // Update the status
    const { data, error } = await supabase
      .from('contacted_vendors')
      .update({ status })
      .eq('customer_id', parseInt(customer_id))
      .eq('vendor_id', vendor_id.toString())
      .select()
      .single();

    if (error) {
      console.error('Error updating status:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update status'
      });
    }

    console.log('Status updated successfully:', data);
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

// Get status options
router.get('/status-options', (req, res) => {
  const statusOptions = [
    { value: 'Contacted', label: 'Contacted', description: 'Initial contact made', color: 'blue' },
    { value: 'In Discussion', label: 'In Discussion', description: 'Negotiating details', color: 'yellow' },
    { value: 'Deal Agreed', label: 'Deal Agreed', description: 'Agreement reached', color: 'green' },
    { value: 'Request Discount Coupon', label: 'Request Discount Coupon', description: 'Asking for special offers', color: 'orange' },
    { value: 'Discount Applied', label: 'Discount Applied', description: 'Special offer applied', color: 'purple' },
    { value: 'Advance Paid', label: 'Advance Paid', description: 'Payment made', color: 'indigo' },
    { value: 'Event Scheduled', label: 'Event Scheduled', description: 'Date confirmed', color: 'pink' },
    { value: 'Event Completed', label: 'Event Completed', description: 'Service delivered', color: 'emerald' },
    { value: 'Closed - Successful', label: 'Closed - Successful', description: 'Deal completed', color: 'green' },
    { value: 'Closed - Not Proceeding', label: 'Closed - Not Proceeding', description: 'Deal cancelled', color: 'red' }
  ];

  res.json({
    success: true,
    data: statusOptions
  });
});

module.exports = router;
