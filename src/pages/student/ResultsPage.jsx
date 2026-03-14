import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { HiCheckBadge, HiClock, HiBookOpen, HiExclamationTriangle } from 'react-icons/hi2';

export default function ResultsPage() {
  const { currentUser, userProfile } = useAuth();
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllocation() {
      try {
        const q = query(collection(db, 'allocations'), where('studentId', '==', currentUser.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setAllocation({ id: snap.docs[0].id, ...snap.docs[0].data() });
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

  if (!allocation && !userProfile?.allocatedCourse) {
    return (
      <motion.div
        className="max-w-lg mx-auto text-center py-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 bg-gold-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <HiClock className="w-8 h-8 text-gold-500" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900 mb-2">Results Pending</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Course allocation has not been completed yet. You will be notified once the results are released.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.3 }}
          >
            <HiCheckBadge className="w-16 h-16 text-white mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white font-display mb-1">Course Allocated!</h2>
          <p className="text-white/70 text-sm">Your course has been successfully assigned</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
            <div className="flex items-center gap-3 mb-2">
              <HiBookOpen className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-semibold text-emerald-800">Allocated Course</h3>
            </div>
            <p className="text-xl font-bold text-emerald-900 font-display">
              {allocation?.courseName || userProfile?.allocatedCourse || '—'}
            </p>
            {allocation?.allocatedCourse && (
              <p className="text-sm text-emerald-600 mt-1">Course ID: {allocation.allocatedCourse}</p>
            )}
          </div>

          {allocation?.timestamp && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <HiClock className="w-3.5 h-3.5" />
              <span>Allocated on {new Date(allocation.timestamp.seconds ? allocation.timestamp.seconds * 1000 : allocation.timestamp).toLocaleString()}</span>
            </div>
          )}

          {/* Preferences vs Result */}
          {userProfile?.preferences?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Your Preference Rankings</h4>
              <div className="space-y-2">
                {userProfile.preferences.map((pref, idx) => {
                  const isAllocated = pref === allocation?.allocatedCourse || pref === userProfile?.allocatedCourse;
                  return (
                    <div key={pref} className={`flex items-center gap-3 p-3 rounded-xl border ${isAllocated ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isAllocated ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                        {idx + 1}
                      </div>
                      <span className={`text-sm font-medium ${isAllocated ? 'text-emerald-800' : 'text-slate-600'}`}>{pref}</span>
                      {isAllocated && <HiCheckBadge className="w-4 h-4 text-emerald-500 ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
