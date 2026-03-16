import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts';
import {
  HiChartBar, HiArrowDownTray, HiExclamationTriangle,
} from 'react-icons/hi2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const COLORS = ['#c9a84c', '#1d9e75', '#378add', '#e24b4a', '#7f77dd', '#ba7517', '#d4537e', '#639922'];

const cardStyle = {
  background: '#0d1425',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 14,
  overflow: 'hidden',
};

const chartHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '16px 20px',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
};

const chartTitleStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 15, fontWeight: 700, color: '#e8e2d0',
};

// ✅ FIXED: brighter text, visible border, lighter cursor
const tooltipStyle = {
  contentStyle: {
    background: '#111e36',
    border: '1px solid rgba(201,168,76,0.35)',
    borderRadius: 8,
    color: '#f0ece0',
    fontSize: 12,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  labelStyle: { color: '#c9a84c', fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: '#e8e2d0' },
  cursor: { fill: 'rgba(255,255,255,0.05)' },
};

// ✅ FIXED: brighter axis labels
const axisStyle = { fontSize: 11, fill: '#6e7e98' };

export default function ReportsPage() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesSnap, studentsSnap, allocSnap] = await Promise.all([
          getDocs(collection(db, 'courses')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'allocations')),
        ]);
        setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setStudents(
          studentsSnap.docs
            .filter(d => d.data().role === 'student')
            .map(d => ({ id: d.id, ...d.data() }))
        );
        setAllocations(allocSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchData();
  }, []);

  const enrollmentData = courses.map(c => ({
    name: c.courseName?.length > 12 ? c.courseName.substring(0, 12) + '..' : c.courseName,
    fullName: c.courseName,
    capacity: c.seatCapacity || 0,
    enrolled: (c.seatCapacity || 0) - (c.remainingSeats ?? c.seatCapacity ?? 0),
  }));

  const utilizationData = courses.map(c => {
    const cap = c.seatCapacity || 1;
    const enrolled = cap - (c.remainingSeats ?? cap);
    return {
      name: c.courseName?.length > 14 ? c.courseName.substring(0, 14) + '..' : c.courseName,
      utilization: Math.round((enrolled / cap) * 100),
    };
  });

  const popularityMap = {};
  students.forEach(s => {
    (s.preferences || []).forEach((pref, idx) => {
      if (!popularityMap[pref]) popularityMap[pref] = { votes: 0, weightedScore: 0 };
      popularityMap[pref].votes += 1;
      popularityMap[pref].weightedScore += (6 - idx);
    });
  });
  const popularityData = Object.entries(popularityMap).map(([courseId, data]) => {
    const course = courses.find(c => (c.courseId || c.id) === courseId);
    return {
      name: course?.courseName?.length > 12
        ? course?.courseName?.substring(0, 12) + '..'
        : (course?.courseName || courseId),
      votes: data.votes,
      score: data.weightedScore,
    };
  }).sort((a, b) => b.score - a.score).slice(0, 8);

  const deptMap = {};
  students.forEach(s => {
    const dept = s.department || 'Unknown';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '..' : name,
    value,
  }));

  const unallocatedStudents = allocations.filter(a => !a.allocatedCourse);
  const allocatedCount = allocations.filter(a => a.allocatedCourse).length;

  async function exportPDF() {
    if (!reportRef.current || exporting) return;
    setExporting(true);
    const toastId = toast.loading('Generating PDF…');
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#080d1a',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const headerH = 22;

      pdf.setFillColor(8, 13, 26);
      pdf.rect(0, 0, pageW, pageH, 'F');
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(240, 236, 224);
      pdf.text('VUCA – Course Allocation Report', margin, 12);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(58, 74, 96);
      pdf.text(
        `Generated: ${new Date().toLocaleString()}   |   Students: ${students.length}   |   Courses: ${courses.length}   |   Allocated: ${allocatedCount}   |   Unallocated: ${unallocatedStudents.length}`,
        margin, 18
      );

      const availW = pageW - margin * 2;
      const availH = pageH - headerH - margin;
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = Math.min(availW / imgW, availH / imgH);
      const drawW = imgW * ratio;
      const drawH = imgH * ratio;
      const xOff = margin + (availW - drawW) / 2;

      pdf.addImage(imgData, 'PNG', xOff, headerH, drawW, drawH);
      pdf.save('VUCA_Reports.pdf');
      toast.success('PDF saved!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Export failed — see console.', { id: toastId });
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid rgba(201,168,76,0.15)',
          borderTopColor: '#c9a84c',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <motion.div
      style={{ fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: 20 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22, fontWeight: 700, color: '#f0ece0', margin: '0 0 4px',
          }}>
            Reports & Analytics
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 2, background: '#c9a84c' }} />
            <p style={{ fontSize: 13, color: '#3a4a60', margin: 0 }}>
              Comprehensive system analytics
            </p>
          </div>
        </div>
        <button
          onClick={exportPDF}
          disabled={exporting}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px',
            background: exporting ? 'rgba(201,168,76,0.45)' : '#c9a84c',
            color: '#080d1a',
            fontSize: 13, fontWeight: 700,
            border: 'none', borderRadius: 10,
            cursor: exporting ? 'not-allowed' : 'pointer',
            letterSpacing: '0.02em',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { if (!exporting) e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <HiArrowDownTray style={{ width: 16, height: 16 }} />
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      {/* ── Summary Strip ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1, background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        <div style={{ background: '#0d1425', padding: '18px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#c9a84c', lineHeight: 1 }}>
            {students.length}
          </div>
          <div style={{ fontSize: 10, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 5 }}>
            Students
          </div>
        </div>
        <div style={{ background: '#0d1425', padding: '18px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#c9a84c', lineHeight: 1 }}>
            {courses.length}
          </div>
          <div style={{ fontSize: 10, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 5 }}>
            Courses
          </div>
        </div>
        <div style={{ background: '#0d1425', padding: '18px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1d9e75', lineHeight: 1 }}>
            {allocatedCount}
          </div>
          <div style={{ fontSize: 10, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 5 }}>
            Allocated
          </div>
        </div>
        <div style={{ background: '#0d1425', padding: '18px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: unallocatedStudents.length > 0 ? '#e24b4a' : '#3a4a60', lineHeight: 1 }}>
            {unallocatedStudents.length}
          </div>
          <div style={{ fontSize: 10, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginTop: 5 }}>
            Unallocated
          </div>
        </div>
      </div>

      {/* ── Charts Grid ── */}
      <div ref={reportRef} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* ── Course Enrollment ── */}
        <div style={cardStyle}>
          <div style={chartHeaderStyle}>
            <HiChartBar style={{ width: 15, height: 15, color: '#c9a84c' }} />
            <span style={chartTitleStyle}>Course Enrollment</span>
          </div>
          <div style={{ padding: '16px 8px 16px 0' }}>
            {enrollmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={enrollmentData} margin={{ left: -10, right: 10 }}>
                  {/* ✅ FIXED: more visible grid lines */}
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8a94a8', paddingTop: 8 }} />
                  {/* ✅ FIXED: capacity bar is now a visible light blue ghost */}
                  <Bar dataKey="capacity" fill="rgba(110,126,152,0.35)" radius={[4, 4, 0, 0]} name="Capacity" />
                  <Bar dataKey="enrolled" fill="#c9a84c" radius={[4, 4, 0, 0]} name="Enrolled" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#2a3548', fontSize: 13 }}>No data</div>
            )}
          </div>
        </div>

        {/* ── Seat Utilization ── */}
        <div style={cardStyle}>
          <div style={chartHeaderStyle}>
            <HiChartBar style={{ width: 15, height: 15, color: '#1d9e75' }} />
            <span style={chartTitleStyle}>Seat Utilization (%)</span>
          </div>
          <div style={{ padding: '16px 8px 16px 0' }}>
            {utilizationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={utilizationData} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    type="number" domain={[0, 100]}
                    tick={axisStyle}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    tickLine={false}
                    // ✅ FIXED: add % unit to tick labels
                    tickFormatter={v => `${v}%`}
                  />
                  <YAxis
                    type="category" dataKey="name"
                    tick={axisStyle} width={110}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={v => [`${v}%`, 'Utilization']}
                  />
                  {/* ✅ FIXED: brighter green + visible label inside bar */}
                  <Bar
                    dataKey="utilization"
                    fill="#1d9e75"
                    radius={[0, 4, 4, 0]}
                    name="Utilization %"
                    label={{
                      position: 'right',
                      formatter: v => v > 0 ? `${v}%` : '',
                      fill: '#6e7e98',
                      fontSize: 10,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#2a3548', fontSize: 13 }}>No data</div>
            )}
          </div>
        </div>

        {/* ── Course Popularity ── */}
        <div style={cardStyle}>
          <div style={chartHeaderStyle}>
            <HiChartBar style={{ width: 15, height: 15, color: '#7f77dd' }} />
            <span style={chartTitleStyle}>Course Popularity</span>
          </div>
          <div style={{ padding: '16px 8px 16px 0' }}>
            {popularityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={popularityData} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={axisStyle} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#8a94a8', paddingTop: 8 }} />
                  <Bar dataKey="votes" fill="#7f77dd" radius={[4, 4, 0, 0]} name="Preferences" />
                  {/* ✅ FIXED: slightly more opaque gold for weighted score */}
                  <Bar dataKey="score" fill="#c9a84c" radius={[4, 4, 0, 0]} name="Weighted Score" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#2a3548', fontSize: 13 }}>No preferences data</div>
            )}
          </div>
        </div>

        {/* ── Department Distribution ── */}
        <div style={cardStyle}>
          <div style={chartHeaderStyle}>
            <HiChartBar style={{ width: 15, height: 15, color: '#378add' }} />
            <span style={chartTitleStyle}>Student Distribution by Dept</span>
          </div>
          <div style={{ padding: '8px 0 16px' }}>
            {deptData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deptData}
                      cx="50%" cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      // ✅ FIXED: visible percentage labels outside slices
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }}
                    >
                      {deptData.map((entry, i) => (
                        <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>

                {/* ✅ FIXED: brighter legend text */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '6px 16px',
                  padding: '4px 20px 0',
                }}>
                  {deptData.map((d, i) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: 3, flexShrink: 0,
                        background: COLORS[i % COLORS.length],
                      }} />
                      <span style={{ fontSize: 11, color: '#8a94a8' }}>
                        {d.name}
                        <span style={{ color: COLORS[i % COLORS.length], fontWeight: 700, marginLeft: 4 }}>
                          {d.value}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#2a3548', fontSize: 13 }}>No data</div>
            )}
          </div>
        </div>

      </div>

      {/* ── Unallocated Students ── */}
      {unallocatedStudents.length > 0 && (
        <div style={{
          background: '#0d1425',
          border: '1px solid rgba(226,75,74,0.2)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '16px 20px',
            background: 'rgba(226,75,74,0.06)',
            borderBottom: '1px solid rgba(226,75,74,0.1)',
          }}>
            <HiExclamationTriangle style={{ width: 16, height: 16, color: '#e24b4a' }} />
            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 15, fontWeight: 700, color: '#e24b4a',
            }}>
              Unallocated Students
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: 'rgba(226,75,74,0.12)',
              border: '1px solid rgba(226,75,74,0.2)',
              color: '#e24b4a',
              padding: '2px 8px', borderRadius: 100,
            }}>
              {unallocatedStudents.length}
            </span>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {unallocatedStudents.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  background: 'rgba(226,75,74,0.04)',
                  border: '1px solid rgba(226,75,74,0.1)',
                  borderRadius: 10,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: 'rgba(226,75,74,0.12)',
                  border: '1px solid rgba(226,75,74,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#e24b4a',
                }}>
                  {s.studentName?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e2d0' }}>
                    {s.studentName}
                  </div>
                  <div style={{ fontSize: 11, color: '#3a4a60', marginTop: 1 }}>
                    {s.registrationNumber} · {s.department}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </motion.div>
  );
}