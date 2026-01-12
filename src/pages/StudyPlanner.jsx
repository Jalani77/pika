import React from 'react';
import { useAssignments } from '../context/AssignmentContext';
import { addDays, format, differenceInCalendarDays, isBefore, startOfDay } from 'date-fns';
import { cn } from '../lib/utils';
import { BookOpen, Clock } from 'lucide-react';

const StudyPlanner = () => {
  const { assignments } = useAssignments();

  // Generate next 7 days
  const startDate = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Distribute study sessions
  const schedule = {};
  
  // Initialize schedule
  days.forEach(day => {
    schedule[format(day, 'yyyy-MM-dd')] = {
      date: day,
      sessions: [],
      totalHours: 0
    };
  });

  assignments.forEach(assignment => {
    // Skip completed or assignments without hours
    if (assignment.score !== null || !assignment.estimated_hours) return;

    const dueDate = new Date(assignment.due_date);
    
    // Skip if overdue (already handled in dashboard) or due today (panic mode?)
    if (isBefore(dueDate, startDate)) return;

    const daysUntilDue = differenceInCalendarDays(dueDate, startDate);
    
    // Avoid division by zero, though logic above handles it mostly. 
    // If due today (daysUntilDue=0), we should probably put all hours today.
    // If due tomorrow (daysUntilDue=1), 1 day of work.
    const spreadDays = Math.max(1, daysUntilDue); 
    const hoursPerDay = assignment.estimated_hours / spreadDays;

    // Allocate to days
    for (let i = 0; i < spreadDays; i++) {
      const targetDate = addDays(startDate, i);
      const dateKey = format(targetDate, 'yyyy-MM-dd');
      
      // Only add if this day is in our view
      if (schedule[dateKey]) {
        schedule[dateKey].sessions.push({
          ...assignment,
          allocatedHours: hoursPerDay
        });
        schedule[dateKey].totalHours += hoursPerDay;
      }
    }
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <header className="mb-6 flex-shrink-0">
        <h2 className="text-3xl font-bold tracking-tight">Study Planner</h2>
        <p className="text-muted-foreground">AI-Generated Weekly Schedule</p>
      </header>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayData = schedule[dateKey];
            const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');

            return (
              <div 
                key={dateKey} 
                className={cn(
                  "w-64 flex-shrink-0 flex flex-col rounded-xl border",
                  isToday ? "border-primary bg-primary/5" : "border-border bg-card"
                )}
              >
                {/* Header */}
                <div className={cn(
                  "p-4 border-b border-border rounded-t-xl",
                  isToday ? "bg-primary/10" : "bg-muted/50"
                )}>
                  <div className="font-bold text-lg">{format(day, 'EEEE')}</div>
                  <div className="text-sm text-muted-foreground">{format(day, 'MMM d')}</div>
                  {dayData.totalHours > 0 && (
                     <div className="mt-2 text-xs font-semibold px-2 py-1 rounded bg-background inline-flex items-center gap-1">
                       <Clock className="w-3 h-3" /> {dayData.totalHours.toFixed(1)} hrs load
                     </div>
                  )}
                </div>

                {/* Sessions */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {dayData.sessions.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground/50 text-sm italic">
                      Free day
                    </div>
                  ) : (
                    dayData.sessions.map((session, idx) => (
                      <div key={`${session.id}-${idx}`} className="p-3 bg-background border border-border rounded-lg shadow-sm hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                            {session.course}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {session.allocatedHours.toFixed(1)}h
                          </span>
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2 leading-tight">{session.name}</h4>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                           <BookOpen className="w-3 h-3" /> Study Session
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
