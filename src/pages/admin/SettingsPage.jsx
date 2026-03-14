import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { HiCog6Tooth, HiClock, HiCheckCircle, HiCalendarDays, HiExclamationTriangle, HiTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [deadline, setDeadline] = useState('');
  const [savedDeadline, setSavedDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.preferenceDeadline) {
            const d = data.preferenceDeadline.seconds
              ? new Date(data.preferenceDeadline.seconds * 1000)
              : new Date(data.preferenceDeadline);
            setDeadline(d.toISOString().slice(0, 16));
            setSavedDeadline(d);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    if (!deadline) return toast.error('Please select a deadline date and time');
    const selectedDate = new Date(deadline);
    if (selectedDate < new Date()) {
      return toast.error('Deadline must be in the future');
    }
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'settings', 'general'),
        { preferenceDeadline: selectedDate, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      setSavedDeadline(selectedDate);
      toast.success('Deadline saved successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save settings');
    }
    setSaving(false);
  }

  async function handleClear() {
    if (!confirm('Remove the current deadline? Students will no longer see a countdown.')) return;
    setClearing(true);
    try {
      await setDoc(
        doc(db, 'settings', 'general'),
        { preferenceDeadline: null, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      setDeadline('');
      setSavedDeadline(null);
      toast.success('Deadline cleared');
    } catch (e) {
      toast.error('Failed to clear deadline');
    }
    setClearing(false);
  }

  const isPast = savedDeadline && savedDeadline < new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div className="max-w-2xl space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h2 className="text-lg font-semibold font-display text-slate-900">Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage system configuration and preferences</p>
      </div>

      {/* Current Deadline Status */}
      {savedDeadline && (
        <div className={`rounded-2xl p-4 border flex items-start gap-3 ${isPast ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isPast ? 'bg-rose-100' : 'bg-emerald-100'}`}>
            {isPast
              ? <HiExclamationTriangle className="w-4 h-4 text-rose-500" />
              : <HiClock className="w-4 h-4 text-emerald-500" />
            }
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold ${isPast ? 'text-rose-700' : 'text-emerald-700'}`}>
              {isPast ? 'Deadline has passed' : 'Active deadline set'}
            </p>
            <p className={`text-xs mt-0.5 ${isPast ? 'text-rose-500' : 'text-emerald-600'}`}>
              {savedDeadline.toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long',
                day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )}

      {/* Deadline Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <div className="w-9 h-9 bg-navy-50 rounded-xl flex items-center justify-center">
            <HiCalendarDays className="w-4.5 h-4.5 text-navy-600" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Course Preference Deadline</h3>
            <p className="text-xs text-slate-400">Set the cut-off date for students to submit their preferences</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Deadline Date & Time
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              ⓘ Students will see a live countdown timer on their dashboard
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white text-sm font-semibold rounded-xl shadow-sm shadow-navy-500/25 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <HiCheckCircle className="w-4 h-4" />
                  Save Deadline
                </>
              )}
            </button>

            {savedDeadline && (
              <button
                type="button"
                onClick={handleClear}
                disabled={clearing}
                className="px-4 py-2.5 flex items-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
              >
                <HiTrash className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Info card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <HiCog6Tooth className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">How It Works</h4>
        </div>
        <ul className="space-y-2 text-xs text-slate-500">
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 bg-navy-100 text-navy-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
            Set a deadline here — it's stored in Firestore under <code className="bg-slate-200 px-1 rounded">settings/general</code>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 bg-navy-100 text-navy-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
            Students see a live countdown on their dashboard and preference page
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 bg-navy-100 text-navy-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
            After the deadline passes, the preference submission form is disabled
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
