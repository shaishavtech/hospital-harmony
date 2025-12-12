import { useState, useMemo } from 'react';
import { format, subDays, startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';
import { Calendar, Download, TrendingUp, Users, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { appointments, payments, doctorsWithDepartments } from '@/lib/mock-data';
import { DailyReport } from '@/types/database';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function DashboardPage() {
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');

  const filteredData = useMemo(() => {
    const from = startOfDay(parseISO(fromDate));
    const to = endOfDay(parseISO(toDate));

    let filtered = appointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_datetime_ist.replace(' ', 'T'));
      return isWithinInterval(aptDate, { start: from, end: to });
    });

    if (selectedDoctor !== 'all') {
      filtered = filtered.filter(apt => apt.doctor_id === parseInt(selectedDoctor));
    }

    return filtered;
  }, [fromDate, toDate, selectedDoctor]);

  const metrics = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter(apt => apt.status === 'COMPLETED').length;
    const cancelled = filteredData.filter(apt => apt.status === 'CANCELLED').length;
    const noShow = filteredData.filter(apt => apt.status === 'NO_SHOW').length;

    const completedAppointmentIds = filteredData
      .filter(apt => apt.status === 'COMPLETED')
      .map(apt => apt.appointment_id);

    const revenue = payments
      .filter(p => 
        completedAppointmentIds.includes(p.appointment_id) &&
        ['SUCCESS', 'PARTIAL_REFUND'].includes(p.payment_status)
      )
      .reduce((sum, p) => sum + p.amount, 0);

    return { total, completed, cancelled, noShow, revenue };
  }, [filteredData]);

  const dailyReport = useMemo((): DailyReport[] => {
    const reportMap = new Map<string, DailyReport>();

    filteredData.forEach(apt => {
      const date = apt.appointment_datetime_ist.split(' ')[0];
      const key = `${date}_${apt.doctor_id}`;
      const doctor = doctorsWithDepartments.find(d => d.doctor_id === apt.doctor_id);

      if (!reportMap.has(key)) {
        reportMap.set(key, {
          date,
          doctor_name: doctor?.full_name || 'Unknown',
          doctor_id: apt.doctor_id,
          total: 0,
          completed: 0,
          cancelled: 0,
          no_show: 0,
          revenue: 0,
        });
      }

      const report = reportMap.get(key)!;
      report.total++;
      
      if (apt.status === 'COMPLETED') {
        report.completed++;
        const payment = payments.find(p => 
          p.appointment_id === apt.appointment_id && 
          ['SUCCESS', 'PARTIAL_REFUND'].includes(p.payment_status)
        );
        if (payment) report.revenue += payment.amount;
      }
      if (apt.status === 'CANCELLED') report.cancelled++;
      if (apt.status === 'NO_SHOW') report.no_show++;
    });

    return Array.from(reportMap.values()).sort((a, b) => 
      b.date.localeCompare(a.date) || a.doctor_name.localeCompare(b.doctor_name)
    );
  }, [filteredData]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('MediCare Hospital - Analytics Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Report Period: ${format(parseISO(fromDate), 'dd MMM yyyy')} - ${format(parseISO(toDate), 'dd MMM yyyy')}`, 14, 32);
    doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')} IST`, 14, 38);
    
    if (selectedDoctor !== 'all') {
      const doctor = doctorsWithDepartments.find(d => d.doctor_id === parseInt(selectedDoctor));
      doc.text(`Doctor: ${doctor?.full_name}`, 14, 44);
    }

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Summary', 14, 55);
    
    const summaryData = [
      ['Total Appointments', metrics.total.toString()],
      ['Completed', metrics.completed.toString()],
      ['Cancelled', metrics.cancelled.toString()],
      ['No Show', metrics.noShow.toString()],
    ];

    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [31, 78, 78] },
    });

    doc.text('Daily Report by Doctor', 14, (doc as any).lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Doctor', 'Total', 'Completed', 'Cancelled', 'No Show']],
      body: dailyReport.map(row => [
        format(parseISO(row.date), 'dd MMM yyyy'),
        row.doctor_name,
        row.total,
        row.completed,
        row.cancelled,
        row.no_show,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [31, 78, 78] },
    });

    doc.save(`MediCare_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor appointments, revenue, and performance metrics</p>
        </div>
        <Button onClick={downloadPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Download Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Doctors" />
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
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setFromDate(format(new Date(), 'yyyy-MM-dd'));
                  setToDate(format(new Date(), 'yyyy-MM-dd'));
                  setSelectedDoctor('all');
                }}
              >
                Reset to Today
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Appointments"
          value={metrics.total}
          icon={Calendar}
          variant="primary"
        />
        <MetricCard
          title="Completed"
          value={metrics.completed}
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Cancelled"
          value={metrics.cancelled}
          icon={XCircle}
          variant="danger"
        />
        <MetricCard
          title="No Show"
          value={metrics.noShow}
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Daily Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Daily Report by Doctor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">Cancelled</TableHead>
                  <TableHead className="text-center">No Show</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyReport.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No data available for the selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  dailyReport.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {format(parseISO(row.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>{row.doctor_name}</TableCell>
                      <TableCell className="text-center">{row.total}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {row.completed}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-medium">
                        {row.cancelled}
                      </TableCell>
                      <TableCell className="text-center text-amber-600 font-medium">
                        {row.no_show}
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
