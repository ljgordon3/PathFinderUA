# Use Cases

## UC-01: Receive Career-Aligned Course Recommendations (primary MVP flow)

**Covers:** US-02, US-03, US-04, US-05, US-06, US-07
**Primary actor:** Student (e.g., persona "Jordan Williams")
**Preconditions:** The curated course/career JSON dataset has loaded and
passed validation at backend startup.

**Main flow:**
1. Student opens PathFinder UA and (optionally) creates a local profile.
2. Student searches for and selects their completed courses from the
   supported dataset (`GET /courses` to search/select).
3. Student selects a career interest (`GET /careers`).
4. Student enters a target credit-hour load and a workload preference.
5. Client sends `POST /recommendations` with completed course IDs,
   career ID, and target credit hours.
6. Backend's prerequisite engine evaluates every course in the dataset
   against the student's completed courses, excluding any course whose
   prerequisites are unmet.
7. Backend's recommendation engine scores the remaining eligible courses
   using career alignment, academic progression, degree relevance, and
   credit fit, then ranks them.
8. Backend returns three to five ranked recommendations, each with an
   explanation (degree relevance, unlocked courses, learning objectives,
   career-relevant skills, and sources).
9. Client displays the ranked list with explanations.

**Alternate flows:**
- **4a. Invalid credit-hour value:** request is rejected with a 422
  validation error and the client shows an inline error message (US-04).
- **6a. Fewer than 3 eligible+relevant courses exist:** backend returns
  however many are available rather than padding with irrelevant courses.
- **3a. Unknown career ID:** backend returns 404; client prompts the
  student to re-select a supported career.

**Postcondition:** The student has a ranked, explained set of eligible
courses to consider for their next semester.

---

## UC-02: Build and Validate a Proposed Semester Schedule

**Covers:** US-08, US-09
**Primary actor:** Student
**Preconditions:** The student has viewed recommendations (UC-01) or
otherwise knows which course IDs they are considering.

**Main flow:**
1. Student adds a recommended (or manually chosen) course to their
   proposed schedule in the client.
2. Client sends the current course-ID list, the student's target credit
   hours, and (optionally) their career ID to `POST /schedule/summary`.
3. Backend calculates total credit hours and, if a career ID was given,
   which of the student's target career skills the schedule already
   covers.
4. Backend evaluates warning conditions: schedule exceeds the credit
   target, or the schedule includes several courses at once.
5. Backend returns the summary and any warnings.
6. Client displays total credits, skill coverage, and warnings, and
   saves the current course-ID list to the local profile in browser
   storage (US-09) so it persists across a page reload.
7. Student removes or replaces courses and repeats from step 2 until
   satisfied.

**Alternate flows:**
- **2a. An unknown course ID is included:** backend returns 404 and the
  client removes the invalid ID with a message to the student.
- **4a. Schedule is within the credit target and course count:** no
  warnings are returned; the client shows a plain summary.

**Postcondition:** The student has a proposed schedule with a validated
credit total, and it is preserved in their browser for their next visit.

---

## UC-03: Check Prerequisite Eligibility (supporting use case)

**Covers:** US-05
**Primary actor:** Student, via the client (also invoked internally by UC-01)
**Main flow:** Client calls `POST /eligibility` with the student's
completed course IDs; backend returns eligibility and, for ineligible
courses, the smallest unmet prerequisite group, for every course in the
dataset. Used both as a standalone "what am I missing?" check and inside
the recommendation flow.

## UC-04: Compare Courses

**Covers:** US-10
**Primary actor:** Student
**Main flow:** Student selects up to three courses from recommendations
or search results; client calls `POST /courses/compare`; backend returns
full course records in the requested order for side-by-side display.

## UC-05: View Career Information

**Covers:** US-11
**Primary actor:** Student (also useful for persona "Maya Robinson"
exploring an unfamiliar career area)
**Main flow:** Student opens a career detail screen; client calls
`GET /careers/{id}`; backend returns responsibilities, relevant skills,
education, salary, outlook, and source/date metadata.
