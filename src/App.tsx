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
  LayoutDashboard,
  Leaf,
  Menu,
  Plus,
  Route,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  X,
  CalendarDays,
  Bot,
} from "lucide-react";
import { careers, courses, emptyProfile } from "./data";
import {
  demoPlanningService,
  isEligible,
  parseProfile,
  storageKey,
} from "./planning";
import type { Course, Page, Profile, Recommendation } from "./types";

const navigation: { id: Page; label: string; icon: typeof Compass }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "courses", label: "Explore courses", icon: BookOpen },
  { id: "careers", label: "Career paths", icon: Route },
  { id: "compare", label: "Compare courses", icon: GitCompareArrows },
  { id: "schedule", label: "My semester", icon: CalendarDays },
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
  onSave,
  onClose,
}: {
  profile: Profile;
  onSave: (value: Profile) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Profile>({
    ...profile,
    completed: [...profile.completed],
  });
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [creditInput, setCreditInput] = useState(String(profile.creditTarget));
  const validCredits =
    /^\d+$/.test(creditInput) &&
    Number(creditInput) >= 1 &&
    Number(creditInput) <= 21;
  const toggle = (id: string) =>
    setDraft((p) => ({
      ...p,
      completed: p.completed.includes(id)
        ? p.completed.filter((c) => c !== id)
        : [...p.completed, id],
    }));
  return (
    <Modal
      title={
        profile.setupComplete
          ? "Your planning profile"
          : "Let’s find your starting point"
      }
      onClose={onClose}
    >
      <div className="wizard-steps" aria-label={`Step ${step + 1} of 3`}>
        {["About you", "Your progress", "Your semester"].map((label, index) => (
          <span key={label} className={index <= step ? "active" : ""}>
            <b>{index < step ? <Check size={13} /> : index + 1}</b>
            {label}
          </span>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 2) setStep(step + 1);
          else if (validCredits && draft.career)
            onSave({
              ...draft,
              creditTarget: Number(creditInput),
              setupComplete: true,
              schedule: draft.schedule.filter(
                (id) =>
                  !draft.completed.includes(id) &&
                  isEligible(
                    courses.find((c) => c.id === id)!,
                    draft.completed,
                  ),
              ),
            });
        }}
      >
        {step === 0 && (
          <div className="wizard-content">
            <p className="muted">
              A little direction goes a long way. You can change all of this
              later.
            </p>
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
            <fieldset>
              <legend>What are you curious about?</legend>
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
          </div>
        )}
        {step === 1 && (
          <div className="wizard-content">
            <p className="muted">
              Select courses you’ve already completed. Starting fresh? You can
              continue without selecting any.
            </p>
            <div className="inline-note">
              <BookOpen size={17} /> These are illustrative courses for the UI
              demo.
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
              {courses
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
              {!courses.some((c) =>
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
        {step === 2 && (
          <div className="wizard-content">
            <p className="muted">
              Make room for the semester you want to have.
            </p>
            <label className="field">
              Target credit hours
              <input
                type="number"
                min="1"
                max="21"
                step="1"
                required
                value={creditInput}
                onChange={(e) => setCreditInput(e.target.value)}
                aria-describedby="credit-help"
              />
            </label>
            <p id="credit-help" className="small muted">
              Choose a whole number from 1 to 21. This is a planning target, not
              registration advice.
            </p>
            <fieldset>
              <legend>Preferred workload</legend>
              <div className="workload-options">
                {(["balanced", "lighter"] as const).map((value) => (
                  <label
                    key={value}
                    className={`workload-option ${draft.workload === value ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="workload"
                      checked={draft.workload === value}
                      onChange={() => setDraft({ ...draft, workload: value })}
                    />
                    <Leaf size={20} />
                    <strong>
                      {value === "balanced" ? "Balanced" : "A little lighter"}
                    </strong>
                    <small>
                      {value === "balanced"
                        ? "A mix of challenge and breathing room"
                        : "Favor courses with lighter demo workload"}
                    </small>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="privacy-note">
              <ShieldCheck size={20} />
              <span>
                Yours to keep. Yours to delete.
                <small>
                  Your profile stays in this browser. No account or academic
                  records needed.
                </small>
              </span>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => (step ? setStep(step - 1) : onClose())}
          >
            {step ? "Back" : "Maybe later"}
          </button>
          <button
            className="button primary"
            type="submit"
            disabled={
              step === 0 ? !draft.career : step === 2 ? !validCredits : false
            }
          >
            {step === 2 ? "Save & see my recommendations" : "Continue"}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CourseCard({
  course,
  profile,
  compared,
  onCompare,
  onAdd,
  onDetails,
}: {
  course: Course;
  profile: Profile;
  compared: boolean;
  onCompare: () => void;
  onAdd: () => void;
  onDetails: () => void;
}) {
  const eligible = isEligible(course, profile.completed);
  const completed = profile.completed.includes(course.id);
  const added = profile.schedule.includes(course.id);
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
      <p>{course.description}</p>
      <div className="tags">
        {course.skills.slice(0, 2).map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
      <div className="course-bottom">
        <span className={`eligibility ${completed || eligible ? "good" : ""}`}>
          {completed ? (
            <>
              <CheckCircle2 size={14} /> Completed
            </>
          ) : eligible ? (
            <>
              <CheckCircle2 size={14} /> Eligible in demo
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
          disabled={completed || !eligible}
          aria-label={`${added ? "Remove" : "Add"} ${course.id} ${added ? "from" : "to"} semester`}
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
      return {
        profile: parseProfile(localStorage.getItem(storageKey)),
        error: "",
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
  const [page, setPage] = useState<Page>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [setup, setSetup] = useState(false);
  const [details, setDetails] = useState<Course | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [compared, setCompared] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState(false);
  const currentCareer = careers.find((c) => c.id === profile.career);
  const planned = courses.filter((c) => profile.schedule.includes(c.id));
  const credits = planned.reduce((total, c) => total + c.credits, 0);
  const selectedCourses = courses.filter((c) => compared.includes(c.id));
  const filtered = courses.filter(
    (c) =>
      `${c.id} ${c.title} ${c.skills.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!eligibleOnly ||
        (isEligible(c, profile.completed) &&
          !profile.completed.includes(c.id))),
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setRecommendationError(false);
    demoPlanningService
      .recommend(profile, courses)
      .then((result) => {
        if (active) setRecommendations(result);
      })
      .catch(() => {
        if (active) setRecommendationError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [profile]);
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
  function toggleSchedule(course: Course) {
    if (
      profile.completed.includes(course.id) ||
      !isEligible(course, profile.completed)
    )
      return;
    const removing = profile.schedule.includes(course.id);
    saveProfile({
      ...profile,
      schedule: removing
        ? profile.schedule.filter((id) => id !== course.id)
        : [...profile.schedule, course.id],
    });
    setNotice(
      `${course.id} ${removing ? "removed from" : "added to"} your semester.`,
    );
  }
  function exportPlan() {
    const text = [
      "PathFinder UA — proposed semester",
      "Illustrative demo data. Review with an academic advisor.",
      "",
      `Career: ${currentCareer?.title ?? "Not selected"}`,
      `Credits: ${credits} / ${profile.creditTarget}`,
      "",
      ...planned.map((c) => `${c.id}: ${c.title} (${c.credits} credits)`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "pathfinder-semester.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  const card = (course: Course) => (
    <CourseCard
      key={course.id}
      course={course}
      profile={profile}
      compared={compared.includes(course.id)}
      onCompare={() => compare(course)}
      onAdd={() => toggleSchedule(course)}
      onDetails={() => setDetails(course)}
    />
  );

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
            navigate("overview");
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
              {id === "compare" && compared.length > 0 && (
                <span className="nav-count">{compared.length}</span>
              )}
              {id === "schedule" && planned.length > 0 && (
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
            <strong>{navigation.find((n) => n.id === page)?.label}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-pill">
              <span /> Interactive demo
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
          {storageError && (
            <div className="warning" role="alert">
              {storageError}
            </div>
          )}
          {page === "overview" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">YOUR PATH, YOUR POSSIBILITIES</p>
                  <h1>
                    {profile.setupComplete
                      ? `Welcome back${profile.name ? `, ${profile.name}` : ""}.`
                      : "Your next step starts here."}
                  </h1>
                  <p>
                    You don’t need your whole future figured out. Just a
                    direction to explore.
                  </p>
                </div>
                <span className="semester-label">
                  <CalendarDays size={15} /> Plan your next semester
                </span>
              </div>
              <section className="welcome-card">
                <div className="welcome-copy">
                  <span className="light-eyebrow">
                    <span /> BUILT FOR YOUR NEXT CHAPTER
                  </span>
                  <h2>
                    A course today.
                    <br />A possibility tomorrow.
                  </h2>
                  <p>
                    Connect what you’ve learned with where you want to go. Let’s
                    build a semester that makes sense for you.
                  </p>
                  <button
                    className="button white"
                    onClick={() =>
                      profile.setupComplete
                        ? navigate("courses")
                        : setSetup(true)
                    }
                  >
                    {profile.setupComplete
                      ? "Explore my next courses"
                      : "Find my starting point"}
                    <ArrowRight size={17} />
                  </button>
                  <span className="welcome-footnote">
                    {profile.setupComplete
                      ? "A little curiosity can take you a long way."
                      : "About 2 minutes · No account needed"}
                  </span>
                </div>
                <div className="journey-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="orbit orbit-three" />
                  <div className="path-line" />
                  <span className="journey-dot dot-one" />
                  <span className="journey-dot dot-two" />
                  <span className="journey-dot dot-three" />
                  <div className="journey-label start">
                    <BookOpen size={16} /> What you know
                  </div>
                  <div className="journey-center">
                    <Compass size={64} strokeWidth={1.1} />
                  </div>
                  <div className="journey-label destination">
                    <Sparkles size={16} /> Where you could go
                  </div>
                  <span className="art-caption">
                    THERE’S MORE THAN ONE WAY FORWARD.
                  </span>
                </div>
              </section>
              <div className="overview-columns">
                <section>
                  <div className="section-heading">
                    <div>
                      <h2>A little about you</h2>
                      <p>Three small steps. A more personal path.</p>
                    </div>
                    <span className="step-count">
                      {profile.setupComplete ? "3 of 3" : "0 of 3"} complete
                    </span>
                  </div>
                  <div className="setup-cards">
                    {[
                      {
                        icon: BookOpen,
                        title: "Start with what you know",
                        text: profile.setupComplete
                          ? `${profile.completed.length} completed courses selected`
                          : "Add the courses you’ve already completed.",
                        label: "Add your courses",
                      },
                      {
                        icon: Target,
                        title: "Follow your curiosity",
                        text:
                          currentCareer?.title ??
                          "Choose a career direction that interests you.",
                        label: "Explore your interests",
                      },
                      {
                        icon: SlidersHorizontal,
                        title: "Find your balance",
                        text: profile.setupComplete
                          ? `${profile.creditTarget} credits · ${profile.workload} workload`
                          : "Set your credit goal and preferred workload.",
                        label: "Set your preferences",
                      },
                    ].map(({ icon: Icon, title, text, label }, i) => (
                      <button
                        className="setup-card"
                        key={title}
                        onClick={() => setSetup(true)}
                      >
                        <span className={`step-icon tone-${i}`}>
                          <Icon size={21} />
                        </span>
                        <span className="step-number">
                          {profile.setupComplete ? (
                            <CheckCircle2 size={17} />
                          ) : (
                            `0${i + 1}`
                          )}
                        </span>
                        <h3>{title}</h3>
                        <p>{text}</p>
                        <span className="card-link">
                          {profile.setupComplete ? "Edit details" : label}
                          <ArrowRight size={14} />
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="semester-preview">
                  <div className="section-heading">
                    <h2>Your semester, at a glance</h2>
                    <CalendarDays size={18} />
                  </div>
                  <div className="credit-overview">
                    <strong>{credits}</strong>
                    <span>/ {profile.creditTarget} credits planned</span>
                  </div>
                  <progress
                    aria-label="Planned credits"
                    max={profile.creditTarget}
                    value={Math.min(credits, profile.creditTarget)}
                  />
                  <p>
                    {planned.length
                      ? `${planned.length} courses in your plan. Keep shaping your next step.`
                      : "A fresh start. Add courses as you discover what fits."}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => navigate("schedule")}
                  >
                    Open semester planner
                    <ArrowRight size={15} />
                  </button>
                </section>
              </div>
              <section className="recommendation-section">
                <div className="section-heading">
                  <div>
                    <h2>
                      {profile.setupComplete
                        ? "Your next possibilities"
                        : "A few possibilities to get you thinking"}
                    </h2>
                    <p>
                      {profile.setupComplete
                        ? "Eligible demo courses, shaped by your interests and progress."
                        : "A small preview of what you could explore. Set up your profile for recommendations."}
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => navigate("courses")}
                  >
                    Explore all courses
                    <ArrowRight size={16} />
                  </button>
                </div>
                {loading ? (
                  <p role="status">Finding your next possibilities…</p>
                ) : recommendationError ? (
                  <div className="warning">
                    Recommendations could not be loaded. Explore the course
                    catalog or try updating your profile.
                  </div>
                ) : profile.setupComplete && !recommendations.length ? (
                  <div className="empty-state">
                    <GraduationCap size={30} />
                    <h3>You’ve explored this corner of the catalog.</h3>
                    <p>
                      No eligible unfinished courses remain in this small demo.
                      Review your completed courses or explore the full list.
                    </p>
                    <button
                      className="button secondary"
                      onClick={() => setSetup(true)}
                    >
                      Review profile
                    </button>
                  </div>
                ) : (
                  <div className="course-grid">
                    {(profile.setupComplete
                      ? recommendations.slice(0, 3).map((r) => r.course)
                      : [courses[2], courses[6], courses[7]]
                    ).map(card)}
                  </div>
                )}
              </section>
              <div className="reassurance">
                <ShieldCheck size={18} />
                <span>
                  Your journey stays yours. Planning information is saved only
                  in this browser.
                </span>
                <button onClick={() => setSetup(true)}>
                  Manage profile
                  <ArrowRight size={13} />
                </button>
              </div>
            </>
          )}
          {page === "courses" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">MAKE ROOM FOR CURIOSITY</p>
                  <h1>Explore your next possibility.</h1>
                  <p>
                    Discover the skills, connections, and next steps behind each
                    course.
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => setSetup(true)}
                >
                  <Settings2 size={16} />
                  Edit my preferences
                </button>
              </div>
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
                <span className="small muted">{filtered.length} courses</span>
              </div>
              <div className="inline-note">
                <BookOpen size={17} /> Sample catalog · Course titles,
                prerequisites, and workload labels are illustrative.
              </div>
              {filtered.length ? (
                <div className="course-grid catalog">{filtered.map(card)}</div>
              ) : (
                <div className="empty-state">
                  <Search size={30} />
                  <h2>No courses found</h2>
                  <p>Try a different search or clear the eligibility filter.</p>
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
                      Course comparison using illustrative demo data
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
                          value: (c: Course) =>
                            c.prerequisites
                              .map((g) => `(${g.join(" or ")})`)
                              .join(" and ") || "None in demo",
                        },
                        {
                          label: "Later connections",
                          value: (c: Course) =>
                            courses
                              .filter((next) =>
                                next.prerequisites.some((g) =>
                                  g.includes(c.id),
                                ),
                              )
                              .map((next) => next.id)
                              .join(", ") || "None in this dataset",
                        },
                        {
                          label: "Demo workload",
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
                        <th scope="row">Your semester</th>
                        {selectedCourses.map((c) => (
                          <td key={c.id}>
                            <button
                              className="button secondary"
                              disabled={
                                profile.completed.includes(c.id) ||
                                !isEligible(c, profile.completed)
                              }
                              onClick={() => toggleSchedule(c)}
                            >
                              {profile.schedule.includes(c.id)
                                ? "Remove from plan"
                                : "Add to plan"}
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
          {page === "schedule" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">ONE SEMESTER. YOUR POSSIBILITIES.</p>
                  <h1>Give your next chapter a shape.</h1>
                  <p>A flexible place to bring your course choices together.</p>
                </div>
                <button
                  className="button secondary"
                  disabled={!planned.length}
                  onClick={exportPlan}
                >
                  <ArrowDownToLine size={16} />
                  Export plan
                </button>
              </div>
              <div className="planner-layout">
                <section className="plan-courses">
                  <div className="section-heading">
                    <h2>Your proposed courses</h2>
                    <button
                      className="text-button"
                      onClick={() => navigate("courses")}
                    >
                      <Plus size={16} />
                      Add courses
                    </button>
                  </div>
                  {planned.length ? (
                    planned.map((course) => (
                      <article className="plan-row" key={course.id}>
                        <span className="step-icon">
                          <BookOpen size={21} />
                        </span>
                        <div>
                          <span className="course-code">{course.id}</span>
                          <button
                            className="course-title"
                            onClick={() => setDetails(course)}
                          >
                            {course.title}
                          </button>
                          <p>{course.skills.join(" · ")}</p>
                        </div>
                        <span>{course.credits} cr.</span>
                        <button
                          className="icon-button"
                          aria-label={`Remove ${course.id} from semester`}
                          onClick={() => toggleSchedule(course)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state large">
                      <CalendarDays size={36} />
                      <h2>A little space for what comes next.</h2>
                      <p>
                        Add eligible courses from Explore courses to start
                        shaping your semester.
                      </p>
                      <button
                        className="button primary"
                        onClick={() => navigate("courses")}
                      >
                        Explore courses
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </section>
                <aside className="plan-summary">
                  <h2>The bigger picture</h2>
                  <div className="credit-overview">
                    <strong>{credits}</strong>
                    <span>/ {profile.creditTarget} credits</span>
                  </div>
                  <progress
                    aria-label="Semester credit target"
                    max={profile.creditTarget}
                    value={Math.min(credits, profile.creditTarget)}
                  />
                  <button
                    className="text-button"
                    onClick={() => setSetup(true)}
                  >
                    Adjust your preferences
                    <Settings2 size={14} />
                  </button>
                  {credits > profile.creditTarget && (
                    <div className="warning" role="status">
                      Your plan is {credits - profile.creditTarget} credits over
                      your target. Consider removing a course or adjusting your
                      goal.
                    </div>
                  )}
                  {planned.filter((c) => c.effort === "Demanding").length >=
                    2 && (
                    <div className="warning">
                      A busy semester ahead: multiple courses have demanding
                      demo workload labels.
                    </div>
                  )}
                  <hr />
                  <h3>Skills you’re building</h3>
                  <div className="tags">
                    {[...new Set(planned.flatMap((c) => c.skills))].map(
                      (skill) => (
                        <span key={skill}>{skill}</span>
                      ),
                    )}
                  </div>
                  {!planned.length && (
                    <p className="small muted">
                      Your skill coverage will appear as you add courses.
                    </p>
                  )}
                  <hr />
                  <div className="privacy-note">
                    <ShieldCheck size={19} />
                    <span>
                      A starting point for advising.
                      <small>
                        Verify prerequisites, availability, and degree
                        applicability with your advisor.
                      </small>
                    </span>
                  </div>
                </aside>
              </div>
            </>
          )}
          <footer>
            <span>
              Made for the next step. <b>PathFinder UA</b>
            </span>
            <span>Demo data · Not an official UA advising tool</span>
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
          onClose={() => setSetup(false)}
          onSave={(next) => {
            saveProfile(next);
            setSetup(false);
            setNotice("Your profile is ready. Let’s explore your next step.");
          }}
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
            <p>
              {details.prerequisites
                .map((g) => `(${g.join(" or ")})`)
                .join(" and ") || "No prerequisites in the demo dataset."}
            </p>
            <span className="eligibility">
              {isEligible(details, profile.completed)
                ? "Your selected courses satisfy the demo prerequisites."
                : "Add the required completed courses to your profile to be eligible."}
            </span>
            <h3>Where it could lead</h3>
            <p>
              {courses
                .filter((c) =>
                  c.prerequisites.some((g) => g.includes(details.id)),
                )
                .map((c) => `${c.id}: ${c.title}`)
                .join(" · ") ||
                "No later connections in the current sample dataset."}
            </p>
            <div className="inline-note">
              {details.source} Course connections may require additional
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
              disabled={
                profile.completed.includes(details.id) ||
                !isEligible(details, profile.completed)
              }
              onClick={() => toggleSchedule(details)}
            >
              {profile.schedule.includes(details.id)
                ? "Remove from semester"
                : "Add to semester"}
            </button>
          </div>
        </Modal>
      )}
      {profile.setupComplete && page === "overview" && (
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
            This deletes your saved profile, completed courses, and semester
            plan from this browser.
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
                  setProfile({ ...emptyProfile });
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
