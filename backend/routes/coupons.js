const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Get all active coupons
router.get('/active', async (req, res) => {
  try {
    console.log('🔍 Fetching active coupons...');
    
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('status', 'active')
      .gte('valid_until', new Date().toISOString())
      .order('discount_percentage', { ascending: false });

    if (error) {
      console.error('❌ Error fetching coupons:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch coupons'
      });
    }

    // Filter out coupons that have reached their usage limit
    const availableCoupons = (data || []).filter(coupon => 
      coupon.usage_count < coupon.usage_limit
    );

    console.log(`✅ Found ${availableCoupons.length} available coupons out of ${data.length} active coupons`);
    res.json({
      success: true,
      data: availableCoupons
    });

  } catch (error) {
    console.error('💥 Error in /active:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get a random active coupon
router.get('/random', async (req, res) => {
  try {
    console.log('🎲 Fetching random coupon...');
    
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('status', 'active')
      .gte('valid_until', new Date().toISOString())
      .order('discount_percentage', { ascending: false });

    if (error) {
      console.error('❌ Error fetching coupons:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch coupons'
      });
    }

    // Filter out coupons that have reached their usage limit
    const availableCoupons = (data || []).filter(coupon => 
      coupon.usage_count < coupon.usage_limit
    );

    if (!availableCoupons || availableCoupons.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No available coupons'
      });
    }

    // Get a random coupon from available ones
    const randomIndex = Math.floor(Math.random() * availableCoupons.length);
    const randomCoupon = availableCoupons[randomIndex];

    console.log(`✅ Selected random coupon: ${randomCoupon.coupon_code} (${randomCoupon.discount_percentage}% off)`);
    
    res.json({
      success: true,
      data: randomCoupon
    });

  } catch (error) {
    console.error('💥 Error in /random:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get coupon by code
router.get('/code/:couponCode', async (req, res) => {
  try {
    const { couponCode } = req.params;
    console.log(`🔍 Fetching coupon by code: ${couponCode}`);
    
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', couponCode.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Coupon not found'
        });
      }
      console.error('❌ Error fetching coupon:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch coupon'
      });
    }

    // Check if coupon is still valid
    const now = new Date();
    const validUntil = new Date(data.valid_until);
    
    if (data.status !== 'active' || now > validUntil || data.usage_count >= data.usage_limit) {
      return res.status(400).json({
        success: false,
        error: 'Coupon is no longer valid'
      });
    }

    console.log(`✅ Found valid coupon: ${data.coupon_code}`);
    
    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('💥 Error in /code/:couponCode:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Use a coupon (increment usage count)
router.post('/use/:couponCode', async (req, res) => {
  try {
    const { couponCode } = req.params;
    console.log(`🎫 Using coupon: ${couponCode}`);
    
    // First check if coupon exists and is valid
    const { data: coupon, error: fetchError } = await supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', couponCode.toUpperCase())
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Coupon not found'
        });
      }
      console.error('❌ Error fetching coupon:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch coupon'
      });
    }

    // Check if coupon is still valid
    const now = new Date();
    const validUntil = new Date(coupon.valid_until);
    
    if (coupon.status !== 'active' || now > validUntil || coupon.usage_count >= coupon.usage_limit) {
      return res.status(400).json({
        success: false,
        error: 'Coupon is no longer valid'
      });
    }

    // Increment usage count
    const { data: updatedCoupon, error: updateError } = await supabase
      .from('coupons')
      .update({ 
        usage_count: coupon.usage_count + 1,
        status: coupon.usage_count + 1 >= coupon.usage_limit ? 'used' : 'active'
      })
      .eq('coupon_code', couponCode.toUpperCase())
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating coupon usage:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to use coupon'
      });
    }

    console.log(`✅ Coupon used successfully: ${updatedCoupon.coupon_code} (${updatedCoupon.usage_count}/${updatedCoupon.usage_limit})`);
    
    res.json({
      success: true,
      message: 'Coupon used successfully',
      data: updatedCoupon
    });

  } catch (error) {
    console.error('💥 Error in /use/:couponCode:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get coupon statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Fetching coupon statistics...');
    
    const { data, error } = await supabase
      .from('coupons')
      .select('status, usage_count, usage_limit, discount_percentage');

    if (error) {
      console.error('❌ Error fetching coupon stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch coupon statistics'
      });
    }

    const stats = {
      total: data.length,
      active: data.filter(c => c.status === 'active').length,
      used: data.filter(c => c.status === 'used').length,
      inactive: data.filter(c => c.status === 'inactive').length,
      expired: data.filter(c => c.status === 'expired').length,
      totalUsage: data.reduce((sum, c) => sum + c.usage_count, 0),
      maxDiscount: Math.max(...data.map(c => c.discount_percentage)),
      avgDiscount: data.reduce((sum, c) => sum + c.discount_percentage, 0) / data.length
    };

    console.log('✅ Coupon statistics:', stats);
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('💥 Error in /stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
