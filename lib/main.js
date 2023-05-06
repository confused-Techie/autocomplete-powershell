const provider = require("./provider.js");

module.exports = {
  activate: () => provider.load(),
  getProvider: () => provider,
  config: {
    useStaticCompletions: {
      type: "boolean",
      default: true,
      title: "Use Static PowerShell Completions",
      description: "If disabled, the system's local PowerShell will power completions."
    }
  }
};
