import Header from '@/components/layout/Header';
import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../excel.json';
import DynamicIcon from '@/components/dynamic-icons';

const GuestTracker = () => {
  const guestCount = 120; // Replace with real data as needed
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/Guest_Tracking_Sheet.xlsx"; // Make sure this file is in your /public folder
    link.setAttribute("download", "guests.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-100 px-6">
        <Header/>
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Left Content */}
        <div>
          <h1 className="text-4xl text-gray-900 mb-4 font-baloo">
            Manage Guests <br />Effortlessly
          </h1>
          <p className="text-lg   mb-6  text-gray-800">
            Download your Excel guest list in one click and stay organized. Perfect for event planning with real-time updates.
          </p>
          <button
            onClick={handleDownload}
            className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-xl text-lg shadow-lg transition flex-row flex justify-center items-center gap-2"
          > <DynamicIcon name={'download'} size={'sm'} color={'white'} />
             Download Excel Sheet
          </button>
        </div>

        {/* Right Image */}
        <div className="flex justify-center">
        <div className=" mx-auto">
      <Lottie animationData={animationData} loop={true} />
    </div>
        </div>
      </div>
    </div>
  );

};

export default GuestTracker;
