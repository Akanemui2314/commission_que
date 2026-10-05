# Code cleanup — 2026-10-05

## Removed
- Hidden legacy TOS settings form, its save handler and form CSS: superseded by the single visual TOS editor. Public TOS content and fallback rendering remain.
- Legacy PIN login dialog, handlers and CSS: superseded by owner-restricted Google authentication.
- Optional globalThis.Tweak developer controls: no dependency loads this debug panel.
- Unused carousel playback/hover state, empty updatePlayback and obsolete rotation helpers: they no longer affected playback.
- Duplicate legacy TOS hiding rules and references to removed elements.

## Optimized without removing features
- Public pages skip building hidden administrator taxonomy, price, commission and artwork editors.
- Carousel copies reduced from five to three, and per-cell layout reads replaced with arithmetic.
- Firebase revision chunks fetched in one ordered collection request instead of one request per chunk.
- Large inline CSS/JavaScript extracted into reusable cached files. Readable sources remain; build-site.mjs produces minified runtime scripts.
- Index and gallery share commission-page.js and commission-page.css.

## Type management
- Type rows can be deleted and dragged to reorder. Prices follow Type order.
- Deleting a Type reassigns its artworks to a remaining Type; artwork files are not deleted.
- Last remaining Type is protected. Failed saves restore the previous state.

## Preserved
Artwork data, image assets, Google authentication, security rules, crop controls, custom price/TOS editors, media cache and backup importer.

## Validation
JavaScript syntax/build, index/gallery/admin runtime smoke checks, Type reorder/deletion and failed-save rollback checks. Runtime smoke checks use mocked cloud/auth and do not test a fresh Google sign-in.

## Follow-up cleanup
- Removed duplicate Manage scales / Scale name UI, add handler, syncScaleTags helper and unused styles. Custom Type & Color is the single scale/color manager; Price settings retains the price matrix.
- Removed three hidden demonstration artwork rows and their unused manage-item styles. Real artwork records remain.
