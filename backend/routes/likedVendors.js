const express = require('express');
const { supabase } = require('../config/supabase');
const router = express.Router();

// Save like vendor API
router.post('/save-like', async (req, res) => {
  try {
    const { customer_id, vendor_id } = req.body;

    // Validate required fields
    if (!customer_id || !vendor_id) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and Vendor ID are required'
      });
    }

    console.log(`Saving like: Customer ${customer_id} likes Vendor ${vendor_id}`);

    // Check if the like already exists
    const { data: existingLike, error: checkError } = await supabase
      .from('customer_liked_vendors')
      .select('id')
      .eq('customer_id', customer_id)
      .eq('vendor_id', vendor_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing like:', checkError);
      return res.status(500).json({
        success: false,
        error: 'Failed to check existing like'
      });
    }

    // If like already exists, return success
    if (existingLike) {
      return res.json({
        success: true,
        message: 'Vendor already liked',
        already_liked: true
      });
    }

    // Insert new like
    const { data, error } = await supabase
      .from('customer_liked_vendors')
      .insert({
        customer_id: parseInt(customer_id),
        vendor_id: vendor_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving like:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save like'
      });
    }

    console.log('Like saved successfully:', data);

    res.json({
      success: true,
      message: 'Vendor liked successfully',
      data: data
    });

  } catch (error) {
    console.error('Error in save-like endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Remove like vendor API
router.delete('/remove-like', async (req, res) => {
  try {
    const { customer_id, vendor_id } = req.body;

    // Validate required fields
    if (!customer_id || !vendor_id) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and Vendor ID are required'
      });
    }

    console.log(`Removing like: Customer ${customer_id} unlikes Vendor ${vendor_id}`);

    // Delete the like
    const { error } = await supabase
      .from('customer_liked_vendors')
      .delete()
      .eq('customer_id', parseInt(customer_id))
      .eq('vendor_id', vendor_id);

    if (error) {
      console.error('Error removing like:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to remove like'
      });
    }

    console.log('Like removed successfully');

    res.json({
      success: true,
      message: 'Vendor unliked successfully'
    });

  } catch (error) {
    console.error('Error in remove-like endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all liked vendors for a customer API
router.get('/get-liked-vendors/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID is required'
      });
    }

    console.log(`Getting liked vendors for customer: ${customer_id}`);

    // First, get all liked vendor IDs for this customer
    const { data: likedData, error: likedError } = await supabase
      .from('customer_liked_vendors')
      .select('vendor_id, liked_at')
      .eq('customer_id', parseInt(customer_id))
      .order('liked_at', { ascending: false });

    if (likedError) {
      console.error('Error fetching liked vendors:', likedError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch liked vendors'
      });
    }

    if (!likedData || likedData.length === 0) {
      return res.json({
        success: true,
        message: 'No liked vendors found',
        data: [],
        liked_vendor_ids: []
      });
    }

    // Get vendor details for each liked vendor
    const vendorIds = likedData.map(item => item.vendor_id);
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
        message: 'No valid liked vendors found',
        data: [],
        liked_vendor_ids: []
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
    console.log('Liked data:', likedData);
    
    if (!vendorsData || vendorsData.length === 0) {
      console.log('No vendor data found, returning liked data with placeholder info');
      const dataWithPlaceholders = likedData.map(liked => ({
        vendor_id: liked.vendor_id,
        brand_name: `Vendor ${liked.vendor_id}`,
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
        liked_at: liked.liked_at
      }));
      
      return res.json({
        success: true,
        message: `Found ${likedData.length} liked vendors`,
        data: dataWithPlaceholders,
        liked_vendor_ids: validVendorIds.map(id => id.toString())
      });
    }

    // Combine liked data with vendor details
    const combinedData = likedData.map(liked => {
      const vendor = vendorsData?.find(v => v.vendor_id.toString() === liked.vendor_id.toString());
      if (vendor) {
        return {
          ...vendor,
          liked_at: liked.liked_at
        };
      } else {
        console.log(`Warning: Vendor ${liked.vendor_id} not found in database`);
        return {
          vendor_id: liked.vendor_id,
          brand_name: 'Unknown Vendor',
          category: 'Unknown',
          liked_at: liked.liked_at
        };
      }
    });

    console.log(`Found ${combinedData.length} liked vendors for customer ${customer_id}`);

    res.json({
      success: true,
      message: `Found ${combinedData.length} liked vendors`,
      data: combinedData,
      liked_vendor_ids: validVendorIds.map(id => id.toString()) // Convert back to strings for frontend
    });

  } catch (error) {
    console.error('Error in get-liked-vendors endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Check if a vendor is liked by a customer API
router.get('/check-like/:customer_id/:vendor_id', async (req, res) => {
  try {
    const { customer_id, vendor_id } = req.params;

    if (!customer_id || !vendor_id) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and Vendor ID are required'
      });
    }

    console.log(`Checking if customer ${customer_id} likes vendor ${vendor_id}`);

    const { data, error } = await supabase
      .from('customer_liked_vendors')
      .select('id, liked_at')
      .eq('customer_id', parseInt(customer_id))
      .eq('vendor_id', vendor_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking like status:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to check like status'
      });
    }

    const isLiked = !!data;

    res.json({
      success: true,
      is_liked: isLiked,
      data: data || null
    });

  } catch (error) {
    console.error('Error in check-like endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
