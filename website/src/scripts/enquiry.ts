import { deliverEnquiry } from './deliver';
import { site } from '../data/site';

document.querySelectorAll<HTMLFormElement>('[data-escape-enquiry]').forEach(form => {
  const status = form.querySelector<HTMLElement>('[data-enquiry-status]')!;
  const date = form.querySelector<HTMLInputElement>('[name="date"]')!;
  const destination = form.querySelector<HTMLSelectElement>('[name="destination"]')!;
  const today = new Date();
  date.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const chosen = new URLSearchParams(location.search).get('destination');
  if (chosen && [...destination.options].some(option => option.value === chosen)) destination.value = chosen;
  // Services ticked in the homepage picker arrive as ?services=Flights&services=... and start the note for you.
  const services = new URLSearchParams(location.search).getAll('services').map(value => value.trim()).filter(Boolean).slice(0, 13);
  const notes = form.querySelector<HTMLTextAreaElement>('[name="notes"]');
  if (services.length && notes && !notes.value.trim()) {
    notes.value = `I would like Pardus to arrange: ${services.join(', ')}.`;
    notes.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const thanks = form.querySelector<HTMLElement>('[data-enquiry-thanks]');
  const name = form.querySelector<HTMLInputElement>('[name="name"]')!;
  const email = form.querySelector<HTMLInputElement>('[name="email"]')!;
  // Native constraint validation runs before submit. Release a whitespace-only name's
  // custom error as soon as it is edited, so the corrected form can submit again.
  name.addEventListener('input', () => name.setCustomValidity(''));
  const draft = () => {
    const fields = new FormData(form);
    return ['PARDUS TRAVEL ENQUIRY', '', `Destination: ${fields.get('destination')}`, `Departure: ${fields.get('date') || 'Flexible'}`, `Travellers: ${fields.get('travellers')}`, `Budget per person: ${fields.get('budget')}`, `Name: ${fields.get('name')}`, `Reply email: ${fields.get('email')}`, `Phone or WhatsApp: ${fields.get('phone') || 'Not provided'}`, '', `Notes: ${fields.get('notes') || 'To discuss'}`, '', 'Please send a proposal in UGX, with a USD reference where useful, and the itinerary, inclusions and terms.'].join('\n');
  };
  const fields = form.querySelector<HTMLElement>('[data-enquiry-fields]')!;
  // Shows the confirmation in place of the form, and puts focus on it so a screen reader announces it.
  const confirmSent = () => {
    if (!thanks) return;
    const first = name.value.trim().split(/\s+/)[0];
    thanks.querySelector('[data-thanks-name]')!.textContent = first ? `, ${first}` : '';
    thanks.querySelector('[data-thanks-email]')!.textContent = email.value.trim();
    form.dataset.state = 'sent';
    fields.hidden = true;
    thanks.hidden = false;
    status.textContent = '';
    thanks.focus();
  };
  form.querySelector('[data-enquiry-again]')?.addEventListener('click', () => {
    form.reset();
    form.dataset.state = 'ready';
    fields.hidden = false;
    if (thanks) thanks.hidden = true;
    status.textContent = '';
    name.focus();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    name.value = name.value.trim(); email.value = email.value.trim();
    if (!name.value) { name.setCustomValidity('Please tell us your name.'); } else name.setCustomValidity('');
    if (!form.reportValidity()) return;
    if (date.value && date.value < date.min) { status.textContent = 'Choose today or a future date, or leave the date empty.'; date.focus(); return; }
    if (site.enquiryEndpoint) {
      const button = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
      button.disabled = true; status.textContent = 'Sending your enquiry…';
      const data = new FormData(form); data.set('_subject', 'Pardus travel enquiry');
      const sent = await deliverEnquiry(site.enquiryEndpoint, data);
      button.disabled = false;
      if (sent) { confirmSent(); return; }
      status.textContent = 'Online delivery is unavailable. Your draft will open in your email app instead.';
    } else status.textContent = 'Your draft is ready. Send it from your email app; it has not been submitted through this website.';
    const address = form.dataset.recipient || site.bookingsEmail;
    const link = document.createElement('a');
    link.href = `mailto:${address}?subject=${encodeURIComponent(`Pardus enquiry — ${destination.value}`)}&body=${encodeURIComponent(draft())}`;
    link.click();
  });
  form.querySelectorAll('[data-download-enquiry]').forEach(button => button.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    const url = URL.createObjectURL(new Blob([draft()], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'Pardus-Travel-Enquiry.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url),2000);
    status.textContent = form.dataset.state === 'sent' ? 'A copy of your enquiry has been saved to your device.' : 'A copy of your enquiry has been saved to your device. It has not been sent to Pardus.';
  }));
});
