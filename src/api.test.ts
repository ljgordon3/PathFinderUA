import { afterEach, describe, expect, it, vi } from "vitest";
import records from "../backend/data/courses.json";
import { getCareers, getComparison, getCourses, getEligibility, getRoadmap } from "./api";

afterEach(() => vi.unstubAllGlobals());
function respond(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("API boundary", () => {
  it("maps course records and puts required courses first", async () => {
    respond(records);
    const result = await getCourses();
    expect(result).toHaveLength(57);
    expect(result[0].category).toBe("B.S. required");
    expect(result.find(course => course.id === "CS 100")?.credits).toBe(4);
  });
  it("maps available careers and omits unavailable records", async () => {
    respond([{ id: "CAR-SWE", description: "Build software", responsibilities: ["Design"], relevant_skill_ids: ["unknown"] }]);
    expect(await getCareers()).toEqual([expect.objectContaining({ id: "software", skills: ["unknown"], roles: ["Design"] })]);
  });
  it("maps prerequisite progress and sends API course IDs", async () => {
    const fetchMock = respond([{ course_id: "CS338", eligible: false, matched_prerequisites: ["CS201"], missing_prerequisites: ["CS200"] }]);
    expect((await getEligibility(["CS 201"]))["CS 338"]).toEqual({ eligible: false, matchedPrerequisites: ["CS 201"], missingPrerequisites: ["CS 200"] });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ completed_course_ids: ["CS201"] });
  });
  it("returns an empty roadmap without a career and makes no request", async () => {
    const fetchMock = respond({});
    expect(await getRoadmap({ career: null, completed: [] })).toEqual({ stronglyRecommended: [], worthConsidering: [], broadenSkills: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("maps future courses and forwards cancellation", async () => {
    const fetchMock = respond({ strongly_recommended: [{ course: records[0], matched_prerequisites: ["CS101"], missing_prerequisites: ["CS201"], explanation: { career_skills: ["unknown"] } }], worth_considering: [], broaden_skills: [] });
    const controller = new AbortController();
    const result = await getRoadmap({ career: "robotics", completed: ["CS 101"] }, controller.signal);
    expect(result.stronglyRecommended[0]).toMatchObject({ matchedPrerequisites: ["CS 101"], missingPrerequisites: ["CS 201"], careerSkills: ["unknown"] });
    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).career_id).toBe("CAR-ROBOTICS");
  });
  it("compares only when IDs are selected", async () => {
    const fetchMock = respond(records.slice(0, 2));
    expect(await getComparison([])).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await getComparison(["CS 100", "CS 101"])).toHaveLength(2);
  });
  it("surfaces HTTP and network failures", async () => {
    respond({}, 503);
    await expect(getCourses()).rejects.toThrow("/courses: 503");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(getCareers()).rejects.toThrow("offline");
  });
});
