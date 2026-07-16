# PetaCerita Accessibility and Product Polish Audit

Target: WCAG 2.2 AA for primary planning, itinerary, bill, settlement, invitation, and sharing flows.

## Completed

### Keyboard and focus

- Added a skip link to the authenticated application shell.
- Added a stable `main` landmark and focus target.
- Preserved visible focus rings on links, buttons, tabs, dialogs, sheets, and itinerary controls.
- Kept itinerary drag and drop keyboard support through the existing DnD keyboard sensor.
- Added a polite live region while itinerary changes are saved.
- Added rollback and an error announcement when optimistic itinerary persistence fails.

### Touch targets and mobile

- Standard buttons and inputs now have a minimum height of 44 pixels.
- Enlarged icon-only controls for close, delete, drag, map, and refresh actions.
- Prevented iOS input zoom by using 16 pixel form text on small screens.
- Added safe-area padding to toast notifications.
- Constrained dialogs and sheets to the dynamic viewport with internal scrolling.

### Labels and screen readers

- Added accessible required-field text while keeping the visual asterisk hidden from screen readers.
- Form errors use `role="alert"`.
- Loading states expose status, busy state, and screen-reader-only labels.
- Decorative icons remain hidden from assistive technology.
- Added a designed not-found state with a clear recovery link.

### Contrast and motion

- Darkened semantic status colors and the primary button color for AA text contrast on light surfaces.
- Retained reduced-motion handling for animation and transitions.
- Removed the decorative page grid when reduced motion is requested.
- Added a forced-colors focus fallback.

### Loading, errors, and reconciliation

- Upgraded the shared loading state from a spinner-only view to a representative skeleton.
- Added a trip-detail loading skeleton to reduce layout shift.
- Existing route error boundaries keep technical details out of user-facing copy.
- Itinerary optimistic updates now revert on returned errors and thrown failures.

## Automated checks performed

- Prettier formatting for all changed TypeScript, TSX, CSS, and Markdown files.
- Targeted TypeScript syntax scan.
- Static scans for missing migration artifacts, obvious secrets, malformed map URLs, em dash UI copy, and undersized icon controls.
- WCAG contrast calculations for primary and semantic foreground colors against white.
- Desktop and 390 pixel mobile visual previews with reduced motion enabled.
- ZIP integrity verification.

## Environment limitation

A full Next.js build, complete typecheck, browser E2E suite, and automated accessibility runner require the project dependencies. Dependency installation is unavailable in the current sandbox, so these checks must still run in CI or staging after dependencies are installed.
