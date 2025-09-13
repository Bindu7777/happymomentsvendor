import { useEffect } from "react";

const InstagramEmbeded = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute("src", "https://www.instagram.com/embed.js");
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const embedHTML = `
    <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DINNroLhaYN/" data-instgrm-version="14" style="margin:auto;"></blockquote>
  `;

  return <div dangerouslySetInnerHTML={{ __html: embedHTML }} />;
};

export default InstagramEmbeded;
