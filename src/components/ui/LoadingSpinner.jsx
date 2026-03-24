import { useTheme } from 'styled-components';

/**
 * LoadingSpinner – theme-aware full-page or inline spinner.
 *
 * Props:
 *   size      – 'sm' | 'md' | 'lg'  (default 'md')
 *   text      – string label shown below spinner (pass null/'' to hide)
 *   fullPage  – if true, centres vertically in the viewport
 */
export default function LoadingSpinner({ size = 'md', text = 'Loading...', fullPage = false }) {
  const theme = useTheme();
  const isDark = theme?.mode === 'dark';
  const accent = theme?.colors?.accent ?? '#FF825C';
  const textColor = isDark ? 'rgba(232,226,208,0.5)' : 'rgba(30,41,59,0.45)';
  const trackColor = isDark
    ? 'rgba(201,168,76,0.12)'
    : 'rgba(255,130,92,0.12)';

  const dimensions = { sm: 28, md: 44, lg: 60 };
  const borders   = { sm: 3,  md: 4,  lg: 5  };
  const d = dimensions[size] ?? dimensions.md;
  const b = borders[size]   ?? borders.md;

  const spinKeyframes = `
    @keyframes __vuca_spin {
      to { transform: rotate(360deg); }
    }
  `;

  const spinner = (
    <>
      <style>{spinKeyframes}</style>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: d,
          height: d,
          borderRadius: '50%',
          border: `${b}px solid ${trackColor}`,
          borderTopColor: accent,
          animation: '__vuca_spin 0.75s linear infinite',
        }} />
        {text && (
          <p style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 500,
            color: textColor,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {text}
          </p>
        )}
      </div>
    </>
  );

  if (fullPage) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? '#080d1a' : '#f8f7f4',
      }}>
        {spinner}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 0',
    }}>
      {spinner}
    </div>
  );
}
