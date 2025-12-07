import { useState, useMemo } from 'react';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Search, Plus, Eye, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { appointments as mockAppointments, doctorsWithDepartments } from '@/lib/mock-data';
import { Appointment, AppointmentStatus } from '@/types/database';
import { useNavigate } from 'react-router-dom';

const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
  { value: 'RESCHEDULED', label: 'Rescheduled' },
];

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAppointments = useMemo(() => {
    const from = startOfDay(parseISO(fromDate));
    const to = endOfDay(parseISO(toDate));

    return mockAppointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_datetime_ist.replace(' ', 'T'));
      const inDateRange = isWithinInterval(aptDate, { start: from, end: to });

      const matchesSearch = 
        apt.patient?.full_name.toLowerCase().includes(search.toLowerCase()) ||
        apt.patient?.mobile_number.includes(search) ||
        apt.appointment_id.toString().includes(search);

      const matchesDoctor = doctorFilter === 'all' || apt.doctor_id === parseInt(doctorFilter);
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

      return inDateRange && matchesSearch && matchesDoctor && matchesStatus;
    });
  }, [search, fromDate, toDate, doctorFilter, statusFilter]);

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'WHATSAPP': return 'bg-green-100 text-green-800';
      case 'FRONTDESK': return 'bg-blue-100 text-blue-800';
      case 'PHONE_CALL': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage and track patient appointments</p>
        </div>
        <Button onClick={() => navigate('/appointments/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name, mobile, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctorsWithDepartments.filter(d => d.is_active).map(doctor => (
                    <SelectItem key={doctor.doctor_id} value={doctor.doctor_id.toString()}>
                      {doctor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setFromDate(format(new Date(), 'yyyy-MM-dd'));
                setToDate(format(new Date(), 'yyyy-MM-dd'));
                setDoctorFilter('all');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Appointments ({filteredAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No appointments found for the selected criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.slice(0, 50).map(apt => (
                    <TableRow key={apt.appointment_id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm">
                        #{apt.appointment_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {format(parseISO(apt.appointment_datetime_ist.replace(' ', 'T')), 'dd MMM yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(apt.appointment_datetime_ist.replace(' ', 'T')), 'hh:mm a')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {apt.patient?.full_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {apt.patient?.mobile_number}
                      </TableCell>
                      <TableCell>
                        {apt.doctor?.full_name}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={apt.status} />
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSourceBadgeColor(apt.source)}`}>
                          {apt.source.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/appointments/${apt.appointment_id}`)}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredAppointments.length > 50 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 50 of {filteredAppointments.length} appointments. Use filters to narrow down results.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
