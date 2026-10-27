# ⚡ Form.io Lightning Compiler

A blazing-fast, markdown-style shorthand compiler for Form.io. This tool completely bypasses the clunky visual builder, allowing you to generate massive, deeply nested, enterprise-ready Form.io JSON schemas just by typing.

## 🌟 Core Features

*   **Lightning Fast Shorthand:** Type `[` (or `![` for a required field), keep typing to narrow the menu (`[fse` → `fsequipment`), and hit Enter (or Tab) — the component drops in with its label already selected, so you just type over it. Then:
    *   **Tab** keeps what's there and jumps to the next placeholder (e.g. radio question → Choice 1 → Choice 2); after the last one it moves you to the next line. Tab never leaves the editor. **Shift+Tab** goes back; **Esc** stops.
    *   **Enter** on a placeholder moves to the next one. At the end of a `- choice` line it starts the next `- ` automatically; Enter on an empty `- ` ends the list.

    Arrow keys move through the menu; Esc dismisses it; typing `]` or a space closes it, so typing tags by hand (`[textfield] Name`) works as always.
*   **Every Form.io Setting, From the Keyboard:** Type `~` on the line under any component to browse all of its Form.io settings with explanations, pick one, and it's written into the JSON. A built-in way to learn what each setting does, too.
*   **Follows Your Cursor:** Wherever your cursor is in the shorthand, the JSON pane highlights that component and scrolls to it, and the Preview outlines and scrolls to it too — no hunting through the other panes.
*   **Special Character Check:** Curly quotes, em/en dashes, ellipses, non-breaking and invisible spaces (common when pasting from Word or PDFs) get garbled by Form.io. They're underlined in red with a ⚠ in the margin (hover it to see what they are), and the header shows a count with a **Fix** button that swaps them all for plain versions.
*   **Intelligent Container Stacking:** Nest Panels, Wells, Edit Grids, Data Grids, and Repeats as deep as you like. Step out of a container simply by leaving a blank line.
*   **Live JSON Sync:** Powered by Ace Editor, the schema updates instantly on every keystroke.
*   **Copy & Download:** Copy the schema to your clipboard in one click, or download it as a `.json` file. Download opens your system's Save dialog so you can name the file (Chrome/Edge; other desktop browsers ask for a name, mobile opens the share sheet). The **Wrapper** checkbox switches between a single `{ }` component and a `[ ]` components array to match where you're pasting.
*   **Offline Favorites Manager:** Save your favorite shorthand sessions locally to the browser's IndexedDB. Comes pre-loaded with enterprise starter templates (True/False Quiz, General Acknowledgement, a Jobsite Hazard Assessment, a Time & Materials calculator showing chained currency formulas, a Service Record (T&M) with materials and labor grids, row totals, and SUM subtotals, a ~ Settings Showcase demonstrating `~` lines on popular components, and a How-To: Formulas & Charts walkthrough with instruction cards and live hints you can delete once learned). Export your favorites as a JSON backup and import it on another device — imports are merged into your existing favorites rather than replacing them.
*   **Visual Snippet Library:** A built-in modal containing all syntax rules with 1-click insertions, organized in a 2-column masonry grid.
*   **Live Form Preview:** A third column renders the actual form with Form.io's open-source renderer. Collapse it to a thin strip on the right edge, or open it and drag its divider to size it. `fs` lookup selects get 5 demo options in the preview only — the copied JSON is untouched. Needs an internet connection to load the renderer.
*   **Comfortable Workspace:** Light/dark theme toggle, adjustable JSON font size (A−/A+), and draggable dividers between all panes. Column widths and whether the preview is open are remembered in this browser.

---

## 🛠️ Shorthand Syntax Guide

### Basic Inputs
Create inputs by wrapping the component type in brackets, followed by the label.
```text
[textfield] First Name
[textarea] Bio
[email] Contact Email
[number] Years of Experience
[phoneNumber] Mobile Number
[datetime] Appointment Time
[date] Start Date
[time] Shift Start
[signature] Employee Signature
[checkbox] I agree to the terms
```

`[date]` and `[time]` compile to Form.io `datetime` components with the time or calendar picker disabled, respectively. `[phoneNumber]` applies a `(999) 999-9999` input mask. `[textarea]` auto-expands as people type (Form.io hides the drag handle when it does).

