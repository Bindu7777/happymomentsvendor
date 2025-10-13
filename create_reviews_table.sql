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
