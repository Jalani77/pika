import React, { createContext, useContext, useState, useEffect } from 'react';

const AssignmentContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAssignments = () => useContext(AssignmentContext);

export const AssignmentProvider = ({ children }) => {
  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('pika-assignments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pika-assignments', JSON.stringify(assignments));
  }, [assignments]);

  const addAssignment = (assignment) => {
    setAssignments(prev => [...prev, { ...assignment, id: crypto.randomUUID(), score: assignment.score ?? null }]);
  };

  const updateAssignment = (id, updates) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAssignment = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AssignmentContext.Provider value={{ assignments, addAssignment, updateAssignment, deleteAssignment }}>
      {children}
    </AssignmentContext.Provider>
  );
};
