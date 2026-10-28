import React, { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import pithlaBhakriImg from './images/mess_pithla_bhakri_1793214332416.jpg';
import kolhapuriThaliImg from './images/mess_kolhapuri_thali_1793214334703.jpg';
import akkhaMasoorImg from './images/mess_akkha_masoor_1793214336359.jpg';
import varanBhatImg from './images/mess_varan_bhat_1793214336844.jpg';
import sundayFeastImg from './images/mess_sunday_feast_1793214338130.jpg';

const IMAGE_MAP: Record<string, string> = {
  pithla_bhakri: pithlaBhakriImg,
  kolhapuri_thali: kolhapuriThaliImg,
  akkha_masoor: akkhaMasoorImg,
  varan_bhat: varanBhatImg,
  sunday_feast: sundayFeastImg,
};

export function resolveMessImage(imageKey: string, customImageUrl?: string | null): string {
  if (customImageUrl && customImageUrl.trim().length > 0) {
    return customImageUrl;
  }
  return IMAGE_MAP[imageKey] || pithlaBhakriImg;
}

interface MessImageProps {
  imageKey: string;
  customImageUrl?: string | null;
  alt: string;
  className?: string;
}

export const MessImage: React.FC<MessImageProps> = ({
  imageKey,
  customImageUrl,
  alt,
  className = 'w-full h-full object-cover',
}) => {
  const [hasError, setHasError] = useState(false);
  const src = resolveMessImage(imageKey, customImageUrl);

  if (hasError || !src) {
    return (
      <div className="w-full h-full bg-[#191919] flex flex-col items-center justify-center p-4 text-center">
        <UtensilsCrossed className="w-8 h-8 text-[#FFD400] mb-2" />
        <span className="text-xs font-medium text-[#FFF4E3]/80 line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
