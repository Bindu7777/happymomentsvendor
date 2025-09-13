import React from "react";

export default function CustomLayoutBox() {
  return (
    <div className="relative w-full h-screen bg-neutral-900 flex items-center justify-center">
      {/* Wrapper Container */}
      <div className="relative w-[300px] h-[180px]">

        {/* Small Top Box */}
        <div className="absolute top-0 left-0 w-[120px] h-[80px] bg-gray-300 rounded-xl z-10 shadow-md" />

        {/* Big L-Shaped Box */}
        <div className="absolute top-[40px] left-[40px] w-[260px] h-[140px] bg-gray-300 rounded-2xl z-0 shadow-md" />
        
      </div>
    </div>
  );
}
