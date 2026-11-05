# Show a Lookup's Name in Another Field

Lookups (Company, Project, Worker…) save an ID. This Calculated Value copies the **name the lookup shows** into another field, as plain text, saved in the entry.

## Set it up
1. Add a **Text Field** (for example "Company Name").
2. Open its **Data** tab → **Calculated Value** and paste the code below.
3. Change `fscompany` to the **Property Name (key)** of the lookup you want the name from.
4. On the **Display** tab, tick **Disabled** so nobody types over it.
5. Save, select something in the lookup, and check the field shows the name.

```js
var w = instance.root.getComponent('fscompany');
var box = document.createElement('div');
box.innerHTML = w && !w.isEmpty(w.dataValue) ? String(w.getView(w.dataValue) || '') : '';
value = box.textContent.trim();
```

## What each line does
| Code | What it does |
|---|---|
| `instance.root.getComponent('fscompany')` | Finds the lookup on the form by its key. |
| `w.isEmpty(w.dataValue)` | Checks whether anything is selected. If not, the field stays blank. |
| `w.getView(w.dataValue)` | Asks the lookup what it *displays* for the saved value: the name, not the ID. |
| `box.innerHTML … box.textContent` | The display comes back as HTML (`<span>Acme</span>`). Putting it in a scratch box and reading the text strips the tags. |
| `value = …trim()` | Sets the field to the clean name. It updates whenever the lookup changes. |

## Want it hidden?
Tick **Hidden** on the Display tab **and** untick **Clear Value When Hidden**.

> **Both are needed.** With Hidden ticked and Clear Value When Hidden left on (the default), Form.io skips the calculation and the field saves nothing.

## If it shows an ID instead of a name
- The lookup hasn't loaded that item's name. Check the lookup itself shows the name on screen; the copy can only show what the lookup shows.
- Check the key in the code matches the lookup's Property Name exactly.

## Using the compiler instead
A formula that is just the lookup's label writes all of this for you:
```text
[fscompany] Company
[textfield: =Company] Company Name
```
Add `~hidden` and `~clearOnHide: false` under it to hide it.
