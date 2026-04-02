import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Crop as CropIcon, Play } from 'lucide-react';

interface CropZoneProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  isProcessing: boolean;
}

export const CropZone: React.FC<CropZoneProps> = ({ imageSrc, onCropComplete, isProcessing }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
      
      const base64Image = canvas.toDataURL('image/jpeg');
      onCropComplete(base64Image);
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div style={{ position: 'relative', width: '100%', minHeight: '300px' }}>
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
        >
          <img
            ref={imgRef}
            alt="Upload"
            src={imageSrc}
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>
      
      <div className="crop-controls">
        <button 
          onClick={getCroppedImg} 
          disabled={isProcessing || !completedCrop}
          className="btn-primary"
          style={{ padding: '0.8rem 2rem' }}
        >
          {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
          {isProcessing ? 'Recognition...' : 'Scan Selected Area'}
        </button>
      </div>
      
      <p style={{ 
        textAlign: 'center', 
        color: 'var(--text-muted)', 
        fontSize: '0.85rem', 
        marginTop: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <CropIcon size={14} />
        Adjust the box to select text region
      </p>
    </div>
  );
};

// Helper for loading icon if needed
import { Loader2 } from 'lucide-react';
