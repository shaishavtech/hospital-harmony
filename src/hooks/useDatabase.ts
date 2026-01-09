import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Type aliases for cleaner code
type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

export type DbDepartment = Tables['departments']['Row'];
export type DbDoctor = Tables['doctors']['Row'];
export type DbPatient = Tables['patients']['Row'];
export type DbDoctorSlot = Tables['doctor_slots']['Row'];
export type DbDoctorSlotException = Tables['doctor_slot_exceptions']['Row'];
export type DbAppointment = Tables['appointments']['Row'];
export type DbAppointmentStatusHistory = Tables['appointment_status_history']['Row'];
export type DbPayment = Tables['payments']['Row'];
export type DbLanguage = Tables['languages']['Row'];
export type DbUser = Tables['users']['Row'];

export type AppointmentStatus = Enums['appointment_status'];
export type AppointmentSource = Enums['appointment_source'];
export type GenderType = Enums['gender_type'];

// Extended types with joins
export type DoctorWithDepartment = DbDoctor & {
  departments: DbDepartment | null;
};

export type AppointmentWithRelations = DbAppointment & {
  patients: DbPatient | null;
  doctors: DoctorWithDepartment | null;
};

// ======================
// DEPARTMENTS
// ======================
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as DbDepartment[];
    },
  });
}

// ======================
// DOCTORS
// ======================
export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          departments (*)
        `)
        .order('full_name');
      if (error) throw error;
      return data as DoctorWithDepartment[];
    },
  });
}

export function useDoctor(doctorId: number | undefined) {
  return useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          departments (*)
        `)
        .eq('doctor_id', doctorId)
        .maybeSingle();
      if (error) throw error;
      return data as DoctorWithDepartment | null;
    },
    enabled: !!doctorId,
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ doctorId, updates }: { doctorId: number; updates: Tables['doctors']['Update'] }) => {
      const { data, error } = await supabase
        .from('doctors')
        .update(updates)
        .eq('doctor_id', doctorId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
    },
  });
}

// ======================
// DOCTOR SLOTS
// ======================
export function useDoctorSlots(doctorId: number | undefined) {
  return useQuery({
    queryKey: ['doctor_slots', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const { data, error } = await supabase
        .from('doctor_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('weekday')
        .order('start_time');
      if (error) throw error;
      return data as DbDoctorSlot[];
    },
    enabled: !!doctorId,
  });
}

export function useCreateDoctorSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slot: Tables['doctor_slots']['Insert']) => {
      const { data, error } = await supabase
        .from('doctor_slots')
        .insert(slot)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor_slots', variables.doctor_id] });
    },
  });
}

export function useUpdateDoctorSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slotId, updates, doctorId }: { 
      slotId: number; 
      updates: Tables['doctor_slots']['Update'];
      doctorId: number;
    }) => {
      const { data, error } = await supabase
        .from('doctor_slots')
        .update(updates)
        .eq('slot_id', slotId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor_slots', variables.doctorId] });
    },
  });
}

export function useDeleteDoctorSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slotId, doctorId }: { slotId: number; doctorId: number }) => {
      const { error } = await supabase
        .from('doctor_slots')
        .delete()
        .eq('slot_id', slotId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor_slots', variables.doctorId] });
    },
  });
}

// ======================
// DOCTOR SLOT EXCEPTIONS
// ======================
export function useDoctorSlotExceptions(doctorId: number | undefined) {
  return useQuery({
    queryKey: ['doctor_slot_exceptions', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const { data, error } = await supabase
        .from('doctor_slot_exceptions')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('date_ist', { ascending: false });
      if (error) throw error;
      return data as DbDoctorSlotException[];
    },
    enabled: !!doctorId,
  });
}

export function useCreateSlotException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (exception: Tables['doctor_slot_exceptions']['Insert']) => {
      const { data, error } = await supabase
        .from('doctor_slot_exceptions')
        .insert(exception)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor_slot_exceptions', variables.doctor_id] });
    },
  });
}

// ======================
// PATIENTS
// ======================
export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('full_name');
      if (error) throw error;
      return data as DbPatient[];
    },
  });
}

