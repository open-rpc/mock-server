import server from "./";

describe("mock-server", () => {
  it("exports a function", () => {
    expect(typeof server).toBe("function");
  });
});
