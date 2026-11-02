# Course catalog audit

## November 1, 2026 expansion

Added 39 CS courses, bringing the dataset to 57: 54 current CS catalog courses, 1 historical CS record, and 2 ECE records. Excluded as requested: CS 102, 106, 112, 206, 285, 302, 305, 312, 385, 391, 491, 492, 493, 494, and 499. The offline title/credit snapshot is `backend/tests/fixtures/cs-catalog-2026-11-01.json`, derived from the official CS catalog. Tests compare every included current CS title and credit value against it.

New course summaries, objectives, and career mappings are project-authored interpretations of catalog topics. The teacher-preparation course remains browsable without invented career-specific recommendations.

Honors CS 110/111 paths and the CS 338 alternative are now modeled. CS 495 includes all listed elective paths supported by this expanded dataset. Completing a standard foundation suppresses redundant honors suggestions, and vice versa. Prerequisite traversal does not suggest an unused alternative foundation when a prerequisite path is already satisfied.

CS 330 and CS 393 allow concurrent CS 301 in the catalog; the app conservatively requires it completed. Non-CS conditions, grades, math-based alternatives, honors admission, and instructor permission are not verified.

## Original October 30 audit (historical snapshot)

Reviewed October 30, 2026 against the [UA CS catalog](https://catalog.ua.edu/undergraduate/engineering/computer-science/courses/) and [UA ECE catalog](https://catalog.ua.edu/undergraduate/engineering/electrical-computer/courses/).

All 17 current course records match the official titles and credits. This includes the corrected CS 100 and CS 475 titles. No further credit changes were needed.

| Course | Verified title | Credits |
| --- | --- | --- |
| CS 100 | CS I for Majors | 4 |
| CS 101 | CS II for Majors | 4 |
| CS 200 | Software Design and Engineering | 4 |
| CS 201 | Data Structures and Algorithms | 4 |
| CS 202 | Web Foundations | 3 |
| CS 223 | Introduction to Python Programming | 3 |
| ECE 380 | Digital Logic | 4 |
| ECE 383 | Microcomputers | 4 |
| CS 301 | Database Management Systems | 3 |
| CS 403 | Programming Languages | 3 |
| CS 415 | Software Design & Development | 3 |
| CS 460 | Intro to Autonomous Robotics | 3 |
| CS 461 | Brain Computer Interface | 3 |
| CS 470 | Computer Algorithms | 3 |
| CS 475 | Formal Languages & Machines | 3 |
| CS 481 | High Performance Computing | 3 |
| CS 495 | Capstone Computing | 3 |

## Historical records

CS 121 (The Discipline of Computing, 1 credit) is supported by the [Fall 2024 UA course record](https://ssb.ua.edu/pls/PROD/bwckctlg.p_disp_course_detail?cat_term_in=202440&crse_numb_in=121&subj_code_in=CS).

CS 300 (Operating Systems, 3 credits) is supported by the [2024-25 UA curriculum flowchart](https://eng.ua.edu/wp-content/uploads/2020/01/CS-Flowchart-24-25-1.pdf). Neither course appears as a standalone entry on the current CS page. They remain in the dataset for historical selections; this does not establish current availability. CS 300's detailed content and prerequisite path are not verified by the current catalog; its learning section now explicitly states this uncertainty. CS 338 is a separate current course and has not been silently substituted for CS 300.

## Prerequisite and content limits

Each current record now cites its official catalog and identifies omitted prerequisite conditions in the source note shown in the UI. Existing prerequisite arrays represent only supported paths within this small dataset. They are not complete registration checks. Math, grades, placement scores, concurrent enrollment, instructor permission, and alternatives outside the dataset remain unmodeled. CS 470 has an additional math-based alternative, and CS 495 permits more electives than this dataset includes.

Descriptions are summaries. Learning objectives and career/skill mappings are project interpretations, not official catalog outcomes. Catalog review is manual; the application does not synchronize automatically or establish whether a course is offered in a particular semester.
