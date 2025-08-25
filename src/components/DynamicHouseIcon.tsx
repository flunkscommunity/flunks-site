import React from 'react';
import { useHouseImage } from '../utils/dayNightHouses';
import styles from '../styles/map.module.css';

interface DynamicHouseIconProps {
  houseId: string;
  className: string;
  onDoubleClick?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  children?: React.ReactNode;
}

export function DynamicHouseIcon({
  houseId,
  className,
  onDoubleClick,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  children
}: DynamicHouseIconProps) {
  const { imageUrl, isLoading, isDay } = useHouseImage(houseId, 30000); // Update every 30 seconds

  // If no dynamic image available, fall back to regular styling
  if (isLoading || !imageUrl) {
    return (
      <div
        className={className}
        onDoubleClick={onDoubleClick}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`${className} ${styles['dynamic-house']}`}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {children}
    </div>
  );
}
