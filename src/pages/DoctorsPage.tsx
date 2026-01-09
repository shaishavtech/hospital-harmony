import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDoctors, useDepartments } from '@/hooks/useDatabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const navigate = useNavigate();

  const { data: doctors = [], isLoading: loadingDoctors } = useDoctors();
  const { data: departments = [], isLoading: loadingDepartments } = useDepartments();

  const isLoading = loadingDoctors || loadingDepartments;

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.full_name.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(search.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
      doctor.department_id === parseInt(departmentFilter);

    return matchesSearch && matchesDepartment && doctor.is_active;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Doctors</h1>
        <p className="text-muted-foreground mt-1">Manage doctor schedules and availability</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Doctor Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredDoctors.map(doctor => (
            <Card key={doctor.doctor_id} className="card-hover overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 ring-2 ring-primary/10">
                    <AvatarImage src={doctor.photo_url || undefined} alt={doctor.full_name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {doctor.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{doctor.full_name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{doctor.specialty}</p>
                    <Badge variant="secondary" className="mt-2">
                      {doctor.departments?.name || 'No Department'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Consultation Fee</p>
                    <p className="text-lg font-semibold text-foreground">
                      ₹{doctor.consultation_fee.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/doctors/${doctor.doctor_id}`)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No doctors found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
