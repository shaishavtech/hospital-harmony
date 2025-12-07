// Database types matching the exact schema provided

export type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'MANAGER';

export interface User {
  user_id: number;
  username: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at_ist: string;
  last_login_at_ist: string | null;
}

export interface Department {
  department_id: number;
  name: string;
}

export interface Doctor {
  doctor_id: number;
  full_name: string;
  department_id: number;
  specialty: string;
  photo_url: string | null;
  consultation_fee: number;
  is_active: boolean;
  created_at_ist: string;
  department?: Department;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';

export interface Patient {
  patient_id: number;
  full_name: string;
  mobile_number: string;
  whatsapp_opt_in: boolean;
  date_of_birth: string | null;
  gender: Gender;
  created_at_ist: string;
}

export interface DoctorSlot {
  slot_id: number;
  doctor_id: number;
  weekday: number; // 1=Mon, 7=Sun
  start_time: string;
  end_time: string;
  max_patients: number;
  is_active: boolean;
  created_at_ist: string;
  updated_at_ist: string | null;
}

export interface DoctorSlotException {
  exception_id: number;
  doctor_id: number;
  date_ist: string;
  is_available: boolean;
  reason: string | null;
  created_at_ist: string;
}

export type AppointmentStatus = 'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
export type AppointmentSource = 'WHATSAPP' | 'FRONTDESK' | 'PHONE_CALL' | 'OTHER';

export interface Appointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  slot_id: number | null;
  appointment_datetime_ist: string;
  status: AppointmentStatus;
  cancellation_reason: string | null;
  reschedule_reason: string | null;
  parent_appointment_id: number | null;
  followup_of_appointment_id: number | null;
  source: AppointmentSource;
  created_by_user_id: number | null;
  created_at_ist: string;
  updated_at_ist: string | null;
  notes: string | null;
  patient?: Patient;
  doctor?: Doctor;
}

export interface AppointmentStatusHistory {
  history_id: number;
  appointment_id: number;
  old_status: AppointmentStatus | null;
  new_status: AppointmentStatus;
  changed_by_user_id: number | null;
  changed_at_ist: string;
  change_reason: string | null;
}

export interface Language {
  language_code: string;
  name: string;
  is_active: boolean;
}

export interface WhatsappTemplate {
  template_id: number;
  template_key: string;
  language_code: string;
  template_name: string;
  body: string;
  is_active: boolean;
  created_at_ist: string;
}

export type ReminderType = 'BOOKING_CONFIRMATION' | 'UPCOMING_APPOINTMENT' | 'FOLLOWUP_REMINDER' | 'CANCELLATION_NOTICE';
export type ReminderChannel = 'WHATSAPP' | 'SMS' | 'EMAIL';
export type ReminderStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';

export interface Reminder {
  reminder_id: number;
  appointment_id: number;
  reminder_type: ReminderType;
  channel: ReminderChannel;
  template_key: string;
  language_code: string;
  scheduled_at_ist: string;
  sent_at_ist: string | null;
  status: ReminderStatus;
  failure_reason: string | null;
  created_at_ist: string;
}

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIAL_REFUND';

export interface Payment {
  payment_id: number;
  appointment_id: number;
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  gateway_name: string;
  gateway_payment_ref: string | null;
  payment_method: string | null;
  paid_at_ist: string | null;
  created_at_ist: string;
}

export type RefundStatus = 'REQUESTED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface Refund {
  refund_id: number;
  payment_id: number;
  amount: number;
  refund_status: RefundStatus;
  reason: string | null;
  gateway_refund_ref: string | null;
  requested_at_ist: string;
  processed_at_ist: string | null;
}

// Analytics types
export interface DashboardMetrics {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowCount: number;
  totalRevenue: number;
}

export interface DailyReport {
  date: string;
  doctor_name: string;
  doctor_id: number;
  total: number;
  completed: number;
  cancelled: number;
  no_show: number;
  revenue: number;
}
