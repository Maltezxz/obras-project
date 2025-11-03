import { useFerramentaImage } from '../hooks/useFerramentaImage';
import { Wrench } from 'lucide-react';

interface FerramentaImageProps {
  ferramentaId: string;
  alt: string;
  className?: string;
}

export function FerramentaImage({ ferramentaId, alt, className = '' }: FerramentaImageProps) {
  const { imageUrl, loading } = useFerramentaImage(ferramentaId);

  if (loading) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="animate-pulse">
          <Wrench className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <Wrench className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
