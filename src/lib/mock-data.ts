import { 
  Department, 
  Doctor, 
  Patient, 
  DoctorSlot, 
  Appointment, 
  Payment,
  AppointmentStatusHistory,
  DoctorSlotException,
  Language
} from '@/types/database';

// Mock Departments
export const departments: Department[] = [
  { department_id: 1, name: 'Cardiology' },
  { department_id: 2, name: 'Orthopedics' },
  { department_id: 3, name: 'Pediatrics' },
  { department_id: 4, name: 'Dermatology' },
  { department_id: 5, name: 'General Medicine' },
];

// Mock Doctors
export const doctors: Doctor[] = [
  {
    doctor_id: 1,
    full_name: 'Dr. Rajesh Kumar',
    department_id: 1,
    specialty: 'Interventional Cardiology',
    photo_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
    consultation_fee: 1500,
    is_active: true,
    created_at_ist: '2024-01-01 09:00:00',
  },
  {
    doctor_id: 2,
    full_name: 'Dr. Priya Sharma',
    department_id: 2,
    specialty: 'Joint Replacement Surgery',
    photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    consultation_fee: 1200,
    is_active: true,
    created_at_ist: '2024-01-02 09:00:00',
  },
  {
    doctor_id: 3,
    full_name: 'Dr. Amit Patel',
    department_id: 3,
    specialty: 'Neonatology',
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop',
    consultation_fee: 1000,
    is_active: true,
    created_at_ist: '2024-01-03 09:00:00',
  },
  {
    doctor_id: 4,
    full_name: 'Dr. Sunita Reddy',
    department_id: 4,
    specialty: 'Cosmetic Dermatology',
    photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop',
    consultation_fee: 800,
    is_active: true,
    created_at_ist: '2024-01-04 09:00:00',
  },
  {
    doctor_id: 5,
    full_name: 'Dr. Vikram Singh',
    department_id: 5,
    specialty: 'Internal Medicine',
    photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop',
    consultation_fee: 600,
    is_active: true,
    created_at_ist: '2024-01-05 09:00:00',
  },
];

// Add department info to doctors
export const doctorsWithDepartments: Doctor[] = doctors.map(doc => ({
  ...doc,
  department: departments.find(d => d.department_id === doc.department_id),
}));

// Mock Patients
export const patients: Patient[] = [
  {
    patient_id: 1,
    full_name: 'Arun Mehta',
    mobile_number: '+91 98765 43210',
    whatsapp_opt_in: true,
    date_of_birth: '1985-03-15',
    gender: 'MALE',
    created_at_ist: '2024-01-10 10:00:00',
  },
  {
    patient_id: 2,
    full_name: 'Kavita Joshi',
    mobile_number: '+91 87654 32109',
    whatsapp_opt_in: true,
    date_of_birth: '1990-07-22',
    gender: 'FEMALE',
    created_at_ist: '2024-01-11 11:00:00',
  },
  {
    patient_id: 3,
    full_name: 'Rohit Verma',
    mobile_number: '+91 76543 21098',
    whatsapp_opt_in: false,
    date_of_birth: '1978-11-08',
    gender: 'MALE',
    created_at_ist: '2024-01-12 09:30:00',
  },
  {
    patient_id: 4,
    full_name: 'Sneha Gupta',
    mobile_number: '+91 65432 10987',
    whatsapp_opt_in: true,
    date_of_birth: '1995-05-30',
    gender: 'FEMALE',
    created_at_ist: '2024-01-13 14:00:00',
  },
  {
    patient_id: 5,
    full_name: 'Manoj Kumar',
    mobile_number: '+91 54321 09876',
    whatsapp_opt_in: true,
    date_of_birth: '1982-09-12',
    gender: 'MALE',
    created_at_ist: '2024-01-14 16:00:00',
  },
];

