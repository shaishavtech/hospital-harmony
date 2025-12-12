import { useMemo } from 'react';
import { User, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { Patient, Appointment } from '@/types/database';
import { appointments as allAppointments, payments } from '@/lib/mock-data';

interface PatientProfileDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientProfileDialog({ patient, open, onOpenChange }: PatientProfileDialogProps) {
  const patientAppointments = useMemo(() => {
    if (!patient) return [];
    return allAppointments.filter(apt => apt.patient_id === patient.patient_id);
  }, [patient]);

  const stats = useMemo(() => {
    const today = new Date();
    const completed = patientAppointments.filter(apt => apt.status === 'COMPLETED').length;
    const cancelled = patientAppointments.filter(apt => apt.status === 'CANCELLED').length;
    const upcoming = patientAppointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_datetime_ist.replace(' ', 'T'));
      return aptDate > today && apt.status === 'BOOKED';
    }).length;

    // Calculate pending payments (booked/completed without successful payment)
    const completedAppointmentIds = patientAppointments
      .filter(apt => apt.status === 'COMPLETED')
      .map(apt => apt.appointment_id);
    
    const paidAppointmentIds = payments
      .filter(p => ['SUCCESS', 'PARTIAL_REFUND'].includes(p.payment_status))
      .map(p => p.appointment_id);

    const pendingPayments = completedAppointmentIds.filter(
      id => !paidAppointmentIds.includes(id)
    ).length;

    return {
      totalVisits: patientAppointments.length,
      completed,
      cancelled,
      upcoming,
      pendingPayments,
    };
  }, [patientAppointments]);

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="block">{patient.full_name}</span>
              <span className="text-sm font-normal text-muted-foreground">{patient.mobile_number}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Calendar className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{stats.totalVisits}</p>
            <p className="text-xs text-muted-foreground">Total Visits</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
            <CheckCircle className="w-5 h-5 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 text-center">
            <XCircle className="w-5 h-5 mx-auto text-red-600 mb-1" />
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 mx-auto text-blue-600 mb-1" />
            <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 text-center">
            <AlertCircle className="w-5 h-5 mx-auto text-amber-600 mb-1" />
            <p className="text-2xl font-bold text-amber-600">{stats.pendingPayments}</p>
            <p className="text-xs text-muted-foreground">Pending Payments</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="flex flex-wrap gap-2 mt-4">
          {patient.gender && (
            <Badge variant="outline">{patient.gender}</Badge>
          )}
          {patient.date_of_birth && (
            <Badge variant="outline">DOB: {format(parseISO(patient.date_of_birth), 'dd MMM yyyy')}</Badge>
          )}
          {patient.whatsapp_opt_in && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">WhatsApp Opted In</Badge>
          )}
        </div>

        {/* Appointment History */}
        <div className="mt-4">
          <h4 className="font-semibold mb-3">Appointment History</h4>
          <ScrollArea className="h-[250px] rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No appointment history
                    </TableCell>
                  </TableRow>
                ) : (
                  patientAppointments.slice(0, 20).map(apt => (
                    <TableRow key={apt.appointment_id}>
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
                      <TableCell>{apt.doctor?.full_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <StatusBadge status={apt.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {apt.source.replace('_', ' ')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