### Required Fields (The Exclamation Modifier)
Add a `!` before any component to instantly mark it as required.
```text
![textfield] Last Name
```

### Values = Labels (The @ Modifier)
By default each choice gets a unique value (`Day Shift` → `dayShift_x7k2`). Add `@` before a `[radio]` or `[select]` to make every choice's value exactly its label. Combine with `!` in either order; in Bulk Mode it applies to the shared choices of every question (question keys stay unique).
```text
@[radio] Shift
- Day Shift
- Night Shift

!@[select] Country
+++ !@[radio]
```
Flagged with ⚠ in the margin (hover for details): duplicate choices in an `@` question (same value twice), empty `- ` choices (skipped), and `@` on anything other than radio/select (ignored — `fs` selects and checkboxes included).

### Any Form.io Setting (The ~ Lines)
Put `~` lines under a component to set anything Form.io supports — no builder trip needed:
```text
[select] Country
~widget: html5
~multiple
- USA
- Canada

[textarea] Notes
~rows: 5
~placeholder: "Describe the issue"
~validate.minLength: 10
```
*   Type `~` at the start of the line under a component and a menu lists **every setting for that component type**, grouped like Form.io's tabs (Display, Data, Validation...) with Form.io's own explanations. Settings already used are marked ✓. Typing filters (`~pla` → placeholder).
*   For settings with fixed options, type `~widget: ` and a second menu offers them (`choicesjs`, `html5`).
*   `~name` alone means true; values like `5`, `true`, `"text"` or `[1,2]` are read as their proper type. Nested settings use dots (`~validate.minLength: 10`).
*   `~` lines belong to the component directly above (choices and settings can mix) until a blank line. Under a `+++` line they apply to every question in the block; under a `[panel]` they set the panel's own options.
*   Hover the margin: ⓘ explains each setting and shows Form.io's default; ⚠ flags settings Form.io doesn't know (still applied), invalid option values, and `~label` / `~key` / `~type` / `~input` (owned by the shorthand). Overriding something the compiler set is noted, with ⚠ for ones compiler features rely on (e.g. `values`, `calculateValue`).
*   The settings list comes from open-source Form.io 4 and loads the first time you use `~`. Custom code settings (custom JS, logic) aren't listed — set those in your builder.

Nothing changes for shorthand without `~` lines.

### Multiple Choice
Type your component and question, then list your choices directly underneath using dashes. (The old comma-separated inline syntax `[radio: Yes, No]` is also still supported for simple lists.)
```text
[radio] Gender
- Male
- Female
- N/A

[select] Country
- USA
- Canada
- Mexico

[selectboxes] Fruits
- Apple
- Orange
- Banana
```

### Lookup Selects (fs)
Any tag starting with `fs` creates a select whose API key (Property Name) is the term itself, with no Data tab values — the app finds the endpoint from the term.
```text
[fsworkers] Foreman
[fsproject]
[fsequipment]
[fscompany]
[fsdivision]
[fsvendor] Main Supplier
```

| Tag | Default label | Key (1st) | Key (2nd+) |
|---|---|---|---|
| `[fsworkers]` | Worker | `fsworkers` | `fsworkers_x7k2` |
| `[fsproject]` | Project | `fsproject` | `fsproject_x7k2` |
| `[fsequipment]` | Equipment | `fsequipment` | `fsequipment_x7k2` |
| `[fscompany]` | Company | `fscompany` | `fscompany_x7k2` |
| `[fsdivision]` | Division | `fsdivision` | `fsdivision_x7k2` |
| `[fsanything]` | Anything | `fsanything` | `fsanything_x7k2` |

The label is whatever you type after the tag; leave it blank to get the default. Each one shows the placeholder "Type to select..." in the form (`[fscompany]` also sets `"multiple": true` so multiple companies can be selected). Type `[fs` to see them in the autocomplete menu.

### Smart Number Ranges
Define min and max limits for numbers. The compiler will automatically calculate the maximum digits and apply custom Bootstrap CSS classes (`col-md-2`, etc.) to visually size the input box perfectly, and inject whole-number validation boundaries with a friendly error message.
```text
[number: 1-5] Priority Rating
[number: 1-1000] Employee Count
```

