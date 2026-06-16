import { describe, it, expect } from "vitest";
import { Member } from "@slack/web-api/dist/types/response/UsersListResponse.js";
import { extractSpeakerOrUndefined } from "./member.functions.js";

describe("extractSpeakerOrUndefined", () => {
  it("extracts from a valid name (firstname.lastname)", () => {
    const member: Member = {
      name: "jean.dupont",
      profile: { email: "jean.dupont@acme-corp.com" },
    };

    expect(extractSpeakerOrUndefined(member)).toEqual({
      firstname: "Jean",
      lastname: "Dupont",
      company: "Acme Corp",
    });
  });

  it("falls back to real_name when name contains a digit", () => {
    const member: Member = {
      name: "jean2.dupont",
      real_name: "Jean Dupont",
      profile: { email: "jean.dupont@acme.com" },
    };

    expect(extractSpeakerOrUndefined(member)).toEqual({
      firstname: "Jean",
      lastname: "Dupont",
      company: "Acme",
    });
  });

  it("falls back to real_name when name has more than two dot-separated segments", () => {
    const member: Member = {
      name: "jean.pierre.dupont",
      real_name: "Jean Dupont",
      profile: { email: "jean.dupont@acme.com" },
    };

    expect(extractSpeakerOrUndefined(member)).toEqual({
      firstname: "Jean",
      lastname: "Dupont",
      company: "Acme",
    });
  });

  it("prefers name over real_name when both are valid", () => {
    const member: Member = {
      name: "jean.dupont",
      real_name: "Someone Else",
      profile: { email: "jean.dupont@acme.com" },
    };

    expect(extractSpeakerOrUndefined(member)).toEqual({
      firstname: "Jean",
      lastname: "Dupont",
      company: "Acme",
    });
  });

  it("extracts and applies pascal case when name is fully uppercase", () => {
    const member: Member = {
      name: "JEAN.DUPONT",
      profile: { email: "jean.dupont@ACME.io" },
    };

    expect(extractSpeakerOrUndefined(member)).toEqual({
      firstname: "Jean",
      lastname: "Dupont",
      company: "Acme",
    });
  });

  it("returns null when real_name has only one word and name is invalid", () => {
    const member: Member = {
      name: "jean2.dupont",
      real_name: "Jean",
      profile: { email: "jean.dupont@acme.com" },
    };

    expect(extractSpeakerOrUndefined(member)).toBeNull();
  });

  it("returns null when real_name has more than two words and name is invalid", () => {
    const member: Member = {
      name: "jean2.dupont",
      real_name: "Jean Pierre Dupont",
      profile: { email: "jean.dupont@acme.com" },
    };

    expect(extractSpeakerOrUndefined(member)).toBeNull();
  });

  it("returns null when neither name nor real_name is present", () => {
    const member: Member = {
      profile: { email: "jean.dupont@acme.com" },
    };

    expect(extractSpeakerOrUndefined(member)).toBeNull();
  });

  it("replaces dashes with spaces in the company name", () => {
    const member: Member = {
      name: "jean.dupont",
      profile: { email: "jean.dupont@my-cool-company.com" },
    };

    expect(extractSpeakerOrUndefined(member)).toEqual({
      firstname: "Jean",
      lastname: "Dupont",
      company: "My Cool Company",
    });
  });
});
