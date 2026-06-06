# FSI Freight Solutions — Website

**Live:** https://fsi-website-pi.vercel.app
**Repo:** https://github.com/pogime05/fsi-website
**Client:** FSI Freight Solutions, Brampton ON
**Stack:** Static HTML / CSS / Vanilla JS — no framework, no build step
**Local dev:** `python3 -m http.server 8080` → http://localhost:8080

---

## Project Overview

Full SPA website for FSI Freight Solutions — a freight coordination, driver training, and carrier compliance consultancy based in Brampton, ON. Rebuilt from scratch from a Codex-generated starter.

---

## Architecture

Single Page Application with pure JS view router — no React, no framework.

- **5 views:** Home, Services, Training, Start a Company, Contact
- **Routing:** `history.pushState` + hash fallback + `popstate` for browser back/forward
- **Pattern:** All `[data-view="X"]` elements are clickable → `showView(id)` → swaps `.active` class
- **Entry animations:** Motion One `animate()` + stagger per view on each route change

---

## File Structure

```
fsi-website/
├── index.html          — Full SPA (all 5 views in one file)
├── styles.css          — All styles (no preprocessor)
├── script.js           — Router + animations + rain canvas + splash
└── assets/
    ├── fsi-logo.png           — Client logo
    ├── fsi-logo-original.jpg  — Original logo
    ├── hero-freight.png       — Hero background image
    └── favicon.svg            — Custom SVG favicon (FSi mark, dark bg)
```

---

## CDN Dependencies

| Library | Version | Purpose |
|---|---|---|
| Inter | Google Fonts | Typography (400–900) |
| tsParticles Slim | 2.12.0 | Ambient sparkles on splash |
| Motion One | 10.18.0 | View animations, stagger, counters |

---

## Splash Screen Sequence

| Time | Effect |
|---|---|
| `0.06s` | Red scan line sweeps top-to-bottom (scene initialization feel) |
| `0.28s` | **F** rushes from deep left z-space, red/blue chromatic aberration during flight |
| `0.40s` | **i** fires from deep right, warm/magenta chromatic split, snaps to red on land |
| `0.52s` | **S** drops from deep above, vertical chromatic split, bounce landing |
| `~2.0s` | Micro-glitch engine — random letter gets 5-frame chromatic jolt every 2–4s |
| `1.5s` | "Freight Solutions" fades up |
| `1.7s` | Red divider line grows |
| `2.0s` | Tagline fades in |
| `4.5s` | Splash slides up, hero revealed |

**Implementation:** Pure CSS keyframes + Web Animations API for micro-glitch. tsParticles drives 90 ambient drifting sparkles.

---

## Hero Cinematic FX (6 layers, no video needed)

| Layer | Technique |
|---|---|
| Ken Burns | CSS `transform scale + translate` on `<img>`, 22s loop, origin at truck |
| Red glow breathe | `radial-gradient` + `mix-blend-mode: screen`, 5.5s pulse |
| Dock light flicker | `radial-gradient` overlay, irregular 9-keyframe timing |
| Fog drift | Two overlapping mist layers, 30s alternate loop |
| Wet pavement shimmer | Bottom gradient breathe synced with glow |
| Rain canvas | `requestAnimationFrame` — angled streaks, splash particles with gravity, IntersectionObserver stop/start, disabled on mobile |

---

## Animation System

### Word-split headings
JS splits `.split-words` into `.word-wrap > .word-inner` spans.
CSS clips overflow. JS stagger-adds `.show` class.

### View entry animations (Motion One)
`animateViewIn(id, viewEl)` in `script.js` — each view has its own block.

### IntersectionObserver animations
About counter, trust bar numbers, services timeline items, startup steps.

---

## Client Details

| | |
|---|---|
| Phone | 905.458.0800 |
| Address | 30 Intermodal Dr #3, Brampton, ON L6T 5K1 |
| Website | fsifreightsolutions.ca |
| Tagline | "When You're out of Quality, You're out of Business" |

---

## Training Programs (from client brochure)

**Operations (17):** Cost/Revenue Calculation, CSA Driver Training, CSA Supervisor Training, Employee Security, Facility Security, Hours of Service (Supervisors), Increasing Fuel Mileage, Maintenance Requirements, Preventive Maintenance, Retention Training, Risk Management, Roadside Inspections, Safety and Security, The Professional Driver, Trip Planning, Vehicle Inspections, Vehicle Inspections Canada

**Personnel (22):** Alcohol & Drugs (Driver, Supervisor x2), Back Safety, Backing, Driver Disqualification, Driver Logs, Employee Security, Entry Level Driver, Facility Security, Hazmat, HOS Canadian, HOS Supervisors, Log Auditing, Retention Training, Safety and Security, Slips/Trips/Falls, Supervisory Training Basics, Train the Trainer, Trip Planning, Vehicle Inspections x2

**Safety (28):** Accident Procedures, Backing, Cargo Securement, Cornering, CSA x2, Defensive Driving, Driver Logs, Driving Grades, Emergency Maneuvers, Employee Security, Entry Level Driver, Extreme Driving Conditions, HOS x3, Fuel Mileage, Log Auditing, LCV, Maintenance, Night Driving, Roadside Inspections, Sharing the Highway, Skid Control, TDG Labels/Marking/Placarding, Vehicle Breakdown

---

## Deployment

- **Host:** Vercel (free tier, auto-deploy from GitHub)
- **Repo:** https://github.com/pogime05/fsi-website
- **Branch:** `main` → triggers deploy on push

---

## Pending Items

- [ ] **Contact form key** — replace `YOUR_WEB3FORMS_KEY` in `index.html`. Get free key at https://web3forms.com
- [ ] **Custom domain** — point `fsifreightsolutions.ca` to Vercel
- [ ] **Client email** — not yet added to contact section
- [ ] **Hero video** (optional upgrade) — use Runway/Kling/Luma free tier to animate `hero-freight.png` → swap `<img>` for `<video autoplay muted loop playsinline>`

---

## Key Commits

| Hash | Description |
|---|---|
| `05271f6` | Initial launch |
| `2a513db` | SPA rebuild — router, splash, 5 views |
| `6f20eff` | tsParticles + slower letter animations |
| `de25b0a` | nav-active fix, startup steps redesign, cursor glow, back-to-top |
| `bcbab29` | Cinematic hero — Ken Burns + rain canvas + 4 FX layers |
| `7d861ce` | Splash redesign — 3D perspective rush + chromatic aberration + scan line + micro-glitch |
