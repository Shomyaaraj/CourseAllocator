import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'styled-components';
import { HiXMark } from 'react-icons/hi2';

/**
 * Modal – theme-aware animated dialog.
 *
 * Props:
 *   isOpen    – boolean controlling visibility
 *   onClose   – function called when backdrop or X is clicked
 *   title     – string shown in the header
 *   children  – modal body content
 *   size      – 'sm' | 'md' | 'lg' | 'xl'  (default 'md')
 *   maxHeight – CSS string, default '88vh'
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  maxHeight = '88vh',
}) {
  const theme = useTheme();
  const isDark = theme?.mode === 'dark';
  const accent  = theme?.colors?.accent    ?? '#FF825C';
  const textMain  = isDark ? '#e8e2d0' : (theme?.colors?.primary  ?? '#1e293b');
  const textMuted = isDark ? 'rgba(232,226,208,0.45)' : (theme?.colors?.textLight ?? '#64748b');
  const modalBg   = isDark ? '#0d1425' : (theme?.colors?.cardBg   ?? '#ffffff');
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : (theme?.colors?.border ?? '#e2e8f0');
  const headerBg  = isDark ? 'rgba(201,168,76,0.05)' : 'rgba(255,130,92,0.04)';
  const headerBorder = isDark ? 'rgba(201,168,76,0.1)' : 'rgba(255,130,92,0.15)';
  const closeBtnBg = isDark ? 'rgba(255,255,255,0.04)' : (theme?.colors?.secondaryBg ?? '#f8f7f4');

  const maxWidths = { sm: 420, md: 520, lg: 680, xl: 900 };
  const mw = maxWidths[size] ?? maxWidths.md;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 55,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: mw,
              background: modalBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 16,
              overflow: 'hidden',
              maxHeight,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: "'DM Sans', sans-serif",
            }}
            initial={{ scale: 0.93, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 14 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            {/* Header */}
            {title !== undefined && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 22px',
                background: headerBg,
                borderBottom: `1px solid ${headerBorder}`,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                backdropFilter: 'blur(8px)',
                flexShrink: 0,
              }}>
                <div>
                  <div style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: textMain,
                  }}>
                    {title}
                  </div>
                  <div style={{ width: 28, height: 2, background: accent, marginTop: 6 }} />
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  style={{
                    padding: 7,
                    background: closeBtnBg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: textMuted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = textMain}
                  onMouseLeave={e => e.currentTarget.style.color = textMuted}
                >
                  <HiXMark style={{ width: 16, height: 16 }} />
                </button>
              </div>
            )}

            {/* Body */}
            <div style={{ overflowY: 'auto', flexGrow: 1 }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