### Currency & Calculated Totals
`[currency]` is a US-dollar field: it shows `$1,234.56` but saves the plain number `1234.56`, so it can be used in calculations, reports, and PDFs.

Add a formula after `=` to make a calculated, read-only total. Write it with the **labels** of other fields — the compiler swaps in their real keys on every compile, so formulas never break when keys regenerate:
```text
[number] Hours
[currency] Hourly Rate
[currency] Materials
[currency: =Hours * Hourly Rate + Materials] Total
```
*Total* updates live as people type and is rounded to cents. Formulas support `+ - * /`, parentheses, plain numbers (`=Subtotal * 1.07`), quoted labels (`"Travel / Equipment"`), and `SUM()` of grid columns; they work on `[number]` too (no rounding there). Labels match regardless of capitalization.

Hover the margin for help: ⓘ shows how a formula was read; ⚠ flags a label that doesn't exist, matches more than one field (labels in formulas must be unique), or points at the field itself. Formulas inside a `[repeat]` aren't supported yet.

### Edit Grid Columns, Row Totals & SUM
Define an Edit Grid's columns in one line. While entering a row the fields stack vertically; saved rows show as a table.
```text
[editgrid: Qty#(s), !Part # / Description(xl), Unit(s), Unit Price$, Ext. Price$] Materials
= Ext. Price: Qty * Unit Price

[currency: =SUM(Ext. Price)] Materials Subtotal
```
*   **Column types:** `$` attached to the name = currency, `#` attached = number, nothing = text. Only an *attached* marker counts, so `Part #` stays a text label. Markers are removed from the displayed name.
*   **Required:** `!` before a column name.
*   **Widths:** `(s)`, `(l)`, `(xl)` after a name; unmarked columns are normal. The compiler sizes the table columns to fit. More than 5 columns gets a ⚠ warning.
*   **Row formulas:** lines starting with `=` right under the grid, as `= Column: formula`. The column becomes read-only and is calculated per row from that row's fields.
*   **Grand totals:** `SUM(Column)` adds a column across every row, in any formula (`=SUM(Ext. Price) * 1.07`). If two grids share a column name, write `SUM(Grid Name.Column)`.
*   **Labels with symbols:** put labels containing `+ - * / ( )` in quotes inside formulas, e.g. `"Travel / Equipment"`.

Only `$` (currency) calculations round to cents; number calculations keep their decimals. See the **Service Record (T&M)** template in Favorites for a complete example.

### Live Charts
Chart number or currency fields by their labels — the chart redraws as people type:
```text
[chart: Labor Total, Materials Total, Tax] Cost Breakdown
```
*   Horizontal bars, one per field, scaled to the largest value, each showing its amount and share of the total (`$400.00 (60%)`). Currency fields show as dollars.
*   Labels work like formulas: quote labels with symbols (`"Travel / Equipment"`) and use `SUM(Column)` to chart an Edit Grid column total.
*   Bars use your app's Bootstrap colors in order (primary, success, info, secondary, dark, warning, danger), so they match your theme.
*   It's a plain HTML Element with inline styles — it shows the same in the Preview, your app, a viewed entry, and your print button. (Stimulsoft PDFs build from data, so they won't include it.)
*   ⓘ shows which fields it reads; ⚠ flags unknown labels and non-number fields. Charts inside a `[repeat]` or grid row aren't supported.

See the **Time & Materials** template for a working example.

### HTML & Content
Drop static text into your form. `[html]` takes the HTML tag after the colon (defaults to `p`); `[content]` accepts raw HTML.
```text
[html: h2] Section Heading
[content] <p>Please read the following carefully.</p>
```

### Clean Print Button
`[print]` adds a print button (the label is the button text, defaulting to "Screenshot PDF"). When clicked, it prints the form with navigation bars, toolbars, sidebars, and buttons hidden for a clean page.
```text
[print] Print This Form
```

### Bulk Mode
Need to ask the same type of question 50 times? Wrap your questions in `+++` tags to inherit the parent component type. For multiple choice fields, define your choices at the top, and they will apply to every question below!
```text
+++ ![radio]
- Yes
- No
- N/A
Do you have a driver's license?
Are you over 18?
Are you a veteran?
+++
```

