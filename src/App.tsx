import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  Database,
  ExternalLink,
  GitCompareArrows,
  GraduationCap,
  Menu,
  Plus,
  Route,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  X,
  Bot,
} from "lucide-react";
import { emptyProfile } from "./data";
import {
  getCareers,
  getComparison,
  getCourses,
  getEligibility,
  getRoadmap,
  type EligibilityStatus,
} from "./api";
import {
  formatPrerequisites,
  legacyStorageKey,
  parseProfile,
  storageKey,
} from "./planning";
import type {
  Career,
  Course,
  Page,
  Profile,
  Recommendation,
  Roadmap,
} from "./types";

const navigation: { id: Page; label: string; icon: typeof Compass }[] = [
  { id: "courses", label: "Explore courses", icon: BookOpen },
  { id: "careers", label: "Career paths", icon: Route },
  { id: "roadmap", label: "My roadmap", icon: Route },
];
const priorityTiers: {
  key: keyof Roadmap;
  title: string;
  description: string;
}[] = [
  {
    key: "stronglyRecommended",
    title: "Strongly recommended",
    description:
      "Required courses in this set, your strongest career matches, and the foundations that help you reach them.",
  },
  {
    key: "worthConsidering",
    title: "Worth considering",
    description:
      "Useful career-aligned options to complement your highest priorities.",
  },
  {
    key: "broadenSkills",
    title: "Broaden your skills",
    description:
      "Supporting skills and academic foundations that add breadth to your preparation.",
  },
];
const careerIcons = { software: Code2, data: Database, robotics: Bot };

