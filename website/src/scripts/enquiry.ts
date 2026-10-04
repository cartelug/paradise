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
  const draft = () => {
    const fields = new FormData(form);
    return ['PARDUS TRAVEL ENQUIRY', '', `Destination: ${fields.get('destination')}`, `Departure: ${fields.get('date') || 'Flexible'}`, `Travellers: ${fields.get('travellers')}`, `Budget per person: ${fields.get('budget')}`, `Name: ${fields.get('name') || 'Not specified'}`, `Reply email: ${fields.get('email') || 'Reply to the sending email'}`, '', `Notes: ${fields.get('notes') || 'To discuss'}`, '', 'Please send a proposal in USD with the itinerary, inclusions and terms.'].join('\n');
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (date.value && date.value < date.min) { status.textContent = 'Choose today or a future date, or leave the date empty.'; date.focus(); return; }
    if (site.enquiryEndpoint) {
      const button = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
      button.disabled = true; status.textContent = 'Sending your enquiry…';
      const data = new FormData(form); data.set('_subject', 'Pardus travel enquiry');
      const sent = await deliverEnquiry(site.enquiryEndpoint, data);
      button.disabled = false;
      if (sent) { status.textContent = 'Your enquiry has been sent. Pardus will use your contact details to continue the conversation.'; return; }
      status.textContent = 'Online delivery is unavailable. Your draft will open in your email app instead.';
    } else status.textContent = 'Your draft is ready. Send it from your email app; it has not been submitted through this website.';
    const address = form.dataset.recipient || site.bookingsEmail;
    const link = document.createElement('a');
    link.href = `mailto:${address}?subject=${encodeURIComponent(`Pardus enquiry — ${destination.value}`)}&body=${encodeURIComponent(draft())}`;
    link.click();
  });
  form.querySelector('[data-download-enquiry]')?.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    const url = URL.createObjectURL(new Blob([draft()], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'Pardus-Travel-Enquiry.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url),2000);
    status.textContent = 'Your enquiry has been downloaded. It has not been sent to Pardus.';
  });
});
