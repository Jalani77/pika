import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AssignmentProvider } from './context/AssignmentContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GradeArchitect from './pages/GradeArchitect';
import SyllabusExtraction from './pages/SyllabusExtraction';
import StudyPlanner from './pages/StudyPlanner';
import NotificationCenter from './pages/NotificationCenter';

function App() {
  return (
    <AssignmentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="grades" element={<GradeArchitect />} />
            <Route path="syllabus" element={<SyllabusExtraction />} />
            <Route path="planner" element={<StudyPlanner />} />
            <Route path="notifications" element={<NotificationCenter />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AssignmentProvider>
  );
}

export default App;
