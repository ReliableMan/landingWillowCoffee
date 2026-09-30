import { useEffect, useState } from 'react'
import { contacts, type OpeningHours } from '@/data/content'

/** kind — ключ шаблона в локали (status), time — время для подстановки */
export type OpenStatus = {
  isOpen: boolean
  kind: 'open' | 'opensToday' | 'opensTomorrow' | 'closed'
  time: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// Считаем по времени кофейни, а не по часовому поясу гостя
function getLocalTime(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return { day: WEEKDAYS.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

export function getOpenStatus(hours: OpeningHours[], timeZone: string, date = new Date()): OpenStatus {
  const { day, minutes } = getLocalTime(timeZone, date)
  const today = hours.find((h) => h.days.includes(day))

  if (today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { isOpen: true, kind: 'open', time: today.close }
  }
  if (today && minutes < toMinutes(today.open)) {
    return { isOpen: false, kind: 'opensToday', time: today.open }
  }
  const tomorrow = hours.find((h) => h.days.includes((day + 1) % 7))
  if (tomorrow) return { isOpen: false, kind: 'opensTomorrow', time: tomorrow.open }
  return { isOpen: false, kind: 'closed', time: '' }
}

export function useOpenStatus() {
  const [status, setStatus] = useState(() => getOpenStatus(contacts.hours, contacts.timeZone))

  useEffect(() => {
    const id = setInterval(() => setStatus(getOpenStatus(contacts.hours, contacts.timeZone)), 60_000)
    return () => clearInterval(id)
  }, [])

  return status
}
