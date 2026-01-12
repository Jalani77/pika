import { useEffect, useMemo, useState } from 'react'
import { Bell, Phone, Send } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Toggle } from '../../components/ui/Toggle'
import { usePika } from '../../store/usePika'

export function NotificationsTab() {
  const { notifications, setNotifications, assignments } = usePika()
  const [didLog, setDidLog] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const next24h = useMemo(() => {
    const day = 24 * 60 * 60 * 1000
    return assignments.filter((a) => {
      const due = new Date(`${a.due_date}T23:59:59`).getTime()
      const ms = due - now
      return ms > 0 && ms < day
    })
  }, [assignments, now])

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold tracking-tight text-zinc-50">Notification Center</div>
        <div className="mt-1 text-sm text-zinc-400">
          Twilio integration is mocked: “Simulate SMS” logs the payload to the console.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone number
            </CardTitle>
            <CardDescription>Used as the “to” field for Twilio SMS.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              placeholder="+1 555 555 5555"
              value={notifications.phoneNumber}
              onChange={(e) => {
                setDidLog(false)
                setNotifications({ ...notifications, phoneNumber: e.target.value })
              }}
            />
            <div className="text-xs text-zinc-400">
              Tip: include country code (E.164) for real Twilio delivery.
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 lg:col-span-2">
          <Toggle
            checked={notifications.alert24hDeadlines}
            onCheckedChange={(next) => {
              setDidLog(false)
              setNotifications({ ...notifications, alert24hDeadlines: next })
            }}
            label="24h Deadline Alerts"
            description={`Warn when something is due within 24 hours (${next24h.length} upcoming).`}
          />
          <Toggle
            checked={notifications.dailyStudyReminders}
            onCheckedChange={(next) => {
              setDidLog(false)
              setNotifications({ ...notifications, dailyStudyReminders: next })
            }}
            label="Daily Study Reminders"
            description="Send a daily prompt based on the Study Planner schedule."
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Simulate Twilio send
              </CardTitle>
              <CardDescription>
                This does not send SMS—check your browser console for the payload.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => {
                  const payload = {
                    to: notifications.phoneNumber,
                    from: '+15551234567',
                    messages: [
                      ...(notifications.alert24hDeadlines
                        ? [
                            {
                              kind: 'deadline_24h',
                              body:
                                next24h.length === 0
                                  ? 'Pika: No assignments due in the next 24 hours.'
                                  : `Pika: Due soon — ${next24h.map((a) => a.name).join(', ')}.`,
                            },
                          ]
                        : []),
                      ...(notifications.dailyStudyReminders
                        ? [
                            {
                              kind: 'daily_study_reminder',
                              body: 'Pika: Your daily study plan is ready. Open Study Planner to begin.',
                            },
                          ]
                        : []),
                    ],
                    provider: 'twilio',
                    meta: {
                      app: 'pika',
                      simulated: true,
                    },
                  }

                  console.log('[Pika] Twilio payload (simulated):', payload)
                  setDidLog(true)
                }}
                disabled={!notifications.phoneNumber}
              >
                <Send className="h-4 w-4" />
                Simulate SMS Send
              </Button>

              {didLog ? <div className="text-xs text-emerald-300">Payload logged.</div> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

