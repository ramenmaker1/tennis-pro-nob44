import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-emerald-200 bg-emerald-100 text-emerald-700',
        warning: 'border-yellow-200 bg-yellow-100 text-yellow-700',
        info: 'border-slate-200 bg-slate-100 text-slate-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

/**
 * @typedef {'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'} BadgeVariant
 */

/**
 * @typedef {Object} BadgeProps
 * @property {string} [className]
 * @property {BadgeVariant} [variant]
 * @property {React.ReactNode} [children]
 */

/**
 * @type {React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLDivElement>>}
 */
const Badge = React.forwardRef(({ className, variant = 'default', children, ...rest }, ref) => {
  return (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...rest}>
      {children}
    </div>
  );
});
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
