import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { HiChartBar, HiArrowDownTray, HiUserGroup, HiExclamationTriangle } from 'react-icons/hi2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

const COLORS = ['#2d4aff', '#ffc107', '#10b981', '#f43f5e', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

export default function ReportsPage() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesSnap, studentsSnap, allocSnap] = await Promise.all([
          getDocs(collection(db, 'courses')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'allocations')),
        ]);
        setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setStudents(studentsSnap.docs.filter(d => d.data().role === 'student').map(d => ({ id: d.id, ...d.data() })));
        setAllocations(allocSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Course enrollment data
  const enrollmentData = courses.map(c => ({
    name: c.courseName?.length > 12 ? c.courseName.substring(0, 12) + '..' : c.courseName,
    fullName: c.courseName,
    capacity: c.seatCapacity || 0,
    enrolled: (c.seatCapacity || 0) - (c.remainingSeats ?? c.seatCapacity ?? 0),
    remaining: c.remainingSeats ?? c.seatCapacity ?? 0,
  }));

  // Seat utilization  
  const utilizationData = courses.map(c => {
    const cap = c.seatCapacity || 1;
    const enrolled = cap - (c.remainingSeats ?? cap);
    return {
      name: c.courseName?.length > 12 ? c.courseName.substring(0, 12) + '..' : c.courseName,
      utilization: Math.round((enrolled / cap) * 100),
    };
  });

  // Course popularity (by preference count)
  const popularityMap = {};
  students.forEach(s => {
    (s.preferences || []).forEach((pref, idx) => {
      if (!popularityMap[pref]) popularityMap[pref] = { votes: 0, weightedScore: 0 };
      popularityMap[pref].votes += 1;
      popularityMap[pref].weightedScore += (6 - idx); // higher rank = more weight
    });
  });
  const popularityData = Object.entries(popularityMap).map(([courseId, data]) => {
    const course = courses.find(c => (c.courseId || c.id) === courseId);
    return {
      name: course?.courseName?.length > 12 ? course?.courseName?.substring(0, 12) + '..' : (course?.courseName || courseId),
      votes: data.votes,
      score: data.weightedScore,
    };
  }).sort((a, b) => b.score - a.score).slice(0, 8);

  // Department distribution
  const deptMap = {};
  students.forEach(s => {
    const dept = s.department || 'Unknown';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name: name.length > 15 ? name.substring(0, 15) + '..' : name, value }));

  // Unallocated students
  const unallocatedStudents = allocations.filter(a => !a.allocatedCourse);

  function exportPDF() {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VUCA - Course Allocation Report', 14, 22);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    // Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', 14, 42);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Students: ${students.length}`, 14, 50);
    pdf.text(`Total Courses: ${courses.length}`, 14, 56);
    pdf.text(`Allocated: ${allocations.filter(a => a.allocatedCourse).length}`, 14, 62);
    pdf.text(`Unallocated: ${unallocatedStudents.length}`, 14, 68);

    // Course table
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Course Enrollment', 14, 82);

    const tableData = courses.map(c => [
      c.courseId,
      c.courseName,
      c.seatCapacity,
      c.remainingSeats ?? c.seatCapacity,
      (c.seatCapacity || 0) - (c.remainingSeats ?? c.seatCapacity ?? 0),
    ]);

    pdf.autoTable({
      startY: 86,
      head: [['Course ID', 'Name', 'Capacity', 'Remaining', 'Enrolled']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [13, 29, 128] },
    });

    // Allocations table
    if (allocations.length > 0) {
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Student Allocations', 14, 22);

      pdf.autoTable({
        startY: 28,
        head: [['Student', 'Reg No.', 'Department', 'Course', 'Pref Rank']],
        body: allocations.map(a => [
          a.studentName,
          a.registrationNumber,
          a.department,
          a.courseName || 'Unallocated',
          a.preferenceRank || '—',
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [13, 29, 128] },
      });
    }

    pdf.save('VUCA_Allocation_Report.pdf');
    toast.success('PDF exported!');
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold font-display text-slate-900">Reports & Analytics</h2>
          <p className="text-sm text-slate-400">Comprehensive system analytics</p>
        </div>
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-navy-600 to-navy-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-navy-500/25 transition-all"
        >
          <HiArrowDownTray className="w-4 h-4" /> Export PDF
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold font-display text-slate-900 mb-4">Course Enrollment</h3>
          {enrollmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="capacity" fill="#e2e8f0" name="Capacity" radius={[4, 4, 0, 0]} />
                <Bar dataKey="enrolled" fill="#2d4aff" name="Enrolled" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400 text-center py-12">No data</p>}
        </div>

        {/* Seat Utilization */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold font-display text-slate-900 mb-4">Seat Utilization (%)</h3>
          {utilizationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={utilizationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="utilization" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400 text-center py-12">No data</p>}
        </div>

        {/* Popularity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold font-display text-slate-900 mb-4">Course Popularity</h3>
          {popularityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={popularityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="votes" fill="#8b5cf6" name="Preferences" radius={[4, 4, 0, 0]} />
                <Bar dataKey="score" fill="#ffc107" name="Weighted Score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400 text-center py-12">No preferences data</p>}
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold font-display text-slate-900 mb-4">Student Distribution by Dept</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-400 text-center py-12">No data</p>}
        </div>
      </div>

      {/* Unallocated Students */}
      {unallocatedStudents.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <HiExclamationTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-semibold font-display text-rose-900">Unallocated Students ({unallocatedStudents.length})</h3>
          </div>
          <div className="space-y-2">
            {unallocatedStudents.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl">
                <div className="w-8 h-8 bg-rose-200 rounded-lg flex items-center justify-center text-xs font-bold text-rose-700">
                  {s.studentName?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-rose-900">{s.studentName}</p>
                  <p className="text-xs text-rose-500">{s.registrationNumber} • {s.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
