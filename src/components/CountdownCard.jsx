import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { differenceInMilliseconds, intervalToDuration, format } from 'date-fns';

const CountdownCard = ({ assignment }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgency, setUrgency] = useState('green');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const due = new Date(assignment.due_date);
      const diff = differenceInMilliseconds(due, now);

      if (diff <= 0) {
        setTimeLeft('Overdue');
        setUrgency('red');
        return;
      }

      // Urgency Logic
      const hours = diff / (1000 * 60 * 60);
      if (hours < 24) setUrgency('red');
      else if (hours < 72) setUrgency('yellow');
      else setUrgency('green');

      // Formatting D:H:M
      const duration = intervalToDuration({ start: now, end: due });
      const days = duration.days || 0;
      const hrs = duration.hours || 0;
      const mins = duration.minutes || 0;

      setTimeLeft(`${days}d : ${hrs}h : ${mins}m`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [assignment.due_date]);

  const colorStyles = {
    red: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400",
    yellow: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    green: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
  };

  const badgeStyles = {
    red: "bg-red-500 text-white",
    yellow: "bg-yellow-500 text-black",
    green: "bg-green-500 text-white"
  };

  return (
    <div className={cn("p-6 rounded-xl border flex flex-col justify-between transition-all hover:shadow-md", colorStyles[urgency])}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-70 flex items-center gap-1">
            {assignment.course}
          </span>
          <h3 className="text-xl font-bold mt-1">{assignment.name}</h3>
        </div>
        <span className={cn("text-xs px-2 py-1 rounded-full font-bold uppercase", badgeStyles[urgency])}>
          {assignment.type}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-2xl font-mono font-bold">
          <Clock className="w-6 h-6 opacity-70" />
          {timeLeft}
        </div>
        
        <div className="flex items-center justify-between text-sm opacity-80 border-t border-current pt-4">
           <div className="flex items-center gap-2">
             <Calendar className="w-4 h-4" />
             {format(new Date(assignment.due_date), "MMM d, h:mm a")}
           </div>
           <div>
             Weight: {assignment.weight}%
           </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownCard;