function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = ref.current!;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      aria-labelledby="modal-title"
      onCancel={onClose}
    >
      <div className="modal-heading">
        <h2 id="modal-title">{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function Setup({
  profile,
  catalog,
  careers,
  onSave,
  onClose,
  inline = false,
}: {
  profile: Profile;
  catalog: Course[];
  careers: Career[];
  onSave: (value: Profile) => void;
  onClose: () => void;
  inline?: boolean;
}) {
  const [draft, setDraft] = useState<Profile>({
    ...profile,
    completed: [...profile.completed],
  });
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const toggle = (id: string) =>
    setDraft((p) => ({
      ...p,
      completed: p.completed.includes(id)
        ? p.completed.filter((c) => c !== id)
        : [...p.completed, id],
    }));
  const content = (
    <>
      <div className="wizard-steps" aria-label={`Step ${step + 1} of 2`}>
        {["Your career", "Your progress"].map((label, index) => (
          <span key={label} className={index <= step ? "active" : ""}>
            <b>{index < step ? <Check size={13} /> : index + 1}</b>
            {label}
          </span>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (step === 0) setStep(1);
          else if (draft.career)
            onSave({
              ...draft,
              setupComplete: true,
              saved: draft.saved.filter((id) => !draft.completed.includes(id)),
            });
        }}
      >
        {step === 0 && (
          <div className="wizard-content">
            <p className="muted">
              A little direction goes a long way. You can change all of this
              later.
            </p>

            <fieldset>
              <legend>Choose your career interest</legend>
              <div className="career-options">
                {careers.map((career) => {
                  const Icon = careerIcons[career.id];
                  return (
                    <label
                      key={career.id}
                      className={`career-option ${draft.career === career.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="career"
                        required
                        value={career.id}
                        checked={draft.career === career.id}
                        onChange={() =>
                          setDraft({ ...draft, career: career.id })
                        }
                      />
                      <Icon size={22} />
                      <span>
                        <strong>{career.title}</strong>
                        <small>{career.skills.join(" · ")}</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <label className="field">
              What should we call you?{" "}
              <span className="optional">Optional</span>
              <input
                maxLength={40}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Your first name"
                autoComplete="given-name"
              />
            </label>
          </div>
        )}
        {step === 1 && (
          <div className="wizard-content">
            <p className="muted">
              Select courses you’ve already completed. Starting fresh? You can
              continue without selecting any.
            </p>
            <div className="inline-note">
              <BookOpen size={17} /> Select the CS and ECE courses you have
              completed. The prerequisite checks cover this curated set only.
            </div>
            <label className="search-box">
              <Search size={17} />
              <input
                aria-label="Search completed courses"
                placeholder="Search course name or code"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="completed-list">
              {catalog
                .filter((c) =>
                  `${c.id} ${c.title}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((course) => (
                  <label className="completed-option" key={course.id}>
                    <input
                      type="checkbox"
                      checked={draft.completed.includes(course.id)}
                      onChange={() => toggle(course.id)}
                    />
                    <span>
                      <b>{course.id}</b> {course.title}
                    </span>
                    <small>{course.credits} cr.</small>
                  </label>
                ))}
              {!catalog.some((c) =>
                `${c.id} ${c.title}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              ) && <p className="muted">No matching courses.</p>}
            </div>
            <p className="small muted">
              {draft.completed.length} courses selected
            </p>
          </div>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => (step ? setStep(step - 1) : onClose())}
          >
            {step ? "Back" : inline ? "Browse all courses" : "Cancel"}
          </button>
          <button
            className="button primary"
            type="submit"
            disabled={!draft.career}
          >
            {step === 1 ? "Show my recommendations" : "Continue"}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </>
  );
  return inline ? (
    <section className="onboarding-form" aria-label="Your course preferences">
      {content}
    </section>
  ) : (
    <Modal title="Your course preferences" onClose={onClose}>
      {content}
    </Modal>
  );
}

function CourseCard({
  course,
  profile,
  prerequisiteStatus,
  careerSkills = [],
  compared,
  onCompare,
  onAdd,
  onDetails,
}: {
  course: Course;
  profile: Profile;
  prerequisiteStatus?: EligibilityStatus;
  careerSkills?: string[];
  compared: boolean;
  onCompare: () => void;
  onAdd: () => void;
  onDetails: () => void;
}) {
  const completed = profile.completed.includes(course.id);
  const added = profile.saved.includes(course.id);
  const missing = prerequisiteStatus?.missingPrerequisites ?? [];
  const matched = prerequisiteStatus?.matchedPrerequisites ?? [];
  const eligible = prerequisiteStatus?.eligible === true;
  const skills = [...new Set([...careerSkills, ...course.skills])];
  return (
    <article className="course-card">
      <div className="course-top">
        <span className="course-code">{course.id}</span>
        <span className="small muted">{course.credits} credits</span>
      </div>
      <button className="course-title" onClick={onDetails}>
        {course.title}
        <ChevronRight size={17} />
      </button>
      <span className="small muted">{course.category}</span>
      <p>{course.description}</p>
      <div className="recommendation-explanation">
        <p>
          <strong>Eligibility:</strong>{" "}
          {completed
            ? "You have completed this course."
            : !prerequisiteStatus
              ? "Checking prerequisites..."
              : missing.length
                ? `Take ${missing.join(" and ")} to unlock this course (one modeled prerequisite path).`
                : matched.length
                  ? `Unlocked by completing ${matched.join(" and ")}.`
                  : "No modeled CS/ECE prerequisites."}
        </p>
        {!completed && missing.length > 0 && matched.length > 0 && (
          <p className="small muted">
            Already completed on this path: {matched.join(", ")}.
          </p>
        )}
      </div>
      <div className="course-skills">
        <h3>Career skills</h3>
        {skills.length ? (
          <div className="tags">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        ) : (
          <p className="small muted">
            No career skills recorded for this course.
          </p>
        )}
      </div>
      <div className="course-bottom">
        <span className={`eligibility ${completed || eligible ? "good" : ""}`}>
          {completed ? (
            <>
              <CheckCircle2 size={14} /> Completed
            </>
          ) : !prerequisiteStatus ? (
            "Checking prerequisites..."
          ) : eligible ? (
            <>
              <CheckCircle2 size={14} /> Prerequisites met
            </>
          ) : (
            "Prerequisites needed"
          )}
        </span>
        <button
          className={`icon-button compare-button ${compared ? "chosen" : ""}`}
          aria-label={`${compared ? "Remove" : "Compare"} ${course.id}${compared ? " from comparison" : ""}`}
          aria-pressed={compared}
          onClick={onCompare}
        >
          <GitCompareArrows size={17} />
        </button>
        <button
          className={`icon-button ${added ? "chosen" : ""}`}
          disabled={completed}
          aria-label={`${added ? "Remove" : "Add"} ${course.id} ${added ? "from" : "to"} roadmap`}
          onClick={onAdd}
        >
          {added ? <Check size={17} /> : <Plus size={17} />}
        </button>
      </div>
    </article>
  );
}

export default function App() {
  const [initial] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return {
        profile: parseProfile(saved),
        error:
          !saved && localStorage.getItem(legacyStorageKey)
            ? "The course list has changed. Please reselect your completed courses and rebuild your plan."
            : "",
      };
    } catch {
      return {
        profile: { ...emptyProfile },
        error:
          "Your saved profile could not be loaded. You can start a new plan.",
      };
    }
  });
  const [profile, setProfile] = useState<Profile>(initial.profile);
  const [storageError, setStorageError] = useState(initial.error);
  const [page, setPage] = useState<Page>("courses");
  const [mobileNav, setMobileNav] = useState(false);
  const [setup, setSetup] = useState(false);
  const [details, setDetails] = useState<Course | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [compared, setCompared] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [courseView, setCourseView] = useState<"recommended" | "all">(
    "recommended",
  );
  const [notice, setNotice] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap>({
    stronglyRecommended: [],
    worthConsidering: [],
    broadenSkills: [],
  });
  const [loading, setLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState(false);
  const [catalog, setCatalog] = useState<Course[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [catalogError, setCatalogError] = useState(false);
  const [eligibility, setEligibility] = useState<
    Record<string, EligibilityStatus>
  >({});
  const [comparedCourses, setComparedCourses] = useState<Course[]>([]);
  const eligible = (course: Course) =>
    eligibility[course.id]?.eligible === true;
  const currentCareer = careers.find((c) => c.id === profile.career);
  const planned = catalog.filter((c) => profile.saved.includes(c.id));
  const savedSkills = [...new Set(planned.flatMap((course) => course.skills))];
  const selectedCourses = comparedCourses;
  const matchesCourse = (c: Course) =>
    `${c.id} ${c.title} ${c.skills.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()) &&
    (!eligibleOnly || (eligible(c) && !profile.completed.includes(c.id)));
  const filtered = catalog.filter(matchesCourse);
  const visibleCourseCount =
    courseView === "all"
      ? filtered.length
      : priorityTiers.reduce(
          (count, tier) =>
            count +
            roadmap[tier.key].filter((item) => matchesCourse(item.course))
              .length,
          0,
        );

  useEffect(() => {
    let active = true;
    Promise.all([getCourses(), getCareers()])
      .then(([courseData, careerData]) => {
        if (active) {
          setCatalog(courseData);
          setCareers(careerData);
        }
      })
      .catch(() => {
        if (active) setCatalogError(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!catalog.length) return;
    let active = true;
    setEligibility({});
    getEligibility(profile.completed)
      .then((result) => {
        if (active) setEligibility(result);
      })
      .catch(() => {
        if (active) setEligibility({});
      });
    return () => {
      active = false;
    };
  }, [catalog, profile.completed]);
  useEffect(() => {
    let active = true;
    if (!profile.career) {
      setRoadmap({
        stronglyRecommended: [],
        worthConsidering: [],
        broadenSkills: [],
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    setRecommendationError(false);
    const controller = new AbortController();
    getRoadmap(
      { career: profile.career, completed: profile.completed },
      controller.signal,
    )
      .then((result) => {
        if (active) setRoadmap(result);
      })
      .catch(() => {
        if (active) setRecommendationError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [profile.career, profile.completed]);
  useEffect(() => {
    let active = true;
    getComparison(compared)
      .then((result) => {
        if (active) setComparedCourses(result);
      })
      .catch(() => {
        if (active) setComparedCourses([]);
      });
    return () => {
      active = false;
    };
  }, [compared]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  function saveProfile(next: Profile) {
    setProfile(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setStorageError("");
    } catch {
      setStorageError(
        "Browser storage is unavailable. Your changes work for this visit but will not be saved.",
      );
    }
  }
  function applyPreferences(next: Profile) {
    saveProfile(next);
    setCourseView("recommended");
    setQuery("");
    setEligibleOnly(false);
    setSetup(false);
    navigate("courses");
    setNotice("Preferences saved. Updating your course priorities.");
  }
  function navigate(next: Page) {
    setPage(next);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function compare(course: Course) {
    if (compared.includes(course.id))
      setCompared(compared.filter((id) => id !== course.id));
    else if (compared.length >= 3)
      setNotice(
        "You can compare up to three courses. Remove one to add another.",
      );
    else {
      setCompared([...compared, course.id]);
      setNotice(`${course.id} added to comparison.`);
    }
  }
  function toggleSaved(course: Course) {
    if (profile.completed.includes(course.id)) return;
    const removing = profile.saved.includes(course.id);
    saveProfile({
      ...profile,
      saved: removing
        ? profile.saved.filter((id) => id !== course.id)
        : [...profile.saved, course.id],
    });
    setNotice(
      `${course.id} ${removing ? "removed from" : "added to"} your roadmap.`,
    );
  }
  function exportPlan() {
    const text = [
      "PathFinder UA - career course roadmap",
      "Curated UA CS/ECE courses. Confirm all prerequisites and degree requirements with an advisor.",
      "",
      `Career: ${currentCareer?.title ?? "Not selected"}`,
      "Saved interests for the rest of your degree; not a semester schedule or degree audit.",
      "",
      ...planned.map(
        (c) =>
          `${c.id}: ${c.title} (${c.credits} credits) - ${eligible(c) ? "Modeled prerequisites matched" : "Prerequisites needed: " + formatPrerequisites(c)}`,
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "pathfinder-roadmap.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  const card = (
    course: Course,
    recommendation: Recommendation | undefined = [
      ...roadmap.stronglyRecommended,
      ...roadmap.worthConsidering,
      ...roadmap.broadenSkills,
    ].find((item) => item.course.id === course.id),
  ) => (
    <CourseCard
      key={course.id}
      course={course}
      profile={profile}
      prerequisiteStatus={
        eligibility[course.id] ??
        (recommendation
          ? {
              eligible: recommendation.missingPrerequisites.length === 0,
              matchedPrerequisites: recommendation.matchedPrerequisites,
              missingPrerequisites: recommendation.missingPrerequisites,
            }
          : undefined)
      }
      careerSkills={recommendation?.careerSkills}
      compared={compared.includes(course.id)}
      onCompare={() => compare(course)}
      onAdd={() => toggleSaved(course)}
      onDetails={() => setDetails(course)}
    />
  );

  const priorityGroups = (applyFilters = false) =>
    priorityTiers.map((tier, index) => {
      const items = applyFilters
        ? roadmap[tier.key].filter((item) => matchesCourse(item.course))
        : roadmap[tier.key];
      return (
        <section
          key={tier.key}
          className={`recommendation-section priority-tier priority-tier-${index + 1}`}
          aria-label={tier.title}
        >
          <div className="section-heading">
            <div>
              <span className="priority-label">Priority {index + 1}</span>
              <h2>{tier.title}</h2>
              <p>{tier.description}</p>
            </div>
            <span className="tier-count">{items.length} courses</span>
          </div>
          {items.length ? (
            <div className="course-grid">
              {items.map((item) => card(item.course, item))}
            </div>
          ) : (
            <p className="small muted">
              No courses in this tier match your profile and current filters.
            </p>
          )}
        </section>
      );
    });

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {mobileNav && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("courses");
          }}
        >
          <span className="brand-mark">
            <Route size={24} />
          </span>
          <span>
            PathFinder <b>UA</b>
            <small>A LITTLE DIRECTION. A LOT OF POSSIBILITY.</small>
          </span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            <GraduationCap size={21} />
          </span>
          <span>
            Student workspace<small>Computer Science · Alabama</small>
          </span>
        </div>
        <p className="nav-label">YOUR NEXT CHAPTER</p>
        <nav aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              aria-current={page === id ? "page" : undefined}
              onClick={() => navigate(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === "roadmap" && planned.length > 0 && (
                <span className="nav-count">{planned.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="advisor-card">
            <span className="advisor-icon">
              <Compass size={21} />
            </span>
            <strong>A guide, not a degree audit.</strong>
            <p>
              Bring your plan to your advisor. Great next steps start with a
              conversation.
            </p>
            <a
              href="https://catalog.ua.edu/undergraduate/engineering/computer-science/"
              target="_blank"
              rel="noreferrer"
            >
              Visit the UA catalog <ExternalLink size={13} />
            </a>
          </div>
          <button className="profile-button" onClick={() => setSetup(true)}>
            <span className="avatar">
              {profile.name ? profile.name.slice(0, 1).toUpperCase() : "Y"}
            </span>
            <span>
              {profile.name || "Your workspace"}
              <small>
                {profile.setupComplete
                  ? "Edit planning profile"
                  : "Make yourself at home"}
              </small>
            </span>
            <Settings2 size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button menu-button"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <span>My workspace</span>
            <ChevronRight size={14} />
            <strong>
              {page === "compare"
                ? "Compare courses"
                : navigation.find((n) => n.id === page)?.label}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="demo-pill">
              <span /> CS career course guide
            </span>
            <button
              className="top-avatar"
              aria-label="Edit your profile"
              onClick={() => setSetup(true)}
            >
              {profile.name ? (
                profile.name.slice(0, 1).toUpperCase()
              ) : (
                <GraduationCap size={18} />
              )}
            </button>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {catalogError && (
            <div className="warning" role="alert">
              Planning data could not be loaded. Start the FastAPI server and
              reload.
            </div>
          )}
          {storageError && (
            <div className="warning" role="alert">
              {storageError}
            </div>
          )}
          {page === "courses" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">MAKE ROOM FOR CURIOSITY</p>
                  <h1>Explore your next possibility.</h1>
                  <p>
                    {profile.setupComplete
                      ? `${currentCareer?.title ?? "Your career"} priorities, based on ${profile.completed.length} completed courses.`
                      : "Select your career interest and completed courses to find what to study next."}
                  </p>
                </div>
                {profile.setupComplete && (
                  <>
                    <button
                      className="button secondary"
                      onClick={() => setSetup(true)}
                    >
                      <Settings2 size={16} />
                      Edit my preferences
                    </button>
                  </>
                )}
              </div>
              {(profile.setupComplete || courseView === "all") && (
                <>
                  <div
                    className="course-views"
                    role="group"
                    aria-label="Course view"
                  >
                    <button
                      type="button"
                      aria-pressed={courseView === "recommended"}
                      onClick={() => setCourseView("recommended")}
                    >
                      <Sparkles size={16} /> Recommended for you
                    </button>
                    <button
                      type="button"
                      aria-pressed={courseView === "all"}
                      onClick={() => setCourseView("all")}
                    >
                      <BookOpen size={16} /> All courses
                    </button>
                  </div>
                  <p className="course-view-description">
                    {courseView === "recommended"
                      ? `Courses selected for ${currentCareer?.title ?? "your career interest"}, based on your completed courses. Review three priority levels, with prerequisite readiness shown on each course.`
                      : "Browse every course in our curated set, including completed courses and options outside your career recommendations."}
                  </p>
                  <div className="filter-bar">
                    <label className="search-box">
                      <Search size={18} />
                      <input
                        placeholder="Search courses, codes, or skills…"
                        aria-label="Search courses"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <label className="filter-toggle">
                      <input
                        type="checkbox"
                        checked={eligibleOnly}
                        onChange={(e) => setEligibleOnly(e.target.checked)}
                      />
                      Eligible for me
                    </label>
                    <span className="small muted">
                      {courseView === "recommended" &&
                      (!profile.setupComplete || loading || recommendationError)
                        ? ""
                        : `${visibleCourseCount} courses`}
                    </span>
                  </div>
                  <div className="inline-note">
                    <BookOpen size={17} /> Curated UA CS/ECE course list.
                    Prerequisite checks cover listed CS/ECE courses; confirm
                    math, grades, enrollment, and degree applicability with UA.
                    This set does not include every course required for the B.S.
                    These tiers reflect career priorities, not official
                    graduation requirements.
                  </div>
                </>
              )}
              {courseView === "recommended" && !profile.setupComplete ? (
                <div className="onboarding">
                  <div className="onboarding-intro">
                    <span className="priority-label">
                      YOUR PERSONAL COURSE GUIDE
                    </span>
                    <h2>Start with your career. Build on what you know.</h2>
                    <p>
                      Choose a career interest, select the courses you have
                      completed, and get three levels of personalized course
                      recommendations. No account needed.
                    </p>
                  </div>
                  {catalogError ? (
                    <p>
                      Reload the page to retry loading your course preferences.
                    </p>
                  ) : !catalog.length || !careers.length ? (
                    <p role="status">Loading your course preferences...</p>
                  ) : (
                    <Setup
                      inline
                      profile={profile}
                      catalog={catalog}
                      careers={careers}
                      onSave={applyPreferences}
                      onClose={() => setCourseView("all")}
                    />
                  )}
                </div>
              ) : courseView === "recommended" && loading ? (
                <p role="status">Updating your course recommendations...</p>
              ) : courseView === "recommended" && recommendationError ? (
                <div className="warning" role="alert">
                  Recommendations could not be loaded.{" "}
                  <button
                    className="text-button"
                    onClick={() => setSetup(true)}
                  >
                    Review preferences and retry
                  </button>
                </div>
              ) : visibleCourseCount > 0 ? (
                courseView === "all" ? (
                  <div className="course-grid catalog">
                    {filtered.map((course) => card(course))}
                  </div>
                ) : (
                  <div aria-label="Personalized course recommendations">
                    {priorityGroups(true)}
                  </div>
                )
              ) : (
                <div className="empty-state">
                  <Search size={30} />
                  <h2>
                    {courseView === "recommended" && !query && !eligibleOnly
                      ? "No remaining recommendations in this set"
                      : "No courses found"}
                  </h2>
                  <p>
                    {courseView === "recommended" && !query && !eligibleOnly
                      ? "Update your preferences or browse All courses for other options. This curated dataset does not cover the full CS degree."
                      : "Try a different search or clear the eligibility filter."}
                  </p>
                  <button
                    className="button secondary"
                    onClick={() => {
                      setQuery("");
                      setEligibleOnly(false);
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
          {page === "careers" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">A DIRECTION, NOT A DESTINATION</p>
                  <h1>Follow what interests you.</h1>
                  <p>
                    You can change direction. Start with something you’re
                    curious about.
                  </p>
                </div>
              </div>
              <div className="career-grid">
                {careers.map((career) => {
                  const Icon = careerIcons[career.id];
                  return (
                    <article
                      className={`career-card ${profile.career === career.id ? "selected" : ""}`}
                      key={career.id}
                    >
                      <span className="career-large-icon">
                        <Icon size={30} />
                      </span>
                      <h2>{career.title}</h2>
                      <p>{career.description}</p>
                      <h3>Skills you’ll explore</h3>
                      <div className="tags">
                        {career.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                      <h3>Possible directions</h3>
                      <ul>
                        {career.roles.map((role) => (
                          <li key={role}>{role}</li>
                        ))}
                      </ul>
                      <button
                        className={`button ${profile.career === career.id ? "secondary" : "primary"}`}
                        onClick={() => {
                          saveProfile({ ...profile, career: career.id });
                          setNotice(
                            `${career.title} selected. Your recommendations will reflect this interest.`,
                          );
                        }}
                      >
                        {profile.career === career.id ? (
                          <>
                            <Check size={16} />
                            Your current direction
                          </>
                        ) : (
                          <>
                            Explore this direction
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </article>
                  );
                })}
              </div>
              <div className="inline-note career-note">
                <Compass size={20} />
                <span>
                  These are illustrative career overviews. Sourced education,
                  salary, and outlook information can be added here as the
                  project grows.
                </span>
              </div>
            </>
          )}
          {page === "compare" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">SEE THE POSSIBILITIES SIDE BY SIDE</p>
                  <h1>A clearer way to choose.</h1>
                  <p>
                    Compare up to three courses by what you’ll learn and where
                    they could take you.
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => navigate("courses")}
                >
                  <Plus size={16} />
                  Choose courses
                </button>
              </div>
              {selectedCourses.length ? (
                <div className="comparison-wrap">
                  <table className="comparison-table">
                    <caption className="sr-only">
                      Course comparison using curated UA course data
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">A closer look</th>
                        {selectedCourses.map((course) => (
                          <th scope="col" key={course.id}>
                            <span className="course-code">{course.id}</span>
                            <h2>{course.title}</h2>
                            <button
                              className="text-button"
                              onClick={() => compare(course)}
                              aria-label={`Remove ${course.id} from comparison`}
                            >
                              <X size={14} />
                              Remove
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          label: "Credit hours",
                          value: (c: Course) => `${c.credits} credits`,
                        },
                        { label: "Category", value: (c: Course) => c.category },
                        {
                          label: "Career skills",
                          value: (c: Course) => c.skills.join(", "),
                        },
                        {
                          label: "Learning objectives",
                          value: (c: Course) => c.objectives.join("; "),
                        },
                        {
                          label: "Prerequisites",
                          value: formatPrerequisites,
                        },
                        {
                          label: "Later connections",
                          value: (c: Course) =>
                            catalog
                              .filter((next) =>
                                next.prerequisites.some((g) =>
                                  g.includes(c.id),
                                ),
                              )
                              .map((next) => next.id)
                              .join(", ") || "None in this dataset",
                        },
                        {
                          label: "Workload data",
                          value: (c: Course) => c.effort,
                        },
                      ].map((row) => (
                        <tr key={row.label}>
                          <th scope="row">{row.label}</th>
                          {selectedCourses.map((c) => (
                            <td key={c.id}>{row.value(c)}</td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <th scope="row">Your roadmap</th>
                        {selectedCourses.map((c) => (
                          <td key={c.id}>
                            <button
                              className="button secondary"
                              disabled={profile.completed.includes(c.id)}
                              onClick={() => toggleSaved(c)}
                            >
                              {profile.saved.includes(c.id)
                                ? "Remove from roadmap"
                                : "Save to roadmap"}
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state large">
                  <GitCompareArrows size={36} />
                  <h2>Good decisions start with a closer look.</h2>
                  <p>Use the compare icon on any course card to add it here.</p>
                  <button
                    className="button primary"
                    onClick={() => navigate("courses")}
                  >
                    Find courses to compare
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          {page === "roadmap" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">YOUR CAREER. YOUR PATH.</p>
                  <h1>My course roadmap</h1>
                  <p>
                    Courses worth considering before graduation, guided by your
                    career interest and completed coursework.
                  </p>
                </div>
                <button
                  className="button secondary"
                  disabled={!planned.length}
                  onClick={exportPlan}
                >
                  <ArrowDownToLine size={16} />
                  Export roadmap
                </button>
              </div>
              <div className="inline-note">
                This curated course set is incomplete. Required major courses
                and suggested electives are labeled separately. Confirm
                catalog-year requirements, full prerequisites, and graduation
                progress with DegreeWorks and your advisor.
              </div>
              <section className="recommendation-section">
                <div className="section-heading">
                  <div>
                    <h2>Saved interests</h2>
                    <p>
                      Your shortlist can include courses you are working toward.
                      Saving a course does not establish eligibility.
                    </p>
                  </div>
                </div>
                {planned.length ? (
                  <div className="course-grid">
                    {planned.map((course) => card(course))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <BookOpen size={30} />
                    <h3>Start your course shortlist</h3>
                    <p>
                      Save courses from the suggestions below or Explore
                      courses.
                    </p>
                  </div>
                )}
                {savedSkills.length > 0 && (
                  <>
                    <h3>Skills to explore</h3>
                    <div className="tags">
                      {savedSkills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  </>
                )}
              </section>
              {!profile.setupComplete ? (
                <button
                  className="button primary"
                  onClick={() => setSetup(true)}
                >
                  Build my roadmap
                </button>
              ) : loading ? (
                <p role="status">Updating your roadmap...</p>
              ) : recommendationError ? (
                <div className="warning" role="alert">
                  Your roadmap could not be loaded.{" "}
                  <button
                    className="text-button"
                    onClick={() => setSetup(true)}
                  >
                    Review profile and retry
                  </button>
                </div>
              ) : (
                <>{priorityGroups()}</>
              )}
            </>
          )}
          <footer>
            <span>
              Made for the next step. <b>PathFinder UA</b>
            </span>
            <span>Curated course data · Not an official UA advising tool</span>
          </footer>
        </main>
      </div>
      {compared.length > 0 && page !== "compare" && (
        <div className="compare-dock">
          <GitCompareArrows size={18} />
          <span>{compared.length} of 3 courses selected</span>
          <button onClick={() => navigate("compare")}>
            Compare
            <ArrowRight size={15} />
          </button>
          <button
            className="icon-button"
            aria-label="Clear comparison"
            onClick={() => setCompared([])}
          >
            <X size={17} />
          </button>
        </div>
      )}
      <div
        className={`toast ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice && (
          <>
            <CheckCircle2 size={18} />
            {notice}
          </>
        )}
      </div>
      {setup && (
        <Setup
          profile={profile}
          catalog={catalog}
          careers={careers}
          onClose={() => setSetup(false)}
          onSave={applyPreferences}
        />
      )}
      {details && (
        <Modal title={details.title} onClose={() => setDetails(null)}>
          <div className="detail-content">
            <div className="detail-meta">
              <span className="course-code">{details.id}</span>
              <span>{details.credits} credits</span>
              <span>{details.category}</span>
            </div>
            <p>{details.description}</p>
            <h3>What you’ll learn</h3>
            <ul>
              {details.objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
            <h3>Why it might fit</h3>
            <p>
              {currentCareer && details.careers.includes(currentCareer.id)
                ? `Builds ${details.skills.join(" and ").toLowerCase()} skills connected to ${currentCareer.title.toLowerCase()}.`
                : "Explore a new part of your computing foundation."}
            </p>
            <h3>Prerequisites</h3>
            <p>{formatPrerequisites(details)}</p>
            <span className="eligibility">
              {eligible(details)
                ? "Your selections match modeled CS/ECE prerequisites. Confirm all catalog requirements with UA."
                : "Add the required completed CS/ECE courses to your profile."}
            </span>
            <h3>Where it could lead</h3>
            <p>
              {catalog
                .filter((c) =>
                  c.prerequisites.some((g) => g.includes(details.id)),
                )
                .map((c) => `${c.id}: ${c.title}`)
                .join(" · ") ||
                "No later connections in the current sample dataset."}
            </p>
            <div className="inline-note">
              {details.source}. See the official UA catalog for current
              requirements. Course connections may require additional
              prerequisites.
            </div>
          </div>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => compare(details)}
            >
              <GitCompareArrows size={16} />
              {compared.includes(details.id)
                ? "Remove comparison"
                : "Compare course"}
            </button>
            <button
              className="button primary"
              disabled={profile.completed.includes(details.id)}
              onClick={() => toggleSaved(details)}
            >
              {profile.saved.includes(details.id)
                ? "Remove from roadmap"
                : "Save to roadmap"}
            </button>
          </div>
        </Modal>
      )}
      {profile.setupComplete && page === "courses" && (
        <button className="delete-profile" onClick={() => setDeleteOpen(true)}>
          <Trash2 size={13} />
          Delete saved profile
        </button>
      )}
      {deleteOpen && (
        <Modal
          title="Start with a clean slate?"
          onClose={() => setDeleteOpen(false)}
        >
          <p className="muted">
            This deletes your saved profile, completed courses, and saved
            roadmap plan from this browser.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setDeleteOpen(false)}
            >
              Keep my profile
            </button>
            <button
              className="button primary"
              onClick={() => {
                try {
                  localStorage.removeItem(storageKey);
                  localStorage.removeItem(legacyStorageKey);
                  setProfile({ ...emptyProfile });
                  setCourseView("recommended");
                  setStorageError("");
                  setCompared([]);
                  setDeleteOpen(false);
                  setNotice("Your saved profile has been deleted.");
                } catch {
                  setStorageError(
                    "Your browser prevented deletion. Clear this site’s storage in your browser settings.",
                  );
                  setDeleteOpen(false);
                }
              }}
            >
              Delete profile
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
