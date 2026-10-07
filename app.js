// --- State ---
let isDarkTheme = true;
let currentFontSize = 14;

// --- DB (IndexedDB) ---
let db;
const defaultTemplates = [
    {
        name: "Template: 10-Question T/F Quiz",
        date: "System Default",
        shorthand: "[panel] True or False Quiz\n+++ ![radio]\n- True\n- False\n1. Question One\n2. Question Two\n3. Question Three\n4. Question Four\n5. Question Five\n6. Question Six\n7. Question Seven\n8. Question Eight\n9. Question Nine\n10. Question Ten\n+++"
    },
    {
        name: "Template: General Acknowledgement",
        date: "System Default",
        shorthand: "[panel] General Acknowledgement\n[content] <p style=\"margin-bottom: 15px;\">By checking the box below and providing my signature, I formally acknowledge that I have received, read, and fully understand the contents of this document. I agree to abide by the guidelines, procedures, and expectations outlined herein, and I understand that it is my responsibility to seek clarification on any points I do not understand.</p>\n![checkbox] I have read and understand the contents of this document.\n![signature] Employee Signature\n![date] Date Signed"
    },
    {
        name: "Template: Jobsite Hazard Assessment",
        date: "System Default",
        shorthand: "[panel] Jobsite Hazard Assessment (JHA)\n[textfield] Project Name\n[textfield] Job Location\n![date] Date of Assessment\n![textfield] Supervisor / Competent Person\n\n[well] Required PPE\n[selectboxes] Personal Protective Equipment (PPE) Check\n- Hard Hat\n- Safety Glasses\n- Steel Toe Boots\n- High Visibility Vest\n- Gloves\n- Fall Protection\n- Hearing Protection\n\n[panel] Hazard Identification\n[content] <p>Please list the potential hazards identified for today's tasks and the control measures that will be implemented.</p>\n[repeat: 5] Hazard & Control Measure\n![textfield] Task / Activity\n![select] Hazard Type\n- Fall Hazard\n- Electrical\n- Struck-By\n- Caught-In/Between\n- Chemical / Hazardous Material\n- Ergonomic / Manual Lifting\n![textarea] Mitigation / Control Strategy\n\n\n[panel] Crew Sign-Off\n[content] <p>All crew members must sign below indicating they have been briefed on the hazards and controls.</p>\n[signature] Crew Member 1\n[signature] Crew Member 2\n[signature] Crew Member 3"
    }
];

const initDB = () => {
    // Bump the version whenever defaultTemplates change so existing installs get refreshed copies
    const request = indexedDB.open('FormioCompilerDB', 2);
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        if (!db.objectStoreNames.contains('favorites')) {
            const store = db.createObjectStore('favorites', { keyPath: 'id', autoIncrement: true });
            defaultTemplates.forEach(template => store.add(template));
            return;
        }
        // Existing DB: replace old system templates, leave user favorites untouched
        const store = e.target.transaction.objectStore('favorites');
        store.openCursor().onsuccess = (ev) => {
            const cursor = ev.target.result;
            if (cursor) {
                if (cursor.value.date === 'System Default') cursor.delete();
                cursor.continue();
            } else {
                defaultTemplates.forEach(template => store.add(template));
            }
        };
    };
    request.onsuccess = (e) => { db = e.target.result; };
};
initDB();

// --- Init Ace Editor ---
const editor = ace.edit("json-editor");
editor.setTheme("ace/theme/tomorrow_night"); // Neutral dark, black-based
editor.session.setMode("ace/mode/json");
editor.setReadOnly(true);
editor.setOptions({
    fontSize: currentFontSize + "px",
    showPrintMargin: false,
    tabSize: 2,
    useWorker: false
});

// --- Shorthand Editor (Ace: autocomplete, Tab placeholders, highlighting) ---
const Range = ace.require('ace/range').Range;
const shorthand = ace.edit('shorthand-input');
shorthand.setTheme("ace/theme/tomorrow_night");
shorthand.session.setMode("ace/mode/text");
shorthand.setOptions({
    fontSize: "14px",
    fontFamily: "'JetBrains Mono', monospace",
    showPrintMargin: false,
    useWorker: false,
    wrap: true,
    enableLiveAutocompletion: true,
    placeholder: "Type [ to add a component..."
});
shorthand.renderer.setScrollMargin(12, 12);

// --- Theme & Font Toggles ---
document.getElementById('btn-theme').addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    document.body.className = isDarkTheme ? 'theme-dark' : 'theme-light';
    const aceTheme = isDarkTheme ? "ace/theme/tomorrow_night" : "ace/theme/github";
    editor.setTheme(aceTheme);
    shorthand.setTheme(aceTheme);
});

document.getElementById('btn-font-inc').addEventListener('click', () => {
    if(currentFontSize < 32) currentFontSize += 2;
    editor.setFontSize(currentFontSize + "px");
});

document.getElementById('btn-font-dec').addEventListener('click', () => {
    if(currentFontSize > 8) currentFontSize -= 2;
    editor.setFontSize(currentFontSize + "px");
});

// --- Layout: Drag Resizers & Preview Column (remembered per browser) ---
const layout = { leftWidth: null, previewWidth: null, previewOpen: false };
try { Object.assign(layout, JSON.parse(localStorage.getItem('layout')) || {}); } catch (e) {}
const saveLayout = () => { try { localStorage.setItem('layout', JSON.stringify(layout)); } catch (e) {} };

const leftPane = document.getElementById('left-pane');
const previewPane = document.getElementById('preview-pane');
const previewResizer = document.getElementById('preview-resizer');

