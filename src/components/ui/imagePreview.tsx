import axios from 'axios';
import { useState, useEffect } from 'react';

export const ImagePreview = ({ imageUrl }: { imageUrl: string }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (imageUrl) {
      // Fetch the image from Google Drive using Axios
      const fetchImage = async () => {
        try {
          const response = await axios.get(imageUrl, { responseType: 'blob' });
          const objectURL = URL.createObjectURL(response.data);
          setImageSrc(objectURL);
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      };

      fetchImage();
    }
  }, [imageUrl]);

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {imageSrc && (
        <img
          src={imageSrc}
          alt="Image preview"
          className="w-40 h-40 object-cover rounded"
        />
      )}
    </div>
  );
};
