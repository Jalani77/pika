import React, { useState } from 'react';
import { Bell, Smartphone, Send, Shield, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

const NotificationCenter = () => {
  const [phone, setPhone] = useState('');
  const [settings, setSettings] = useState({
    deadlineAlerts: true,
    studyReminders: false,
    gradeUpdates: true
  });
  const [lastLog, setLastLog] = useState(null);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const simulateSMS = () => {
    if (!phone) return;
    
    const payload = {
      to: phone,
      from: "+15550199",
      body: "Pika Reminder: Calculus Midterm is due in 2 days. You have 2.5 hours of study scheduled for today.",
      timestamp: new Date().toISOString()
    };

    console.log("[Twilio Mock] SMS Payload:", payload);
    setLastLog(payload);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Notification Center</h2>
        <p className="text-muted-foreground">Manage your alerts and integrations</p>
      </header>

      <div className="bg-card border border-border rounded-xl p-6 space-y-8">
        {/* Phone Input */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" /> Contact Information
          </h3>
          <div className="flex gap-4">
            <input 
              type="tel" 
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Your phone number is used only for local SMS simulations in this demo.
          </p>
        </div>

        <div className="w-full h-px bg-border" />

        {/* Toggles */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Alert Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">24h Deadline Alerts</label>
                <p className="text-xs text-muted-foreground">Get notified when an assignment is due tomorrow</p>
              </div>
              <button 
                onClick={() => handleToggle('deadlineAlerts')}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  settings.deadlineAlerts ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                  settings.deadlineAlerts ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Daily Study Reminders</label>
                <p className="text-xs text-muted-foreground">Morning summary of your study schedule</p>
              </div>
              <button 
                onClick={() => handleToggle('studyReminders')}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  settings.studyReminders ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                  settings.studyReminders ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-border" />

        {/* Simulation */}
        <div className="space-y-4">
           <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Developer Tools
          </h3>
          <button 
            onClick={simulateSMS}
            disabled={!phone}
            className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Simulate SMS Send
          </button>
          
          {lastLog && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg font-mono text-xs overflow-x-auto">
              <div className="text-muted-foreground mb-1">Last Logged Payload:</div>
              <pre>{JSON.stringify(lastLog, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
