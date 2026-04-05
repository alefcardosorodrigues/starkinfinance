import React, { createContext, useContext, useState, useEffect } from 'react';

interface MonthContextType {
  selectedMonth: number; // 0-11
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  nextYear: () => void;
  prevYear: () => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage or current date
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const saved = localStorage.getItem('starkin_month');
    return saved ? parseInt(saved, 10) : new Date().getMonth();
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem('starkin_year');
    return saved ? parseInt(saved, 10) : new Date().getFullYear();
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('starkin_month', selectedMonth.toString());
    localStorage.setItem('starkin_year', selectedYear.toString());
  }, [selectedMonth, selectedYear]);

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(v => v + 1);
    } else {
      setSelectedMonth(v => v + 1);
    }
  };

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(v => v - 1);
    } else {
      setSelectedMonth(v => v - 1);
    }
  };

  const nextYear = () => setSelectedYear(v => v + 1);
  const prevYear = () => setSelectedYear(v => v - 1);

  return (
    <MonthContext.Provider
      value={{
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        nextMonth,
        prevMonth,
        nextYear,
        prevYear,
      }}
    >
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
}
