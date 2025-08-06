import React, { useCallback, useEffect, useState } from "react";
import { Button, Frame } from "react95";

interface ImageDisplayProps {
  src: string;
  collectionItemName: string;
  tokenId: number | string;
  templateId: number;
}

const FLUNKS_BACKGROUND = `data:image/svg+xml,<svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='memphisPattern' patternUnits='userSpaceOnUse' width='120' height='120' patternTransform='scale(1)'><rect x='0' y='0' width='120' height='120' fill='%23000000'/><path d='M10 20 Q 15 10, 25 20 T 40 25' stroke='%23cc44cc' stroke-width='3' fill='none'/><path d='M60 15 Q 70 5, 80 15 T 100 20' stroke='%2344cccc' stroke-width='3' fill='none'/><path d='M20 60 Q 30 50, 40 60 T 60 65' stroke='%23cccc44' stroke-width='3' fill='none'/><path d='M80 80 Q 90 70, 100 80 T 115 85' stroke='%23cc7744' stroke-width='3' fill='none'/><path d='M5 100 Q 15 90, 25 100 T 45 105' stroke='%2344cc44' stroke-width='3' fill='none'/><circle cx='15' cy='35' r='4' fill='%23aa33aa'/><circle cx='85' cy='25' r='3' fill='%2333aaaa'/><circle cx='45' cy='85' r='5' fill='%23aaaa33'/><circle cx='105' cy='55' r='4' fill='%23aa6633'/><circle cx='25' cy='75' r='3' fill='%2333aa33'/><rect x='50' y='40' width='8' height='2' fill='%23aa33aa' transform='rotate(25 54 41)'/><rect x='70' y='60' width='10' height='2' fill='%2333aaaa' transform='rotate(-15 75 61)'/><rect x='30' y='30' width='6' height='2' fill='%23aaaa33' transform='rotate(45 33 31)'/><rect x='90' y='90' width='8' height='2' fill='%23aa6633' transform='rotate(-30 94 91)'/><rect x='10' y='80' width='7' height='2' fill='%2333aa33' transform='rotate(60 13.5 81)'/><path d='M70 30 L 75 25 L 80 30 L 75 35 Z' fill='%23882288'/><path d='M35 50 L 40 45 L 45 50 L 40 55 Z' fill='%23228888'/><path d='M95 70 L 100 65 L 105 70 L 100 75 Z' fill='%23888822'/><path d='M15 55 L 20 50 L 25 55 L 20 60 Z' fill='%23885522'/><path d='M55 75 L 60 70 L 65 75 L 60 80 Z' fill='%23228822'/><path d='M85 45 Q 90 40, 95 45 Q 90 50, 85 45' fill='%23772277'/><path d='M25 95 Q 30 90, 35 95 Q 30 100, 25 95' fill='%23227777'/><path d='M65 15 Q 70 10, 75 15 Q 70 20, 65 15' fill='%23777722'/><path d='M45 35 Q 50 30, 55 35 Q 50 40, 45 35' fill='%23774422'/><path d='M5 45 Q 10 40, 15 45 Q 10 50, 5 45' fill='%23227722'/><polygon points='105,105 110,100 115,105 110,110' fill='%23661166'/><polygon points='5,25 10,20 15,25 10,30' fill='%23116666'/><polygon points='75,95 80,90 85,95 80,100' fill='%23666611'/><polygon points='35,15 40,10 45,15 40,20' fill='%23663311'/><polygon points='55,55 60,50 65,55 60,60' fill='%23116611'/></pattern></defs><rect width='100%' height='100%' fill='url(%23memphisPattern)'/></svg>`;
const BACKPACK_BACKGROUND = `data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='45.88' height='100' patternTransform='scale(4) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0, 0%, 100%, 0)'/><path d='M-.51 13.99a7.7 7.7 0 0 0-5.37 2.15l-6.1 5.9-1.94 1.88-5.72 5.53c-.11.1-.24.19-.36.28v5.58A7.5 7.5 0 0 0-18.08 34l8.04-7.78 5.72-5.53a5.52 5.52 0 0 1 7.62 0l5.7 5.5-.03.03.02.02 1.95 1.88L17.02 34a7.77 7.77 0 0 0 10.73 0l6.1-5.9 1.95-1.88 5.72-5.53a5.52 5.52 0 0 1 7.61 0l5.72 5.53 1.94 1.88 6.1 5.9c.87.84 1.9 1.4 2.99 1.75V30.4c-.51-.25-1-.55-1.43-.96l-5.71-5.53-1.95-1.88-6.1-5.9a7.77 7.77 0 0 0-10.73 0l-6.1 5.9-1.95 1.88-5.71 5.53a5.52 5.52 0 0 1-7.62 0l-5.7-5.51.02-.02-.02-.02-1.94-1.88-6.08-5.88a7.7 7.7 0 0 0-5.37-2.15zm0 62.32a7.7 7.7 0 0 0-5.37 2.15l-6.1 5.9-1.94 1.89-5.72 5.53c-.11.1-.24.19-.36.28v5.58a7.5 7.5 0 0 0 1.92-1.31l8.04-7.78 5.72-5.53a5.52 5.52 0 0 1 7.62 0l5.7 5.5-.03.03.02.02 1.95 1.88 6.08 5.88a7.77 7.77 0 0 0 10.73 0l6.1-5.9 1.95-1.88 5.72-5.53a5.52 5.52 0 0 1 7.61 0l5.72 5.53 1.94 1.88 6.1 5.9c.87.84 1.9 1.4 2.99 1.75v-5.34c-.51-.24-1-.55-1.43-.96l-5.71-5.53-1.95-1.88-6.1-5.9a7.77 7.77 0 0 0-10.73 0l-6.1 5.9-1.95 1.88-5.71 5.53a5.52 5.52 0 0 1-7.62 0l-5.7-5.51.02-.02-.02-.02-1.94-1.88-6.08-5.89a7.7 7.7 0 0 0-5.37-2.15z'  stroke-width='1' stroke='none' fill='hsla(259, 0%, 100%, 0.51)'/><path d='M-.51 1.52a7.7 7.7 0 0 0-5.37 2.15l-6.1 5.9-1.94 1.89-5.72 5.52-.36.29v5.58a7.5 7.5 0 0 0 1.92-1.31l8.04-7.79 5.72-5.53a5.52 5.52 0 0 1 7.62 0L9 13.73l-.03.02.02.02 1.95 1.88 6.08 5.89a7.77 7.77 0 0 0 10.73 0l6.1-5.9 1.95-1.89 5.72-5.53a5.52 5.52 0 0 1 7.61 0l5.72 5.53 1.94 1.88 6.1 5.9c.87.84 1.9 1.4 2.99 1.75v-5.34c-.51-.24-1-.55-1.43-.96l-5.71-5.52-1.95-1.89-6.1-5.9a7.77 7.77 0 0 0-10.73 0l-6.1 5.9-1.95 1.89-5.71 5.52a5.52 5.52 0 0 1-7.62 0l-5.7-5.5.02-.02-.02-.03-1.94-1.88-6.08-5.88A7.7 7.7 0 0 0-.51 1.52zm0 37.4a7.7 7.7 0 0 0-5.37 2.15l-6.1 5.9-1.94 1.88-5.72 5.53c-.11.1-.24.19-.36.28v5.58a7.5 7.5 0 0 0 1.92-1.3l8.04-7.8 5.72-5.52a5.52 5.52 0 0 1 7.62 0l5.7 5.5-.03.03.02.02 1.95 1.88 6.08 5.88a7.77 7.77 0 0 0 10.73 0l6.1-5.9 1.95-1.88 5.72-5.53a5.52 5.52 0 0 1 7.61 0l5.72 5.53 1.94 1.88 6.1 5.9c.87.84 1.9 1.4 2.99 1.75v-5.34c-.51-.24-1-.55-1.43-.96l-5.71-5.53-1.95-1.88-6.1-5.9a7.77 7.77 0 0 0-10.73 0l-6.1 5.9-1.95 1.88-5.71 5.53a5.52 5.52 0 0 1-7.62 0l-5.7-5.5.02-.03-.02-.02-1.94-1.88-6.08-5.88a7.7 7.7 0 0 0-5.37-2.15zm0 24.93A7.7 7.7 0 0 0-5.88 66l-6.1 5.9-1.94 1.89-5.72 5.52-.36.29v5.57a7.5 7.5 0 0 0 1.92-1.3l8.04-7.79 5.72-5.53a5.52 5.52 0 0 1 7.62 0L9 76.06l-.03.02.02.02 1.95 1.88 6.08 5.88a7.77 7.77 0 0 0 10.73 0l6.1-5.9 1.95-1.88 5.72-5.53a5.52 5.52 0 0 1 7.61 0l5.72 5.53 1.94 1.88 6.1 5.9c.87.84 1.9 1.4 2.99 1.75v-5.34c-.51-.24-1-.55-1.43-.96l-5.71-5.52-1.95-1.89-6.1-5.9a7.77 7.77 0 0 0-10.73 0l-6.1 5.9-1.95 1.89-5.71 5.52a5.52 5.52 0 0 1-7.62 0l-5.7-5.5.02-.02-.02-.03-1.94-1.88L4.86 66a7.7 7.7 0 0 0-5.37-2.15z'  stroke-width='1' stroke='none' fill='hsla(259, 0%, 100%, 0.51)'/><path d='M-.51-10.95A7.7 7.7 0 0 0-5.88-8.8l-6.1 5.9L-13.92-1l-5.72 5.53c-.11.1-.24.18-.36.28v5.58a7.5 7.5 0 0 0 1.92-1.31l8.04-7.78 5.72-5.53a5.52 5.52 0 0 1 7.62 0L9 1.26l-.03.03.02.01 1.95 1.89 6.08 5.88a7.77 7.77 0 0 0 10.73 0l6.1-5.9 1.95-1.88 5.72-5.53a5.52 5.52 0 0 1 7.61 0l5.72 5.53 1.94 1.88 6.1 5.9c.87.83 1.9 1.4 2.99 1.74V5.48c-.51-.25-1-.55-1.43-.96l-5.71-5.53-1.95-1.88-6.1-5.9a7.77 7.77 0 0 0-10.73 0l-6.1 5.9-1.95 1.88-5.71 5.53a5.52 5.52 0 0 1-7.62 0L12.88-1l.02-.02-.02-.02-1.94-1.88L4.86-8.8a7.7 7.7 0 0 0-5.37-2.15zm0 37.4a7.7 7.7 0 0 0-5.37 2.15l-6.1 5.9-1.94 1.89-5.72 5.52c-.11.11-.24.2-.36.29v5.58a7.5 7.5 0 0 0 1.92-1.31l8.04-7.79 5.72-5.53a5.52 5.52 0 0 1 7.62 0L9 38.66l-.03.02.02.02 1.95 1.88 6.08 5.89a7.77 7.77 0 0 0 10.73 0l6.1-5.9 1.95-1.89 5.72-5.53a5.52 5.52 0 0 1 7.61 0l5.72 5.53 1.94 1.88 6.1 5.9c.87.84 1.9 1.4 2.99 1.75v-5.33c-.51-.25-1-.55-1.43-.97l-5.71-5.52-1.95-1.89-6.1-5.9a7.77 7.77 0 0 0-10.73 0l-6.1 5.9-1.95 1.89-5.71 5.52a5.52 5.52 0 0 1-7.62 0l-5.7-5.5.02-.02-.02-.02-1.94-1.88-6.08-5.89a7.7 7.7 0 0 0-5.37-2.15zm0 24.93a7.7 7.7 0 0 0-5.37 2.15l-6.1 5.9-1.94 1.89-5.72 5.53c-.11.1-.24.18-.36.28v5.58a7.5 7.5 0 0 0 1.92-1.31l8.04-7.78 5.72-5.53a5.52 5.52 0 0 1 7.62 0l5.7 5.5-.03.03.02.01 1.95 1.89 6.08 5.88a7.77 7.77 0 0 0 10.73 0l6.1-5.9 1.95-1.88 5.72-5.53a5.52 5.52 0 0 1 7.61 0l5.72 5.53 1.94 1.88 6.1 5.9c.87.83 1.9 1.4 2.99 1.74v-5.33c-.51-.25-1-.55-1.43-.96l-5.71-5.53-1.95-1.88-6.1-5.9a7.77 7.77 0 0 0-10.73 0l-6.1 5.9-1.95 1.88-5.71 5.53a5.52 5.52 0 0 1-7.62 0l-5.7-5.51.02-.02-.02-.02-1.94-1.88-6.08-5.89a7.7 7.7 0 0 0-5.37-2.15zm0 37.4a7.7 7.7 0 0 0-5.37 2.15l-6.1 5.9-1.94 1.89-5.72 5.52c-.11.11-.24.19-.36.29v5.58a7.5 7.5 0 0 0 1.92-1.31l8.04-7.79 5.72-5.53a5.52 5.52 0 0 1 7.62 0L9 101l-.03.02.02.02 1.95 1.88 6.08 5.89a7.77 7.77 0 0 0 10.73 0l6.1-5.9L35.8 101l5.72-5.53a5.52 5.52 0 0 1 7.61 0l5.72 5.53 1.94 1.88 6.1 5.9c.87.84 1.9 1.4 2.99 1.75v-5.33c-.51-.25-1-.56-1.43-.97l-5.71-5.52-1.95-1.89-6.1-5.9a7.77 7.77 0 0 0-10.73 0l-6.1 5.9-1.95 1.89-5.71 5.52a5.52 5.52 0 0 1-7.62 0l-5.7-5.5.02-.02-.02-.02-1.94-1.88-6.08-5.89a7.7 7.7 0 0 0-5.37-2.15z'  stroke-width='1' stroke='none' fill='hsla(259, 0%, 100%, 0.51)'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>`;

