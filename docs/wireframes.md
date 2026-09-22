# UX Wireframes (low-fidelity)

> These are text-based low-fidelity wireframes for the four screens in
> the primary MVP flow, meant to unblock backend/API contract work and
> give the TA a sense of the multi-screen flow. The frontend owner
> (Jylen) should replace/extend these with higher-fidelity mockups as
> the React client (`src/`) develops.

## Screen 1 — Profile & Completed Courses (US-01, US-02)

```
┌──────────────────────────────────────────────┐
│ PathFinder UA                                 │
│ "Supports, but does not replace, DegreeWorks, │
│  the catalog, or your advisor."               │
├──────────────────────────────────────────────┤
│ Display name (optional): [______________]     │
│                                                │
│ Completed courses:                            │
│  [ Search courses... ▾ ]                      │
│  [x] CS100  [x] CS150  [x] CS201   (+ Add)     │
├──────────────────────────────────────────────┤
│                                   [ Next → ]   │
└──────────────────────────────────────────────┘
```

## Screen 2 — Career & Semester Preferences (US-03, US-04)

```
┌──────────────────────────────────────────────┐
│ Career interest:  ( ) Software Engineering    │
│                   ( ) Data Science / AI       │
│                   ( ) Robotics                │
│                                                │
│ Target credit hours: [ 15 ]                   │
│ Workload preference: [ Balanced ▾ ]           │
├──────────────────────────────────────────────┤
│ [ ← Back ]                 [ Get Recommendations → ] │
└──────────────────────────────────────────────┘
```

## Screen 3 — Recommendations (US-06, US-07, US-10, US-12)

```
┌──────────────────────────────────────────────┐
│ Recommended next courses for Software Eng.    │
├──────────────────────────────────────────────┤
│ 1. CS310 — Software Design & Development       │
│    Core • unlocks CS330 • builds: system design│
│    [ Details ]  [ + Add to schedule ] [ Compare]│
│ 2. CS301 — Algorithm Design & Analysis          │
│    ...                                        │
│ 3. CS340 — Operating Systems                   │
│    ...                                        │
├──────────────────────────────────────────────┤
│ Compare selected (0/3)          [ ← Back ]     │
└──────────────────────────────────────────────┘
```

## Screen 4 — Proposed Schedule (US-08, US-09)

```
┌──────────────────────────────────────────────┐
│ Your proposed schedule            15 / 15 cr  │
├──────────────────────────────────────────────┤
│ CS310  3cr   [remove]                          │
│ CS301  3cr   [remove]                          │
│ CS340  3cr   [remove]                          │
│                                                │
│ ⚠ 3 demanding courses — review with advisor    │
├──────────────────────────────────────────────┤
│ Career skills covered: system design, algo...  │
│                          [ Save & share summary]│
└──────────────────────────────────────────────┘
```

## Responsive / cross-platform considerations

- **Primary target:** desktop/laptop browser widths (per Intended
  Platform in the project brief); layouts above assume a single-column
  or two-column desktop width.
- **Narrower viewports (tablet):** the course list and recommendation
  cards stack to a single column; the "Compare selected" bar becomes a
  sticky footer instead of an inline row.
- **Mobile (stretch, not MVP-required):** screens 1–2 remain usable as
  a simple vertical form; screen 3's compare feature is the most likely
  to need simplification (e.g., compare two at a time) if mobile support
  is pursued later, per the MVP Scope's "Possible Later Features" for
  tablet/mobile support.
- **No native app:** the application is a responsive web app only for
  the MVP; installing software is explicitly out of scope (NFR-06).
