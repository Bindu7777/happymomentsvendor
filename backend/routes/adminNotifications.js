const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get admin notifications for a vendor
router.get('/get-vendor-admin-notifications/:vendor_id', async (req, res) => {
  try {
    const { vendor_id } = req.params;

    console.log(`🔔 Fetching admin notifications for vendor ID: ${vendor_id}`);

    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('vendor_id', parseInt(vendor_id))
      .order('created_at', { ascending: false })
      .limit(20); // Get latest 20 notifications

    if (error) {
      console.error('❌ Error fetching admin notifications:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch admin notifications'
      });
    }

    console.log(`✅ Admin notifications fetched:`, data?.length || 0, 'notifications');

    res.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('💥 Error in get-vendor-admin-notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Mark admin notification as read
router.put('/mark-admin-notification-read/:notification_id', async (req, res) => {
  try {
    const { notification_id } = req.params;

    console.log(`📖 Marking admin notification ${notification_id} as read`);

    const { error } = await supabase
      .from('admin_notifications')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(notification_id));

    if (error) {
      console.error('❌ Error marking admin notification as read:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read'
      });
    }

    console.log(`✅ Admin notification ${notification_id} marked as read`);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('💥 Error in mark-admin-notification-read:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Mark all admin notifications as read for a vendor
router.put('/mark-all-admin-notifications-read/:vendor_id', async (req, res) => {
  try {
    const { vendor_id } = req.params;

    console.log(`📖 Marking all admin notifications as read for vendor ${vendor_id}`);

    const { error } = await supabase
      .from('admin_notifications')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .eq('vendor_id', parseInt(vendor_id))
      .eq('is_read', false); // Only update unread ones

    if (error) {
      console.error('❌ Error marking all admin notifications as read:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to mark all notifications as read'
      });
    }

    console.log(`✅ All admin notifications marked as read for vendor ${vendor_id}`);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('💥 Error in mark-all-admin-notifications-read:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Send admin notification (used by admin approval process)
router.post('/send-admin-notification', async (req, res) => {
  try {
    const { 
      vendor_id, 
      notification_type, 
      title, 
      message, 
      admin_username, 
      change_id 
    } = req.body;

    // Validate input
    if (!vendor_id || !notification_type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Vendor ID, notification type, title, and message are required'
      });
    }

    console.log(`📤 Sending admin notification to vendor ${vendor_id}:`, {
      notification_type,
      title,
      message,
      admin_username,
      change_id
    });

    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        vendor_id: parseInt(vendor_id),
        notification_type,
        title,
        message,
        is_read: false,
        admin_username: admin_username || 'Admin',
        change_id: change_id || null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error sending admin notification:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send admin notification'
      });
    }

    console.log(`✅ Admin notification sent successfully:`, data);

    res.json({
      success: true,
      message: 'Admin notification sent successfully',
      data
    });

  } catch (error) {
    console.error('💥 Error in send-admin-notification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