const ImageDisplay: React.FC<ImageDisplayProps> = React.memo(({
  src,
  collectionItemName,
  tokenId,
  templateId,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    console.warn(`Failed to load image: ${src}`);
  }, [src]);
  return (
    <Frame
      className="!w-full h-auto p-4 !flex !items-center !justify-center !flex-col"
      style={{
        backgroundBlendMode: "overlay",
        backgroundImage: `url("${
          collectionItemName === "Backpack"
            ? BACKPACK_BACKGROUND
            : FLUNKS_BACKGROUND
        }")`,
      }}
    >
      <div className="flex flex-col">
        <Frame className="w-auto h-auto !flex flex-col relative min-w-full min-h-full max-w-[250px] lg:max-w-[500px] p-2">
          <Frame variant="well">
            <img 
              src={src} 
              className="w-full h-full flex-shrink" 
              loading="lazy"
              decoding="async"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                willChange: 'transform',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            />
          </Frame>
          <Frame
            variant="well"
            className="w-full !mb-0 !flex !items-center mt-1"
          >
            <Frame variant="field" className="w-full px-3 py-2">
              <span className="text-lg lg:text-2xl tracking-widest font-bold">
                {collectionItemName}
              </span>
            </Frame>

            <Frame
              variant="field"
              className="!w-auto !mr-auto !flex !flex-grow-0 px-3 py-2"
            >
              <span className="text-lg lg:text-2xl font-bold tracking-wide">
                #{templateId}
              </span>
            </Frame>
          </Frame>
        </Frame>
      </div>
    </Frame>
  );
});

export default ImageDisplay;
