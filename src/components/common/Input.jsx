import { cn } from '@utils/cn';
import { forwardRef } from 'react';

const Input = forwardRef(
  ({ label, error, type = 'text', className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('w-full', containerClassName)}>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors bg-white border border-gray-300 text-gray-900 placeholder-gray-500',
            error ? 'ring-1 ring-red-500' : '',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
