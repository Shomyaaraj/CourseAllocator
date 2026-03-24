import { createContext, useContext, useState } from "react";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../styles/theme";

const ThemeToggleContext = createContext();

export const useThemeToggle = () => useContext(ThemeToggleContext);

export const ThemeContextProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('vuca-theme') === 'dark'
  );

  const toggleTheme = () =>
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('vuca-theme', next ? 'dark' : 'light');
      return next;
    });

  return (
    <ThemeToggleContext.Provider value={{ isDark, toggleTheme }}>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        {children}
      </ThemeProvider>
    </ThemeToggleContext.Provider>
  );
};