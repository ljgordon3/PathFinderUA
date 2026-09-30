# ADR 0003: Replace illustrative demo data with the real UA CS/ECE curriculum, scoped to CS/ECE prerequisites only

**Status:** Accepted — Milestone 1
**Deciders:** Logan Gordon (backend)
**Inputs:** UA's official "2021-24 Computer Science Curriculum" flowchart
and 17 official UA course syllabi (CS 101, 121, 200, 201, 202, 223, 301,
403, 415, 460, 461, 470, 481, 495; ECE 380, 383; plus supporting math/
gen-ed syllabi consulted for context).

## Context

The Milestone 1 dataset originally shipped with illustrative, explicitly
labeled placeholder courses ("Illustrative fixtures, not verified UA
catalog records") so that the recommendation and prerequisite engines
could be built and tested before real curriculum data was available.
Real syllabi and the official curriculum flowchart are now available.

## Decision

1. **Replace the demo dataset with 19 real UA Computer Science and
   Electrical/Computer Engineering courses** (`backend/data/courses.json`),
   each tagged with its real source: a specific syllabus (course number,
   section, term) where one was provided, or the curriculum flowchart
   where no syllabus was available for that course number (`CS 100`,
   `CS 300`, `CS 475`). No course description in this dataset is copied
   verbatim from a syllabus; each is paraphrased into a short summary
   in this project's own words.

2. **Scope modeled prerequisites to CS/ECE courses only.** UA's real
   prerequisite rules also reference math and gen-ed courses (e.g., `CS
   101` requires `MATH 125`; `CS 470` accepts `MATH 359` as an
   alternate path). PathFinder UA's stated purpose is course *selection
   within the major*, not a full degree audit — DegreeWorks and an
   academic advisor already own that broader check (see the project
   brief's Purpose section: "not intended to replace DegreeWorks... or
   academic advisors"). Modeling math/gen-ed prerequisites would require
   a much larger course catalog for no benefit to the recommendation use
   case, so they are intentionally left out of the eligibility engine.

3. **Simplify compound "or" branches to the alternative already in this
   catalog.** Where a real prerequisite offers a choice UA's other
   sequence doesn't include in this MVP's course list (e.g., `CS 110` or
   `RRS 101/102` as alternates to `CS 100`; `CS 338` as an alternate to
   `CS 300`), only the path through a catalogued course is modeled.
   "Permission of instructor" override clauses (`CS 461`, `CS 481`) are
   also not modeled, since PathFinder UA has no representation of
   instructor overrides.

## Simplifications made (for transparency)

| Course | Real UA rule (from syllabus) | Modeled as |
|---|---|---|
| CS 101 | `(CS 100 or CS 110 or RRS 102) and (MATH 125 or MATH 145)` | `CS100` |
| CS 201 | `(CS 101 or CS 111) and MATH 301` | `CS101` |
| ECE 380 | `CS 100 or CS 110 or RRS 101` | `CS100` |
| CS 301 | `CS 201 and (CS 200 or MATH 355)` | `CS201 AND CS200` |
| CS 403 / CS 415 / CS 460 | `(CS 300 or CS 338) and CS 301 and ECE 383` | `CS300 AND CS301 AND ECE383` |
| CS 461 / CS 481 | same 400-level rule, `... or permission of instructor` | same 400-level rule (no override path) |
| CS 470 | `CS 301 and (MATH 359 or ((CS 300 or CS 338) and ECE 383))` | `CS300 AND CS301 AND ECE383` |
| CS 495 | `(CS 403 or CS 470) and (one of a ~20-course list) with C- or higher` | `(CS403 or CS470) AND (CS460 or CS461 or CS475 or CS481)` — the four 4xx electives this catalog actually includes from that list |

`CS 300` and `CS 475` have no syllabus in this project's reference set;
their credit hours and prerequisites are taken directly from the
curriculum flowchart and flagged as such in their `source` field rather
than attributed to a syllabus that wasn't provided.

## Consequences

- **Positive:** the dataset and its prerequisite chains are now
  traceable to real, named sources instead of invented placeholders,
  and the recommendation/eligibility demo in `VERIFICATION.md` reflects
  UA's actual CS curriculum, including the real compound rule for the
  `CS 495` capstone (verified in `test_capstone_requires_theory_course_and_a_second_400_level_course`).
- **Negative:** a student who satisfies a real prerequisite through a
  math course or an alternate CS course not in this catalog (e.g. `MATH
  355` instead of `CS 200`) will be marked ineligible by PathFinder UA
  even though the registrar would allow it. This is an accepted MVP
  limitation stated in the product's own scope boundary, not a data bug.
- **Revisit when:** the course catalog expands to include the math/
  gen-ed courses referenced in these prerequisite rules, at which point
  the simplifications in the table above should be replaced with the
  real compound rules.
