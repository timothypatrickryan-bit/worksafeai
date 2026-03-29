import React, { useState, useEffect } from 'react'

export default function CalendarSection({ state }) {
  const [today, setToday] = useState(new Date())
  const [upcomingTasks, setUpcomingTasks] = useState([])

  // Cron jobs definition
  const cronJobs = [
    {
      id: 'heartbeat',
      name: 'Mission Control Heartbeat',
      description: 'Check task board & agent status',
      frequency: 'Every 30 minutes',
      pattern: '*/30 * * * *',
      nextRun: getNextHeartbeat(),
      color: 'bg-blue-50 border-blue-300',
      icon: '💓',
    },
    {
      id: 'gap-smart-detection',
      name: 'Smart Progress Detection',
      description: 'Analyze git commits, deployments, task completion',
      frequency: 'Daily @ 8:00 AM EST',
      pattern: '0 8 * * *',
      nextRun: getNextDailyAt(8),
      color: 'bg-green-50 border-green-300',
      icon: '📊',
    },
    {
      id: 'gap-daily-review',
      name: 'Daily Gap Analysis Review',
      description: 'Identify focus area toward mission',
      frequency: 'Daily @ 9:00 AM EST',
      pattern: '0 9 * * *',
      nextRun: getNextDailyAt(9),
      color: 'bg-green-50 border-green-300',
      icon: '🎯',
    },
    {
      id: 'gap-weekly-prompt',
      name: 'Weekly Gap Check-in Prompt',
      description: 'Remind to do quick 5-min assessment update',
      frequency: 'Friday @ 4:00 PM EST',
      pattern: '0 16 * * 5',
      nextRun: getNextWeeklyAt(5, 16),
      color: 'bg-amber-50 border-amber-300',
      icon: '📅',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Auto-Post',
      description: 'Generate & post content',
      frequency: 'Tue, Thu, Sat @ 9:00 AM EST',
      pattern: '0 9 * * 2,4,6',
      nextRun: getNextLinkedInPost(),
      color: 'bg-purple-50 border-purple-300',
      icon: '📱',
    },
  ]

  useEffect(() => {
    const upcoming = cronJobs
      .map(job => ({
        ...job,
        nextRun: job.id === 'linkedin' ? getNextLinkedInPost() : getNextHeartbeat(),
      }))
      .sort((a, b) => new Date(a.nextRun) - new Date(b.nextRun))

    setUpcomingTasks(upcoming)
  }, [today])

  function getNextHeartbeat() {
    const now = new Date()
    let next = new Date(now)
    const minutes = next.getMinutes()
    next.setMinutes(Math.ceil(minutes / 30) * 30, 0, 0)
    if (next <= now) next.setMinutes(next.getMinutes() + 30)
    return next
  }

  function getNextLinkedInPost() {
    const now = new Date()
    const linkedinDays = [2, 4, 6] // Tue, Thu, Sat
    let next = new Date(now)
    next.setHours(9, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      if (linkedinDays.includes(next.getDay())) {
        if (next > now) return next
      }
      next.setDate(next.getDate() + 1)
    }
    return next
  }

  function getNextDailyAt(hour) {
    const now = new Date()
    let next = new Date(now)
    next.setHours(hour, 0, 0, 0)
    if (next <= now) {
      next.setDate(next.getDate() + 1)
    }
    return next
  }

  function getNextWeeklyAt(dayOfWeek, hour) {
    const now = new Date()
    let next = new Date(now)
    next.setHours(hour, 0, 0, 0)

    // If it's already past the target day/time this week, move to next week
    while (next.getDay() !== dayOfWeek || next <= now) {
      next.setDate(next.getDate() + 1)
    }
    return next
  }

  const getWeekDates = () => {
    const curr = new Date(today)
    const first = curr.getDate() - curr.getDay()
    const dates = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr)
      d.setDate(first + i)
      dates.push(d)
    }
    return dates
  }

  const getTimeUntil = (futureDate) => {
    const now = new Date()
    const ms = futureDate - now
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `in ${days}d ${hours % 24}h`
    }
    if (hours > 0) return `in ${hours}h ${minutes}m`
    return `in ${minutes}m`
  }

  const weekDates = getWeekDates()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-md p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">5</p>
          <p className="text-xs text-gray-600 mt-1">Scheduled Jobs</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">336</p>
          <p className="text-xs text-gray-600 mt-1">Checks/week</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">7</p>
          <p className="text-xs text-gray-600 mt-1">GAP Reviews/week</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">3</p>
          <p className="text-xs text-gray-600 mt-1">LinkedIn/week</p>
        </div>
      </div>

      {/* Upcoming Tasks (Priority List) */}
      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-3">📋 Upcoming (Next 7 Days)</h3>
        <div className="space-y-2">
          {upcomingTasks.map((task) => (
            <div
              key={task.id}
              className={`border-2 ${task.color} rounded-md p-3 flex items-start justify-between`}
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">
                  <span className="mr-2">{task.icon}</span>
                  {task.name}
                </p>
                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {task.frequency}
                </p>
              </div>
              <div className="text-right ml-3 whitespace-nowrap">
                <p className="text-xs font-bold text-gray-900">
                  {task.nextRun.toLocaleTimeString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs font-medium text-blue-600 mt-1">
                  {getTimeUntil(task.nextRun)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* This Week Grid */}
      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-3">📅 This Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, i) => {
            const isLinkedInDay = [2, 4, 6].includes(date.getDay())
            const isToday = date.toDateString() === today.toDateString()

            return (
              <div
                key={i}
                className={`text-center p-3 rounded-md border-2 transition-all ${
                  isToday
                    ? 'bg-blue-100 border-blue-400 font-bold'
                    : isLinkedInDay
                    ? 'bg-purple-50 border-purple-300'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="text-xs font-semibold text-gray-600 uppercase">
                  {dayNames[i]}
                </div>
                <div className="text-lg font-bold text-gray-900 mt-1">
                  {date.getDate()}
                </div>
                {isLinkedInDay && (
                  <div className="text-sm mt-2 font-semibold text-purple-600">
                    📱 9 AM
                  </div>
                )}
                {isLinkedInDay && !isToday && (
                  <div className="text-xs text-purple-500">Post</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Cron Details */}
      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-3">⚙️ Cron Patterns</h3>
        <div className="space-y-2">
          {cronJobs.map((job) => (
            <div key={job.id} className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <p className="text-xs font-mono bg-gray-900 text-gray-100 px-2 py-1 rounded-sm mb-2 overflow-x-auto">
                {job.pattern} — {job.name}
              </p>
              <p className="text-xs text-gray-600">
                Config: <span className="font-mono text-gray-700">openclaw.json</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reference */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p className="text-xs font-semibold text-yellow-900 mb-2">💡 Cron Quick Reference</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-yellow-800">
          <div>
            <p className="font-mono">*/30 * * * *</p>
            <p className="text-yellow-700">Every 30 minutes</p>
          </div>
          <div>
            <p className="font-mono">0 9 * * 2,4,6</p>
            <p className="text-yellow-700">Tue, Thu, Sat @ 9 AM</p>
          </div>
        </div>
      </div>
    </div>
  )
}
