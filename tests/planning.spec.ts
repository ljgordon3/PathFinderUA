import { expect, test } from "@playwright/test";

test("setup, compare, plan, persist, export, and delete a profile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Find my starting point" }).click();
  await page.getByLabel("What should we call you?").fill("Taylor");
  await page.getByRole("radio", { name: /Software engineering/ }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox", { name: /CS 100/ }).check();
  await page.getByRole("checkbox", { name: /CS 101/ }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Target credit hours").fill("3");
  await page
    .getByRole("button", { name: "Save & see my recommendations" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Welcome back, Taylor." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Compare CS 200", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Compare CS 201", exact: true })
    .click();
  await page.getByRole("button", { name: "Add CS 200 to semester" }).click();
  await page.getByRole("button", { name: "Add CS 201 to semester" }).click();
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Software design" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /My semester/ })
    .click();
  await expect(
    page.getByText("Your plan is 3 credits over your target.", {
      exact: false,
    }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export plan" }).click();
  expect((await download).suggestedFilename()).toBe("pathfinder-semester.txt");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Welcome back, Taylor." }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: /My semester/ })
    .click();
  await expect(
    page.getByRole("button", { name: "Software design", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Overview" })
    .click();
  await page.getByRole("button", { name: "Delete saved profile" }).click();
  await page
    .getByRole("button", { name: "Delete profile", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your next step starts here." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("pathfinder-ua:profile:v1")),
  ).toBeNull();
  expect(errors).toEqual([]);
});

test("mobile navigation, search, and dialogs work without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
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
    .getByRole("button", { name: "Foundations of programming", exact: true })
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
