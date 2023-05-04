This package's backbone will be the existence of PowerShell's `TabExpansion2` of which there isn't much documentation.

This does mean that PowerShell has to be installed on the system.

But does also mean that autocompletions will never have to be updated.

----

The returned data of this can be a little strange, and isn't always super obvious.

Since it's intended for the PowerShell ISE the data seems to favor that rather than any standards.

This means a few things:

General Objects have the following structure:

> When provided the text `ConvertTo-Json`

```json
{
  "CurrentMatchIndex": -1,
  "ReplacementIndex": 0,
  "ReplacementLength": 14,
  "CompletionMatches": [
    {
      "CompletionText": "ConvertTo-Json",
      "ListItemText": "ConvertTo-Json",
      "ResultType": 2,
      "ToolTip": "ConvertTo-Json [-InputObject] <Object> [-Depth <int>] [-Compress] [<CommonParameters>]\r\n"
    }
  ]
}
```

> When provided the text `notep`

```json
{
  "CurrentMatchIndex": -1,
  "ReplacmentIndex": 0,
  "ReplacmentLength": 5,
  "CompletionMatches": [
    {
      "CompletionText": "notepad.exe",
      "ListItemText": "notepad.exe",
      "ResultType": 2,
      "ToolTip": "C:\\WINDOWS\\system32\\notepad.exe"
    },
    {
      "CompletionText": "C:\\WINDOWS\\notepad.exe",
      "ListItemText": "notepad.exe",
      "ToolTip": "C:\\WINDOWS\\notepad.exe"
    }
  ]
}
```

---

Also the `TabExpansion2` takes two arguments:

  * `-inputScript`: The input text to complete
  * `-cursorColumn`: Seemingly the location of the cursor within the text

---

My big question is if the tab completion here should occur on each keypress, or follow
the same methodology as other completions (every few characters)
