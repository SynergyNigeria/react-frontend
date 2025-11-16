import { cn } from '@utils/cn';

const Card = ({ children, className, hover = false, onClick, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-card overflow-hidden',
        hover && 'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
