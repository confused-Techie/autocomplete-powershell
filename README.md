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
