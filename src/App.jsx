import React, { useState, useEffect } from 'react'
import { fetchToday, fetchSlots } from './api.js'

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]
const MONTHS_RU_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
]
const WEEKDAYS_RU = [
  'Воскресенье', 'Понедельник', 'Вторник', 'Среда',
  'Четверг', 'Пятница', 'Суббота'
]
const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function getToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function formatDateISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [viewYear, setViewYear] = useState(null)
  const [viewMonth, setViewMonth] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState(null)
  const [slots, setSlots] = useState([])

  // Загрузка "сегодня" с сервера при монтировании
  useEffect(() => {
    fetchToday()
      .then(data => {
        setViewYear(data.year)
        setViewMonth(data.month)
        setSelectedDate(new Date(data.year, data.month, data.date))
        setLoading(false)
      })
      .catch(err => {
        setLoadError(err.message)
        setLoading(false)
      })
  }, [])

  // Загрузка слотов при смене выбранной даты
  useEffect(() => {
    if (!selectedDate) return

    setSlotsLoading(true)
    setSlotsError(null)
    setSlots([])

    const dateStr = formatDateISO(selectedDate)

    fetchSlots(dateStr)
      .then(data => {
        setSlots(data.slots)
        setSlotsLoading(false)
      })
      .catch(err => {
        setSlotsError(err.message)
        setSlotsLoading(false)
      })
  }, [selectedDate])

  const handlePrevMonth = () => {
    setViewMonth(m => {
      if (m === 0) {
        setViewYear(y => y - 1)
        return 11
      }
      return m - 1
    })
  }

  const handleNextMonth = () => {
    setViewMonth(m => {
      if (m === 11) {
        setViewYear(y => y + 1)
        return 0
      }
      return m + 1
    })
  }

  const handleDayClick = (day) => {
    const date = new Date(viewYear, viewMonth, day)
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeClick = (time) => {
    setSelectedTime(time)
  }

  const handleRetry = () => {
    setLoadError(null)
    setLoading(true)
    fetchToday()
      .then(data => {
        setViewYear(data.year)
        setViewMonth(data.month)
        setSelectedDate(new Date(data.year, data.month, data.date))
        setLoading(false)
      })
      .catch(err => {
        setLoadError(err.message)
        setLoading(false)
      })
  }

  const handleRetrySlots = () => {
    if (selectedDate) {
      setSelectedDate(new Date(selectedDate)) // триггерит useEffect
    }
  }

  // Построение сетки календаря
  const calendarCells = []
  if (viewYear !== null && viewMonth !== null) {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    const totalDays = daysInMonth(viewYear, viewMonth)
    const prevMonthDays = daysInMonth(viewYear, viewMonth - 1)
    const todayDate = getToday()

    for (let i = startOffset - 1; i >= 0; i--) {
      calendarCells.push(
        <button key={`prev-${i}`} className="day muted" disabled>
          {prevMonthDays - i}
        </button>
      )
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(viewYear, viewMonth, d)
      const isPast = date < todayDate
      const isSelected = selectedDate && isSameDay(date, selectedDate)

      calendarCells.push(
        <button
          key={d}
          className={`day${isPast ? ' muted' : ''}${isSelected ? ' selected' : ''}`}
          disabled={isPast}
          onClick={() => !isPast && handleDayClick(d)}
        >
          {d}
        </button>
      )
    }

    const totalCells = startOffset + totalDays
    const remainder = totalCells % 7
    if (remainder !== 0) {
      for (let i = 1; i <= 7 - remainder; i++) {
        calendarCells.push(
          <button key={`next-${i}`} className="day muted" disabled>
            {i}
          </button>
        )
      }
    }
  }

  // Сводка внизу
  let summaryDateText = '—'
  let summaryTimeText = 'время не выбрано'
  if (selectedDate) {
    const wd = WEEKDAYS_RU[selectedDate.getDay()]
    summaryDateText = `${wd}, ${selectedDate.getDate()} ${MONTHS_RU_GENITIVE[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
    if (selectedTime) summaryTimeText = selectedTime
  }

  return (
    <>
      {/* Шапка */}
      <header className="header">
        <div className="header-container">
          <a href="#" className="logo">
            <img src="/logo.png" alt="Barbershop" />
          </a>
          <nav className="navigation">
            <a href="#">Услуги</a>
            <a href="#">Галерея</a>
            <a href="#">Команда</a>
            <a href="#">Отзывы</a>
            <a href="#">Контакты</a>
          </nav>
        </div>
      </header>

      {/* Индикатор этапов */}
      <div className="steps">
        <div className="steps-container">
          <div className="step">
            <div className="step-number completed">1</div>
            <div className="step-line"></div>
          </div>
          <div className="step">
            <div className="step-number completed">2</div>
            <div className="step-line"></div>
          </div>
          <div className="step">
            <div className="step-number active">3</div>
            <div className="step-line"></div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-line"></div>
          </div>
          <div className="step">
            <div className="step-number">5</div>
          </div>
        </div>
      </div>

      {/* Основная часть */}
      <section className="booking">
        <div className="booking-container">
          <div className="booking-title">
            <a href="#" className="back-button">‹</a>
            <h1>Дата и время</h1>
          </div>

          {loading && (
            <div className="loading-message">Загрузка…</div>
          )}

          {loadError && (
            <div className="error-message">
              {loadError}
              <br />
              <button onClick={handleRetry}>Повторить</button>
            </div>
          )}

          {!loading && !loadError && (
            <>
              <div className="booking-content">
                {/* Календарь */}
                <div className="calendar">
                  <div className="calendar-header">
                    <h2>{MONTHS_RU[viewMonth]} {viewYear}</h2>
                    <div className="calendar-controls">
                      <button className="calendar-arrow" onClick={handlePrevMonth}>‹</button>
                      <button className="calendar-arrow" onClick={handleNextMonth}>›</button>
                    </div>
                  </div>
                  <div className="calendar-grid">
                    {WEEKDAYS_SHORT.map(wd => (
                      <div key={wd} className="weekday">{wd}</div>
                    ))}
                    {calendarCells}
                  </div>
                </div>

                {/* Время */}
                <div className="time-section">
                  <h2>Доступное время</h2>

                  {slotsLoading && (
                    <div className="loading-message">Загрузка слотов…</div>
                  )}

                  {slotsError && (
                    <div className="error-message">
                      {slotsError}
                      <br />
                      <button onClick={handleRetrySlots}>Повторить</button>
                    </div>
                  )}

                  {!slotsLoading && !slotsError && (
                    <div className="time-grid">
                      {slots.map(slot => {
                        const isSelected = selectedTime === slot.time && !slot.booked
                        return (
                          <button
                            key={slot.time}
                            className={`time-slot${slot.booked ? ' booked' : ''}${isSelected ? ' selected' : ''}`}
                            disabled={slot.booked}
                            onClick={() => !slot.booked && handleTimeClick(slot.time)}
                          >
                            {slot.time}
                            {slot.booked && <span>Занято</span>}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Нижняя панель сводки */}
              <div className="booking-summary">
                <div className="booking-summary-info">
                  <span className="booking-summary-date">{summaryDateText}</span>
                  <span className="booking-summary-time">{summaryTimeText}</span>
                </div>
              </div>

              {/* Кнопка Далее */}
              <div className="booking-actions">
                <button className="next-button">Далее</button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Подвал */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-logo">
              <img src="/logo-footer.png" alt="Barbershop" />
            </div>
            <div className="footer-contacts">
              <h2>Контакты</h2>
              <p><span className="contact-icon">⌖</span> ул. Садовая, 15, Москва</p>
              <p><span className="contact-icon">☎</span> +7 (495) 123-45-67</p>
            </div>
            <div className="footer-hours">
              <h3>Режим работы</h3>
              <p>Пн–Пт: 9:00 – 21:00</p>
              <p>Сб–Вс: 10:00 – 19:00</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026. Все права защищены.</p>
            <a href="#">Политика конфиденциальности</a>
          </div>
        </div>
      </footer>
    </>
  )
}