import DynamicIcon from "@/components/dynamic-icons";
import axios from "axios";
import React, { useEffect } from "react";

export default function BeautyVendor() {
  const services = [
    "Serice 1",
    "Serice 1",
    "Serice 1",
    "Serice 1",
    "Serice 1",
    "Serice 1",
    "Serice 1",
    "Serice 1",
  ];

  useEffect(() => {
    
  
    return () => {
      axios.get('https://www.instagram.com/p/DL7WU0wT6_h/').then((value)=>{
        console.log("value",value)
      })
    }
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-tl from-[#f1d8d8] via-[#b97a7a] to-[#c68a8a] flex items-center justify-center font-volte">
      <div className="flex flex-col items-center justify-center">
        <div className="flex justify-center items-center">
          <div className="rounded-[2.4rem] bg-white opacity-50 backdrop-blur-3xl h-[70vh] w-[24vw]"></div>
          <span className="w-24"></span>
          <div className="flex flex-col">
            <div className="text-5xl font-semibold text-wrap text-violet-200">
              Telugu Ammayi make overs
            </div>
            <div className="text-md font-black text-black">
              SERVICES AVAILABLE
            </div>
            <div className="flex flex-wrap gap-2 w-[40vw] mt-1 mb-4">
              {services.map((element, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg px-6 py-2 text-black font-semibold"
                >
                  {element}
                </div>
              ))}
            </div>
            <div className="text-lg font-black text-black/100">
              PRICES STARTING FROM
            </div>
            <div className="text-3xl font-black text-black mb-3">₹ 599</div>
            <div className="text-lg font-black text-black">HIGHLIGHTS</div>
            <div className="flex justify-start">
              <div className="rounded-3xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg h-[18vh] w-[8vw] flex flex-col justify-center items-center mr-4 gap-1">
                <div className="text-2xl font-bold text-black">8+</div>
                <div className="text-sm text-black">Years Experience</div>
              </div>
              <div className="rounded-3xl bg-white/30 backdrop-blur-lg border border-white/40 shadow-lg h-[18vh] w-[8vw] flex flex-col justify-center items-center mr-4">
                <div className="text-2xl font-bold text-black">100+</div>
                <div className="text-sm text-black">Bride Makeup</div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-[48vw] pt-9  pb-4 text-md font-medium italic text-black mt-6 justify-center rounded-2xl backdrop-blur-lg bg-white/30 border border-white/40 shadow-lg">
          <div className="px-4">
            I am a dedicated makeup artist with over 8 years of experience,
            specializing in bridal and event makeovers. My passion is to enhance
            natural beauty and help every client feel confident, radiant, and
            ready for their most memorable occasions.
          </div>
          <div className="absolute top-0 px-2 py-1  rounded-br-2xl rounded-tl-2xl bg-black/85 text-white font-semibold">
            Artist Words
          </div>
        </div>
      </div>
    </div>
  );
}
