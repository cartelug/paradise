PARDUS LUXURY ESCAPES — WEBSITE (V1)
=====================================

HOW TO VIEW
-----------
Open index.html in any browser. No build step, no server required.
To deploy: upload this whole folder as-is to any static host
(Netlify, Vercel, cPanel, GitHub Pages, etc.) — index.html is the homepage.


FOLDER STRUCTURE
-----------------
index.html              the homepage
css/styles.css           all styling
js/main.js                nav, scroll reveals, form logic, WhatsApp button
assets/images/            local image assets
  pardus-logo-icon.webp    globe emblem, extracted from the client's own PDF
  pardus-logo-full.webp    full logo lockup, extracted from the client's own PDF


BEFORE THIS GOES LIVE — 4 PLACEHOLDERS TO SWAP
-------------------------------------------------
Search index.html for these and replace with the client's real details:

  1. hello@pardusluxuryescapes.com   (footer email link)
  2. corporate@pardusluxuryescapes.com  (Corporate Travel mailto link)
  3. 256700000000   (WhatsApp number — appears 3x: final CTA, footer,
     floating WhatsApp button bottom-right)


ABOUT THE PHOTOGRAPHY
----------------------
Every destination/lifestyle photo is currently hotlinked from free-license
stock sources (Unsplash / Pexels) so the site looks complete right away.
These are placeholders, not final assets — swap them for the client's own
photography whenever it's ready. Direct source links, in case you want to
download and self-host them in assets/images/ instead of hotlinking:

  Hero (infinity pool)   https://images.unsplash.com/photo-1762254923872-5bdc4210eb90
  Zanzibar                https://images.unsplash.com/photo-1762118817730-955d832b2cb7
  Dubai                   https://images.unsplash.com/photo-1744416328915-1341add4a393
  Maldives                https://images.pexels.com/photos/9482140/pexels-photo-9482140.jpeg
  Europe / Santorini       https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff
  East Africa              https://images.unsplash.com/photo-1599921777960-ac7c40d1bc60
  Statement band (dunes)   https://images.unsplash.com/photo-1745437980540-b234c90a6557
  Tailor-Made (Seychelles) https://images.pexels.com/photos/30358268/pexels-photo-30358268.jpeg
  Corporate (jet interior) https://images.pexels.com/photos/20562278/pexels-photo-20562278.jpeg

  To self-host: download an image, drop it in assets/images/, then update
  its <img src="..."> (or CSS background) in index.html to point locally.

The two logo files ARE the client's real logo — extracted directly from
their brief PDF, not placeholders.


WHAT'S FUNCTIONAL VS. NOT YET WIRED
--------------------------------------
- Tailor-Made journey form: fully working UI (validates, shows a success
  state) but does not send data anywhere yet — needs a backend/email
  service (e.g. Formspree, a serverless function) to actually deliver
  enquiries to Pardus.
- Nav, mobile menu, scroll reveals, WhatsApp links: fully functional.


NEXT STEPS (per the original proposal)
------------------------------------------
This is the homepage (Mockup 1). Dedicated pages for Destinations,
Travel Concierge, Corporate Travel and a real intake backend are the
natural next phase.
