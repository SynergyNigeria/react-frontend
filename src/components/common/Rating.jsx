import { Star } from 'lucide-react';
import { cn } from '@utils/cn';

const Rating = ({ value, max = 5, size = 'sm', showValue = true, onChange }) => {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const isInteractive = typeof onChange === 'function';

  const handleClick = (rating) => {
    if (isInteractive) {
      onChange(rating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(max)].map((_, index) => {
          const rating = index + 1;
          const isFilled = rating <= value;

          return (
            <Star
              key={index}
              className={cn(
                sizes[size],
                isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-white/30',
                isInteractive && 'cursor-pointer hover:scale-110 transition-transform'
              )}
              onClick={() => handleClick(rating)}
            />
          );
        })}
      </div>
      {showValue && <span className="text-sm text-white/70 ml-1">{value.toFixed(1)}</span>}
    </div>
  );
};

export default Rating;
