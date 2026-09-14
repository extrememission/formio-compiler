# ⚡ Form.io Lightning Compiler

A blazing-fast, markdown-style shorthand compiler for Form.io. This tool completely bypasses the clunky visual builder, allowing you to generate massive, deeply nested, enterprise-ready Form.io JSON schemas just by typing.

## 🌟 Core Features

*   **Lightning Fast Shorthand:** Build forms in seconds using intuitive bracket syntax ([textfield] Name).
*   **Command Palette Autocomplete:** Type / anywhere on a new line to instantly summon a Notion-style autocomplete menu to rapidly insert components without taking your hands off the keyboard.
*   **Intelligent Container Stacking:** Nest Panels, Edit Grids, and Repeats infinitely deep. Step out of a container simply by leaving a blank line.
*   **Live JSON Sync:** Powered by Ace Editor, the schema updates instantly on every keystroke.
*   **Offline Favorites Manager:** Save your favorite shorthand sessions locally to the browser's IndexedDB. Comes pre-loaded with enterprise starter templates (True/False Quiz, General Acknowledgement, and a Jobsite Hazard Assessment). Export your database as a JSON backup to port your favorites between devices.
*   **Visual Snippet Library:** A built-in modal containing all syntax rules with 1-click insertions, organized in an optimized 2-column masonry grid.

---

## 🛠️ Shorthand Syntax Guide

### Basic Inputs
Create inputs by wrapping the component type in brackets, followed by the label.
`	ext
[textfield] First Name
[textarea] Bio
[email] Contact Email
[phoneNumber] Mobile Number
[datetime] Appointment Time
[signature] Employee Signature
[checkbox] I agree to the terms
`

### Required Fields (The Exclamation Modifier)
Add a ! before any component to instantly mark it as required.
`	ext
![textfield] Last Name
`

### Multiple Choice
Type your component and question, then list your choices directly underneath using dashes. (The old comma-separated inline syntax `[radio: Yes, No]` is also still supported for simple lists).
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

### Smart Number Ranges
Define min and max limits for numbers. The compiler will automatically calculate the maximum digits and apply custom Bootstrap CSS classes (col-md-2, etc.) to visually size the input box perfectly, and inject standard validation boundaries.
```text
[number: 1-5] Priority Rating
[number: 1-1000] Employee Count
```

### Bulk Mode
Need to ask the same type of question 50 times? Wrap your questions in +++ tags to inherit the parent component type. For multiple choice fields, define your choices at the top, and they will apply to every question below!
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
When you type a container (like a Panel), you "enter" that container. Any fields you type below it go inside it. To exit a container, simply leave a **blank line**.
`	ext
[panel] Employment History
[textfield] Company Name

[panel] Education
`

### Supported Containers
*   [panel] Panel Name
*   [well] Well Name
*   [editgrid] Dynamic Edit Grid
*   [datagrid] Dynamic Data Grid
*   [table: 3x2] Layout Table (generates a 3 row, 2 column table)

---

## 🔁 The "Super Group" Repeater
*Syntax:* [repeat: 5] Work History

**The Problem:** Form.io's native editgrid arrays often crash legacy SQL databases or proprietary PDF renderers (like Stimulsoft) because they struggle with deeply nested dynamic arrays.

**The Solution:** The [repeat] tag acts like an Edit Grid, but instead of using a native array, it utilizes **Compiler-side Loop Unrolling**. 

It physically duplicates your fields N times in the JSON, automatically renaming their API keys (company_1, company_2), and injecting dynamic HTML Headers and "Add Another" checkboxes tied to Form.io native conditional rules. It strictly enforces clearOnHide: false to prevent data-wipes during edit mode load flickering. It provides the exact same user experience as an Edit Grid, but outputs 100% flat, crash-proof data!
