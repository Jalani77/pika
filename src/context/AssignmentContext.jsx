import React, { createContext, useContext, useState, useEffect } from 'react';

const AssignmentContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAssignments = () => useContext(AssignmentContext);

export const AssignmentProvider = ({ children }) => {
  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('pika-assignments');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Calculus Midterm',
        type: 'exam',
        weight: 30,
        score: null,
        due_date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days
        estimated_hours: 10,
        course: 'Calculus'
      },
      {
        id: '2',
        name: 'Physics Lab Report',
        type: 'homework',
        weight: 10,
        score: null,
        due_date: new Date(Date.now() + 3600000 * 5).toISOString(), // 5 hours
        estimated_hours: 3,
        course: 'Physics'
      },
      {
        id: '3',
        name: 'History Essay',
        type: 'project',
        weight: 20,
        score: 85,
        due_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        estimated_hours: 5,
        course: 'History'
      },
      {
        id: '4',
        name: 'CS Final Project',
        type: 'project',
        weight: 40,
        score: null,
        due_date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days
        estimated_hours: 20,
        course: 'Computer Science'
      }
    ];
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
