# PathFinder UA: career course roadmap (Milestone 2)

PathFinder UA helps University of Alabama Computer Science students identify courses worth considering before graduation, based on career interests and completed coursework. It supports advising conversations rather than official registration or graduation approval.

## Scope revision

The original proposal and Milestone 1 centered on a semester schedule. Milestone 2 keeps the audience, three career paths, curated data, prerequisite checks, comparison, and explanations while replacing semester planning with a saved course roadmap. It does not produce a semester-by-semester plan.

This revises proposal stories US-04 (semester preferences), US-06 (next-semester recommendations), US-08 (schedule construction), US-09 (saved schedule), and SC-02/06/07 (schedule workflow, persistence, and credit warnings). The submitted PDF and Milestone 1 tag remain historical records; this document records the revised scope.

## Current workflow

1. Select software engineering, data science/AI, or robotics, with an optional display name.
2. Select completed courses from the supported set.
3. Review Strongly recommended, Worth considering, and Broaden your skills. Priority reflects career fit and foundational value, while prerequisite readiness appears separately on each course. Completed courses are excluded from all three tiers.
4. Explore courses has Recommended for you and All courses subviews; after setup it defaults to three personalized priority tiers. Search and eligibility filters apply to both. Save courses of interest, including future courses. Compare up to three courses and export the saved roadmap with prerequisite context.
5. Update completed courses as progress changes. Completed courses leave remaining suggestions and saved interests and remain tracked in the profile and All courses. Information persists in this browser and can be deleted.

No credit target or workload preference is requested. Rankings use career relevance, progression connections, and recorded degree categories. Unmapped electives are excluded from personalized remaining suggestions unless they are foundations on a modeled prerequisite path. All supported courses remain browsable and saveable. Completed courses are tracked in the profile and the All courses view, rather than occupying a recommendation tier.

## Data and boundaries

The current dataset contains 57 records in `backend/data/courses.json`, not a complete catalog or degree plan. CS 121 is identified as a historical record. CS 300 is removed in favor of CS 338. On November 1, 2026, 39 CS courses were added. All 54 current catalog courses remaining after the requested exclusions are included, plus the one historical CS course and two existing ECE courses. Exclusions: CS 102, 106, 112, 206, 285, 302, 305, 312, 385, 391, 491, 492, 493, 494, and 499. Grades, mathematics, and concurrent enrollment are still not evaluated.

Prerequisites use AND within groups and OR between groups. Missing prerequisites show one shortest remaining modeled path. Math, grades, concurrency, transfer credit, instructor approval, alternatives outside the set, and availability are not checked. Required-course labels are guidance for the curated set and do not certify remaining graduation requirements.

Objectives and skills are project interpretations. No accounts, DegreeWorks integration, live catalog synchronization, full degree audit, outcome predictions, or automated semester planning are included.

## Acceptance criteria

- Career changes recompute immediate and future suggestions deterministically.
- Completed courses leave remaining suggestions and saved interests.
- Future courses retain their career-priority tier while completing prerequisites updates their readiness.
- Every untaken required course (`is_required` in the shared course record), high direct relevance (4-5 on the project mapping scale), and prerequisite foundations on a shortest current-course path to those courses are Strongly recommended; relevance 3 is Worth considering; remaining supporting options are Broaden your skills. Readiness sorts courses within tiers, not between tiers.
- Cards show course identity, credits, required/option labels, description, career skills, and prerequisite eligibility. Completed prerequisites explain an unlocked course; missing prerequisites explain a locked one. Detailed objectives and sources remain accessible in course details.
- Future courses can be saved without claiming eligibility.
- Existing profiles migrate safely; save, reload, export, update, and delete work.
- The API rejects unknown courses and careers; load failures are visible.
- Unit, API, browser tests, and the production build pass.

## API

`POST /roadmap` accepts `career_id` and `completed_course_ids`, returning `strongly_recommended`, `worth_considering`, and `broaden_skills`. Each item includes its course, score, explanation, `missing_prerequisites`, and `priority_reason`.

The original `/recommendations` and `/schedule/summary` endpoints remain available for Milestone 1 API compatibility. The roadmap UI does not use them, and semester preferences do not affect roadmap rankings.

The eligibility and roadmap endpoints share the same prerequisite-path selection. Both return `matched_prerequisites` and `missing_prerequisites` so card explanations and eligibility filtering stay consistent. Required flags refer only to this curated course set, not a complete catalog-year degree audit.
