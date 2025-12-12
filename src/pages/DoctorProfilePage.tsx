import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Edit, Plus, Check, X, CalendarOff, IndianRupee, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { doctorsWithDepartments, doctorSlots, slotExceptions } from '@/lib/mock-data';
import { DoctorSlot, DoctorSlotException } from '@/types/database';
import { toast } from 'sonner';

const WEEKDAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorProfilePage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const doctor = doctorsWithDepartments.find(d => d.doctor_id === parseInt(doctorId || '0'));
  
  const [slots, setSlots] = useState<DoctorSlot[]>(
    doctorSlots.filter(s => s.doctor_id === parseInt(doctorId || '0'))
  );
  const [editingSlot, setEditingSlot] = useState<DoctorSlot | null>(null);
  const [editHasMaxPatients, setEditHasMaxPatients] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExceptionDialogOpen, setIsExceptionDialogOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [consultationFee, setConsultationFee] = useState(doctor?.consultation_fee || 0);
  const [hasMaxPatients, setHasMaxPatients] = useState(true);
  const [newSlot, setNewSlot] = useState<Partial<DoctorSlot>>({
    weekday: 1,
    start_time: '09:00',
    end_time: '12:00',
    max_patients: 10,
    is_active: true,
  });
  const [newException, setNewException] = useState<Partial<DoctorSlotException>>({
    date_ist: '',
    is_available: false,
    reason: '',
  });

  const [exceptions, setExceptions] = useState<DoctorSlotException[]>(
    slotExceptions.filter(e => e.doctor_id === parseInt(doctorId || '0'))
  );

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Doctor not found</p>
        <Button variant="outline" onClick={() => navigate('/doctors')} className="mt-4">
          Back to Doctors
        </Button>
      </div>
    );
  }

  const handleToggleSlot = (slotId: number, isActive: boolean) => {
    setSlots(prev => prev.map(slot => 
      slot.slot_id === slotId ? { ...slot, is_active: isActive } : slot
    ));
    toast.success(`Slot ${isActive ? 'activated' : 'deactivated'}`);
  };

  const handleOpenEditDialog = (slot: DoctorSlot) => {
    setEditingSlot(slot);
    setEditHasMaxPatients(slot.max_patients > 0);
    setIsDialogOpen(true);
  };

  const handleSaveSlot = () => {
    if (editingSlot) {
      const updatedSlot = {
        ...editingSlot,
        max_patients: editHasMaxPatients ? editingSlot.max_patients : 0,
      };
      setSlots(prev => prev.map(slot => 
        slot.slot_id === editingSlot.slot_id ? updatedSlot : slot
      ));
      toast.success('Slot updated successfully');
    }
    setEditingSlot(null);
    setIsDialogOpen(false);
  };

  const handleDeleteSlot = (slotId: number) => {
    setSlots(prev => prev.filter(slot => slot.slot_id !== slotId));
    toast.success('Slot deleted successfully');
  };

  const handleAddSlot = () => {
    const newSlotData: DoctorSlot = {
      slot_id: Math.max(...slots.map(s => s.slot_id), 0) + 1,
      doctor_id: doctor.doctor_id,
      weekday: newSlot.weekday || 1,
      start_time: newSlot.start_time || '09:00',
      end_time: newSlot.end_time || '12:00',
      max_patients: hasMaxPatients ? (newSlot.max_patients || 10) : 0,
      is_active: true,
      created_at_ist: new Date().toISOString(),
      updated_at_ist: null,
    };
    setSlots(prev => [...prev, newSlotData]);
    setNewSlot({
      weekday: 1,
      start_time: '09:00',
      end_time: '12:00',
      max_patients: 10,
      is_active: true,
    });
    setHasMaxPatients(true);
    setIsDialogOpen(false);
    toast.success('Slot added successfully');
  };

  const handleAddException = () => {
    if (!newException.date_ist) {
      toast.error('Please select a date');
      return;
    }
    const exceptionData: DoctorSlotException = {
      exception_id: Math.max(...exceptions.map(e => e.exception_id), 0) + 1,
      doctor_id: doctor.doctor_id,
      date_ist: newException.date_ist,
      is_available: newException.is_available || false,
      reason: newException.reason || null,
      created_at_ist: new Date().toISOString(),
    };
    setExceptions(prev => [...prev, exceptionData]);
    setNewException({
      date_ist: '',
      is_available: false,
      reason: '',
    });
    setIsExceptionDialogOpen(false);
    toast.success('Schedule exception added');
  };

  const handleUpdateFee = () => {
    toast.success('Consultation fee updated');
    setIsFeeDialogOpen(false);
  };

  const slotsByWeekday = WEEKDAYS.map((day, idx) => ({
    day,
    weekday: idx,
    slots: slots.filter(s => s.weekday === idx),
  })).filter(d => d.weekday > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/doctors')} className="gap-2 -ml-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Doctors
      </Button>

      {/* Doctor Profile Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-primary/10 mx-auto sm:mx-0">
              <AvatarImage src={doctor.photo_url || undefined} alt={doctor.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl font-semibold">
                {doctor.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{doctor.full_name}</h1>
              <p className="text-muted-foreground">{doctor.specialty}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <Badge variant="secondary">{doctor.department?.name}</Badge>
                <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
                  <DialogTrigger asChild>
                    <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                      <span className="text-muted-foreground">Fee:</span>
                      ₹{consultationFee.toLocaleString('en-IN')}
                      <Edit className="w-3 h-3 ml-1" />
                    </Badge>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Consultation Fee</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Consultation Fee (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={consultationFee}
                          onChange={(e) => setConsultationFee(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsFeeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateFee}>
                        Update Fee
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Weekly Schedule
          </CardTitle>
          <Dialog open={isDialogOpen && !editingSlot} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingSlot(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Slot</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Weekday</Label>
                  <Select 
                    value={newSlot.weekday?.toString()} 
                    onValueChange={(v) => setNewSlot(prev => ({ ...prev, weekday: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.slice(1).map((day, idx) => (
                        <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Limit Max Patients</Label>
                    <Switch
                      checked={hasMaxPatients}
                      onCheckedChange={setHasMaxPatients}
                    />
                  </div>
                  {hasMaxPatients && (
                    <div className="space-y-2">
                      <Label>Max Patients</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newSlot.max_patients}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, max_patients: parseInt(e.target.value) }))}
                      />
                    </div>
                  )}
                </div>
                <Button onClick={handleAddSlot} className="w-full">
                  Add Slot
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-center">Max Patients</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slotsByWeekday.map(({ day, slots: daySlots }) => (
                  daySlots.length > 0 ? (
                    daySlots.map((slot, idx) => (
                      <TableRow key={slot.slot_id}>
                        {idx === 0 && (
                          <TableCell rowSpan={daySlots.length} className="font-medium align-top">
                            {day}
                          </TableCell>
                        )}
                        <TableCell className="whitespace-nowrap">
                          {slot.start_time} - {slot.end_time}
                        </TableCell>
                        <TableCell className="text-center">
                          {slot.max_patients > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              {slot.max_patients}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unlimited</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={slot.is_active}
                            onCheckedChange={(checked) => handleToggleSlot(slot.slot_id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenEditDialog(slot)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteSlot(slot.slot_id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : null
                ))}
                {slots.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No slots configured. Click "Add Slot" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Slot Dialog */}
      <Dialog open={isDialogOpen && editingSlot !== null} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingSlot(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Slot</DialogTitle>
          </DialogHeader>
          {editingSlot && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Weekday</Label>
                <Select 
                  value={editingSlot.weekday.toString()} 
                  onValueChange={(v) => setEditingSlot(prev => prev ? { ...prev, weekday: parseInt(v) } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.slice(1).map((day, idx) => (
                      <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={editingSlot.start_time}
                    onChange={(e) => setEditingSlot(prev => prev ? { ...prev, start_time: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={editingSlot.end_time}
                    onChange={(e) => setEditingSlot(prev => prev ? { ...prev, end_time: e.target.value } : null)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Limit Max Patients</Label>
                  <Switch
                    checked={editHasMaxPatients}
                    onCheckedChange={setEditHasMaxPatients}
                  />
                </div>
                {editHasMaxPatients && (
                  <div className="space-y-2">
                    <Label>Max Patients</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editingSlot.max_patients || 10}
                      onChange={(e) => setEditingSlot(prev => prev ? { ...prev, max_patients: parseInt(e.target.value) || 10 } : null)}
                    />
                  </div>
                )}
              </div>
              <Button onClick={handleSaveSlot} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Slot Exceptions */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarOff className="w-5 h-5" />
            Schedule Exceptions
          </CardTitle>
          <Dialog open={isExceptionDialogOpen} onOpenChange={setIsExceptionDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Add Exception
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Schedule Exception</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newException.date_ist}
                    onChange={(e) => setNewException(prev => ({ ...prev, date_ist: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Is Available</Label>
                  <Switch
                    checked={newException.is_available}
                    onCheckedChange={(checked) => setNewException(prev => ({ ...prev, is_available: checked }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="e.g., Holiday, Conference, Personal leave..."
                    value={newException.reason || ''}
                    onChange={(e) => setNewException(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExceptionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddException}>
                  Add Exception
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No exceptions configured. Click "Add Exception" to add holidays or special availability.
                    </TableCell>
                  </TableRow>
                ) : (
                  exceptions.map(exception => (
                    <TableRow key={exception.exception_id}>
                      <TableCell className="font-medium">{exception.date_ist}</TableCell>
                      <TableCell>
                        {exception.is_available ? (
                          <Badge variant="outline" className="gap-1 text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30">
                            <Check className="w-3 h-3" />
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-red-600 border-red-200 bg-red-50 dark:bg-red-950/30">
                            <X className="w-3 h-3" />
                            Unavailable
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {exception.reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