// Mock Doctor Slots
export const doctorSlots: DoctorSlot[] = [
  // Dr. Rajesh Kumar (Cardiology) - Mon, Wed, Fri
  { slot_id: 1, doctor_id: 1, weekday: 1, start_time: '09:00', end_time: '12:00', max_patients: 10, is_active: true, created_at_ist: '2024-01-01 09:00:00', updated_at_ist: null },
  { slot_id: 2, doctor_id: 1, weekday: 3, start_time: '09:00', end_time: '12:00', max_patients: 10, is_active: true, created_at_ist: '2024-01-01 09:00:00', updated_at_ist: null },
  { slot_id: 3, doctor_id: 1, weekday: 5, start_time: '14:00', end_time: '17:00', max_patients: 8, is_active: true, created_at_ist: '2024-01-01 09:00:00', updated_at_ist: null },
  
  // Dr. Priya Sharma (Orthopedics) - Tue, Thu, Sat
  { slot_id: 4, doctor_id: 2, weekday: 2, start_time: '10:00', end_time: '13:00', max_patients: 12, is_active: true, created_at_ist: '2024-01-02 09:00:00', updated_at_ist: null },
  { slot_id: 5, doctor_id: 2, weekday: 4, start_time: '10:00', end_time: '13:00', max_patients: 12, is_active: true, created_at_ist: '2024-01-02 09:00:00', updated_at_ist: null },
  { slot_id: 6, doctor_id: 2, weekday: 6, start_time: '09:00', end_time: '12:00', max_patients: 10, is_active: true, created_at_ist: '2024-01-02 09:00:00', updated_at_ist: null },
  
  // Dr. Amit Patel (Pediatrics) - Mon-Fri
  { slot_id: 7, doctor_id: 3, weekday: 1, start_time: '08:00', end_time: '11:00', max_patients: 15, is_active: true, created_at_ist: '2024-01-03 09:00:00', updated_at_ist: null },
  { slot_id: 8, doctor_id: 3, weekday: 2, start_time: '08:00', end_time: '11:00', max_patients: 15, is_active: true, created_at_ist: '2024-01-03 09:00:00', updated_at_ist: null },
  { slot_id: 9, doctor_id: 3, weekday: 3, start_time: '14:00', end_time: '17:00', max_patients: 12, is_active: true, created_at_ist: '2024-01-03 09:00:00', updated_at_ist: null },
  { slot_id: 10, doctor_id: 3, weekday: 4, start_time: '14:00', end_time: '17:00', max_patients: 12, is_active: true, created_at_ist: '2024-01-03 09:00:00', updated_at_ist: null },
  { slot_id: 11, doctor_id: 3, weekday: 5, start_time: '08:00', end_time: '11:00', max_patients: 15, is_active: true, created_at_ist: '2024-01-03 09:00:00', updated_at_ist: null },
  
  // Dr. Sunita Reddy (Dermatology) - Mon, Wed, Sat
  { slot_id: 12, doctor_id: 4, weekday: 1, start_time: '11:00', end_time: '14:00', max_patients: 8, is_active: true, created_at_ist: '2024-01-04 09:00:00', updated_at_ist: null },
  { slot_id: 13, doctor_id: 4, weekday: 3, start_time: '11:00', end_time: '14:00', max_patients: 8, is_active: true, created_at_ist: '2024-01-04 09:00:00', updated_at_ist: null },
  { slot_id: 14, doctor_id: 4, weekday: 6, start_time: '10:00', end_time: '13:00', max_patients: 10, is_active: true, created_at_ist: '2024-01-04 09:00:00', updated_at_ist: null },
  
  // Dr. Vikram Singh (General Medicine) - Mon-Sat
  { slot_id: 15, doctor_id: 5, weekday: 1, start_time: '09:00', end_time: '17:00', max_patients: 25, is_active: true, created_at_ist: '2024-01-05 09:00:00', updated_at_ist: null },
  { slot_id: 16, doctor_id: 5, weekday: 2, start_time: '09:00', end_time: '17:00', max_patients: 25, is_active: true, created_at_ist: '2024-01-05 09:00:00', updated_at_ist: null },
  { slot_id: 17, doctor_id: 5, weekday: 3, start_time: '09:00', end_time: '17:00', max_patients: 25, is_active: true, created_at_ist: '2024-01-05 09:00:00', updated_at_ist: null },
  { slot_id: 18, doctor_id: 5, weekday: 4, start_time: '09:00', end_time: '17:00', max_patients: 25, is_active: true, created_at_ist: '2024-01-05 09:00:00', updated_at_ist: null },
  { slot_id: 19, doctor_id: 5, weekday: 5, start_time: '09:00', end_time: '17:00', max_patients: 25, is_active: true, created_at_ist: '2024-01-05 09:00:00', updated_at_ist: null },
  { slot_id: 20, doctor_id: 5, weekday: 6, start_time: '09:00', end_time: '13:00', max_patients: 15, is_active: true, created_at_ist: '2024-01-05 09:00:00', updated_at_ist: null },
];

// Mock Slot Exceptions
export const slotExceptions: DoctorSlotException[] = [
  { exception_id: 1, doctor_id: 1, date_ist: '2024-12-25', is_available: false, reason: 'Christmas Holiday', created_at_ist: '2024-12-01 09:00:00' },
  { exception_id: 2, doctor_id: 2, date_ist: '2024-12-31', is_available: false, reason: 'New Year Eve', created_at_ist: '2024-12-01 09:00:00' },
  { exception_id: 3, doctor_id: 3, date_ist: '2024-12-10', is_available: false, reason: 'Medical Conference', created_at_ist: '2024-12-01 09:00:00' },
];

