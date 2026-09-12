export interface JourneyBrief {
  place: string; pace: string; reason: string; destination: string; style: string;
  adults: string; children: string; budget: string; date: string; dateFlexibility: string;
  nights: string; departure: string; priorities: string; access: string; notes: string;
  name: string; email: string; phone: string; contactPreference: string; country: string;
}

export function cleanBrief(data: FormData): JourneyBrief {
  const limits = {
    place: 40, pace: 40, reason: 60, destination: 100, style: 120,
    adults: 20, children: 30, budget: 100, date: 10, dateFlexibility: 60,
    nights: 60, departure: 120, access: 500, notes: 1500,
    name: 120, email: 200, phone: 60, contactPreference: 40, country: 100,
  };
  const cleaned = Object.fromEntries(Object.entries(limits).map(([key, limit]) => [key, String(data.get(key) || '').trim().slice(0, limit)]));
  const priorities = data.getAll('priorities').map(value => String(value).trim().slice(0, 80)).filter(Boolean).slice(0, 8).join(', ');
  return { ...cleaned, priorities } as unknown as JourneyBrief;
}

export function validDeparture(value: string, minimum: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= minimum;
}

export function validEmail(value: string): boolean {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

export function briefText(d: JourneyBrief, delivered = false): string {
  return [
    'PARDUS LUXURY ESCAPES', 'Your personal journey brief', '',
    `Place: ${d.place || 'Open'}`,
    `Pace: ${d.pace || 'Open'}`,
    `Reason: ${d.reason || 'To discuss'}`,
    `Destination: ${d.destination || 'Open to inspiration'}`,
    `Journey idea: ${d.style || 'To discuss'}`,
    `Travellers: ${d.adults || 'To discuss'} adults; ${d.children || 'No children noted'}`,
    `Budget per person: ${d.budget || 'To discuss'}`,
    `Preferred departure: ${d.date || 'Flexible'}`,
    `Date flexibility: ${d.dateFlexibility || 'To discuss'}`,
    `Length of stay: ${d.nights || 'Flexible'}`,
    `Departure city: ${d.departure || 'To discuss'}`,
    `Priorities: ${d.priorities || 'To discuss'}`,
    `Mobility, dietary or practical considerations: ${d.access || 'None noted'}`,
    `Name: ${d.name || 'Not provided'}`,
    `Email: ${d.email || 'Not provided'}`,
    `Telephone / WhatsApp: ${d.phone || 'Not provided'}`,
    `Preferred reply: ${d.contactPreference || 'To discuss'}`,
    `Country: ${d.country || 'Not provided'}`, '', 'What would make it special:',
    d.notes || 'To be discussed.', '',
    delivered
      ? 'A copy of this brief was submitted to Pardus as an online enquiry when you downloaded it.'
      : 'This brief has not been sent to Pardus and does not confirm a booking.',
    'No payment, reservation or availability guarantee is created by this document.', ''
  ].join('\n');
}
