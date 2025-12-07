import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Edit, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doctorsWithDepartments, doctorSlots, slotExceptions } from '@/lib/mock-data';
import { DoctorSlot } from '@/types/database';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState<Partial<DoctorSlot>>({
    weekday: 1,
    start_time: '09:00',
    end_time: '12:00',
    max_patients: 10,
    is_active: true,
  });

  const exceptions = slotExceptions.filter(e => e.doctor_id === parseInt(doctorId || '0'));

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

  const handleSaveSlot = () => {
    if (editingSlot) {
      setSlots(prev => prev.map(slot => 
        slot.slot_id === editingSlot.slot_id ? editingSlot : slot
      ));
      toast.success('Slot updated successfully');
    }
    setEditingSlot(null);
    setIsDialogOpen(false);
  };

  const handleAddSlot = () => {
    const newSlotData: DoctorSlot = {
      slot_id: Math.max(...slots.map(s => s.slot_id), 0) + 1,
      doctor_id: doctor.doctor_id,
      weekday: newSlot.weekday || 1,
      start_time: newSlot.start_time || '09:00',
      end_time: newSlot.end_time || '12:00',
      max_patients: newSlot.max_patients || 10,
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
    setIsDialogOpen(false);
    toast.success('Slot added successfully');
  };

  const slotsByWeekday = WEEKDAYS.map((day, idx) => ({
    day,
    weekday: idx,
    slots: slots.filter(s => s.weekday === idx),
  })).filter(d => d.weekday > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/doctors')} className="gap-2 -ml-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Doctors
      </Button>

      {/* Doctor Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-primary/10">
              <AvatarImage src={doctor.photo_url || undefined} alt={doctor.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {doctor.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{doctor.full_name}</h1>
              <p className="text-muted-foreground">{doctor.specialty}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">{doctor.department?.name}</Badge>
                <Badge variant="outline" className="gap-1">
                  <span className="text-muted-foreground">Fee:</span>
                  ₹{doctor.consultation_fee.toLocaleString('en-IN')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Weekly Schedule
          </CardTitle>
          <Dialog open={isDialogOpen && !editingSlot} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingSlot(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
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
                <div className="space-y-2">
                  <Label>Max Patients</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newSlot.max_patients}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, max_patients: parseInt(e.target.value) }))}
                  />
                </div>
                <Button onClick={handleAddSlot} className="w-full">
                  Add Slot
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
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
                        <TableCell>
                          {slot.start_time} - {slot.end_time}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            {slot.max_patients}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={slot.is_active}
                            onCheckedChange={(checked) => handleToggleSlot(slot.slot_id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog open={isDialogOpen && editingSlot?.slot_id === slot.slot_id} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingSlot(null); }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingSlot(slot)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
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
                                  <div className="space-y-2">
                                    <Label>Max Patients</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={editingSlot.max_patients}
                                      onChange={(e) => setEditingSlot(prev => prev ? { ...prev, max_patients: parseInt(e.target.value) } : null)}
                                    />
                                  </div>
                                  <Button onClick={handleSaveSlot} className="w-full">
                                    Save Changes
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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

      {/* Slot Exceptions */}
      {exceptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Exceptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exceptions.map(exception => (
                    <TableRow key={exception.exception_id}>
                      <TableCell className="font-medium">{exception.date_ist}</TableCell>
                      <TableCell>
                        {exception.is_available ? (
                          <Badge variant="outline" className="gap-1 text-green-600 border-green-200 bg-green-50">
                            <Check className="w-3 h-3" />
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-red-600 border-red-200 bg-red-50">
                            <X className="w-3 h-3" />
                            Unavailable
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {exception.reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
