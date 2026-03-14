import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import {
  HiCheckBadge, HiClock, HiBookOpen, HiExclamationTriangle,
  HiQueueList, HiChartBar, HiCalendarDays, HiBuildingOffice2,
  HiSparkles
} from 'react-icons/hi2';

export default function ResultsPage() {
  const { currentUser, userProfile } = useAuth();
  const [allocation, setAllocation] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllocation() {
      try {
        const q = query(collection(db, 'allocations'), where('studentId', '==', currentUser.uid));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const allocData = { id: snap.docs[0].id, ...snap.docs[0].data() };
          setAllocation(allocData);

          // Fetch the full course details if allocated
          if (allocData.allocatedCourse) {
            const coursesSnap = await getDocs(collection(db, 'courses'));
            const course = coursesSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .find(c => (c.courseId || c.id) === allocData.allocatedCourse);
            if (course) setCourseDetails(course);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchAllocation();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No allocation record at all
  if (!allocation && !userProfile?.allocatedCourse) {
    return (
      <motion.div
        className="max-w-md mx-auto text-center py-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 bg-gold-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <HiClock className="w-8 h-8 text-gold-500" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900 mb-2">Results Pending</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Course allocation has not been run yet. Once the administrator runs the Gale-Shapley algorithm, your result will appear here.
        </p>
      </motion.div>
    );
  }

  // Student was processed but left unallocated
  if (allocation?.unallocated || (!allocation?.allocatedCourse && !userProfile?.allocatedCourse)) {
    return (
      <motion.div
        className="max-w-md mx-auto text-center py-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <HiExclamationTriangle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900 mb-2">Not Allocated</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          Unfortunately, none of your preferred courses had seats available for your priority level. Please contact your administrator.
        </p>
        {allocation?.preferences?.length > 0 && (
          <div className="text-left bg-white rounded-2xl border border-slate-200 p-4 mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Your Preferences</p>
            <div className="space-y-2">
              {allocation.preferences.map((pref, i) => (
                <div key={pref} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className="w-5 h-5 bg-slate-100 rounded-md flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">{i + 1}</span>
                  {pref}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  const courseName = allocation?.courseName || courseDetails?.courseName || userProfile?.allocatedCourse || '—';
  const courseId = allocation?.allocatedCourse || '—';
  const prefRank = allocation?.preferenceRank;
  const timetableSlot = allocation?.timetableSlot || courseDetails?.timetableSlot;
  const department = courseDetails?.department;
  const allocatedAt = allocation?.timestamp
    ? new Date(allocation.timestamp.seconds ? allocation.timestamp.seconds * 1000 : allocation.timestamp)
    : null;

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-4"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Success Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-center text-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.2 }}
          className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <HiCheckBadge className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold font-display mb-1">Course Allocated!</h2>
        <p className="text-white/70 text-sm">
          Your course has been assigned via Gale-Shapley stable matching
        </p>
        {prefRank && (
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-white/15 rounded-full text-sm font-semibold">
            <HiSparkles className="w-4 h-4" />
            {prefRank === 1 ? '🎉 First Choice Allocated!' : `Preference #${prefRank} Allocated`}
          </div>
        )}
      </div>

      {/* Course Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <HiBookOpen className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Allocated Course</span>
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900">{courseName}</h3>
          <p className="text-sm text-slate-400 mt-0.5">{courseId !== courseName ? courseId : ''}</p>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          {department && (
            <div>
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <HiBuildingOffice2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Department</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">{department}</p>
            </div>
          )}
          {timetableSlot && (
            <div>
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <HiCalendarDays className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Schedule</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">{timetableSlot}</p>
            </div>
          )}
          {prefRank && (
            <div>
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <HiQueueList className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Preference Rank</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">#{prefRank} of {allocation?.preferences?.length || '?'}</p>
            </div>
          )}
          {allocatedAt && (
            <div>
              <div className="flex items-center gap-1 text-slate-400 mb-1">
                <HiClock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Allocated On</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {allocatedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
        {allocation?.overridden && (
          <div className="px-5 py-2 bg-amber-50 border-t border-amber-100">
            <p className="text-xs text-amber-600 font-medium">⚡ This allocation was manually overridden by an administrator</p>
          </div>
        )}
      </div>

      {/* Preferences vs Result */}
      {userProfile?.preferences?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <HiQueueList className="w-4 h-4 text-navy-500" />
            <h4 className="text-sm font-semibold text-slate-900">Your Preference Rankings</h4>
          </div>
          <div className="space-y-2">
            {userProfile.preferences.map((pref, idx) => {
              const isAllocated =
                pref === allocation?.allocatedCourse ||
                pref === (courseDetails?.courseId || courseDetails?.id);
              return (
                <div
                  key={pref}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    isAllocated
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isAllocated ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-sm font-medium flex-1 truncate ${isAllocated ? 'text-emerald-800' : 'text-slate-600'}`}>
                    {pref}
                  </span>
                  {isAllocated && (
                    <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <HiCheckBadge className="w-4 h-4" /> Allocated
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CGPA Info */}
      {userProfile?.cgpa && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
          <HiChartBar className="w-5 h-5 text-slate-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-400 font-medium">Your CGPA used for priority ranking</p>
            <p className="text-sm font-bold text-slate-700">{Number(userProfile.cgpa).toFixed(2)} / 10.0</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
