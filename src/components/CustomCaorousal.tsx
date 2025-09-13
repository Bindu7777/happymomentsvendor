import React, { useState } from "react";
import { Carousel } from "primereact/carousel";
import { Dialog } from "primereact/dialog";
import DynamicIcon from "./dynamic-icons";

export default function CustomCarousel({ images = [] }) {
  const responsiveOptions = [
    { breakpoint: "1400px", numVisible: 2, numScroll: 1 },
    { breakpoint: "1199px", numVisible: 3, numScroll: 1 },
    { breakpoint: "767px", numVisible: 2, numScroll: 1 },
    { breakpoint: "575px", numVisible: 1, numScroll: 1 },
  ];

  const [visible, setVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpenDialog = (media) => {
    setSelectedImage(media);
    setVisible(true);
  };

  const handleCloseDialog = () => {
    setVisible(false);
    setSelectedImage(null);
  };

  const mediaTemplate = (media) => {
    return (
      <div className="p-2 flex justify-center w-full h-[48vh]">
        <div className="relative group w-full h-full">
          <img
            key={media.id}
            className="w-full h-full object-cover rounded-lg"
            src={`https://lh3.googleusercontent.com/d/${media.id}=s800`}
            alt={media.name}
          />

          <button
            onClick={() => handleOpenDialog(media)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-600 border border-white rounded-full px-2 py-1 bg-black/50"
          >
            <DynamicIcon name="max" size="1x" color="white" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Carousel
        value={images}
        numScroll={1}
        numVisible={3}
        responsiveOptions={responsiveOptions}
        itemTemplate={mediaTemplate}
        circular
        autoplayInterval={4000}
      />

      <Dialog
        visible={visible}
        onHide={handleCloseDialog}
        closable={false}
        // dismissableMask
        headerStyle={{ display: "none" }}
        modal
        className="custom-dialog"
      
        contentStyle={{
          padding: 0,
          background: "transparent",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="relative w-full  flex justify-center items-center">
          <button
            onClick={handleCloseDialog}
            className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-black px-2.5 py-1 rounded-full"
          >
            <DynamicIcon name="cross" size="1x" color="white" />
          </button>

          {selectedImage && (
            <img
              src={`https://lh3.googleusercontent.com/d/${selectedImage.id}=s2000`}
              alt={selectedImage.name}
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-lg"
            />
          )}
        </div>
      </Dialog>

      {/* Background blur when dialog is open */}
      {visible && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"></div>
      )}
    </div>
  );
}
