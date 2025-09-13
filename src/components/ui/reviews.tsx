import React from "react";
import DynamicIcon from "@/components/dynamic-icons";

const reviews = [
  {
    id: 1,
    name: "John Doe",
    avatar: "/images/avatar1.jpg",
    date: "March 20, 2025",
    rating: 5,
    comment:
      "Abhilash and his team were phenomenal! The lighting was exactly what we envisioned. Highly recommended!",
  },
  {
    id: 2,
    name: "Priya Sharma",
    avatar: "/images/avatar2.jpg",
    date: "March 12, 2025",
    rating: 4,
    comment:
      "Very professional and punctual. Loved the fireworks at the wedding. Just a little expensive, but worth it!",
  },
];

export default function ReviewSection() {
  return (
    <div className="w-full px-4 sm:px-8 py-10 max-w-6xl mx-auto ">
      <div className="flex flex-wrap gap-y-6 gap-x-6  justify-center">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row gap-4 w-full md:w-[48%]"
          >
          

            {/* Review Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start flex-col sm:flex-row">
                <div>
                  <h3 className="text-lg font-semibold">{review.name}</h3>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>

                {/* Stars */}
                <div className="flex mt-2 sm:mt-0">
                  {Array.from({ length: review.rating }, (_, i) => (
                    <DynamicIcon key={i} name="star" size="1x" color="orange" />
                  ))}
                  {Array.from({ length: 5 - review.rating }, (_, i) => (
                    <DynamicIcon key={i} name="star" size="1x" color="gray" />
                  ))}
                </div>
              </div>

              {/* Comment */}
              <p className="mt-3 text-gray-700 text-sm sm:text-base leading-relaxed">
                {review.comment}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
