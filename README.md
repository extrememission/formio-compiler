# ⚡ Form.io Lightning Compiler

A blazing-fast, markdown-style shorthand compiler for Form.io. This tool completely bypasses the clunky visual builder, allowing you to generate massive, deeply nested, enterprise-ready Form.io JSON schemas just by typing.

## 🌟 Core Features

*   **Lightning Fast Shorthand:** Build forms in seconds using intuitive bracket syntax (`[textfield] Name`).
*   **Command Palette Autocomplete:** Type `/` at the start of a line (or after a space) to instantly summon a Notion-style autocomplete menu. Filter by typing, navigate with the arrow keys, insert with Enter, dismiss with Esc.
*   **Intelligent Container Stacking:** Nest Panels, Wells, Edit Grids, Data Grids, and Repeats as deep as you like. Step out of a container simply by leaving a blank line.
*   **Live JSON Sync:** Powered by Ace Editor, the schema updates instantly on every keystroke.
*   **Copy & Download:** Copy the schema to your clipboard in one click, or name it and download it as a `.json` file.
*   **Offline Favorites Manager:** Save your favorite shorthand sessions locally to the browser's IndexedDB. Comes pre-loaded with enterprise starter templates (True/False Quiz, General Acknowledgement, and a Jobsite Hazard Assessment). Export your favorites as a JSON backup and import it on another device — imports are merged into your existing favorites rather than replacing them.
*   **Visual Snippet Library:** A built-in modal containing all syntax rules with 1-click insertions, organized in a 2-column masonry grid.
*   **Comfortable Workspace:** Light/dark theme toggle, adjustable JSON font size (A−/A+), and a draggable divider between the shorthand and JSON panes.

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

`[date]` and `[time]` compile to Form.io `datetime` components with the time or calendar picker disabled, respectively. `[phoneNumber]` applies a `(999) 999-9999` input mask.

### Required Fields (The Exclamation Modifier)
Add a `!` before any component to instantly mark it as required.
```text
![textfield] Last Name
```

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

The label is whatever you type after the tag; leave it blank to get the default. Type `/fs` to see them in the autocomplete menu.

### Smart Number Ranges
Define min and max limits for numbers. The compiler will automatically calculate the maximum digits and apply custom Bootstrap CSS classes (`col-md-2`, etc.) to visually size the input box perfectly, and inject whole-number validation boundaries with a friendly error message.
```text
[number: 1-5] Priority Rating
[number: 1-1000] Employee Count
```

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
*   `[panel] Panel Name`
*   `[fieldset] Field Set Name` (the name becomes the Field Set's legend)
*   `[well] Well Name`
*   `[editgrid] Dynamic Edit Grid`
*   `[datagrid] Dynamic Data Grid`
*   `[repeat: 5] Repeat Group` (see below)

The output is always a JSON array (`[ ... ]`), even for a single component, so it can be pasted directly inside any component's `"components": [ ]`.

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

It physically duplicates your fields N times in the JSON, appending the copy number to each API key (`companyName_x7k2_1`, `companyName_x7k2_2`, …), and injects numbered HTML headers ("Work History (1)") and "Add another Work History?" checkboxes tied to Form.io native conditional rules. It strictly enforces `clearOnHide: false` to prevent data-wipes during edit mode load flickering. It provides the exact same user experience as an Edit Grid, but outputs 100% flat, crash-proof data!

Like other containers, the repeat group ends at the next blank line.
