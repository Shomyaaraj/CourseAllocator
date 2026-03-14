import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { HiArrowsUpDown, HiBookOpen, HiClock, HiCheckCircle, HiXCircle, HiSparkles, HiChevronUp, HiChevronDown, HiTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function PreferencePage() {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deadline, setDeadline] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch courses
        const coursesSnap = await getDocs(collection(db, 'courses'));
        const coursesList = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCourses(coursesList);

        // Fetch settings for deadline
        const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
        if (settingsSnap.exists()) {
          const dl = settingsSnap.data().preferenceDeadline;
          if (dl) setDeadline(new Date(dl.seconds ? dl.seconds * 1000 : dl));
        }

        // Load existing preferences
        if (userProfile?.preferences?.length > 0) {
          setPreferences(userProfile.preferences);
        }

        // Generate recommendations
        const recommended = coursesList.filter(c => {
          const deptMatch = c.department === userProfile?.department || c.department === 'Open Elective';
          const prereqsMet = !c.prerequisites?.length || c.prerequisites.every(p => userProfile?.completedCourses?.includes(p));
          const hasSeats = (c.remainingSeats ?? c.seatCapacity) > 0;
          return deptMatch && prereqsMet && hasSeats;
        }).slice(0, 5);
        setRecommendations(recommended);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load courses');
      }
      setLoading(false);
    }
    fetchData();
  }, [userProfile]);

  // Countdown timer
  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const deadlinePassed = deadline && deadline.getTime() < Date.now();

  function addPreference(courseId) {
    if (preferences.includes(courseId)) {
      return toast.error('Course already in preferences');
    }
    if (preferences.length >= 6) {
      return toast.error('Maximum 6 preferences allowed');
    }
    setPreferences([...preferences, courseId]);
    toast.success('Course added to preferences');
  }

  function removePreference(courseId) {
    setPreferences(preferences.filter(id => id !== courseId));
  }

  function moveUp(index) {
    if (index === 0) return;
    const newPrefs = [...preferences];
    [newPrefs[index - 1], newPrefs[index]] = [newPrefs[index], newPrefs[index - 1]];
    setPreferences(newPrefs);
  }

  function moveDown(index) {
    if (index === preferences.length - 1) return;
    const newPrefs = [...preferences];
    [newPrefs[index + 1], newPrefs[index]] = [newPrefs[index], newPrefs[index + 1]];
    setPreferences(newPrefs);
  }

  async function savePreferences() {
    if (deadlinePassed) return toast.error('Deadline has passed');
    if (preferences.length === 0) return toast.error('Please select at least one course');
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { preferences });
      setUserProfile({ ...userProfile, preferences });
      toast.success('Preferences saved successfully!');
    } catch (e) {
      toast.error('Failed to save preferences');
    }
    setSaving(false);
  }

  function getCourse(id) {
    return courses.find(c => c.id === id || c.courseId === id);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Deadline Timer */}
      {deadline && (
        <div className={`rounded-2xl border p-5 ${deadlinePassed ? 'bg-rose-50 border-rose-200' : 'bg-gradient-to-r from-navy-600 to-navy-800 border-transparent'}`}>
          <div className="flex items-center gap-3 mb-3">
            <HiClock className={`w-5 h-5 ${deadlinePassed ? 'text-rose-500' : 'text-gold-300'}`} />
            <h3 className={`text-sm font-semibold ${deadlinePassed ? 'text-rose-700' : 'text-white'}`}>
              {deadlinePassed ? 'Submission Deadline Passed' : 'Submission Deadline'}
            </h3>
          </div>
          {!deadlinePassed && timeLeft && (
            <div className="flex gap-3">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Min', value: timeLeft.minutes },
                { label: 'Sec', value: timeLeft.seconds },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center min-w-[60px]">
                  <p className="text-2xl font-bold text-white font-display">{String(item.value).padStart(2, '0')}</p>
                  <p className="text-[10px] text-white/50 font-medium uppercase">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <HiSparkles className="w-5 h-5 text-gold-500" />
            <h3 className="text-base font-semibold font-display text-slate-900">Recommended for You</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-gold-50/50 border border-gold-200/50 rounded-xl">
                <div className="min-w-0 mr-2">
                  <p className="text-sm font-medium text-slate-800 truncate">{course.courseName}</p>
                  <p className="text-xs text-slate-400">{course.courseId}</p>
                </div>
                <button
                  onClick={() => addPreference(course.courseId || course.id)}
                  disabled={deadlinePassed || preferences.includes(course.courseId || course.id)}
                  className="shrink-0 px-3 py-1.5 text-xs font-semibold text-navy-700 bg-white border border-navy-200 hover:bg-navy-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {preferences.includes(course.courseId || course.id) ? 'Added' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Courses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold font-display text-slate-900 mb-4">Available Courses</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {courses.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No courses available yet.</p>
            ) : (
              courses.map((course) => {
                const cId = course.courseId || course.id;
                const isSelected = preferences.includes(cId);
                const seats = course.remainingSeats ?? course.seatCapacity;
                return (
                  <div key={course.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isSelected ? 'bg-navy-50 border-navy-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                    <div className="min-w-0 mr-3">
                      <p className="text-sm font-medium text-slate-800 truncate">{course.courseName}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-400">{cId}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className={`text-xs font-medium ${seats > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {seats > 0 ? `${seats} seats` : 'Full'}
                        </span>
                      </div>
                      {course.prerequisites?.length > 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Prerequisites: {course.prerequisites.join(', ')}</p>
                      )}
                    </div>
                    <button
                      onClick={() => isSelected ? removePreference(cId) : addPreference(cId)}
                      disabled={deadlinePassed}
                      className={`shrink-0 p-2 rounded-lg transition-colors disabled:opacity-40 ${
                        isSelected ? 'text-rose-500 hover:bg-rose-50' : 'text-navy-500 hover:bg-navy-50'
                      }`}
                    >
                      {isSelected ? <HiXCircle className="w-5 h-5" /> : <HiCheckCircle className="w-5 h-5" />}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ranked Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold font-display text-slate-900">Your Ranked Preferences</h3>
            <span className="text-xs font-medium text-slate-400">{preferences.length}/6</span>
          </div>
          {preferences.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <HiArrowsUpDown className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Select courses from the left to rank them</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {preferences.map((prefId, idx) => {
                const course = getCourse(prefId);
                return (
                  <motion.div
                    key={prefId}
                    layout
                    className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl"
                  >
                    <div className="w-7 h-7 bg-navy-100 rounded-lg flex items-center justify-center text-xs font-bold text-navy-700 shrink-0">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{course?.courseName || prefId}</p>
                      <p className="text-xs text-slate-400">{prefId}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"><HiChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => moveDown(idx)} disabled={idx === preferences.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"><HiChevronDown className="w-4 h-4" /></button>
                      <button onClick={() => removePreference(prefId)} className="p-1 text-rose-400 hover:text-rose-600"><HiTrash className="w-4 h-4" /></button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <button
            onClick={savePreferences}
            disabled={saving || deadlinePassed || preferences.length === 0}
            className="w-full py-3 px-4 bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white font-semibold rounded-xl shadow-lg shadow-navy-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
