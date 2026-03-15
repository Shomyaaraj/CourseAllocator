import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  HiCog6Tooth, HiClock, HiCheckCircle,
  HiCalendarDays, HiExclamationTriangle, HiTrash,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const pageStyle = {
  fontFamily: "'DM Sans', sans-serif",
  maxWidth: 600,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const cardStyle = {
  background: '#0d1425',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 14,
  overflow: 'hidden',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: '#3a4a60',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 8,
};

export default function SettingsPage() {
  const [deadline, setDeadline] = useState('');
  const [savedDeadline, setSavedDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

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
    if (selectedDate < new Date()) return toast.error('Deadline must be in the future');
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
    } catch {
      toast.error('Failed to clear deadline');
    }
    setClearing(false);
  }

  const isPast = savedDeadline && savedDeadline < new Date();

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
      style={pageStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0.3) sepia(1) saturate(3) hue-rotate(5deg);
          cursor: pointer;
          opacity: 0.6;
        }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>

      {/* ── Page Header ── */}
      <div>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 22, fontWeight: 700, color: '#f0ece0', margin: '0 0 4px',
        }}>
          Settings
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 2, background: '#c9a84c' }} />
          <p style={{ fontSize: 13, color: '#3a4a60', margin: 0 }}>
            Manage system configuration and preferences
          </p>
        </div>
      </div>

      {/* ── Current Deadline Status ── */}
      {savedDeadline && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 18px',
            background: isPast ? 'rgba(226,75,74,0.06)' : 'rgba(29,158,117,0.06)',
            border: isPast
              ? '1px solid rgba(226,75,74,0.2)'
              : '1px solid rgba(29,158,117,0.2)',
            borderRadius: 12,
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: isPast ? 'rgba(226,75,74,0.1)' : 'rgba(29,158,117,0.1)',
            border: isPast ? '1px solid rgba(226,75,74,0.2)' : '1px solid rgba(29,158,117,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isPast
              ? <HiExclamationTriangle style={{ width: 17, height: 17, color: '#e24b4a' }} />
              : <HiClock style={{ width: 17, height: 17, color: '#1d9e75' }} />
            }
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: isPast ? '#e24b4a' : '#1d9e75',
              marginBottom: 3,
            }}>
              {isPast ? 'Deadline has passed' : 'Active deadline set'}
            </div>
            <div style={{ fontSize: 12, color: '#3a4a60' }}>
              {savedDeadline.toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long',
                day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Deadline Form Card ── */}
      <div style={cardStyle}>
        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '18px 22px',
          background: 'rgba(201,168,76,0.05)',
          borderBottom: '1px solid rgba(201,168,76,0.08)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HiCalendarDays style={{ width: 19, height: 19, color: '#c9a84c' }} />
          </div>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 15, fontWeight: 700, color: '#e8e2d0',
            }}>
              Course Preference Deadline
            </div>
            <div style={{ fontSize: 12, color: '#3a4a60', marginTop: 2 }}>
              Set the cut-off date for students to submit their preferences
            </div>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSave} style={{ padding: '22px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Deadline Date & Time</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: inputFocused
                  ? '1px solid rgba(201,168,76,0.45)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 9,
                color: '#e8e2d0',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                colorScheme: 'dark',
              }}
            />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginTop: 8, fontSize: 12, color: '#2a3548',
            }}>
              <HiClock style={{ width: 12, height: 12, color: '#3a4a60' }} />
              Students will see a live countdown on their dashboard and preference page
            </div>
          </div>

          {/* Gold divider */}
          <div style={{ height: 1, background: 'rgba(201,168,76,0.08)', marginBottom: 18 }} />

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '12px',
                background: saving ? 'rgba(201,168,76,0.15)' : '#c9a84c',
                color: saving ? '#3a4a60' : '#080d1a',
                fontSize: 13, fontWeight: 700,
                border: 'none', borderRadius: 10,
                cursor: saving ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em',
                transition: 'all 0.2s',
              }}
            >
              {saving ? (
                <>
                  <span style={{
                    width: 14, height: 14,
                    border: '2px solid #3a4a60',
                    borderTopColor: '#c9a84c',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Saving…
                </>
              ) : (
                <>
                  <HiCheckCircle style={{ width: 16, height: 16 }} />
                  Save Deadline
                </>
              )}
            </button>

            {savedDeadline && (
              <button
                type="button"
                onClick={handleClear}
                disabled={clearing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '12px 18px',
                  background: 'rgba(226,75,74,0.06)',
                  border: '1px solid rgba(226,75,74,0.2)',
                  borderRadius: 10, cursor: clearing ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 600, color: '#e24b4a',
                  opacity: clearing ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(226,75,74,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(226,75,74,0.06)'}
              >
                <HiTrash style={{ width: 15, height: 15 }} />
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── How It Works Card ── */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <HiCog6Tooth style={{ width: 15, height: 15, color: '#c9a84c' }} />
          <span style={{
            fontSize: 11, fontWeight: 600, color: '#3a4a60',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            How It Works
          </span>
        </div>

        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#c9a84c',
            }}>
              1
            </div>
            <div style={{ fontSize: 13, color: '#3a4a60', lineHeight: 1.65, marginTop: 2 }}>
              Set a deadline here — it's stored in Firestore under{' '}
              <code style={{
                fontSize: 11, padding: '1px 6px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 5, color: '#8a94a8',
                fontFamily: 'monospace',
              }}>
                settings/general
              </code>
            </div>
          </div>

          {/* Connector */}
          <div style={{ width: 1, height: 12, background: 'rgba(201,168,76,0.1)', marginLeft: 11 }} />

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#c9a84c',
            }}>
              2
            </div>
            <div style={{ fontSize: 13, color: '#3a4a60', lineHeight: 1.65, marginTop: 2 }}>
              Students see a live countdown on their dashboard and preference page
            </div>
          </div>

          {/* Connector */}
          <div style={{ width: 1, height: 12, background: 'rgba(201,168,76,0.1)', marginLeft: 11 }} />

          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#c9a84c',
            }}>
              3
            </div>
            <div style={{ fontSize: 13, color: '#3a4a60', lineHeight: 1.65, marginTop: 2 }}>
              After the deadline passes, the preference submission form is disabled automatically
            </div>
          </div>

        </div>
      </div>

    </motion.div>
  );
}