export function useSearchPatients(search: string) {
  return useQuery({
    queryKey: ['patients', 'search', search],
    queryFn: async () => {
      if (search.length < 3) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`mobile_number.ilike.%${search}%,full_name.ilike.%${search}%`)
        .limit(10);
      if (error) throw error;
      return data as DbPatient[];
    },
    enabled: search.length >= 3,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patient: Tables['patients']['Insert']) => {
      const { data, error } = await supabase
        .from('patients')
        .insert(patient)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// ======================
// APPOINTMENTS
// ======================
export function useAppointments(filters?: {
  fromDate?: string;
  toDate?: string;
  doctorId?: number;
  status?: AppointmentStatus;
}) {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patients (*),
          doctors (*, departments (*))
        `)
        .order('appointment_datetime_ist', { ascending: false });

      if (filters?.fromDate) {
        query = query.gte('appointment_datetime_ist', filters.fromDate);
      }
      if (filters?.toDate) {
        query = query.lte('appointment_datetime_ist', filters.toDate + 'T23:59:59');
      }
      if (filters?.doctorId) {
        query = query.eq('doctor_id', filters.doctorId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.limit(500);
      if (error) throw error;
      return data as AppointmentWithRelations[];
    },
  });
}

export function useAppointment(appointmentId: number | undefined) {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (*),
          doctors (*, departments (*))
        `)
        .eq('appointment_id', appointmentId)
        .maybeSingle();
      if (error) throw error;
      return data as AppointmentWithRelations | null;
    },
    enabled: !!appointmentId,
  });
}

export function usePatientAppointments(patientId: number | undefined) {
  return useQuery({
    queryKey: ['patient_appointments', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors (full_name, specialty)
        `)
        .eq('patient_id', patientId)
        .order('appointment_datetime_ist', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appointment: Tables['appointments']['Insert']) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appointmentId, updates }: { 
      appointmentId: number; 
      updates: Tables['appointments']['Update'] 
    }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('appointment_id', appointmentId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
    },
  });
}

// ======================
// APPOINTMENT STATUS HISTORY
// ======================
export function useAppointmentStatusHistory(appointmentId: number | undefined) {
  return useQuery({
    queryKey: ['appointment_status_history', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return [];
      const { data, error } = await supabase
        .from('appointment_status_history')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('changed_at_ist', { ascending: false });
      if (error) throw error;
      return data as DbAppointmentStatusHistory[];
    },
    enabled: !!appointmentId,
  });
}

export function useCreateStatusHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (history: Tables['appointment_status_history']['Insert']) => {
      const { data, error } = await supabase
        .from('appointment_status_history')
        .insert(history)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointment_status_history', variables.appointment_id] });
    },
  });
}

// ======================
// PAYMENTS
// ======================
export function usePayments(appointmentIds?: number[]) {
  return useQuery({
    queryKey: ['payments', appointmentIds],
    queryFn: async () => {
      let query = supabase.from('payments').select('*');
      if (appointmentIds && appointmentIds.length > 0) {
        query = query.in('appointment_id', appointmentIds);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as DbPayment[];
    },
  });
}

export function useAppointmentPayment(appointmentId: number | undefined) {
  return useQuery({
    queryKey: ['payment', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('appointment_id', appointmentId)
        .maybeSingle();
      if (error) throw error;
      return data as DbPayment | null;
    },
    enabled: !!appointmentId,
  });
}

// ======================
// LANGUAGES
// ======================
export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('is_active', 1)
        .order('name');
      if (error) throw error;
      return data as DbLanguage[];
    },
  });
}

// ======================
// USERS (for login)
// ======================
export function useValidateUser() {
  return useMutation({
    mutationFn: async ({ username, passwordHash }: { username: string; passwordHash: string }) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .eq('is_active', 1)
        .maybeSingle();
      if (error) throw error;
      return data as DbUser | null;
    },
  });
}

export function useUpdateLastLogin() {
  return useMutation({
    mutationFn: async (userId: number) => {
      const { error } = await supabase
        .from('users')
        .update({ last_login_at_ist: new Date().toISOString() })
        .eq('user_id', userId);
      if (error) throw error;
    },
  });
}