function applyLayout() {
    if (layout.leftWidth) {
        leftPane.style.width = layout.leftWidth + 'px';
        leftPane.style.flex = 'none';
    }
    previewPane.classList.toggle('collapsed', !layout.previewOpen);
    previewResizer.classList.toggle('hidden', !layout.previewOpen);
    if (layout.previewOpen) {
        // Keep at least 300px for the JSON pane if the window got smaller since last visit
        const maxPreview = window.innerWidth - leftPane.offsetWidth - 300;
        previewPane.style.width = Math.max(250, Math.min(layout.previewWidth, maxPreview)) + 'px';
    } else {
        previewPane.style.width = '';
    }
    editor.resize();
    shorthand.resize();
}

function makeResizer(resizer, onMove) {
    let isResizing = false;
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        resizer.style.background = 'var(--accent)';
        if (previewFrame) previewFrame.style.pointerEvents = 'none'; // iframe would swallow mousemove
        e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
        if (isResizing) onMove(e.clientX);
    });
    document.addEventListener('mouseup', () => {
        if (!isResizing) return;
        isResizing = false;
        document.body.style.cursor = 'default';
        resizer.style.background = '';
        if (previewFrame) previewFrame.style.pointerEvents = '';
        saveLayout();
        editor.resize();
        shorthand.resize();
    });
}

makeResizer(document.getElementById('drag-resizer'), (x) => {
    if (x > 300 && x < window.innerWidth - previewPane.offsetWidth - 300) {
        layout.leftWidth = x;
        leftPane.style.width = x + 'px';
        leftPane.style.flex = 'none';
    }
});

makeResizer(previewResizer, (x) => {
    const w = window.innerWidth - x;
    if (w > 250 && x > leftPane.offsetWidth + 300) {
        layout.previewWidth = w;
        previewPane.style.width = w + 'px';
    }
});

// --- Form Preview (Form.io open-source renderer in an iframe) ---
// Demo options so fs lookup selects aren't empty in the preview; never added to the copied JSON
const previewDemoValues = {
    fsworkers: ['John Smith', 'Maria Garcia', 'David Chen', 'Aisha Patel', 'Robert Johnson'],
    fsproject: ['Main Street Renovation', 'Riverside Office Tower', 'Highway 9 Overpass', 'Lakeview Apartments', 'North Plant Expansion'],
    fsequipment: ['Excavator CAT 320', 'Skid Steer S650', 'Boom Lift 600S', 'Concrete Mixer', 'Generator 20kW'],
    fscompany: ['Acme Construction', 'Summit Builders', 'BlueLine Electric', 'Granite Paving Co.', 'Northstar Mechanical'],
    fsdivision: ['Civil', 'Electrical', 'Mechanical', 'Structural', 'Safety']
};

