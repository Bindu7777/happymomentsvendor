"use client";

import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import { motion, useInView } from "framer-motion";
import { Galleria } from "primereact/galleria";
import "primereact/resources/themes/lara-light-indigo/theme.css"; // theme
import "primereact/resources/primereact.min.css"; // core styles
import "primeicons/primeicons.css"; // icons
import DynamicIcons from "@/components/dynamic-icons";
import PaymentModal from "@/components/payment-mode";
import RazorpayPaymentForm from "@/components/RazorpayPaymentForm";
import RazorpayButton from "@/components/RazorpayPaymentForm";
import { Link, useNavigate } from "react-router-dom";

const folderId = "1LyoPU8_yLWdLmWpcsxEeU6mWWfUNpxKC";
const apiKey = "AIzaSyBBMC5vLrePsd-dngi1Bgo8ssf5Wp6kOx4";
function DriveGallery() {
  const [images, setImages] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(null);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

  useEffect(() => {
    async function fetchDriveImages() {
      try {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType+contains+'image/'&key=${apiKey}`
        );
        const data = await response.json();
        const files = data.files.map((file) => ({
          id: file.id,
          name: file.name,
          url: `https://lh3.googleusercontent.com/d/${file.id}=s1600`,
        }));
        setImages(files);
      } catch (err) {
        console.error("Failed to fetch Drive images", err);
      }
    }

    fetchDriveImages();
  }, []);

    const phoneNumber = "+917330732710";
    const message = "Hello, may I know pricing for the Mandapa?"; 
    const openWhatsApp = () => {
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;
      window.open(url, "_blank");
  };

  const openCarousel = (index) => {
    setCarouselIndex(index);
    setIsCarouselOpen(true);
  };

  const closeCarousel = () => {
    setIsCarouselOpen(false);
  };

  const nextImage = () => {
    setCarouselIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCarouselIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-8">
      {images.map((img, index) => (
        <div key={index} className="relative">
          <img
            alt={img.name}
            className="rounded-xl shadow-subtle object-cover h-72 w-full"
            srcSet={`
              https://lh3.googleusercontent.com/d/${img.id}=s800 800w,
              https://lh3.googleusercontent.com/d/${img.id}=s1200 1200w,
              https://lh3.googleusercontent.com/d/${img.id}=s1600 1600w
            `}
            sizes="(max-width: 640px) 800px, (max-width: 768px) 1200px, 1600px"
            src={`https://lh3.googleusercontent.com/d/${img.id}=s1600`}
          />
          <button
            onClick={() => openCarousel(index)}
            className="absolute top-4 right-4 w-8 h-8 bg-white/80 text-black p-2 rounded-full shadow-md hover:bg-gray-200 transition flex items-center justify-center"
            title="View in Carousel"
          >
            <DynamicIcons name="max" size="1x" color="black" />
          </button>
          <button
            onClick={() => openWhatsApp()}
            className="absolute bottom-4 right-4 px-2 py-3 h-6 bg-orange-400 text-white hover:text-black p-2 rounded-full  hover:bg-gray-200 transition flex items-center justify-center"
            title="View in Carousel"
          >
            know more
          </button>
        </div>
      ))}

      {isCarouselOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative rounded-lg shadow-lg h-[80vh] w-full max-w-5xl">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
              <button
                onClick={prevImage}
                className="text-white bg-black rounded-full w-10 h-10 flex items-center justify-center z-10"
              >
                &#8592;
              </button>

              <button
                onClick={nextImage}
                className="text-white bg-black rounded-full w-10 h-10 flex items-center justify-center z-10"
              >
                &#8594;
              </button>
            </div>

            <div className="relative flex items-center justify-center h-full">
              <img
                src={images[carouselIndex].url}
                alt="Carousel Image"
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
              <button
                onClick={closeCarousel}
                className="absolute top-4 right-4 text-white bg-black rounded-full w-10 h-10 flex items-center justify-center"
                title="Close Carousel"
              >
                <DynamicIcons name="cross" color="white" size="1x" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Mandapas() {
  const navigate = useNavigate();
  const textRef = useRef(null);
  const textInView = useInView(textRef, { once: true });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="text-foreground min-h-screen flex flex-col items-center justify-center bg-violet-50">
      <Header />

      {/* Hero Section */}
      <section className="relative mt-[16vh] w-[80vw] h-[80vh] rounded-3xl shadow-card shadow-orange-400 z-10">
        <img
          src="/images/mandapas.png"
          alt="Traditional wedding mandap"
          className="w-full h-full object-cover rounded-3xl"
        />
        <div className="absolute top-16 left-16 text-6xl font-bold font-belinda p-4 rounded-lg text-white drop-shadow-[2px_2px_3px_rgba(0,0,0,0.9)]">
          Mandapas
        </div>
      </section>

      {/* Description Section */}
      <section className="relative z-20 mt-[2vh] px-6 md:px-24 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div
            ref={textRef}
            initial={{ opacity: 0, x: -50 }}
            animate={textInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:w-1/2 space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-belinda font-bold text-orange-400">
              Celebrate in Style
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our beautifully crafted mandapas blend tradition with elegance to
              create the perfect sacred space for your union. Discover luxurious
              designs, intricate details, and a serene ambiance that turns your
              wedding dreams into reality.
            </p>
            <button className="bg-wedding-orange text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-wedding-orange-hover transition">
              Explore Mandapas
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={textInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:w-1/2 space-y-6"
          >
            <img
              src="/images/mandapas_2.png"
              alt="Decor sample"
              className="scale-75 rounded-xl shadow-card shadow-black/50"
            />
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="flex flex-col items-center justify-center pt-2 md:p-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-belinda font-bold mb-4"
        >
          Our Themes
        </motion.h1>
        <p className="text-muted-foreground max-w-2xl mb-12">
          A glimpse into the beauty and soul of our handcrafted wedding
          mandapas, captured in timeless moments.
        </p>

        {/* Dynamically fetched images from Drive */}
        <DriveGallery />
      </section>

      {/* Subscription Section with Blur Effect */}

      <section className="relative bg-opacity-40 -top-[16vh] h-[40vh] bg-black py-12 w-full overflow-hidden">
        <div className="absolute  inset-0 bg-gradient-to-b from-transparent to-white backdrop-blur-[2px] sm:backdrop-blur-[5px] md:backdrop-blur-[10px] lg:backdrop-blur-[20px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex-col items-center justify-center mb-4">
            <DynamicIcons name="lock" color="black" size="2x" />
            <h2 className="text-3xl font-semibold text-gray-800 m-4">
              Want to see more themes?
            </h2>
          </div>
          <p className="text-lg text-center font-belinda mb-6  text-gray-800">
            Subscribe at just <span className="text-3xl text-black ">₹49</span>{" "}
            to get access to exclusive designs and more beautiful themes.
          </p>

          <div className="flex justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="p-3 w-80 rounded-l-full text-gray-700 border border-gray-300"
            />
            <button
              onClick={() =>
                (window.location.href = "https://rzp.io/rzp/lD2ZdNA")
              }
              className="bg-wedding-orange text-white px-6 py-3 rounded-r-full font-semibold hover:bg-wedding-orange-hover transition"
            >
              Subscribe
            </button>

            {/* <RazorpayButton /> */}
          </div>
        </div>
      </section>

      {/* Payment Modal */}
    </div>
  );
}
