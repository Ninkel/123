export async function fetchToday() {
  const res = await fetch('/api/today');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Ошибка загрузки даты');
  }
  return res.json();
}

export async function fetchSlots(dateStr) {
  const res = await fetch(`/api/slots?date=${encodeURIComponent(dateStr)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Ошибка загрузки слотов');
  }
  return res.json();
}