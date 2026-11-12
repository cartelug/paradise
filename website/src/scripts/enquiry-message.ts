import { site } from '../data/site.ts';

// Shared by email drafts, saved copies and online delivery. No message is sent here.
export function enquiryText(fields: FormData): string {
  return [
    'PARDUS TRAVEL ENQUIRY', '',
    `Destination: ${fields.get('destination') || 'To discuss'}`,
    `Departure: ${fields.get('date') || 'Flexible'}`,
    `Travellers: ${fields.get('travellers') || 'To discuss'}`,
    `Budget per person: ${fields.get('budget') || 'To discuss'}`,
    `Name: ${fields.get('name') || ''}`,
    `Reply email: ${fields.get('email') || ''}`,
    `Phone or WhatsApp: ${fields.get('phone') || 'Not provided'}`, '',
    `Notes: ${fields.get('notes') || 'To discuss'}`, '',
    'Please send a proposal in UGX, with a USD reference where useful, and the itinerary, inclusions and terms.',
    '', site.fareNotice,
  ].join('\n');
}
