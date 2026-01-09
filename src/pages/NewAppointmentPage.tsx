import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  useDoctors, 
  useDoctorSlots, 
  useLanguages, 
  useSearchPatients, 
  useCreatePatient,
  useCreateAppointment,
  DbPatient,
  GenderType,
  AppointmentSource 
} from '@/hooks/useDatabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function NewAppointmentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Patient Selection
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<DbPatient | null>(null);
  const [showPatientResults, setShowPatientResults] = useState(false);
  
  // New Patient Form
  const [isNewPatientDialogOpen, setIsNewPatientDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    full_name: '',
    mobile_number: '',
    gender: 'UNKNOWN' as GenderType,
    date_of_birth: '',
    whatsapp_opt_in: 1,
  });
  
  // Appointment Details
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [source, setSource] = useState<AppointmentSource>('FRONTDESK');

  // Available time slots based on doctor and weekday
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Data hooks
  const { data: doctors = [] } = useDoctors();
  const { data: languages = [] } = useLanguages();
  const { data: searchedPatients = [] } = useSearchPatients(patientSearch);
  const { data: doctorSlots = [] } = useDoctorSlots(selectedDoctor ? parseInt(selectedDoctor) : undefined);
  
  const createPatientMutation = useCreatePatient();
  const createAppointmentMutation = useCreateAppointment();

  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      const date = new Date(appointmentDate);
      const weekday = date.getDay() === 0 ? 7 : date.getDay();
      
      const slots = doctorSlots.filter(s => 
        s.weekday === weekday && 
        s.is_active === 1
      );

      const times: string[] = [];
      slots.forEach(slot => {
        const [startHour] = slot.start_time.split(':').map(Number);
        const [endHour] = slot.end_time.split(':').map(Number);
        
        for (let hour = startHour; hour < endHour; hour++) {
          times.push(`${hour.toString().padStart(2, '0')}:00`);
          times.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      });

      setAvailableSlots([...new Set(times)].sort());
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, appointmentDate, doctorSlots]);

  const handleSelectPatient = (patient: DbPatient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.mobile_number);
    setShowPatientResults(false);
  };

  const handleCreatePatient = async () => {
    if (!newPatient.full_name || !newPatient.mobile_number) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      const created = await createPatientMutation.mutateAsync({
        full_name: newPatient.full_name,
        mobile_number: newPatient.mobile_number,
        gender: newPatient.gender,
        date_of_birth: newPatient.date_of_birth || null,
        whatsapp_opt_in: newPatient.whatsapp_opt_in,
      });
      
      setSelectedPatient(created);
      setPatientSearch(created.mobile_number);
      setIsNewPatientDialogOpen(false);
      toast.success('Patient created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create patient');
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }
    if (!appointmentDate || !appointmentTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      await createAppointmentMutation.mutateAsync({
        patient_id: selectedPatient.patient_id,
        doctor_id: parseInt(selectedDoctor),
        appointment_datetime_ist: `${appointmentDate}T${appointmentTime}:00`,
        status: 'BOOKED',
        source,
        notes: notes || null,
        created_by_user_id: user?.user_id || null,
      });
      
      toast.success('Appointment created successfully');
      navigate('/appointments');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create appointment');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/appointments')} className="gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Appointment</h1>
          <p className="text-muted-foreground">Schedule a new patient appointment</p>
        </div>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patient Information</span>
            <Dialog open={isNewPatientDialogOpen} onOpenChange={setIsNewPatientDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  New Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register New Patient</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      placeholder="Enter patient name"
                      value={newPatient.full_name}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Number *</Label>
                    <Input
                      placeholder="+91 XXXXX XXXXX"
                      value={newPatient.mobile_number}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, mobile_number: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup
                      value={newPatient.gender}
                      onValueChange={(v) => setNewPatient(prev => ({ ...prev, gender: v as GenderType }))}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="MALE" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="FEMALE" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="OTHER" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={newPatient.date_of_birth}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewPatientDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePatient} disabled={createPatientMutation.isPending}>
                    {createPatientMutation.isPending ? 'Creating...' : 'Create Patient'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by mobile number or name (min 3 chars)..."
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setShowPatientResults(true);
                if (selectedPatient && e.target.value !== selectedPatient.mobile_number) {
                  setSelectedPatient(null);
                }
              }}
              onFocus={() => setShowPatientResults(true)}
              className="pl-10"
            />
            
            {showPatientResults && searchedPatients.length > 0 && !selectedPatient && (
              <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-60 overflow-auto">
                {searchedPatients.map(patient => (
                  <button
                    key={patient.patient_id}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <p className="font-medium">{patient.full_name}</p>
                    <p className="text-sm text-muted-foreground">{patient.mobile_number}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedPatient && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{selectedPatient.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPatient.mobile_number}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedPatient.gender} • {selectedPatient.date_of_birth || 'DOB not set'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientSearch('');
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Doctor *</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.filter(d => d.is_active).map(doctor => (
                  <SelectItem key={doctor.doctor_id} value={doctor.doctor_id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{doctor.full_name}</span>
                      <span className="text-xs text-muted-foreground">• {doctor.specialty}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setAppointmentTime('');
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Time *</Label>
              <Select 
                value={appointmentTime} 
                onValueChange={setAppointmentTime}
                disabled={availableSlots.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    availableSlots.length === 0 
                      ? 'Select doctor & date first' 
                      : 'Select time'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source *</Label>
              <Select value={source} onValueChange={(v) => setSource(v as AppointmentSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FRONTDESK">Front Desk</SelectItem>
                  <SelectItem value="PHONE_CALL">Phone Call</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preferred Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.language_code} value={lang.language_code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add any notes about this appointment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/appointments')}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="gap-2"
          disabled={createAppointmentMutation.isPending}
        >
          <Calendar className="w-4 h-4" />
          {createAppointmentMutation.isPending ? 'Creating...' : 'Create Appointment'}
        </Button>
      </div>
    </div>
  );
}
