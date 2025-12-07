import { cn } from '@/lib/utils';
import { AppointmentStatus } from '@/types/database';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  BOOKED: { label: 'Booked', className: 'status-booked' },
  COMPLETED: { label: 'Completed', className: 'status-completed' },
  CANCELLED: { label: 'Cancelled', className: 'status-cancelled' },
  NO_SHOW: { label: 'No Show', className: 'status-noshow' },
  RESCHEDULED: { label: 'Rescheduled', className: 'status-rescheduled' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
