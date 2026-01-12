import React from 'react';
import { useAssignments } from '../context/AssignmentContext';
import CountdownCard from '../components/CountdownCard';

const Dashboard = () => {
  const { assignments } = useAssignments();

  // Filter pending assignments and sort by due date
  const pendingAssignments = assignments
    .filter(a => a.score === null)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Urgency Visualizer & Pending Tasks</p>
      </header>

      {pendingAssignments.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground text-lg">No pending assignments! 🎉</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingAssignments.map(assignment => (
            <CountdownCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
