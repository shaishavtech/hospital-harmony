import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { 
  ArrowLeft, 
  User, 
  Stethoscope, 
  Calendar, 
  Clock, 
  Phone,
  MessageCircle,
  CreditCard,
  History,
  Edit,
  RefreshCw,
  Plus,
  XCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { appointments, payments, statusHistory, doctorsWithDepartments } from '@/lib/mock-data';
import { AppointmentStatus } from '@/types/database';
import { toast } from 'sonner';

export default function AppointmentDetailPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const appointment = appointments.find(a => a.appointment_id === parseInt(appointmentId || '0'));
  const payment = payments.find(p => p.appointment_id === parseInt(appointmentId || '0'));
  const history = statusHistory.filter(h => h.appointment_id === parseInt(appointmentId || '0'));

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isFollowupDialogOpen, setIsFollowupDialogOpen] = useState(false);
  
  const [newStatus, setNewStatus] = useState<AppointmentStatus>('COMPLETED');
  const [cancellationReason, setCancellationReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [followupTime, setFollowupTime] = useState('');
  const [followupDoctor, setFollowupDoctor] = useState('');

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Appointment not found</p>
        <Button variant="outline" onClick={() => navigate('/appointments')} className="mt-4">
          Back to Appointments
        </Button>
      </div>
    );
  }

  const handleUpdateStatus = () => {
    // In production, this would be an API call
    toast.success(`Appointment marked as ${newStatus}`);
    setIsStatusDialogOpen(false);
  };

  const handleReschedule = () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Please select date and time');
      return;
    }
    toast.success('Appointment rescheduled successfully');
    setIsRescheduleDialogOpen(false);
  };

  const handleFollowup = () => {
    if (!followupDate || !followupTime) {
      toast.error('Please select date and time');
      return;
    }
    toast.success('Follow-up appointment scheduled');
    setIsFollowupDialogOpen(false);
  };

  const canModify = ['BOOKED'].includes(appointment.status);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/appointments')} className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                Appointment #{appointment.appointment_id}
              </h1>
              <StatusBadge status={appointment.status} />
            </div>
            <p className="text-muted-foreground">
              Created on {format(parseISO(appointment.created_at_ist.replace(' ', 'T')), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
        
        {canModify && (
          <div className="flex gap-2">
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Appointment Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>New Status</Label>
                    <Select value={newStatus} onValueChange={(v) => setNewStatus(v as AppointmentStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPLETED">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Completed
                          </span>
                        </SelectItem>
                        <SelectItem value="NO_SHOW">
                          <span className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            No Show
                          </span>
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          <span className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            Cancelled
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newStatus === 'CANCELLED' && (
                    <div className="space-y-2">
                      <Label>Cancellation Reason</Label>
                      <Textarea
                        placeholder="Enter reason for cancellation..."
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateStatus}>
                    Update Status
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reschedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reschedule Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Date</Label>
                      <Input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Time</Label>
                      <Input
                        type="time"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for Rescheduling</Label>
                    <Textarea
                      placeholder="Enter reason..."
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleReschedule}>
                    Reschedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(parseISO(appointment.appointment_datetime_ist.replace(' ', 'T')), 'EEEE, dd MMM yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time (IST)</p>
                    <p className="font-medium">
                      {format(parseISO(appointment.appointment_datetime_ist.replace(' ', 'T')), 'hh:mm a')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{appointment.source.replace('_', ' ')}</Badge>
                {appointment.notes && (
                  <span className="text-sm text-muted-foreground">• {appointment.notes}</span>
                )}
              </div>

              {appointment.cancellation_reason && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-sm font-medium text-red-800">Cancellation Reason:</p>
                  <p className="text-sm text-red-700">{appointment.cancellation_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-lg font-semibold">{appointment.patient?.full_name}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {appointment.patient?.mobile_number}
                    </span>
                    {appointment.patient?.whatsapp_opt_in && (
                      <span className="flex items-center gap-1 text-green-600">
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp Enabled
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{appointment.patient?.gender}</Badge>
                    {appointment.patient?.date_of_birth && (
                      <Badge variant="outline">
                        DOB: {appointment.patient.date_of_birth}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <img
                  src={appointment.doctor?.photo_url || '/placeholder.svg'}
                  alt={appointment.doctor?.full_name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/10"
                />
                <div className="flex-1">
                  <p className="text-lg font-semibold">{appointment.doctor?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{appointment.doctor?.specialty}</p>
                  <Badge variant="secondary" className="mt-2">
                    Fee: ₹{appointment.doctor?.consultation_fee.toLocaleString('en-IN')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date & Time</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map(h => (
                      <TableRow key={h.history_id}>
                        <TableCell className="text-sm">
                          {format(parseISO(h.changed_at_ist.replace(' ', 'T')), 'dd MMM yyyy, hh:mm a')}
                        </TableCell>
                        <TableCell>
                          {h.old_status ? <StatusBadge status={h.old_status} /> : '-'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={h.new_status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {h.change_reason || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog open={isFollowupDialogOpen} onOpenChange={setIsFollowupDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Plus className="w-4 h-4" />
                    Schedule Follow-up
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Follow-up Appointment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Patient</p>
                      <p className="font-medium">{appointment.patient?.full_name}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Doctor</Label>
                      <Select 
                        value={followupDoctor || appointment.doctor_id.toString()} 
                        onValueChange={setFollowupDoctor}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {doctorsWithDepartments.filter(d => d.is_active).map(doctor => (
                            <SelectItem key={doctor.doctor_id} value={doctor.doctor_id.toString()}>
                              {doctor.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={followupDate}
                          onChange={(e) => setFollowupDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={followupTime}
                          onChange={(e) => setFollowupTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsFollowupDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleFollowup}>
                      Schedule Follow-up
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payment ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-xl font-bold">
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge 
                      variant={payment.payment_status === 'SUCCESS' ? 'default' : 'secondary'}
                      className={payment.payment_status === 'SUCCESS' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {payment.payment_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Method</span>
                    <span>{payment.payment_method || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gateway</span>
                    <span>{payment.gateway_name}</span>
                  </div>
                  {payment.paid_at_ist && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Paid At</span>
                      <span className="text-sm">
                        {format(parseISO(payment.paid_at_ist.replace(' ', 'T')), 'dd MMM yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No payment recorded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
