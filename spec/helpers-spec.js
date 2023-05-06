const helpers = require("../lib/helpers.js");

describe("Properly Identifies the CMDLet in use", () => {

  it("Properly Identifies single CMDLet Strings", () => {

    expect(helpers.cmdletInUse("Add-Content ")).toEqual("Add-Content");
    expect(helpers.cmdletInUse("Add-Content -")).toEqual("Add-Content");
    expect(helpers.cmdletInUse("Add-Content -Path ")).toEqual("Add-Content");
    expect(helpers.cmdletInUse("Add-Content -Path 'myValue' -Another 123")).toEqual("Add-Content");
    expect(helpers.cmdletInUse("} Add-Content -Path 'val'")).toEqual("Add-Content");
  });

  it("Properly Identifies Multi CMDLet Strings", () => {

    expect(helpers.cmdletInUse("Add-Content | Clear-Content")).toEqual("Clear-Content");
    expect(helpers.cmdletInUse("Add-Content -Path | Clear-Content")).toEqual("Clear-Content");
    expect(helpers.cmdletInUse("Add-Content -Path 'myVal' -Test 123 | Clear-Content ")).toEqual("Clear-Content");
    expect(helpers.cmdletInUse("Add-Content; Clear-Content -Path 'myVal' ")).toEqual("Clear-Content");
    expect(helpers.cmdletInUse("Add-Content; Clear-Content")).toEqual("Clear-Content");
    expect(helpers.cmdletInUse("Add-Content; Clear-Content ")).toEqual("Clear-Content");
  });

});
