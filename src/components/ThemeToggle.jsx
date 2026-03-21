import { useThemeToggle } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeToggle();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 9999,
        width: 52,
        height: 52,
        borderRadius: '50%',
        border: 'none',
        background: '#FF825C',
        color: '#fff',
        fontSize: 22,
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(255,130,92,0.4)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}