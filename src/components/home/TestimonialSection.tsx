
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    text: "From decor to coordination, Happy Moments made our event unforgettable! Everything was flawless and stress-free. Truly the best!",
    author: "Priya & Arjun",
    location: "hyderabad,Telangana",
    rating: 5,
    // image: "https://www.google.com/imgres?q=unsplash%20south%20indian%20people%20image&imgurl=https%3A%2F%2Fplus.unsplash.com%2Fpremium_photo-1682092039530-584ae1d9da7f%3Ffm%3Djpg%26q%3D60%26w%3D3000%26ixlib%3Drb-4.0.3%26ixid%3DM3wxMjA3fDB8MHxzZWFyY2h8MXx8aW5kaWFuJTIwcGVvcGxlfGVufDB8fDB8fHww&imgrefurl=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Findian-people&docid=XHhE394kloFRAM&tbnid=ZyiUtbI_YS4hjM&vet=12ahUKEwir1cKwoPaMAxWx4zgGHRPgEA8QM3oECGcQAA..i&w=3000&h=4500&hcb=2&ved=https://www.google.com/imgres?q=south%20indian%20lady%20images&imgurl=https%3A%2F%2Fi.pinimg.com%2F474x%2F6f%2F7a%2Fae%2F6f7aae011c9ea58caaaa922ff9c8a1d2.jpg&imgrefurl=https%3A%2F%2Fza.pinterest.com%2Fprincesscaslynn%2Fsouth-indian-woman%2F&docid=-oVJVlu2aRaAcM&tbnid=8fqyINZQBayRJM&vet=12ahUKEwjJxdvvoPaMAxVSzjgGHSpxJ7wQM3oECGYQAA..i&w=474&h=690&hcb=2&ved=2ahUKEwjJxdvvoPaMAxVSzjgGHSpxJ7wQM3oECGYQAA"
  },
  {
    id: 2,
    text: "The planning tools were a blessing! Guest list, budget, seating — all so easy. Saved us so much time and tension!",
    author: "Srinivas",
    location: "Vizag,AP",
    rating: 5,
    // image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 3,
    text: "Found top vendors for catering, music, and decor in one place! No need to hunt around. Happy Moments made it simple and fast!",
    author: "Lakshmi & Bhanu",
    location: "Hyderabad,Telangana",
    rating: 4,
    // image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
  }
  //,
  // {
  //   id: 4,
  //   text: "Took Happy Moments' service for my kid’s 1st birthday. They explained everything patiently in Telugu and gave a quick, helpful response. Very happy!",
  //   author: "Pravalika Reddy",
  //   location: "Hyderabad,Telangana",
  //   rating: 4,
  //   // image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80"
  // }
];

const TestimonialSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-wedding-navy mb-4">What Our Customer Say</h2>
          <p className="text-wedding-gray max-w-2xl mx-auto">Real experiences</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className="bg-wedding-light rounded-2xl p-6 shadow-subtle hover:shadow-card transition-all duration-300 animate-fade-up border border-wedding-orange/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < testimonial.rating ? 'text-wedding-orange fill-wedding-orange' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              
              <p className="text-wedding-navy mb-6 italic">"{testimonial.text}"</p>
              
              <div className="flex items-center">
                <img 
                  // src={testimonial} 
                  alt={testimonial.author} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-wedding-navy">{testimonial.author}</h4>
                  <p className="text-sm text-wedding-gray">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
