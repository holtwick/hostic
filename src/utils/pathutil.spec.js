import { getBasePath } from "./pathutil.js"
import { parsePath } from "./pathutil.js"

describe("Path Utils", () => {
  it("should find correct base name", () => {
    expect(getBasePath("")).toBe("/")
    expect(getBasePath("/")).toBe("/")
    expect(getBasePath("/en")).toBe("/")
    expect(getBasePath("/en/")).toBe("/en/")
    expect(getBasePath("/en/help")).toBe("/en/")
    expect(getBasePath("en/help")).toBe("/en/")
    expect(getBasePath("/en/blog/public/article")).toBe("/en/blog/public/")
  })

  it("should parse", () => {
    expect(parsePath("/en/blog/public/article")).toEqual({
      base: "article",
      dir: "/en/blog/public",
      ext: "",
      name: "article",
      root: "/",
    })
  })
})
