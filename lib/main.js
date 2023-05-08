const provider = require("./provider.js");
const { CompositeDispoable } = require("atom");

module.exports = {
  activate: () => provider.load(),
  getProvider: () => provider,
  consumeModules: (service) => {
    const registrations = new CompositeDisposable();

    registrations.add(provider.registerProvider(service));
    return registrations;
  },
  config: {
    useStaticCompletions: {
      type: "boolean",
      default: true,
      title: "Use Static PowerShell Completions",
      description: "If disabled, the system's local PowerShell will power completions."
    }
  }
};
