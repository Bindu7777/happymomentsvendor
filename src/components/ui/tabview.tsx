import React, { useState } from "react";
import styled from "styled-components";
import PhotoGallery from "./photo-gallery";
import { motion, AnimatePresence } from "framer-motion";
import ReviewSection from "./reviews";
interface RadioTabsProps {
  videos: Array<string>;
}
const RadioTabs: React.FC<RadioTabsProps> = ({ videos }) => {
  // Removed duplicate declaration of videos
  const [selectedTab, setSelectedTab] = useState("PORTFOLIO");

  return (
    <StyledWrapper>
      {/* Radio Tabs */}
      <div className="radio-inputs" role="radiogroup">
        {["PORTFOLIO", "REVIEWS"].map((tab) => (
          <label key={tab} className="radio">
            <input
              type="radio"
              name="radio"
              checked={selectedTab === tab}
              onChange={() => setSelectedTab(tab)}
              aria-label={tab}
            />
            <span className="name ">{tab}</span>
          </label>
        ))}
      </div>

      {/* Animated Tab Content */}
      {/* <div className="tab-content-container"> */}
      <AnimatePresence mode="wait">
        {selectedTab === "PORTFOLIO" && (
          <motion.div
            key="PORTFOLIO"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <PhotoGallery media={videos} />
          </motion.div>
        )}

        {selectedTab === "REVIEWS" && (
          <motion.div
            key="REVIEWS"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <ReviewsContent />
          </motion.div>
        )}
      </AnimatePresence>
      {/* </div> */}
    </StyledWrapper>
  );
};

const ReviewsContent = () => (
  <div className="content">
    <ReviewSection />
  </div>
);

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;

  .radio-inputs {
    display: flex;
    border-radius: 0.5rem;
    background-color: #f58700;
    padding: 0.25rem;
    margin: 0.25rem 0 2rem 0;
    width: 300px;
    font-size: 14px;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  }

  .radio {
    flex: 1;
    text-align: center;
  }

  .radio input {
    display: none;
  }

  .radio .name {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    padding: 0.5rem 0;
    color: #ffffff;
    font-weight:bold;
    font-size: 17px;
    letter-spacing:0.2;
    
    transition: all 0.4s ease-in-out;
  }

  .radio input:checked + .name {
    background-color: #fff;
    color: #374151;
    font-weight: 600;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }

  .radio .name:hover {
    background-color: rgba(255, 255, 255, 0.6);
  }

  .tab-content-container {
    width: 100%;
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    background: #fff;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    min-height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    position: relative;
  }
`;

export default RadioTabs;
