# Akane commission website

Public pages: index.html, gallery.html, queue.html, shop.html.
Owner pages: admin.html, admin-shop.html, price-rate-admin.html, tos-admin.html.

Commission updates are saved to Firebase. Owner access uses Google Login and
Firestore rules; keep server-side rules deployed. The owner is configured in
akane-auth.js and firestore.rules. The old PIN workflow is no longer used.

## Build

Readable commission/admin logic is in commission-page.js and admin-page.js.
Shared editor source is akane-studio.js. Run `node build-site.mjs` after edits
and commit the generated minified assets too. Keep existing data-import tooling
for backup recovery; do not publish private backups.