const PREVIEW_HTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/formiojs@4/dist/formio.full.min.css">
<style>body { margin: 0; padding: 16px; background: #fff; } .preview-error { color: #b00020; font-family: monospace; white-space: pre-wrap; }
.sync-focus { outline: 2px solid #007acc; outline-offset: 4px; border-radius: 4px; }</style>
</head><body><div id="form"></div>
<script src="https://cdn.jsdelivr.net/npm/formiojs@4/dist/formio.full.min.js"></script>
<script>
var form = null, pending = null, busy = false, focusKey = null, el = document.getElementById('form');
function showError(msg) { el.innerHTML = '<div class="preview-error"></div>'; el.firstChild.textContent = msg; form = null; }
// Outline + scroll to the component the cursor is on in the shorthand
function applyFocus() {
    var prev = document.querySelector('.sync-focus');
    if (prev) prev.classList.remove('sync-focus');
    if (!focusKey) return;
    var target = document.querySelector('.formio-component-' + CSS.escape(focusKey));
    if (!target || target.offsetParent === null) return;
    target.classList.add('sync-focus');
    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function render(schema) {
    if (typeof Formio === 'undefined') return showError('Could not load the Form.io renderer. Check your internet connection.');
    if (busy) { pending = schema; return; }
    busy = true;
    var done = function () { busy = false; if (pending) { var s = pending; pending = null; render(s); } else applyFocus(); };
    var p = form ? Promise.resolve(form.setForm(schema)) : Formio.createForm(el, schema).then(function (f) { form = f; });
    p.then(done, function (err) { showError(String(err)); done(); });
}
window.addEventListener('message', function (e) {
    if (e.source !== parent || !e.data) return;
    if (e.data.type === 'render') render(e.data.schema);
    if (e.data.type === 'focus') { focusKey = e.data.key; if (!busy) applyFocus(); }
});
parent.postMessage({ type: 'preview-ready' }, '*');
<\/script></body></html>`;

let previewFrame = null;
let previewReady = false;
let previewTimer = null;
let lastComponents = [];

function previewSchema() {
    const components = JSON.parse(JSON.stringify(lastComponents));
    const addDemo = (list) => list.forEach(c => {
        if (c.type === 'select' && !c.dataSrc && String(c.key).startsWith('fs')) {
            const term = Object.keys(previewDemoValues).find(t => c.key.startsWith(t));
            const opts = term ? previewDemoValues[term] : [1, 2, 3, 4, 5].map(n => 'Sample ' + n);
            c.dataSrc = 'values';
            c.data = { values: opts.map(o => ({ label: o, value: o })) };
        }
        if (c.components) addDemo(c.components);
    });
    addDemo(components);
    return { display: 'form', components };
}

function sendPreview() {
    if (previewFrame && previewReady && layout.previewOpen) {
        previewFrame.contentWindow.postMessage({ type: 'render', schema: previewSchema() }, '*');
    }
}

function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(sendPreview, 400);
}

function ensurePreviewFrame() {
    if (previewFrame) return;
    previewFrame = document.createElement('iframe');
    previewFrame.id = 'preview-frame';
    previewFrame.srcdoc = PREVIEW_HTML;
    document.getElementById('preview-frame-wrap').appendChild(previewFrame);
}

window.addEventListener('message', (e) => {
    if (previewFrame && e.source === previewFrame.contentWindow && e.data && e.data.type === 'preview-ready') {
        previewReady = true;
        sendPreview();
    }
});

document.getElementById('btn-preview-open').addEventListener('click', () => {
    if (!layout.previewWidth) {
        // First open: split the window into thirds
        const third = Math.round(window.innerWidth / 3);
        layout.previewWidth = third;
        if (!layout.leftWidth) layout.leftWidth = third;
    }
    layout.previewOpen = true;
    applyLayout();
    saveLayout();
    ensurePreviewFrame();
    sendPreview();
});

document.getElementById('btn-preview-close').addEventListener('click', () => {
    layout.previewOpen = false;
    applyLayout();
    saveLayout();
});

applyLayout();
if (layout.previewOpen) ensurePreviewFrame();

// --- Compiler Core Logic ---
// Lookup selects: any [fs...] tag. The key IS the term (our app finds the endpoint from it).
const lookupLabels = { fsworkers: 'Worker', fsproject: 'Project', fsequipment: 'Equipment', fscompany: 'Company', fsdivision: 'Division' };
let usedLookupKeys = new Set(); // reset each compile; first use gets the plain key, repeats get a suffix
const repeatFirstKey = new WeakMap(); // repeat group → key of its first copy's header, for cursor sync

function generateSmartKey(label) {
    if (!label) return 'comp_' + Math.random().toString(36).substring(2,6);
    const words = label.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(w => w);
    let key = words.slice(0, 3).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    if (!key) key = 'field';
    const hash = Math.random().toString(36).substring(2, 6);
    return `${key}_${hash}`;
}

function unrollRepeatGroup(groupDef) {
    let results = [];
    let max = groupDef.max || 3;
    let groupKey = groupDef.key;
    
    for (let i = 1; i <= max; i++) {
        let condObj = i > 1 ? { show: true, when: `addAnother_${groupKey}_${i-1}`, eq: 'true' } : null;
        
        let header = {
            type: 'htmlelement',
            tag: 'p',
            content: `${groupDef.label} (${i})`,
            key: generateSmartKey(`header_${groupKey}_${i}`),
            input: false,
            tableView: false
        };
        if (condObj) header.conditional = condObj;
        if (i === 1) repeatFirstKey.set(groupDef, header.key);
        results.push(header);

        groupDef.components.forEach(comp => {
            let clone = JSON.parse(JSON.stringify(comp));
            clone.key = `${clone.key}_${i}`;
            clone.clearOnHide = false; // PREVENT DATA WIPE BUG IN EDIT MODE
            if (condObj) clone.conditional = condObj;
            results.push(clone);
        });

        if (i < max) {
            let addCheckbox = {
                label: `Add another ${groupDef.label}?`,
                key: `addAnother_${groupKey}_${i}`,
                type: 'checkbox',
                inputType: 'checkbox',
                input: true,
                tableView: false,
                clearOnHide: false // PREVENT DATA WIPE BUG
            };
            if (condObj) addCheckbox.conditional = condObj;
            results.push(addCheckbox);
            
            let hr = {
                type: 'htmlelement',
                tag: 'hr',
                content: '',
                key: generateSmartKey(`hr_${groupKey}_${i}`),
                input: false,
                tableView: false
            };
            if (condObj) hr.conditional = condObj;
            results.push(hr);
        }
    }
    return results;
}

function buildComponent(type, label, choicesStr, isRequired) {
    const isContainer = ['panel', 'fieldset', 'editgrid', 'datagrid', 'well', 'repeat'].includes(type);
    if (isContainer) {
        let comp = { type: type, label: label, key: generateSmartKey(label), input: type.includes('grid'), tableView: type.includes('grid'), components: [] };
        if (type === 'fieldset') comp.legend = label;
        if (type === 'panel') {
            comp.title = label; // text shown in the panel's header bar
            comp.theme = 'primary';
        }

        if (type === 'repeat') {
            comp.max = parseInt(choicesStr) || 3;
            comp.input = false;
            comp.tableView = false;
        }
        
        return comp;
    }

    if (type === 'html') return { type: 'htmlelement', tag: choicesStr || 'p', content: label, key: generateSmartKey('html') };
    if (type === 'content') return { type: 'content', html: label, key: generateSmartKey('content') };
    
    if (type === 'table') {
        let rows = 3, cols = 3;
        if (choicesStr && choicesStr.includes('x')) {
            const parts = choicesStr.split('x');
            rows = parseInt(parts[0]) || 3;
            cols = parseInt(parts[1]) || 3;
        }
        const tableRows = Array(rows).fill(0).map(() => Array(cols).fill(0).map(() => ({ components: [] })));
        return { type: 'table', label: label, key: generateSmartKey(label), numRows: rows, numCols: cols, rows: tableRows, input: false, tableView: false };
    }

    if (type === 'print') {
        const btnText = label || "Screenshot PDF";
        return {
            title: btnText,
            label: btnText,
            key: generateSmartKey("printPanel"),
            type: "panel",
            theme: "primary",
            input: false,
            tableView: false,
            collapsible: false,
            customClass: "no-print",
            components: [
                {
                    label: "Clean Print Init",
                    key: "cleanPrintInit",
                    type: "hidden",
                    input: true,
                    tableView: false,
                    persistent: false,
                    clearOnHide: false,
                    customDefaultValue: `var HIDE = [
  'nav', 'header', 'footer', 'aside',
  '[role="navigation"]', '[role="banner"]', '[role="complementary"]',
  '.menu', '.navbar', '.toolbar', '.app-bar', '.sidebar', '.drawer',
  '.fab', '.floating-action-button',
  'button', '.no-print',
  '.more-actions', '.action-button',
  'a.active.link-underline.link-underline-opacity-0.link-underline-opacity-100-hover',
  'a.link-underline.link-underline-opacity-0.link-underline-opacity-100-hover.fs-6'
].join(',');

if (!document.getElementById('formio-clean-print')) {
  var s = document.createElement('style');
  s.id = 'formio-clean-print';
  s.textContent = '@media print{' +
    HIDE + '{display:none!important}' +
    'html,body{margin:0!important;padding:0!important;overflow:visible!important}' +
    'main,article,[role="main"],.content{width:100%!important;max-width:none!important;margin:0!important}' +
    '@page{margin:.5in}' +
  '}';
  document.head.appendChild(s);
}

if (!window.__formioCleanPrint) {
  window.__formioCleanPrint = true;
  document.addEventListener('click', function (e) {
    if (e.target.closest('.js-print')) {
      e.preventDefault();
      window.print();
    }
  });
}

value = true;`
                },
                {
                    label: "Print Button",
                    key: "printButtonHtml",
                    type: "htmlelement",
                    tag: "div",
                    input: false,
                    tableView: false,
                    refreshOnChange: false,
                    content: `<button type="button" class="btn btn-light btn-sm w-100 py-1 js-print no-print">${btnText}</button>`
                }
            ]
        };
    }

    if (type.startsWith('fs') && type.length > 2) {
        const key = usedLookupKeys.has(type) ? generateSmartKey(type) : type;
        usedLookupKeys.add(type);
        const lookupLabel = label || lookupLabels[type] || type.charAt(2).toUpperCase() + type.slice(3);
        // Deliberately minimal: no dataSrc / data values
        const lookup = { label: lookupLabel, key: key, type: 'select', placeholder: 'Type to select...', input: true, tableView: true };
        if (isRequired) lookup.validate = { required: true };
        return lookup;
    }

    const base = { label: label, key: generateSmartKey(label), type: type, input: true, tableView: true };
    if (isRequired) base.validate = { required: true };

    if (type === 'radio' || type === 'selectboxes') {
        let optionsArray = choicesStr ? choicesStr.split(',').map(s => s.trim()).filter(s => s).map(opt => ({ label: opt, value: generateSmartKey(opt) })) : [];
        base.values = optionsArray;
    } else if (type === 'select') {
        base.dataSrc = 'values';
        let optionsArray = choicesStr ? choicesStr.split(',').map(s => s.trim()).filter(s => s).map(opt => ({ label: opt, value: generateSmartKey(opt) })) : [];
        base.data = { values: optionsArray };
    } else if (type === 'checkbox') {
        base.inputType = 'checkbox';
    } else if (type === 'datetime' || type === 'date' || type === 'time') {
        base.type = 'datetime';
        base.enableDate = (type === 'datetime' || type === 'date');
        base.enableTime = (type === 'datetime' || type === 'time');
        base.widget = {
            type: 'calendar',
            displayInTimezone: 'viewer',
            language: 'en',
            useLocaleSettings: false,
            allowInput: true,
            mode: 'single',
            enableTime: base.enableTime,
            noCalendar: !base.enableDate,
            format: type === 'date' ? 'yyyy-MM-dd' : (type === 'time' ? 'hh:mm a' : 'yyyy-MM-dd hh:mm a')
        };
    } else if (type === 'signature') {
        base.type = 'signature';
        base.penColor = "black";
        base.backgroundColor = "rgb(245,245,235)";
        base.minWidth = "0.5";
        base.maxWidth = "2.5";
    } else if (type === 'phoneNumber') {
        base.type = 'phoneNumber';
        base.inputType = 'tel';
        base.inputMask = '(999) 999-9999';
    } else if (type === 'number' && choicesStr && choicesStr.includes('-')) {
        let parts = choicesStr.split('-');
        let min = parseInt(parts[0]);
        let max = parseInt(parts[1]);
        if (!isNaN(min) && !isNaN(max)) {
            base.validate = base.validate || {};
            base.validate.min = min;
            base.validate.max = max;
            base.validate.step = "1"; // Forces whole numbers
            base.validate.customMessage = "Please enter a number from " + min + " to " + max + ".";
            
            // Auto-size the input based on the length of the maximum number
            let maxDigits = max.toString().length;
            if (maxDigits <= 2) {
                base.customClass = "col-md-2";
            } else if (maxDigits <= 4) {
                base.customClass = "col-md-3";
            } else {
                base.customClass = "col-md-4";
            }
        }
    }

    return base;
}

function parseComponentDef(str) {
    const required = str.startsWith('!');
    const bracketMatch = str.match(/\[(.*?)\]/);
    if (!bracketMatch) return null;
    
    let inside = bracketMatch[1];
    let type = inside, choices = '';
    
    if (inside.includes(':')) {
        const parts = inside.split(':');
        type = parts[0].trim().toLowerCase();
        choices = parts.slice(1).join(':').trim();
    } else {
        type = inside.trim().toLowerCase();
    }
    let label = str.substring(str.indexOf(']') + 1).trim();
    return { type, choices, required, label };
}

function compileShorthand() {
    const lines = shorthand.session.getDocument().getAllLines();
    const lineComps = []; // source row → component it produced (for cursor sync)
    usedLookupKeys = new Set();
    let rootComponents = [];
    let containerStack = [];
    let inBulkMode = false;
    let bulkDef = null;
    let lastFieldComponent = null;

    const pushComponent = (comp) => {
        if (containerStack.length > 0) {
            containerStack[containerStack.length - 1].components.push(comp);
        } else {
            rootComponents.push(comp);
        }
    };

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) { 
            lastFieldComponent = null;
            if (containerStack.length > 0) {
                let popped = containerStack.pop();
                if (popped.type === 'repeat') {
                    let unrolled = unrollRepeatGroup(popped);
                    unrolled.forEach(c => pushComponent(c));
                }
            }
            continue; 
        }

        if (line.startsWith('+++')) {
            lastFieldComponent = null;
            if (inBulkMode) { inBulkMode = false; bulkDef = null; } 
            else { 
                inBulkMode = true; 
                bulkDef = parseComponentDef(line.substring(3).trim());
                bulkDef.markdownChoices = [];
            }
            continue;
        }

        if (inBulkMode && bulkDef) {
            if (line.startsWith('- ')) {
                bulkDef.markdownChoices.push(line.substring(2).trim());
                continue;
            }

            const comp = buildComponent(bulkDef.type, line, bulkDef.choices, bulkDef.required);
            if (bulkDef.markdownChoices.length > 0) {
                if (comp.type === 'radio' || comp.type === 'selectboxes') {
                    comp.values = comp.values || [];
                    bulkDef.markdownChoices.forEach(opt => {
                        comp.values.push({ label: opt, value: generateSmartKey(opt) });
                    });
                } else if (comp.type === 'select') {
                    comp.data = comp.data || { values: [] };
                    comp.data.values = comp.data.values || [];
                    bulkDef.markdownChoices.forEach(opt => {
                        comp.data.values.push({ label: opt, value: generateSmartKey(opt) });
                    });
                }
            }
            pushComponent(comp);
            lineComps[i] = comp;
            continue;
        }

        if (line.match(/^!?\[/)) {
            const def = parseComponentDef(line);
            if (def) {
                const comp = buildComponent(def.type, def.label, def.choices, def.required);
                lineComps[i] = comp;
                if (['panel', 'fieldset', 'editgrid', 'datagrid', 'well', 'repeat'].includes(def.type)) {
                    if (def.type !== 'repeat') {
                        pushComponent(comp);
                    }
                    containerStack.push(comp);
                    lastFieldComponent = null;
                } else {
                    pushComponent(comp);
                    lastFieldComponent = comp;
                }
            }
        } else if (line.startsWith('- ') && lastFieldComponent) {
            lineComps[i] = lastFieldComponent;
            const optText = line.substring(2).trim();
            const optObj = { label: optText, value: generateSmartKey(optText) };
            if (lastFieldComponent.type === 'radio' || lastFieldComponent.type === 'selectboxes') {
                lastFieldComponent.values = lastFieldComponent.values || [];
                lastFieldComponent.values.push(optObj);
            } else if (lastFieldComponent.type === 'select') {
                lastFieldComponent.data = lastFieldComponent.data || { values: [] };
                lastFieldComponent.data.values = lastFieldComponent.data.values || [];
                lastFieldComponent.data.values.push(optObj);
            }
        } else {
            lastFieldComponent = null;
        }
    }

    while (containerStack.length > 0) {
        let popped = containerStack.pop();
        if (popped.type === 'repeat') {
            let unrolled = unrollRepeatGroup(popped);
            unrolled.forEach(c => pushComponent(c));
        }
    }

    // Components mode: array, pasted over a "components": [ ]
    // Component mode: one object, pasted over a whole component's schema (several top-level items get wrapped in a panel)
    let finalOutput = rootComponents;
    if (outputMode === 'component') {
        if (rootComponents.length === 1) {
            finalOutput = rootComponents[0];
        } else {
            finalOutput = { title: 'Panel', label: 'Panel', key: generateSmartKey('Panel'), type: 'panel', theme: 'primary', input: false, tableView: false, components: rootComponents };
        }
    }
    const scrollTop = editor.session.getScrollTop(); // setValue would jump to the top
    editor.setValue(JSON.stringify(finalOutput, null, 2), -1);
    editor.session.setScrollTop(scrollTop);

    // Resolve each line's component to its key in the output (repeat copies are suffixed _1, _2, ...)
    const outputKeys = new Set();
    const collectKeys = (list) => list.forEach(c => { outputKeys.add(c.key); if (c.components) collectKeys(c.components); });
    collectKeys(rootComponents);
    lineKeys = lineComps.map(c => !c ? null
        : outputKeys.has(c.key) ? c.key
        : outputKeys.has(c.key + '_1') ? c.key + '_1'
        : repeatFirstKey.get(c) || null);

    lastComponents = rootComponents;
    schedulePreview();
    checkBadChars();
    scheduleSync();
}

// --- Wrapper Checkbox (checked = one { } component, unchecked = [ ] components array) ---
let outputMode = 'components';
try { outputMode = localStorage.getItem('outputMode') === 'component' ? 'component' : 'components'; } catch (e) {}

const wrapperCheck = document.getElementById('chk-wrapper');
wrapperCheck.checked = outputMode === 'component';
wrapperCheck.addEventListener('change', () => {
    outputMode = wrapperCheck.checked ? 'component' : 'components';
    try { localStorage.setItem('outputMode', outputMode); } catch (e) {}
    compileShorthand();
});

// --- Listeners ---
// Recompile once per batch of edits (setValue / snippet insert fire several change events)
let compileQueued = false;
shorthand.session.on('change', () => {
    if (compileQueued) return;
    compileQueued = true;
    setTimeout(() => { compileQueued = false; compileShorthand(); }, 0);
});
document.getElementById('btn-clear').addEventListener('click', () => {
    shorthand.setValue('', -1);
    shorthand.focus();
});
document.getElementById('btn-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(editor.getValue()).then(() => {
        const btn = document.getElementById('btn-copy');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check" style="color:var(--accent);"></i>';
        setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
    });
});

// Download: mobile → share sheet; Chrome/Edge desktop → native Save dialog; others → ask for a name, then download
document.getElementById('btn-download').addEventListener('click', async () => {
    const jsonStr = editor.getValue();
    const suggestedName = 'form_schema.json';

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1); // iPadOS reports as Mac
    if (isMobile && navigator.canShare) {
        const file = new File([jsonStr], suggestedName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
            try { await navigator.share({ files: [file], title: suggestedName }); } catch (e) {} // dismissed
            return;
        }
    }

    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName,
                types: [{ description: 'JSON file', accept: { 'application/json': ['.json'] } }]
            });
            const writable = await handle.createWritable();
            await writable.write(jsonStr);
            await writable.close();
        } catch (e) {
            if (e.name !== 'AbortError') alert('Could not save the file: ' + e.message);
        }
        return;
    }

    let fileName = prompt('Save as:', suggestedName);
    if (!fileName || !fileName.trim()) return;
    fileName = fileName.trim();
    if (!fileName.toLowerCase().endsWith('.json')) fileName += '.json';
    const url = URL.createObjectURL(new Blob([jsonStr], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
});

// --- Favorites Logic ---
const favModal = document.getElementById('fav-modal');
document.getElementById('btn-close-fav').addEventListener('click', () => favModal.classList.add('hidden'));

document.getElementById('btn-save-fav').addEventListener('click', () => {
    const name = prompt("Enter a name for this favorite session:");
    if (!name) return;
    const text = shorthand.getValue();
    if (!text.trim()) return alert("Shorthand is empty!");

    const tx = db.transaction('favorites', 'readwrite');
    tx.objectStore('favorites').add({ name, shorthand: text, date: new Date().toLocaleDateString() });
    tx.oncomplete = () => {
        const btn = document.getElementById('btn-save-fav');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-star" style="color: gold;"></i>';
        setTimeout(() => btn.innerHTML = orig, 2000);
    };
});

document.getElementById('btn-export-favs').addEventListener('click', () => {
    const tx = db.transaction('favorites', 'readonly');
    const req = tx.objectStore('favorites').getAll();
    req.onsuccess = () => {
        const favs = req.result;
        favs.forEach(f => delete f.id); 
        const blob = new Blob([JSON.stringify(favs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formio_favorites_backup.json';
        a.click();
        URL.revokeObjectURL(url);
    };
});

const fileImport = document.getElementById('file-import-favs');
document.getElementById('btn-import-favs').addEventListener('click', () => fileImport.click());

fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const favs = JSON.parse(event.target.result);
            if (!Array.isArray(favs)) throw new Error("Invalid format");
            
            const tx = db.transaction('favorites', 'readwrite');
            const store = tx.objectStore('favorites');
            let count = 0;
            favs.forEach(f => {
                delete f.id;
                if (f.name && f.shorthand) {
                    store.add(f);
                    count++;
                }
            });
            tx.oncomplete = () => {
                alert(`Successfully imported ${count} favorites!`);
                fileImport.value = ''; // reset
                document.getElementById('btn-list-favs').click(); // refresh list
            };
        } catch (err) {
            alert("Error importing favorites. Make sure it is a valid backup file.");
        }
    };
    reader.readAsText(file);
});

document.getElementById('btn-list-favs').addEventListener('click', () => {
    const list = document.getElementById('fav-list');
    list.innerHTML = '';
    
    const tx = db.transaction('favorites', 'readonly');
    const req = tx.objectStore('favorites').getAll();
    req.onsuccess = () => {
        const favs = req.result;
        if (favs.length === 0) {
            list.innerHTML = '<p style="color: var(--text-dim);">No favorites saved yet.</p>';
        } else {
            favs.forEach(f => {
                const div = document.createElement('div');
                div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 4px;';
                
                const info = document.createElement('div');
                info.innerHTML = `<strong>${f.name}</strong> <span style="font-size: 10px; color: var(--text-dim); margin-left: 10px;">${f.date}</span>`;
                
                const actions = document.createElement('div');
                actions.style.display = 'flex';
                actions.style.gap = '5px';
                
                const loadBtn = document.createElement('button');
                loadBtn.className = 'btn-primary';
                loadBtn.innerHTML = 'Load';
                loadBtn.onclick = () => {
                    shorthand.setValue(f.shorthand, -1);
                    favModal.classList.add('hidden');
                    shorthand.focus();
                };
                
                const delBtn = document.createElement('button');
                delBtn.className = 'btn-icon text-danger';
                delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                delBtn.onclick = () => {
                    const tx = db.transaction('favorites', 'readwrite');
                    tx.objectStore('favorites').delete(f.id);
                    tx.oncomplete = () => div.remove();
                };
                
                actions.appendChild(loadBtn);
                actions.appendChild(delBtn);
                div.appendChild(info);
                div.appendChild(actions);
                list.appendChild(div);
            });
        }
        favModal.classList.remove('hidden');
    };
});

favModal.addEventListener('click', (e) => {
    if (e.target === favModal) favModal.classList.add('hidden');
});

// --- Modal Snippet Logic ---
const snippetModal = document.getElementById('snippet-modal');
document.getElementById('btn-help').addEventListener('click', () => snippetModal.classList.remove('hidden'));
document.getElementById('btn-close-modal').addEventListener('click', () => snippetModal.classList.add('hidden'));

// Close modal when clicking on the dark overlay (outside the content)
snippetModal.addEventListener('click', (e) => {
    if (e.target === snippetModal) {
        snippetModal.classList.add('hidden');
    }
});

document.querySelectorAll('.btn-insert').forEach(btn => {
    btn.addEventListener('click', (e) => {
        let snippet = e.target.getAttribute('data-snippet');
        if (snippet) snippet = snippet.replace(/\\n/g, '\n');
        if (shorthand.getCursorPosition().column > 0) snippet = '\n' + snippet;
        shorthand.insert(snippet);
        shorthand.focus();
        
        const originalText = e.target.innerText;
        e.target.innerText = "Added!";
        setTimeout(() => e.target.innerText = originalText, 1000);
    });
});

// --- Autocomplete Logic ---
// ${n:text} marks a placeholder: inserted selected, Tab/Enter moves to the next one in n order
const quickSnippets = [
    { name: 'panel', desc: 'Panel Container', syntax: '[panel] ${1:Panel}' },
    { name: 'fieldset', desc: 'Field Set Container', syntax: '[fieldset] ${1:Field Set}' },
    { name: 'repeat', desc: 'Super Group Repeater', syntax: '[repeat: ${2:3}] ${1:Repeat Group}' },
    { name: 'editgrid', desc: 'Edit Grid', syntax: '[editgrid] ${1:Edit Grid}' },
    { name: 'datagrid', desc: 'Data Grid', syntax: '[datagrid] ${1:Data Grid}' },
    { name: 'well', desc: 'Well Container', syntax: '[well] ${1:Well}' },
    { name: 'table', desc: 'Table Layout', syntax: '[table: ${2:2x2}] ${1:Table}' },
    { name: 'textfield', desc: 'Text Field', syntax: '[textfield] ${1:Text Field}' },
    { name: 'textarea', desc: 'Text Area', syntax: '[textarea] ${1:Text Area}' },
    { name: 'number', desc: 'Number Input', syntax: '[number] ${1:Number}' },
    { name: 'numberrange', desc: 'Number (Min/Max)', syntax: '[number: ${2:1-5}] ${1:Number}' },
    { name: 'phoneNumber', desc: 'Phone Number', syntax: '[phoneNumber] ${1:Phone Number}' },
    { name: 'datetime', desc: 'Date & Time', syntax: '[datetime] ${1:Date Time}' },
    { name: 'date', desc: 'Date Only', syntax: '[date] ${1:Date}' },
    { name: 'email', desc: 'Email Input', syntax: '[email] ${1:Email}' },
    { name: 'radio', desc: 'Radio Buttons', syntax: '[radio] ${1:Question}\n- ${2:Choice 1}\n- ${3:Choice 2}' },
    { name: 'select', desc: 'Select Dropdown', syntax: '[select] ${1:Question}\n- ${2:Choice 1}\n- ${3:Choice 2}' },
    { name: 'selectboxes', desc: 'Checkboxes (Multi)', syntax: '[selectboxes] ${1:Question}\n- ${2:Choice 1}\n- ${3:Choice 2}' },
    { name: 'fsworkers', desc: 'Worker select', syntax: '[fsworkers] ${1:Worker}' },
    { name: 'fsproject', desc: 'Project select', syntax: '[fsproject] ${1:Project}' },
    { name: 'fsequipment', desc: 'Equipment select', syntax: '[fsequipment] ${1:Equipment}' },
    { name: 'fscompany', desc: 'Company select', syntax: '[fscompany] ${1:Company}' },
    { name: 'fsdivision', desc: 'Division select', syntax: '[fsdivision] ${1:Division}' },
    { name: 'checkbox', desc: 'Single Checkbox', syntax: '[checkbox] ${1:Checkbox}' },
    { name: 'signature', desc: 'Signature Pad', syntax: '[signature] ${1:Signature}' },
    { name: 'html', desc: 'HTML Element', syntax: '[html: ${2:h2}] ${1:Heading}' },
    { name: 'content', desc: 'HTML Content', syntax: '[content] ${1:<p>Content</p>}' },
    { name: 'print', desc: 'Clean Print Button', syntax: '[print] ${1:Print}' },
    { name: 'bulk', desc: 'Bulk Mode Wrapper', syntax: '+++ ![radio]\n- ${1:Choice 1}\n- ${2:Choice 2}\n${3:Question 1}\n${4:Question 2}\n+++' }
];

const stripPlaceholders = (syntax) => syntax.replace(/\$\{\d+:([^}]*)\}/g, '$1');

// Typing [ opens the menu; typed letters filter it; Enter/Tab inserts with the first placeholder selected
shorthand.completers = [{
    id: 'shorthandTags',
    identifierRegexps: [/[\[\w]/],
    triggerCharacters: ['['],
    getCompletions(ed, session, pos, prefix, callback) {
        if (!prefix.startsWith('[')) return callback(null, []);
        callback(null, quickSnippets.map((s, i) => ({
            caption: '[' + s.name,
            snippet: s.syntax,
            meta: s.desc,
            docText: stripPlaceholders(s.syntax),
            score: 1000 - i
        })));
    }
}];

// Enter at the end of a "- choice" line starts the next "- "; Enter on an empty "- " ends the list
function continueList(ed) {
    if (!ed.selection.isEmpty()) return false;
    const pos = ed.getCursorPosition();
    const line = ed.session.getLine(pos.row);
    if (pos.column !== line.length) return false;
    if (line.trim() === '-') {
        ed.session.replace(new Range(pos.row, 0, pos.row, line.length), '');
        return true;
    }
    if (!/^\s*- /.test(line)) return false;
    ed.insert('\n- ');
    return true;
}

// Move to the next line: reuse an empty one rather than adding another blank (blank lines close containers)
function goToNextLine(ed) {
    const row = ed.getCursorPosition().row;
    if (row + 1 < ed.session.getLength() && ed.session.getLine(row + 1).trim() === '') {
        ed.selection.moveTo(row + 1, 0);
    } else {
        ed.navigateLineEnd();
        ed.insert('\n');
    }
}

// Tab never leaves the editor: Ace's placeholder Tab runs first; otherwise Tab goes to the next line
shorthand.commands.removeCommand('indent');
shorthand.commands.removeCommand('outdent');
shorthand.commands.addCommand({ name: 'nextLine', bindKey: { win: 'Tab', mac: 'Tab' }, exec: goToNextLine });

// Enter on a placeholder moves to the next one; on the last, finishes and acts like Enter at the line end
shorthand.commands.addCommand({
    name: 'smartEnter',
    bindKey: { win: 'Return', mac: 'Return' },
    exec(ed) {
        const m = ed.tabstopManager;
        if (m) {
            if (m.index < m.tabstops.length - 1) { m.tabNext(1); return; }
            m.detach();
            ed.navigateLineEnd();
        }
        if (!continueList(ed)) ed.insert('\n');
    }
});

// Tab on the last placeholder: Ace parks at the snippet end; carry on to the next line like a final Tab should
let tabFromLastStop = false;
shorthand.commands.on('exec', (e) => {
    const m = shorthand.tabstopManager;
    tabFromLastStop = e.command.name === 'Tab' && !!m && m.index === m.tabstops.length - 1;
});
shorthand.commands.on('afterExec', (e) => {
    if (e.command.name === 'Tab' && tabFromLastStop) {
        tabFromLastStop = false;
        goToNextLine(shorthand);
    }
});

// --- Special Characters (garbled by Form.io when pasted from Word/PDF) ---
const BAD_CHARS = {
    '‘': ["'", 'curly single quote'], '’': ["'", 'curly apostrophe'], '‚': ["'", 'low single quote'], '‛': ["'", 'reversed single quote'],
    '“': ['"', 'curly double quote'], '”': ['"', 'curly double quote'], '„': ['"', 'low double quote'], '‟': ['"', 'reversed double quote'],
    '′': ["'", 'prime'], '″': ['"', 'double prime'],
    '–': ['-', 'en dash'], '—': ['-', 'em dash'], '―': ['-', 'horizontal bar'], '−': ['-', 'minus sign'],
    '‐': ['-', 'Unicode hyphen'], '‑': ['-', 'non-breaking hyphen'],
    '…': ['...', 'ellipsis'], '•': ['-', 'bullet'],
    ' ': [' ', 'non-breaking space'], ' ': [' ', 'en space'], ' ': [' ', 'em space'], ' ': [' ', 'figure space'],
    ' ': [' ', 'thin space'], ' ': [' ', 'hair space'], ' ': [' ', 'narrow non-breaking space'],
    '​': ['', 'zero-width space'], '‌': ['', 'zero-width non-joiner'], '‍': ['', 'zero-width joiner'],
    '﻿': ['', 'invisible byte-order mark'], '­': ['', 'soft hyphen']
};
const BAD_CHAR_RE = new RegExp('[' + Object.keys(BAD_CHARS).join('') + ']', 'g');
const fixCharsBtn = document.getElementById('btn-fix-chars');
let badCharMarkers = [];

// Underline each one, flag its line in the margin (hover for names), and show a count + Fix button
function checkBadChars() {
    const session = shorthand.session;
    badCharMarkers.forEach(id => session.removeMarker(id));
    badCharMarkers = [];
    const annotations = [];
    let count = 0;
    session.getDocument().getAllLines().forEach((line, row) => {
        const names = new Set();
        line.replace(BAD_CHAR_RE, (ch, col) => {
            count++;
            names.add(BAD_CHARS[ch][1]);
            badCharMarkers.push(session.addMarker(new Range(row, col, row, col + 1), 'bad-char', 'text', true));
            return ch;
        });
        if (names.size) annotations.push({ row, column: 0, type: 'warning', text: 'Form.io may garble: ' + [...names].join(', ') });
    });
    session.setAnnotations(annotations);
    fixCharsBtn.hidden = count === 0;
    fixCharsBtn.textContent = `⚠ ${count} special character${count === 1 ? '' : 's'} · Fix`;
}

fixCharsBtn.addEventListener('click', () => {
    const pos = shorthand.getCursorPosition();
    shorthand.setValue(shorthand.getValue().replace(BAD_CHAR_RE, ch => BAD_CHARS[ch][0]), -1);
    shorthand.moveCursorToPosition(pos);
    shorthand.focus();
});

// --- Cursor Sync: JSON pane + Preview follow the component under the shorthand cursor ---
let lineKeys = [];
let syncTimer = null;
let jsonSyncMarker = null;

function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncToCursor, 120);
}

function syncToCursor() {
    let row = shorthand.getCursorPosition().row;
    while (row >= 0 && !lineKeys[row]) row--; // blank or plain line: use the component above it
    const key = row >= 0 ? lineKeys[row] : null;
    highlightJson(key);
    if (previewFrame && previewReady && layout.previewOpen) {
        previewFrame.contentWindow.postMessage({ type: 'focus', key }, '*');
    }
}

// Highlight the component's whole { ... } block in the JSON pane and scroll it into view
function highlightJson(key) {
    const session = editor.session;
    if (jsonSyncMarker !== null) { session.removeMarker(jsonSyncMarker); jsonSyncMarker = null; }
    if (!key) return;
    const lines = session.getDocument().getAllLines();
    const keyLine = '"key": ' + JSON.stringify(key);
    const keyRow = lines.findIndex(l => l.trim().replace(/,$/, '') === keyLine);
    if (keyRow === -1) return;
    const indent = ' '.repeat(lines[keyRow].search(/\S/) - 2);
    let start = keyRow, end = keyRow;
    while (start > 0 && lines[start] !== indent + '{') start--;
    while (end < lines.length - 1 && lines[end] !== indent + '}' && lines[end] !== indent + '},') end++;
    jsonSyncMarker = session.addMarker(new Range(start, 0, end, Infinity), 'sync-line', 'fullLine');
    if (start < editor.getFirstVisibleRow() || start > editor.getLastVisibleRow() - 2) {
        editor.scrollToLine(Math.max(0, start - 2), false, true, () => {});
    }
}

shorthand.selection.on('changeCursor', scheduleSync);

// --- Pre-fill Example ---
shorthand.setValue(`[panel] Employee Onboarding
![textfield] First Name
![textfield] Last Name
[radio] Gender
- Male
- Female
- N/A

[editgrid] Work History
![textfield] Company Name
![datetime] Start Date

[table: 2x2] Example Table

+++ ![radio]
- Yes
- No
Have you worked here before?
Are you over 18?
Do you need a visa sponsorship?
+++
`, -1);
compileShorthand();


