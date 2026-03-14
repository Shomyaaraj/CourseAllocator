import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { HiCog6Tooth, HiClock, HiCheckCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        preferenceDeadline: new Date(deadline),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast.success('Settings saved!');
    } catch (e) {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <motion.div className="max-w-2xl space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h2 className="text-lg font-semibold font-display text-slate-900">Settings</h2>
        <p className="text-sm text-slate-400">Manage system configuration</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HiClock className="w-5 h-5 text-navy-500" />
            <h3 className="text-base font-semibold font-display text-slate-900">Preference Deadline</h3>
          </div>
          <p className="text-sm text-slate-400 mb-3">Set the deadline for students to submit their course preferences.</p>
          <input
            type="datetime-local"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500"
          />
        </div>

        <button
          type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-navy-600 to-navy-700 text-white font-semibold rounded-xl shadow-lg shadow-navy-500/25 transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <HiCheckCircle className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