// Generate appointments for the past week and upcoming week
const generateAppointments = (): Appointment[] => {
  const statuses: Array<'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'> = ['BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
  const sources: Array<'WHATSAPP' | 'FRONTDESK' | 'PHONE_CALL'> = ['WHATSAPP', 'FRONTDESK', 'PHONE_CALL'];
  const appointments: Appointment[] = [];
  
  let id = 1;
  const today = new Date();
  
  for (let dayOffset = -7; dayOffset <= 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    
    // Generate 3-8 appointments per day
    const appointmentsPerDay = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < appointmentsPerDay; i++) {
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const hour = 9 + Math.floor(Math.random() * 8);
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hour, minute, 0, 0);
      
      // Past appointments are more likely to be completed
      let status: 'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
      if (dayOffset < 0) {
        const rand = Math.random();
        if (rand < 0.7) status = 'COMPLETED';
        else if (rand < 0.85) status = 'CANCELLED';
        else status = 'NO_SHOW';
      } else if (dayOffset === 0) {
        const rand = Math.random();
        if (rand < 0.5) status = 'BOOKED';
        else if (rand < 0.8) status = 'COMPLETED';
        else status = 'CANCELLED';
      } else {
        status = 'BOOKED';
      }
      
      appointments.push({
        appointment_id: id,
        patient_id: patient.patient_id,
        doctor_id: doctor.doctor_id,
        slot_id: Math.floor(Math.random() * 20) + 1,
        appointment_datetime_ist: appointmentDate.toISOString().slice(0, 19).replace('T', ' '),
        status,
        cancellation_reason: status === 'CANCELLED' ? 'Patient requested cancellation' : null,
        reschedule_reason: null,
        parent_appointment_id: null,
        followup_of_appointment_id: null,
        source: sources[Math.floor(Math.random() * sources.length)],
        created_by_user_id: 1,
        created_at_ist: new Date(appointmentDate.getTime() - 86400000).toISOString().slice(0, 19).replace('T', ' '),
        updated_at_ist: null,
        notes: Math.random() > 0.7 ? 'Regular checkup' : null,
        patient,
        doctor,
      });
      
      id++;
    }
  }
  
  return appointments.sort((a, b) => 
    new Date(b.appointment_datetime_ist).getTime() - new Date(a.appointment_datetime_ist).getTime()
  );
};

export const appointments: Appointment[] = generateAppointments();

// Mock Payments (for completed appointments)
export const payments: Payment[] = appointments
  .filter(apt => apt.status === 'COMPLETED')
  .map((apt, idx) => ({
    payment_id: idx + 1,
    appointment_id: apt.appointment_id,
    amount: doctors.find(d => d.doctor_id === apt.doctor_id)?.consultation_fee || 500,
    currency: 'INR',
    payment_status: 'SUCCESS' as const,
    gateway_name: 'RAZORPAY',
    gateway_payment_ref: `pay_${Math.random().toString(36).substr(2, 14)}`,
    payment_method: Math.random() > 0.5 ? 'UPI' : 'CARD',
    paid_at_ist: apt.appointment_datetime_ist,
    created_at_ist: apt.appointment_datetime_ist,
  }));

// Mock Status History
export const statusHistory: AppointmentStatusHistory[] = appointments.flatMap(apt => {
  const history: AppointmentStatusHistory[] = [
    {
      history_id: apt.appointment_id * 10,
      appointment_id: apt.appointment_id,
      old_status: null,
      new_status: 'BOOKED',
      changed_by_user_id: 1,
      changed_at_ist: apt.created_at_ist,
      change_reason: 'Appointment created',
    },
  ];
  
  if (apt.status !== 'BOOKED') {
    history.push({
      history_id: apt.appointment_id * 10 + 1,
      appointment_id: apt.appointment_id,
      old_status: 'BOOKED',
      new_status: apt.status,
      changed_by_user_id: 1,
      changed_at_ist: apt.appointment_datetime_ist,
      change_reason: apt.status === 'CANCELLED' ? apt.cancellation_reason : 'Status updated',
    });
  }
  
  return history;
});

// Mock Languages
export const languages: Language[] = [
  { language_code: 'en', name: 'English', is_active: true },
  { language_code: 'hi', name: 'Hindi', is_active: true },
  { language_code: 'ta', name: 'Tamil', is_active: true },
  { language_code: 'te', name: 'Telugu', is_active: true },
];