#### Bulk Mode with Notes
Add a word after the bracket to give every question a notes box (radio and select only). The word becomes the notes box's label; any word works (`Notes`, `Explain`, `Comments`...).
```text
+++ ![radio] Notes?     ← conditional: adds a "Notes" choice to every question; picking it opens a REQUIRED notes box
- Yes
- No
Ladder inspected?
Harness worn?
+++

+++ ![radio] Notes      ← always: every question gets an OPTIONAL notes box underneath, no extra choice
```
Notes boxes auto-expand as you type, sit right under their question, and get a key tied to it (`ladderInspected_k2p0_notes`). If someone switches away from the Notes choice, the box hides but what they typed is kept. Works with `!` and `@`, and inside a `[repeat]`. Plain `+++ ![radio]` (nothing after the bracket) works exactly as before.

---

## 🧱 Layouts & Structural Containers

### The Container Stack
When you type a container (like a Panel), you "enter" that container. Any fields you type below it go inside it. To exit a container, simply leave a **blank line** — each blank line closes **one** level.

Don't put a blank line directly after a container's title, or you'll close it before adding anything to it.
```text
[panel] Employment History
[textfield] Company Name

[panel] Education
```

To nest, type a container while you're already inside another one:
```text
[panel] Applicant
[textfield] Full Name
[well] Emergency Contact
[textfield] Contact Name
[phoneNumber] Contact Phone

[textfield] Notes

[panel] Next Section
```
Here the first blank line closes the Well (so *Notes* lands back in the Applicant panel), and the second closes the Applicant panel.

### Supported Containers
*   `[panel] Panel Name` (all panels use the Primary theme)
*   `[fieldset] Field Set Name` (the name becomes the Field Set's legend)
*   `[well] Well Name`
*   `[editgrid] Dynamic Edit Grid`
*   `[datagrid] Dynamic Data Grid`
*   `[repeat: 5] Repeat Group` (see below)

### Output: The Wrapper Checkbox
Use the **Wrapper** checkbox at the top of the JSON pane to choose how the output is shaped for pasting:
*   **Unchecked** — a `[ ]` components array. Paste it over an empty `"components": [ ]` inside a component's schema.
*   **Checked** — a single `{ }` component. Drag any component onto the page, open its schema, select all, and paste over it. If your shorthand has more than one top-level item, they're wrapped in one Panel titled "Panel".

Your choice is remembered in this browser. UUIDs aren't needed in the pasted JSON — the app adds them on save.

### Tables
`[table: 3x2] Layout Table` generates an empty 3 row, 2 column table. Tables are **not** containers — fields typed below a table are not placed into its cells.

### API Keys
Every component gets an auto-generated key: the first three words of its label in camelCase plus a random 4-character suffix (e.g. `Company Name` → `companyName_x7k2`). The suffix is regenerated every time the shorthand recompiles, so copy or download your JSON once you're happy with it — re-compiling the same shorthand later will produce different keys.

---

## 🔁 The "Super Group" Repeater
*Syntax:* `[repeat: 5] Work History` (defaults to 3 copies if no number is given)

**The Problem:** Form.io's native editgrid arrays often crash legacy SQL databases or proprietary PDF renderers (like Stimulsoft) because they struggle with deeply nested dynamic arrays.

**The Solution:** The `[repeat]` tag acts like an Edit Grid, but instead of using a native array, it utilizes **Compiler-side Loop Unrolling**.

```text
[repeat: 3] Work History
![textfield] Company Name
![date] Start Date
```

It physically duplicates your fields N times in the JSON, appending the copy number to each API key (`companyName_x7k2_1`, `companyName_x7k2_2`, …), and injects numbered labels in normal paragraph text ("Work History (1)") and "Add another Work History?" checkboxes tied to Form.io native conditional rules. It strictly enforces `clearOnHide: false` to prevent data-wipes during edit mode load flickering. It provides the exact same user experience as an Edit Grid, but outputs 100% flat, crash-proof data!

Like other containers, the repeat group ends at the next blank line.
