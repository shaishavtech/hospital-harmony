
-- Create enum types
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'MANAGER');
CREATE TYPE public.gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');
CREATE TYPE public.appointment_status AS ENUM ('BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');
CREATE TYPE public.appointment_source AS ENUM ('WHATSAPP', 'FRONTDESK', 'PHONE_CALL', 'OTHER');
CREATE TYPE public.reminder_type AS ENUM ('BOOKING_CONFIRMATION', 'UPCOMING_APPOINTMENT', 'FOLLOWUP_REMINDER', 'CANCELLATION_NOTICE');
CREATE TYPE public.channel_type AS ENUM ('WHATSAPP', 'SMS', 'EMAIL');
CREATE TYPE public.reminder_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');
CREATE TYPE public.payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND');
CREATE TYPE public.refund_status AS ENUM ('REQUESTED', 'PROCESSING', 'SUCCESS', 'FAILED');

-- 1. Users table
CREATE TABLE public.users (
  user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role public.user_role NOT NULL DEFAULT 'RECEPTIONIST',
  is_active SMALLINT NOT NULL DEFAULT 1,
  created_at_ist TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at_ist TIMESTAMP
);

-- 2. Departments table
CREATE TABLE public.departments (
  department_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- 3. Doctors table
CREATE TABLE public.doctors (
  doctor_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  department_id INT REFERENCES public.departments(department_id),
  specialty VARCHAR(200) NOT NULL,
  photo_url VARCHAR(500),
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active SMALLINT NOT NULL DEFAULT 1,
  created_at_ist TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Patients table
CREATE TABLE public.patients (
  patient_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  mobile_number VARCHAR(20) UNIQUE NOT NULL,
  whatsapp_opt_in SMALLINT NOT NULL DEFAULT 0,
  date_of_birth DATE,
  gender public.gender_type NOT NULL DEFAULT 'UNKNOWN',
  created_at_ist TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Doctor slots table
CREATE TABLE public.doctor_slots (
  slot_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id BIGINT REFERENCES public.doctors(doctor_id) ON DELETE CASCADE NOT NULL,
  weekday SMALLINT NOT NULL CHECK (weekday >= 1 AND weekday <= 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_patients INT NOT NULL DEFAULT 0,
  is_active SMALLINT NOT NULL DEFAULT 1,
  created_at_ist TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at_ist TIMESTAMP
);

-- 6. Doctor slot exceptions table
CREATE TABLE public.doctor_slot_exceptions (
  exception_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doctor_id BIGINT REFERENCES public.doctors(doctor_id) ON DELETE CASCADE NOT NULL,
  date_ist DATE NOT NULL,
  is_available SMALLINT NOT NULL DEFAULT 0,
  reason VARCHAR(500),
  created_at_ist TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. Appointments table
CREATE TABLE public.appointments (
  appointment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id BIGINT REFERENCES public.patients(patient_id) NOT NULL,
  doctor_id BIGINT REFERENCES public.doctors(doctor_id) NOT NULL,
  slot_id BIGINT REFERENCES public.doctor_slots(slot_id),
  appointment_datetime_ist TIMESTAMP NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'BOOKED',
  cancellation_reason VARCHAR(500),
  reschedule_reason VARCHAR(500),
  parent_appointment_id BIGINT REFERENCES public.appointments(appointment_id),
  followup_of_appointment_id BIGINT REFERENCES public.appointments(appointment_id),
  source public.appointment_source NOT NULL DEFAULT 'FRONTDESK',
  created_by_user_id BIGINT REFERENCES public.users(user_id),
  created_at_ist TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at_ist TIMESTAMP,
  notes TEXT
);

-- 8. Appointment status history table
CREATE TABLE public.appointment_status_history (
  history_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id BIGINT REFERENCES public.appointments(appointment_id) ON DELETE CASCADE NOT NULL,
  old_status public.appointment_status,
  new_status public.appointment_status NOT NULL,
  changed_by_user_id BIGINT REFERENCES public.users(user_id),
  changed_at_ist TIMESTAMP NOT NULL DEFAULT NOW(),
  change_reason VARCHAR(500)
);

-- 9. Languages table
CREATE TABLE public.languages (
  language_code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_active SMALLINT NOT NULL DEFAULT 1
);

-- 10. WhatsApp templates table
CREATE TABLE public.whatsapp_templates (
  template_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  template_key VARCHAR(100) NOT NULL,
  language_code VARCHAR(10) REFERENCES public.languages(language_code) NOT NULL,
  template_name VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  is_active SMALLINT NOT NULL DEFAULT 1,
  created_at_ist TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 11. Reminders table
CREATE TABLE public.reminders (
  reminder_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id BIGINT REFERENCES public.appointments(appointment_id) ON DELETE CASCADE NOT NULL,
  reminder_type public.reminder_type NOT NULL,
  channel public.channel_type NOT NULL DEFAULT 'WHATSAPP',
  template_key VARCHAR(100) NOT NULL,
  language_code VARCHAR(10) REFERENCES public.languages(language_code) NOT NULL,
  scheduled_at_ist TIMESTAMP NOT NULL,
  sent_at_ist TIMESTAMP,
  status public.reminder_status NOT NULL DEFAULT 'PENDING',
  failure_reason VARCHAR(500),
  created_at_ist TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 12. Payments table
CREATE TABLE public.payments (
  payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id BIGINT REFERENCES public.appointments(appointment_id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  payment_status public.payment_status NOT NULL DEFAULT 'PENDING',
  gateway_name VARCHAR(100) NOT NULL,
  gateway_payment_ref VARCHAR(200),
  payment_method VARCHAR(100),
  paid_at_ist TIMESTAMP,
  created_at_ist TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 13. Refunds table
CREATE TABLE public.refunds (
  refund_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_id BIGINT REFERENCES public.payments(payment_id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  refund_status public.refund_status NOT NULL DEFAULT 'REQUESTED',
  reason VARCHAR(500),
  gateway_refund_ref VARCHAR(200),
  requested_at_ist TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at_ist TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_appointments_datetime ON public.appointments(appointment_datetime_ist);
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_doctor_slots_doctor ON public.doctor_slots(doctor_id);
CREATE INDEX idx_payments_appointment ON public.payments(appointment_id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_slot_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users full access (internal staff app)
CREATE POLICY "Authenticated users can read users" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update users" ON public.users FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage departments" ON public.departments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage doctors" ON public.doctors FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage patients" ON public.patients FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage doctor_slots" ON public.doctor_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage doctor_slot_exceptions" ON public.doctor_slot_exceptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage appointments" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage appointment_status_history" ON public.appointment_status_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read languages" ON public.languages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read whatsapp_templates" ON public.whatsapp_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage reminders" ON public.reminders FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage refunds" ON public.refunds FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anon to read users for login validation
CREATE POLICY "Anon can read users for login" ON public.users FOR SELECT TO anon USING (true);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at_ist = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_doctor_slots_updated_at
  BEFORE UPDATE ON public.doctor_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default languages
INSERT INTO public.languages (language_code, name, is_active) VALUES
  ('en', 'English', 1),
  ('hi', 'Hindi', 1),
  ('ta', 'Tamil', 1),
  ('te', 'Telugu', 1);

-- Insert default departments
INSERT INTO public.departments (name) VALUES
  ('General Medicine'),
  ('Cardiology'),
  ('Orthopedics'),
  ('Pediatrics'),
  ('Dermatology'),
  ('Neurology'),
  ('Gynecology');
