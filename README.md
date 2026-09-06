# Pardus Luxury Escapes

Responsive static website with the approved leopard logo, animated headlines, scroll reveals, accessible mobile navigation, destination filters, five destination pages, service accordions and a three-step downloadable journey brief.

## Run and deploy

The website is served from the repository root on GitHub Pages at https://cartelug.github.io/paradise/. No build or dependencies are required. Open index.html or serve the repository root with a static server.

Main layout: index.html. Shared styles: styles.css. Interactions: app.js. Destination pages: destination-*.html. Photography and the approved logo: assets/. Run node --check app.js for JavaScript syntax validation.

The error page uses the /paradise/ project path. Update its absolute links if hosting under a different base path.

## Journey planner

The planner downloads a text brief on the visitor's device. It does not send leads, take payments or create bookings, and it does not persist entries in browser storage. Verified email/WhatsApp delivery, CMS editing and analytics are not connected. No fabricated reviews, prices, phone numbers or enquiry-success messages are included.

## Assets and maintenance

The user-approved Pardus leopard logo replaces the earlier globe emblem. Photography is reused from the previous concept and is stored locally. Confirm stock licensing and destination accuracy when finalising business content; sources are recorded in ASSETS.md.

Motion honours prefers-reduced-motion. Native dialogs support keyboard focus containment and Escape. Core editorial content remains visible without JavaScript.

README.txt and the earlier css/, js/ and assets/images/ files are retained for reference; the rebuilt pages use the root styles.css, app.js and updated assets instead.
