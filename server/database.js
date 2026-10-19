const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const today = new Date();
today.setHours(0, 0, 0, 0);

export function getToday() {
  return {
    year: today.getFullYear(),
    month: today.getMonth(),
    date: today.getDate(),
    iso: today.toISOString().split('T')[0]
  };
}

export function getSlotsForDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error('Некорректная дата');
  }

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const hash = (day * 7 + month * 13 + year) % TIME_SLOTS.length;
  const booked = [];
  for (let i = 0; i < 2; i++) {
    booked.push(TIME_SLOTS[(hash + i * 3) % TIME_SLOTS.length]);
  }

  return TIME_SLOTS.map(time => ({
    time,
    booked: booked.includes(time)
  }));
}
