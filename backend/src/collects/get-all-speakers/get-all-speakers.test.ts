import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Member } from "@slack/web-api/dist/types/response/UsersListResponse.js";

const { usersListMock } = vi.hoisted(() => ({ usersListMock: vi.fn() }));

vi.mock("@slack/web-api", () => ({
  WebClient: vi.fn().mockImplementation(function () {
    return { users: { list: usersListMock } };
  }),
}));

import { getAllSpeakers } from "./get-all-speakers.js";

function buildMember(overrides: Partial<Member> = {}): Member {
  return {
    id: "U123",
    is_bot: false,
    deleted: false,
    name: "jean.dupont",
    profile: { email: "jean.dupont@acme.io" },
    ...overrides,
  } as Member;
}

describe("getAllSpeakers", () => {
  beforeEach(() => {
    usersListMock.mockReset();
  });

  it("excludes bot members", async () => {
    usersListMock.mockResolvedValue({
      members: [buildMember({ is_bot: true })],
    });

    expect(await getAllSpeakers()).toEqual([]);
  });

  it("excludes USLACKBOT", async () => {
    usersListMock.mockResolvedValue({
      members: [buildMember({ id: "USLACKBOT" })],
    });

    expect(await getAllSpeakers()).toEqual([]);
  });

  it("excludes deleted members", async () => {
    usersListMock.mockResolvedValue({
      members: [buildMember({ deleted: true })],
    });

    expect(await getAllSpeakers()).toEqual([]);
  });

  it("falls back to real_name when name is not usable", async () => {
    usersListMock.mockResolvedValue({
      members: [
        buildMember({
          name: "jean", // single segment -> not usable
          real_name: "Marie Curie",
          profile: { email: "marie.curie@labo-physique.fr" },
        }),
      ],
    });

    expect(await getAllSpeakers()).toEqual([
      { firstname: "Marie", lastname: "Curie", company: "Labo Physique" },
    ]);
  });

  it("excludes a member with neither a usable name nor a usable real_name", async () => {
    usersListMock.mockResolvedValue({
      members: [
        buildMember({
          name: "jean2.dupont", // contains a digit -> not usable
          real_name: "Jean Paul Dupont", // 3 words -> not usable
        }),
      ],
    });

    expect(await getAllSpeakers()).toEqual([]);
  });

  it("returns an empty array when members is undefined", async () => {
    usersListMock.mockResolvedValue({});

    expect(await getAllSpeakers()).toEqual([]);
  });

  it("returns an empty array when members is empty", async () => {
    usersListMock.mockResolvedValue({ members: [] });

    expect(await getAllSpeakers()).toEqual([]);
  });

  it("keeps only valid speakers from a mixed list, in original order", async () => {
    usersListMock.mockResolvedValue({
      members: [
        buildMember({ is_bot: true }),
        buildMember({ id: "USLACKBOT" }),
        buildMember({ deleted: true }),
        buildMember({
          name: "alice.martin",
          profile: { email: "alice.martin@bigco.com" },
        }),
        buildMember({
          name: "x", // single segment -> not usable
          real_name: "Bob Smith",
          profile: { email: "bob.smith@other-corp.com" },
        }),
        buildMember({ name: "invalid" }),
      ],
    });

    expect(await getAllSpeakers()).toEqual([
      { firstname: "Alice", lastname: "Martin", company: "Bigco" },
      { firstname: "Bob", lastname: "Smith", company: "Other Corp" },
    ]);
  });
});
