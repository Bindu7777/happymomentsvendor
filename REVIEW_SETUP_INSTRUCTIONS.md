# Review System Setup Instructions

## Database Setup

### 1. Create Reviews Table
Run the SQL commands in `create_reviews_table.sql` in your Supabase SQL editor or database management tool:

```sql
-- Create Reviews table for customer testimonials
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    review TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial reviews from Andhra Pradesh and Telangana customers
INSERT INTO reviews (name, state, review, rating) VALUES
('Ravi', 'Andhra Pradesh', 'We booked a photographer through Happy Moments…the best in our budget!', 5),
('Priya', 'Telangana', 'Very nice experience. Photographer captured our event perfectly, and price was reasonable!', 5),
('Lakshmi', 'Andhra Pradesh', 'The booking was quick and easy. Photographer was very good and affordable.', 5),
('Srinivas', 'Telangana', 'Great help from the team! They arranged everything smoothly within my budget.', 5),
('Nagma', 'Andhra Pradesh', 'Loved the platform for finding decorators and photographers—very convenient.', 5),
('Anulekha', 'Telangana', 'Found an amazing vendor for our family event. Highly recommended to everyone.', 5),
('Ramesh', 'Andhra Pradesh', 'I got excellent assistance and the vendor gave top quality service.', 5),
('Sunitha', 'Telangana', 'After my event, I could donate leftover food with just a WhatsApp message. Very happy!', 5),
('Vijay', 'Andhra Pradesh', 'Our extra food was picked up quickly and given to an NGO. Great social cause!', 5),
('Saritha', 'Telangana', 'Affordable, quick, and good vendors. Will use again.', 5),
('Naresh', 'Andhra Pradesh', 'The support team was very friendly, helped me select the right vendor on time.', 5),
('Pavani', 'Telangana', 'Happy Moments made my celebration easy, and I loved the kindness food donation feature.', 5),
('Krishna', 'Andhra Pradesh', 'Smooth experience—happy with the rates and overall service.', 5),
('Deepa', 'Telangana', 'Thank you for enabling us to share our food with people who needed it after our wedding.', 5),
('Manoj', 'Andhra Pradesh', 'Photographer, decorator—all under one roof and within my budget. Super-helpful platform!', 5);
```

### 2. Verify Setup
After running the SQL commands, verify that:
- The `reviews` table exists with the correct structure
- All 15 initial reviews are inserted
- The table has proper permissions for your application

## Features Implemented

### ✅ Review Form
- **Name Field**: Required text input for customer name
- **State Field**: Required dropdown with all Indian states
- **Review Text**: Required textarea for review content
- **Rating**: Optional star rating (1-5 stars, defaults to 5)
- **Validation**: All three fields (name, state, review) must be filled to submit

### ✅ Database Integration
- **Reviews Table**: Stores all reviews with name, state, review text, rating, and timestamp
- **Service Functions**: 
  - `getAllReviews()`: Fetch all reviews for display
  - `addReview()`: Add new reviews to database
  - `getReviewsByState()`: Filter reviews by state (for future use)

### ✅ Dynamic Display
- **Carousel**: Shows 3 reviews per page with navigation arrows
- **Real-time Updates**: New reviews appear immediately after submission
- **Loading States**: Skeleton loading while fetching reviews
- **Dot Indicators**: Show current page and allow direct navigation

### ✅ User Experience
- **Add Review Button**: Prominently placed "Add Your Review" button
- **Modal Form**: Clean, user-friendly form in a modal dialog
- **Success Feedback**: Form resets and closes after successful submission
- **Error Handling**: Clear error messages for validation failures

## Usage Flow

1. **View Reviews**: Customers see existing reviews in a carousel format
2. **Add Review**: Click "Add Your Review" button to open the form
3. **Fill Form**: Enter name, select state, write review, optionally set rating
4. **Submit**: Form validates all required fields before submission
5. **Success**: Review is saved to database and immediately appears in the carousel

## Technical Notes

- All reviews are stored in a single `reviews` table
- Reviews are fetched dynamically from the database (no hardcoded data)
- The system supports unlimited reviews with pagination
- Initial 15 reviews are pre-populated from real customer feedback
- Form includes proper validation and error handling
- Loading states provide smooth user experience

## Next Steps

1. Run the SQL commands to create the table and insert initial data
2. Test the review form functionality
3. Verify reviews appear correctly in the carousel
4. Test the navigation arrows and dot indicators
5. Ensure new reviews are properly saved and displayed
