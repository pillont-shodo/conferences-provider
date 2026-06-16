import { describe, it, expect } from "vitest";
import { toPascalCase } from "./string.functions.js";

describe("toPascalCase", () => {
  it("capitalizes a single lowercase word", () => {
    expect(toPascalCase("hello")).toBe("Hello");
  });

  it("normalizes a single uppercase word", () => {
    expect(toPascalCase("HELLO")).toBe("Hello");
  });

  it("capitalizes each word separated by a single space", () => {
    expect(toPascalCase("hello world")).toBe("Hello World");
  });

  it("normalizes each word independently regardless of its original case", () => {
    expect(toPascalCase("hELLo WoRLD")).toBe("Hello World");
  });

  it("returns an empty string unchanged", () => {
    expect(toPascalCase("")).toBe("");
  });

  it("preserves empty words produced by multiple consecutive spaces", () => {
    expect(toPascalCase("a  b")).toBe("A  B");
  });

  it("capitalizes a single character", () => {
    expect(toPascalCase("a")).toBe("A");
  });
});
