So the majority of the language is based off Verbs, such as Get-Module
Then each verb has it's supported flags or parameters.

Additionally using '|' as flow control to pipe on command to another.

Then we have '-eq' as a comparison operator. Remember there are many other operators:
  - Arithmetic Operators
  - Assignment Operators
  - Comparison Operators
  - Logical Operators
  - Redirection Operators
  - Split and Join Operators
  - Type Operators
  - Unary Operators
  - Special Operators
  - Grouping Operator
  - Subexpression Operator
  - Array subexpression operator
  - Call Operator
  - Background Operator
  - Cast Operator
  - Comma Operator
  - Dot Sourcing Operator
  - Format Operator
  - Index Operator
  - Pipeline Operator
  - Pipeline Chain Operators
  - Range Operator
  - Member-Access Operator
  - Static Member Operator
  - Ternary Operator
  - Null-Coalescing Operator
  - Null-Coalescing Assignment Operator
  - Null-Conditional Operators
  -

---

Otherwise, I think the best thing we can do here is essentially this:

During each request for an autocompletion we inspect the line of text leading up to our column.

When we inspect we care really about two facts:
  - Was the most recent character a flow break?
  - Was the most recent recognized string a string starting with a valid verb,

The situations we should be prepared to autocomplete:
  - The cursor is on a new line, or has a flow break as the last valid character.
    We should be attempting to autofill CMDLets
  - The cursor has no line breaks, and is otherwise following a recognized CMDlet
    We should be attempting to autofill valid parameters for that CMDLet
  - The cursor has no line breaks, and is otherwise following an unrecognized CMDLet but we can confirm a valid starting verb.
    We should be attempting to autofill valid operators.
