import React, { useState } from 'react';
import { useAssignments } from '../context/AssignmentContext';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const GradeCard = ({ course, assignments }) => {
  const [goal, setGoal] = useState(90);

  const graded = assignments.filter(a => a.score !== null);
  const remaining = assignments.filter(a => a.score === null);

  const currentWeight = graded.reduce((sum, a) => sum + a.weight, 0);
  const currentWeightedScore = graded.reduce((sum, a) => sum + (a.score * a.weight), 0);
  const currentAverage = currentWeight > 0 ? (currentWeightedScore / currentWeight) : 100;

  const remainingWeight = remaining.reduce((sum, a) => sum + a.weight, 0);
  const totalWeight = currentWeight + remainingWeight;

  // Needed Score Calculation
  // We want: (CurrentWeightedScore + (Needed * RemainingWeight)) / TotalWeight = Goal
  const neededScore = remainingWeight > 0
    ? ((goal * totalWeight) - currentWeightedScore) / remainingWeight
    : null;

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold">{course}</h3>
          <p className="text-sm text-muted-foreground">{assignments.length} Assignments</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">
            {currentAverage.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Current Grade</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Goal Input */}
        <div className="bg-secondary/20 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" /> Goal Grade
            </label>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="w-20 bg-background border border-border rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="pt-2 border-t border-border/50">
            {remainingWeight === 0 ? (
              <p className="text-sm text-muted-foreground">Course completed.</p>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Needed Avg:</span>
                <span className={cn(
                  "font-mono font-bold text-lg",
                  neededScore > 100 ? "text-destructive" : neededScore > 85 ? "text-yellow-500" : "text-green-500"
                )}>
                  {neededScore.toFixed(1)}%
                </span>
              </div>
            )}
            {neededScore > 100 && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Mathematical impossibility
              </p>
            )}
          </div>
        </div>

        {/* Assignments Table */}
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 font-medium">Assignment</th>
                <th className="px-3 py-2 font-medium w-20">Weight</th>
                <th className="px-3 py-2 font-medium w-20">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignments.map(a => (
                <tr key={a.id} className="group hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{a.type}</div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{a.weight}%</td>
                  <td className="px-3 py-2">
                    {a.score !== null ? (
                      <span className={cn(
                        "font-medium",
                        a.score >= 90 ? "text-green-600" : a.score >= 80 ? "text-primary" : "text-yellow-600"
                      )}>
                        {a.score}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const GradeArchitect = () => {
  const { assignments } = useAssignments();

  // Group by course
  const courses = assignments.reduce((acc, curr) => {
    if (!acc[curr.course]) acc[curr.course] = [];
    acc[curr.course].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Grade Architect</h2>
        <p className="text-muted-foreground">Predictive Grade Calculator & Course Analysis</p>
      </header>

      {Object.keys(courses).length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No courses found. Add assignments to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(courses).map(([courseName, courseAssignments]) => (
            <GradeCard key={courseName} course={courseName} assignments={courseAssignments} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GradeArchitect;
