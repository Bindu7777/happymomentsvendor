import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/youtube";

interface PhotoGalleryProps {
  media: string[];
}

const isYouTubeUrl = (url: string) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url);

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ media }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const playerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoverTimeouts = useRef<{ [key: number]: NodeJS.Timeout }>({});

  const handleInteraction = (index: number) => setActiveIndex(index);
  const clearInteraction = () => setActiveIndex(null);

  const shareMedia = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check this out!",
          text: "Check out this media",
          url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert("Sharing is not supported in this browser.");
    }
  };

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    const observers: IntersectionObserver[] = [];
    const currentRefs = [...playerRefs.current];

    currentRefs.forEach((ref, index) => {
      if (!ref) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting && activeIndex === index) {
            setActiveIndex(null);
          }
        },
        { threshold: 0.25 }
      );
      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer, i) => {
        if (currentRefs[i]) observer.unobserve(currentRefs[i]!);
      });
    };
  }, [media, activeIndex]);

  return (
    <div className="flex flex-wrap gap-6 justify-center p-4 ">
      
      {media?.map((src, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.03 }}
          className="overflow-hidden rounded-2xl shadow-md bg-gray-900/55 border border-orange-400 relative hover:border-white flex justify-center items-center hover:shadow-sm hover:shadow-blue-600"
        >
          <div
            ref={(el) => (playerRefs.current[index] = el)}
            onMouseEnter={() => {
              setActiveIndex(null);
              if (window.innerWidth > 768) {
                hoverTimeouts.current[index] = setTimeout(() => {
                  setActiveIndex(index);
                }, 1000);
              }
            }}
            onMouseLeave={() => {
              clearTimeout(hoverTimeouts.current[index]);
              // Pause video when mouse leaves
              if (window.innerWidth > 768) {
                setActiveIndex(null);
              }
            }}
            onClick={() => {
              if (window.innerWidth <= 768) {
                setActiveIndex((prev) => (prev === index ? null : index));
              }
            }}
            className="w-[90vw] sm:w-[24rem] h-[70vw] sm:h-[24rem] rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center"
          >
            {isYouTubeUrl(src) ? (
              <ReactPlayer
                url={src}
                playing={activeIndex === index}
                muted={false}
                loop={true}
                onBuffer={() => <div>Loading...</div>}
                controls={true}
                width="100%"
                height="100%"
                onPlay={() => handleInteraction(index)}
                config={{
                  playerVars: {
                    rel: 0, // Don't show related videos at the end
                    controls: 1, // Show player controls
                    fs: 0, // Hide fullscreen button
                    iv_load_policy: 3, // Hide annotations
                    cc_load_policy: 0, // Hide closed captions
                    modestbranding: 0, // Hide YouTube logo
                    showinfo: 0,
                  },
                }}
              />
            ) : (
              <motion.img
                src={src}
                alt={`media-${index}`}
                className="object-cover w-full h-full"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                draggable={false}
              />
            )}
          </div>
          <button
            onClick={() => shareMedia(src)}
            className="absolute top-2 right-2 bg-black/80 rounded-full flex items-center justify-center p-2 shadow-lg hover:bg-orange-400 hover:border-black border-white"
          >
            <i
              className="pi pi-share-alt"
              style={{ fontSize: "1em", color: "white" }}
            ></i>
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default PhotoGallery;