import { expect, test } from "@playwright/test";

test("setup, compare, save a roadmap, persist, export, and delete a profile", async ({
  page,
}) => {
  const errors: string[] = [];
  const apiCalls = new Set<string>();
  page.on("request", (request) => {
    if (request.url().includes("/api/"))
      apiCalls.add(new URL(request.url()).pathname);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button"),
  ).toHaveText(["Explore courses", "Career paths", "My roadmap"]);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("What should we call you?").fill("Taylor");
  await page.getByRole("radio", { name: /Software engineering/ }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox", { name: /CS 100/ }).check();
  await page.getByRole("checkbox", { name: /CS 101/ }).check();
  await page.getByRole("button", { name: "Show my recommendations" }).click();
  await expect(
    page.getByRole("heading", { name: "Explore your next possibility." }),
  ).toBeVisible();
  for (const tier of [
    "Strongly recommended",
    "Worth considering",
    "Broaden your skills",
  ]) {
    await expect(
      page.getByRole("region", { name: tier, exact: true }),
    ).toBeVisible();
  }
  const engineering = page
    .getByRole("article")
    .filter({
      has: page.getByRole("button", {
        name: "Software Design and Engineering",
        exact: true,
      }),
    });
  await expect(
    engineering.getByText("Unlocked by completing CS 101.", { exact: false }),
  ).toBeVisible();
  await expect(
    engineering.getByRole("heading", { name: "Career skills", exact: true }),
  ).toBeVisible();
  await expect(
    engineering.getByText("Software System Design", { exact: true }),
  ).toBeVisible();
  for (const label of [
    "Why this tier:",
    "Career connection:",
    "Degree relevance:",
    "Later courses:",
    "Learning objectives:",
    "Sources:",
  ]) {
    await expect(
      page.locator(".course-card").getByText(label, { exact: true }),
    ).toHaveCount(0);
  }
  await page
    .getByRole("button", { name: "Compare CS 200", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare CS 201", exact: true })
    .click();
  await page.getByRole("button", { name: "Add CS 200 to roadmap" }).click();
  await page.getByRole("button", { name: "Add CS 201 to roadmap" }).click();
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Software Design and Engineering" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /My roadmap/ })
    .click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export roadmap" }).click();
  expect((await download).suggestedFilename()).toBe("pathfinder-roadmap.txt");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Explore your next possibility." }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /My roadmap/ })
    .click();
  await expect(
    page
      .getByRole("button", {
        name: "Software Design and Engineering",
        exact: true,
      })
      .first(),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Explore courses" })
    .click();
  await page.getByRole("button", { name: "Delete saved profile" }).click();
  await page
    .getByRole("button", { name: "Delete profile", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Explore your next possibility." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("pathfinder-ua:profile:curated:v2"),
    ),
  ).toBeNull();
  expect(errors).toEqual([]);
  for (const path of [
    "/api/courses",
    "/api/careers",
    "/api/eligibility",
    "/api/roadmap",
    "/api/courses/compare",
  ])
    expect(apiCalls.has(path), `Expected browser request to ${path}`).toBe(
      true,
    );
});

test("high-priority future courses stay in their tier as readiness changes", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("radio", { name: /Robotics/ }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Target credit hours")).toHaveCount(0);
  await page.getByRole("button", { name: "Show my recommendations" }).click();
  const future = page.getByRole("region", {
    name: "Strongly recommended",
    exact: true,
  });
  await expect(
    future
      .getByText("Take CS 338 and CS 301 and ECE 383 to unlock this course", {
        exact: false,
      })
      .first(),
  ).toBeVisible();
  await future
    .getByRole("button", { name: "Add CS 460 to roadmap", exact: true })
    .click();
  await page.reload();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /My roadmap/ })
    .click();
  const saved = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Saved interests", exact: true }),
  });
  await expect(
    saved.getByRole("button", {
      name: "Intro to Autonomous Robotics",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Edit planning profile/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  for (const course of ["CS 338", "CS 301", "ECE 383"]) {
    await page.getByRole("checkbox", { name: new RegExp(course) }).check();
  }
  await page.getByRole("button", { name: "Show my recommendations" }).click();
  await expect(
    page
      .getByRole("region", { name: "Strongly recommended", exact: true })
      .getByRole("button", {
        name: "Intro to Autonomous Robotics",
        exact: true,
      }),
  ).toBeVisible();
  const robotics = page
    .getByRole("article")
    .filter({
      has: page.getByRole("button", {
        name: "Intro to Autonomous Robotics",
        exact: true,
      }),
    });
  await expect(
    robotics.getByText(
      "Unlocked by completing CS 338 and CS 301 and ECE 383.",
      { exact: false },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: /Edit planning profile/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox", { name: /CS 460/ }).check();
  await page.getByRole("button", { name: "Show my recommendations" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /My roadmap/ })
    .click();
  await expect(
    saved.getByRole("button", {
      name: "Intro to Autonomous Robotics",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("region", { name: "Strongly recommended", exact: true })
      .getByRole("button", {
        name: "Intro to Autonomous Robotics",
        exact: true,
      }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("pathfinder-ua:profile:curated:v2")!)
          .completed,
    ),
  ).toContain("CS 460");
});

test("mobile navigation, search, and dialogs work without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Browse all courses", exact: true })
    .click();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Explore courses" })
    .click();
  await page
    .getByRole("textbox", { name: "Search courses", exact: true })
    .fill("no-matching-course");
  await expect(
    page.getByRole("heading", { name: "No courses found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page
    .getByRole("button", { name: "CS I for Majors", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("old fictional course selections are not reused", async ({ page }) => {
  const previous = JSON.stringify({
    name: "Taylor",
    completed: ["CS 301"],
    schedule: ["CS 340"],
    career: "software",
    setupComplete: true,
  });
  await page.addInitScript(
    (value) => localStorage.setItem("pathfinder-ua:profile:v1", value),
    previous,
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Explore your next possibility." }),
  ).toBeVisible();
  await expect(page.getByText(/course list has changed/)).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("pathfinder-ua:profile:v1")),
  ).toBe(previous);
});

test("saving preferences refreshes recommendations and persists the new profile", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "pathfinder-ua:profile:curated:v2",
      JSON.stringify({
        name: "Taylor",
        career: "software",
        completed: [
          "CS 100",
          "CS 101",
          "CS 200",
          "CS 201",
          "CS 301",
          "CS 338",
          "ECE 380",
          "ECE 383",
        ],
        saved: [],
        setupComplete: true,
      }),
    ),
  );
  await page.reload();
  const firstRecommendation = page
    .locator(".recommendation-section .course-card")
    .first();
  await expect(
    firstRecommendation.getByRole("button", {
      name: "Testing and Quality Assurance",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Edit planning profile/ }).click();
  await page.getByRole("radio", { name: /Robotics/ }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox", { name: /CS 415/ }).check();
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/roadmap") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Show my recommendations" }).click();
  const response = await responsePromise;
  expect(response.request().postDataJSON()).toMatchObject({
    career_id: "CAR-ROBOTICS",
  });
  expect(response.request().postDataJSON().completed_course_ids).toContain(
    "CS415",
  );
  await expect(
    firstRecommendation.getByRole("button", {
      name: "Artificial Intelligence",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.locator(".recommendation-section").first().getByRole("button", {
      name: "Software Design & Development",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    firstRecommendation.getByRole("button", {
      name: "Artificial Intelligence",
      exact: true,
    }),
  ).toBeVisible();
});

test("Explore courses switches between personalized suggestions and the complete catalog", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("radio", { name: /Robotics/ }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox", { name: /CS 100/ }).check();
  await page.getByRole("button", { name: "Show my recommendations" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Explore courses", exact: true })
    .click();
  const recommended = page.getByRole("button", {
    name: "Recommended for you",
    exact: true,
  });
  const all = page.getByRole("button", { name: "All courses", exact: true });
  await expect(recommended).toHaveAttribute("aria-pressed", "true");
  await expect(
    page
      .getByRole("region", { name: "Strongly recommended", exact: true })
      .getByRole("button", {
        name: "Intro to Autonomous Robotics",
        exact: true,
      }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Web Foundations", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "CS I for Majors", exact: true }),
  ).toHaveCount(0);
  await all.click();
  await expect(page.locator(".course-card")).toHaveCount(57);
  await expect(
    page.getByRole("button", { name: "Web Foundations", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "CS I for Majors", exact: true }),
  ).toBeVisible();
  await recommended.click();
  await page.getByRole("checkbox", { name: "Eligible for me" }).check();
  await expect(
    page.getByRole("button", {
      name: "Intro to Autonomous Robotics",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search courses", exact: true })
    .fill("no-matching-course");
  await expect(
    page.getByRole("heading", { name: "No courses found", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit my preferences", exact: true })
    .click();
  await page.getByRole("radio", { name: /Software engineering/ }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Show my recommendations" }).click();
  await expect(recommended).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("textbox", { name: "Search courses", exact: true }),
  ).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Web Foundations", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Introduction to Python Programming",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.reload();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Explore courses", exact: true })
    .click();
  await expect(recommended).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Web Foundations", exact: true }),
  ).toBeVisible();
});
