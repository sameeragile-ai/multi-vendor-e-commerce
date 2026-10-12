import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: number;
  showText?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  size = 14,
  showText = true,
}) => {
  return (
    <div className="flex items-center gap-1.5 select-none">
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              rating >= star
                ? 'fill-amber-400 text-amber-500'
                : rating >= star - 0.5
                ? 'fill-amber-400/50 text-amber-500'
                : 'text-stone-300'
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className="text-xs font-semibold text-stone-800">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-stone-500">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
};
