export type JourneyBrief = Record<'destination' | 'style' | 'travellers' | 'budget' | 'date' | 'nights' | 'departure' | 'notes' | 'name', string>;

export function cleanBrief(data: FormData): JourneyBrief {
  const limits = { destination: 100, style: 100, travellers: 50, budget: 100, date: 10, nights: 60, departure: 120, notes: 1500, name: 120 };
  return Object.fromEntries(Object.entries(limits).map(([key, limit]) => [key, String(data.get(key) || '').trim().slice(0, limit)])) as JourneyBrief;
}

export function validDeparture(value: string, minimum: string): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= minimum;
}

export function briefText(d: JourneyBrief, delivered = false): string {
  return [
    'PARDUS LUXURY ESCAPES', 'Your personal journey brief', '',
    `Destination: ${d.destination || 'Open to inspiration'}`,
    `Travel style: ${d.style || 'To discuss'}`,
    `Travellers: ${d.travellers || 'To discuss'}`,
    `Budget per person: ${d.budget || 'To discuss'}`,
    `Preferred departure: ${d.date || 'Flexible'}`,
    `Length of stay: ${d.nights || 'Flexible'}`,
    `Departure city: ${d.departure || 'To discuss'}`,
    `Name: ${d.name || 'Not provided'}`, '', 'What would make it special:',
    d.notes || 'To be discussed.', '',
    delivered
      ? 'A copy of this brief was submitted to Pardus as an online enquiry when you downloaded it.'
      : 'This brief has not been sent to Pardus and does not confirm a booking.',
    'No payment, reservation or availability guarantee is created by this document.', ''
  ].join('\n');
}
