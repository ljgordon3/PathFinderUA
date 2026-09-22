# Software Process Model

## Chosen model: Agile (Scrum-inspired), two-week sprints

PathFinder UA is built by a two-person team with a fixed course deadline
(Milestones 1–3) and requirements that are expected to sharpen as we
learn more about available data (SOI/historical outcome access, O*NET
mapping quality). We use a lightweight Scrum-inspired process:

- **Sprint length:** two weeks. Each sprint selects the highest-priority
  backlog items that fit its capacity and confirms their acceptance
  criteria before work starts (see `backlog-and-dod.md`).
- **Backlog & board:** GitHub Issues represent user stories, technical
  tasks, defects, and data-curation work. A GitHub Project board tracks
  Backlog → Ready → In Progress → In Review → Done.
- **Review & retrospective:** each sprint ends with a working
  demonstration of the increment and a short retrospective.
- **Branching:** short-lived feature branches merged to `main` via pull
  requests linked to an issue; at least one teammate reviews nontrivial
  changes before merge.

## Why Agile/Scrum rather than a plan-driven (Waterfall) model

| Factor | Why it favors Agile here |
|---|---|
| Two-person team, fixed milestones | Short iterations with visible demos let us course-correct every two weeks instead of discovering a gap at the final deadline. |
| External data availability is uncertain (SOI access, catalog changes) | The MVP scope already marks historical-outcome data as optional/best-effort; iterative delivery lets us build the core flow first and slot in optional data if/when it becomes available, rather than blocking on it up front. |
| Requirements will sharpen with use | Career-to-course mappings and scoring weights are easiest to validate by running the real recommendation engine against real course data early, then refining — not by writing a complete specification before any code exists. |
| Course structure itself is milestone-based | Milestones 1–3 ("Build It" / "Test It" / "Deploy It") map naturally onto incremental Agile delivery: each milestone is itself a larger "sprint goal" made up of several two-week sprints. |

A heavier plan-driven process (Waterfall) was considered and rejected:
with only two contributors and a 12-week window, a long up-front design
phase would leave too little time to react to what we learn once the
prerequisite and recommendation engines run against real curated data.
