# Autocomplete-PowerShell

Welcome to the `autocomplete-powershell` Pulsar Package!

This package provides the fullest autocompletions for Pulsar to date!

When using `autocomplete-powershell`, it's recommended to use the new and improved [`language-powershell-revised`](https://web.pulsar-edit.dev/packages/language-powershell-revised) for Pulsar.

Autocompletions from this package are able to be provided between two distinct ways:

## Static Autocompletions

The Static Autocompletions will provide autocompletions just like the vast majority of other Pulsar packages.

Providing completions via the `COMPLETIONS.json` file within the package, that must be kept up to date in a much more manual method.

The pros of this method, is that it'll work no matter what system you are on, or what programs you have installed (other than Pulsar of Course) and is much more responsive and resource intensive than CLI Autocompletions.

This is the method that is enabled by default on this package.

## CLI Autocompletions

Alternatively, `autocomplete-powershell` offers CLI Autocompletions. These autocompletions work much the same way that the PowerShell ISE editor does itself, so may be slightly more familiar to those coming from that editor.

Within PowerShell's editor on Windows, it uses the PowerShell command `Tab-Expansion2` to generate autocompletions for users.

If you disable the `autocomplete-powershell` setting `useStaticCompletions` and opt to use CLI Autocompletions instead, what you type is given to this PowerShell command to generate Autocompletions, and those autocompletions are then parsed on the fly to return pack to the user.

The Pros of this method, is it will always be up to date with your system that you are writing the PowerShell Script on, meaning you'll never have to wait for this package to be updated to get access to new CMDlets.

The con of this method, is it's generally slower than static completions, and uses a bit more resources.

But if you would rather use PowerShell's native autocompletions, just ensure to have PowerShell installed on your development machine, and accessible to Pulsar.

## Adding new Modules

As you'll see spending any time with this package, it only provides autocompletions for the core of PowerShell, as is it's intention. But there will often times be that you may want support for additional modules of PowerShell, such as community modules, or even other Microsoft ones such as ActiveDirectory.

In this case, this package makes it as easy as possible to provide additional modules, without much code.

Using Pulsar's Service Hub, this package consumes a new service called `autocomplete-powershell.modules`, similar in much the same way Autocomplete itself functions, any packages that consume this service are then able to take advantage of the service to provide additional modules to autocomplete through this package, without having to deal with any of the complexity of writing the code to support autocompletions.

To create a package and provide autocompletions for a new PowerShell Module you'll just need to follow the below steps.

Much like creating any package, start off with your `package.json` and ensure to provide the `autocomplete-powershell.modules` service like so:

```json
"providedServices": {
  "autocomplete-powershell.modules": {
    "versions": {
      "1.0.0": "getProvider"
    }
  }
}
```

Then you'll need to make sure that `getProvider` is a function exported by your package's `main` module. This could be as simple as:

```javascript
const provider = require("./provider.js");

module.exports = {
  activate: () => provider.load(),
  getProvider: () => provider,
};
```

From here you'll be able to implement all the logic within your `provider.js` file.

To properly use this service there's only two functions that are required (and used):

  * `getModule()`: This key can return a function that returns, or directly return an array or object. This should contain valid `autocomplete-plus` entries for your module or supported modules.
  * `getParams(cmdlet)`: This **must** be a function that returns an array of items, that are the params for your supported module. A CMDLet is passed in this function, which you **must** check to ensure you support it, and if you don't just return empty like `return;` and otherwise return your array of valid `autocomplete-plus` items that will be injected at the top of the completions for the module.
  * `name`: It's highly recommended you add a name field to your provider. This allows the package to be easily identified for end users.

From there, you are good to go! Now after a user has both your package and `autocomplete-powershell` installed, they will be able to get completions for all of the core of PowerShell as well as your new module.

It's recommended to name any module package's like `autocomplete-powershell-MODULE_NAME` to help users find them on the Pulsar Package Registry.

Additionally, feel free to add the tag `autocomplete-powershell` to your GitHub repo to increase discoverability.

As a user, once you've added new modules you can use the Command Palette and search for `autocomplete-powershell: Show Module Providers` to show all providers you currently have installed.
