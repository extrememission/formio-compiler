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
    },
    {
        name: "Template: Time & Materials",
        date: "System Default",
        shorthand: "[panel] Time & Materials\n[textfield] Job Description\n![date] Work Date\n[fieldset] Labor\n![number] Labor Hours\n![currency] Hourly Rate\n[currency: =Labor Hours * Hourly Rate] Labor Total\n\n[fieldset] Materials\n[currency] Materials Cost\n[number: 0-100] Markup Percent\n[currency: =Materials Cost + Materials Cost * Markup Percent / 100] Materials Total\n\n[fieldset] Totals\n[currency: =Labor Total + Materials Total] Subtotal\n[number: 0-20] Tax Rate Percent\n[currency: =Subtotal * Tax Rate Percent / 100] Tax\n[currency: =Subtotal + Tax] Grand Total\n\n[chart: Labor Total, Materials Total, Tax] Cost Breakdown"
    },
    {
        name: "Template: Service Record (T&M)",
        date: "System Default",
        shorthand: "[panel] Materials & Parts Used\n[editgrid: Qty#(s), !Part # / Description(xl), Unit(s), Unit Price$, Ext. Price$] Materials\n= Ext. Price: Qty * Unit Price\n\n\n[panel] Labor & Other Charges\n[editgrid: !Labor / Charge Description(l), Hours#(s), Rate$, Amount$, Notes(l)] Labor\n= Amount: Hours * Rate\n\n\n[panel] Summary / Billing\n[textarea] Technician Recommendations\n[currency: =SUM(Ext. Price)] Materials Subtotal\n[currency: =SUM(Amount)] Labor Subtotal\n[currency] Travel / Equipment\n[currency] Other Charges\n[currency] Sales Tax\n[currency: =Materials Subtotal + Labor Subtotal + \"Travel / Equipment\" + Other Charges + Sales Tax] Total"
    },
    {
        name: "Template: How-To: Formulas & Charts",
        date: "System Default",
        // Instructions are [content] cards (delete their lines when done); field hints are ~description lines
        shorthand: [
            '[panel] How-To: Formulas & Charts',
            '~collapsible',
            '[content] <p><strong>How to use this example:</strong> type numbers into the fields and watch the totals and the chart update. The grey hint under each field explains what its shorthand line does. Delete the [content] lines once you have the hang of it.</p>',
            '[fieldset] 1. Formulas use labels',
            '[content] <p>Shorthand: <code>[currency: =Hours * Rate] Labor Total</code>. Write formulas with field labels; the compiler fills in the real keys every time it compiles.</p>',
            '[number] Hours',
            '~description: "Try 8"',
            '[currency] Rate',
            '~description: "Try 50"',
            '[currency: =Hours * Rate] Labor Total',
            '~description: "Calculated: Hours x Rate, rounded to cents, read-only"',
            '',
            '[fieldset] 2. Labels with symbols need quotes',
            '[content] <p>Shorthand: <code>[currency: =Labor Total + "Travel / Equipment"] Subtotal</code>. A label containing + - * / ( ) must be in quotes inside a formula.</p>',
            '[currency] Travel / Equipment',
            '~description: "Try 75"',
            '[currency: =Labor Total + "Travel / Equipment"] Subtotal',
            '~description: "Calculated: Labor Total + Travel / Equipment"',
            '',
            '[fieldset] 3. Grid columns and SUM()',
            '[content] <p>Shorthand: <code>[editgrid: !Item(xl), Qty#(s), Price$, Line Total$] Parts</code> then <code>= Line Total: Qty * Price</code> on the next line. <code>$</code> = currency, <code>#</code> = number, <code>!</code> = required, <code>(s)/(l)/(xl)</code> = width. <code>SUM(Line Total)</code> adds a column across every row.</p>',
            '[editgrid: !Item(xl), Qty#(s), Price$, Line Total$] Parts',
            '= Line Total: Qty * Price',
            '~description: "Click Add Another: Line Total fills in from Qty x Price"',
            '',
            '[currency: =SUM(Line Total)] Parts Total',
            '~description: "Calculated: SUM(Line Total) across every row of Parts"',
            '',
            '[fieldset] 4. Charts',
            '[content] <p>Shorthand: <code>[chart: Labor Total, "Travel / Equipment", Parts Total] Cost Breakdown</code>. List any number of number or currency fields by label (quotes and SUM() work here too). Each bar shows its amount and share of the total, and redraws as you type.</p>',
            '[chart: Labor Total, "Travel / Equipment", Parts Total] Cost Breakdown',
            '',
            '[fieldset] 5. ~ settings',
            '[content] <p>Every grey hint on this page is a <code>~description</code> line under its field. On a new line under any field, type <code>~</code> to browse all of its Form.io settings with explanations.</p>',
            '[textfield] Try It',
            '~placeholder: "Type here"',
            '~tooltip: "Added with ~tooltip"',
            '~description: "Added with ~description"'
        ].join('\n')
    },
    {
        name: "Template: ~ Settings Showcase",
        date: "System Default",
        shorthand: "[panel] ~ Settings Showcase\n~collapsible\n[content] <p>Every field here is customized with <strong>~ lines</strong>. Hover the ⓘ in the margin next to any ~ line to see what it does, or type <strong>~</strong> on a new line under any field to browse all of its settings.</p>\n[textfield] Full Name\n~placeholder: \"First and last name\"\n~tooltip: \"As it appears on your ID\"\n~validate.maxLength: 60\n~showCharCount\n![email] Email\n~description: \"We'll only use this for receipts\"\n[textfield] Employee ID\n~labelPosition: left-left\n~labelWidth: 25\n~prefix: \"#\"\n[number] Hours Worked\n~suffix: \"hrs\"\n~validate.min: 0\n~validate.max: 24\n[select] Department\n~widget: html5\n~placeholder: \"Choose a department\"\n- Field Operations\n- Service\n- Office\n[radio] Shift\n~inline\n- Day\n- Night\n- Weekend\n[textarea] Work Summary\n~rows: 4\n~showWordCount\n~validate.maxWords: 200\n[signature] Technician Signature\n~footer: \"Sign above the line\""
    }
];

const initDB = () => {
    // Bump the version whenever defaultTemplates change so existing installs get refreshed copies
    const request = indexedDB.open('FormioCompilerDB', 7);
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
// Outline the synced component; center it when it just changed, otherwise only keep it in view
function applyFocus(center) {
    var prev = document.querySelector('.sync-focus');
    if (prev) prev.classList.remove('sync-focus');
    if (!focusKey) return;
    var target = document.querySelector('.formio-component-' + CSS.escape(focusKey));
    if (!target || target.offsetParent === null) return;
    target.classList.add('sync-focus');
    target.scrollIntoView({ block: center ? 'center' : 'nearest', behavior: 'smooth' });
}
// Clicking a field tells the compiler which component it is, so the other panes can center on it
document.addEventListener('click', function (e) {
    var comp = e.target.closest ? e.target.closest('.formio-component') : null;
    if (!comp) return;
    var keys = Array.prototype.slice.call(comp.classList)
        .filter(function (c) { return c.indexOf('formio-component-') === 0; })
        .map(function (c) { return c.slice('formio-component-'.length); });
    parent.postMessage({ type: 'preview-click', keys: keys }, '*');
}, true);
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
    if (e.data.type === 'focus') { focusKey = e.data.key; if (!busy) applyFocus(e.data.center); }
    if (e.data.type === 'scrollTo') window.scrollTo({ top: e.data.end ? document.documentElement.scrollHeight : 0, behavior: 'smooth' });
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
        childListsOf(c).forEach(addDemo);
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
const asIsComps = new WeakSet(); // radio/select marked with @: choice values = labels exactly
let compileWarnings = []; // { row, text } shown as ⚠ in the shorthand margin; reset each compile
let formTitle = '';       // from a "# Title" line in the shorthand; '' when there isn't one
let compileHints = [];    // { row, text } shown as ⓘ in the margin (e.g. how a formula was read)
const formulaOf = new WeakMap(); // component → its "=..." formula text, resolved to keys after the whole form is built

// --- Edit Grid columns: [editgrid: !Item(xl), Qty#(s), Unit Price$, Line Total$] Materials ---
// Attached $ = currency, attached # = number (so "Part #" stays text), ! = required, (s)/(l)/(xl) = width.
const WIDTH_WEIGHTS = { s: 1, normal: 2, l: 3, xl: 5 };

function parseGridColumns(columnsStr) {
    return columnsStr.split(',').map(s => s.trim()).filter(Boolean).map(raw => {
        let text = raw;
        const required = text.startsWith('!');
        if (required) text = text.slice(1).trim();
        let width = 'normal';
        const w = text.match(/\((s|l|xl)\)\s*$/i);
        if (w) { width = w[1].toLowerCase(); text = text.slice(0, w.index).trim(); }
        let type = 'textfield';
        const marker = text.match(/[^\s]([$#])$/);
        if (marker) { type = marker[1] === '$' ? 'currency' : 'number'; text = text.slice(0, -1).trim(); }
        return { label: text, type, required, width };
    });
}

// Split 10 Bootstrap units across the columns by weight (the last 2 of 12 hold the edit/delete buttons)
function gridColumnUnits(columns) {
    const weights = columns.map(c => WIDTH_WEIGHTS[c.width]);
    const total = weights.reduce((a, b) => a + b, 0);
    const units = weights.map(w => Math.max(1, Math.round(w * 10 / total)));
    let diff = 10 - units.reduce((a, b) => a + b, 0);
    while (diff !== 0) { // nudge the widest column until the row adds up exactly
        const i = units.indexOf(Math.max(...units));
        if (diff < 0 && units[i] <= 1) break;
        units[i] += Math.sign(diff);
        diff -= Math.sign(diff);
    }
    return units;
}

// Form.io's default Edit Grid templates, with per-column widths instead of col-sm-2 for every column
function gridTemplates(widthByKey) {
    const w = JSON.stringify(widthByKey);
    return {
        header: `<div class="row">{% var w = ${w}; %}{% util.eachComponent(components, function(component) { %}{% if (displayValue(component)) { %}<div class="col-sm-{{ w[component.key] || 2 }}">{{ t(component.label) }}</div>{% } %}{% }) %}<div class="col-sm-2"></div></div>`,
        row: `<div class="row">{% var w = ${w}; %}{% util.eachComponent(components, function(component) { %}{% if (displayValue(component)) { %}<div class="col-sm-{{ w[component.key] || 2 }}">{{ isVisibleInRow(component) ? getView(component, row[component.key]) : '' }}</div>{% } %}{% }) %}{% if (!instance.options.readOnly && !instance.disabled) { %}<div class="col-sm-2"><div class="btn-group pull-right"><button class="btn btn-default btn-light btn-sm editRow"><i class="{{ iconClass('edit') }}"></i></button>{% if (!instance.hasRemoveButtons || instance.hasRemoveButtons()) { %}<button class="btn btn-danger btn-sm removeRow"><i class="{{ iconClass('trash') }}"></i></button>{% } %}</div></div>{% } %}</div>`
    };
}

// "= Line Total: Qty * Unit Price" on the line after a grid: a per-row calculated column (uses row.key)
function addRowFormula(grid, text, row) {
    const m = text.match(/^=\s*(?:"([^"]+)"|([^:]+)):(.+)$/);
    if (!m) {
        compileWarnings.push({ row, text: 'Row formula format: = Column Name: formula   (e.g. = Line Total: Qty * Unit Price)' });
        return;
    }
    const target = (m[1] || m[2]).trim();
    const column = grid.components.find(c => (c.label || '').trim().toLowerCase() === target.toLowerCase());
    if (!column) {
        compileWarnings.push({ row, text: `Row formula: this grid has no column "${target}"` });
        return;
    }
    const scope = new Map(grid.components.map(c => [(c.label || '').trim().toLowerCase(), [c.key]]));
    const { expr, problems } = translateFormula(m[3].trim(), column, scope, null, 'row');
    applyCalculation(column, expr, problems, row, `${column.label} = ${m[3].trim()} (each row)`);
}

// @ radio/select keep the label as the value; everything else gets a unique smart key
// @ values are the label with spaces → underscores ("Safety_toe_leather_footwear"): readable, and PDF/report
// tools that split values on spaces keep it as one item. Everything else gets a unique smart key.
const asIsValue = (opt) => String(opt).trim().replace(/\s+/g, '_');
const choiceValue = (comp, opt) => asIsComps.has(comp) ? asIsValue(opt) : generateSmartKey(opt);

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

        const groupKeys = new Set(groupDef.components.map(c => c.key));
        groupDef.components.forEach(comp => {
            let clone = JSON.parse(JSON.stringify(comp));
            clone.key = `${clone.key}_${i}`;
            clone.clearOnHide = false; // PREVENT DATA WIPE BUG IN EDIT MODE
            if (clone.conditional && groupKeys.has(clone.conditional.when)) {
                // Points at a sibling in this copy (e.g. bulk notes → its question): follow the renamed key.
                // If the copy is hidden, its question is empty, so this stays hidden too.
                clone.conditional = { ...clone.conditional, when: `${clone.conditional.when}_${i}` };
            } else if (condObj) {
                clone.conditional = condObj;
            }
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

function buildComponent(type, label, choicesStr, isRequired, asIs) {
    const isContainer = ['panel', 'fieldset', 'editgrid', 'datagrid', 'well', 'repeat'].includes(type);
    if (isContainer) {
        let comp = { type: type, label: label, key: generateSmartKey(label), input: type.includes('grid'), tableView: type.includes('grid'), components: [] };
        if (type === 'fieldset') comp.legend = label;
        if (type === 'panel') {
            comp.title = label; // text shown in the panel's header bar
            comp.theme = 'primary';
        }

        if (type === 'editgrid' && choicesStr) {
            const columns = parseGridColumns(choicesStr);
            const units = gridColumnUnits(columns);
            const widthByKey = {};
            comp.components = columns.map((col, i) => {
                const child = buildComponent(col.type, col.label, '', col.required);
                widthByKey[child.key] = units[i];
                return child;
            });
            comp.templates = gridTemplates(widthByKey);
        }

        if (type === 'repeat') {
            comp.max = parseInt(choicesStr) || 3;
            comp.input = false;
            comp.tableView = false;
        }
        
        return comp;
    }

    if (type === 'html') return { type: 'htmlelement', tag: choicesStr || 'p', content: label, key: generateSmartKey('html') };
    if (type === 'chart') return buildChart(label, choicesStr);
    if (type === 'content') return { type: 'content', html: label, key: generateSmartKey('content') };
    
    if (type === 'table') {
        // [table: 2x3] = 2 rows × 3 columns (fixed); [table: 2] = 2 columns, rows added as fields fill them; [table] = 3×3
        let rows = 3, cols = 3, autoRows = false;
        if (choicesStr && /x/i.test(choicesStr)) {
            const parts = choicesStr.toLowerCase().split('x');
            rows = parseInt(parts[0]) || 3;
            cols = parseInt(parts[1]) || 3;
        } else if (parseInt(choicesStr)) {
            cols = parseInt(choicesStr);
            rows = 1;
            autoRows = true;
        }
        const tableRows = Array(rows).fill(0).map(() => Array(cols).fill(0).map(() => ({ components: [] })));
        const table = { type: 'table', label: label, key: generateSmartKey(label), numRows: rows, numCols: cols, rows: tableRows, input: false, tableView: false };
        tableFill.set(table, { next: 0, autoRows, warned: false });
        return table;
    }

    if (type === 'print') return buildCleanPdfButton(label || 'Export Clean PDF');

    if (type.startsWith('fs') && type.length > 2) {
        const key = usedLookupKeys.has(type) ? generateSmartKey(type) : type;
        usedLookupKeys.add(type);
        const lookupLabel = label || lookupLabels[type] || type.charAt(2).toUpperCase() + type.slice(3);
        // Deliberately minimal: no dataSrc / data values
        const lookup = { label: lookupLabel, key: key, type: 'select', placeholder: 'Type to select...', input: true, tableView: true };
        if (type === 'fscompany') lookup.multiple = true;
        if (isRequired) lookup.validate = { required: true };
        return lookup;
    }

    const base = { label: label, key: generateSmartKey(label), type: type, input: true, tableView: true };
    if (isRequired) base.validate = { required: true };
    if (asIs && ['radio', 'select', 'selectboxes'].includes(type)) asIsComps.add(base);

    // "[currency: =Hours * Rate] Total": a formula written with labels; keys are filled in later
    const formula = choicesStr && choicesStr.startsWith('=') ? choicesStr.slice(1).trim() : null;
    if (formula) {
        formulaOf.set(base, formula);
        choicesStr = '';
    }

    if (type === 'radio' || type === 'selectboxes') {
        let optionsArray = choicesStr ? choicesStr.split(',').map(s => s.trim()).filter(s => s).map(opt => ({ label: opt, value: choiceValue(base, opt) })) : [];
        base.values = optionsArray;
    } else if (type === 'select') {
        base.dataSrc = 'values';
        let optionsArray = choicesStr ? choicesStr.split(',').map(s => s.trim()).filter(s => s).map(opt => ({ label: opt, value: choiceValue(base, opt) })) : [];
        base.data = { values: optionsArray };
    } else if (type === 'textarea') {
        base.autoExpand = true; // grows as people type, matching the Bulk Mode notes boxes (Form.io hides the drag handle)
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
    } else if (type === 'currency') {
        // Shows $1,234.56; saves the plain number 1234.56 so it can be used in calculations
        base.currency = 'USD';
        base.delimiter = true;
        base.decimalLimit = 2;
        base.requireDecimal = true;
    } else if (type === 'phonenumber') { // types arrive lowercased; Form.io's real type is camelCase
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
    const prefix = str.match(/^[!@]*/)[0]; // ! = required, @ = choice values as-is; either order
    const required = prefix.includes('!');
    const asIs = prefix.includes('@');
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
    return { type, choices, required, asIs, label };
}

// Adds one "- choice" to a radio/selectboxes/select, flagging empty and (for @) duplicate choices
function addChoice(comp, optText, row) {
    if (!['radio', 'selectboxes', 'select'].includes(comp.type)) return;
    if (!optText) {
        compileWarnings.push({ row, text: 'Empty choice: skipped' });
        return;
    }
    const list = comp.type === 'select'
        ? ((comp.data = comp.data || { values: [] }).values = comp.data.values || [])
        : (comp.values = comp.values || []);
    if (asIsComps.has(comp) && list.some(o => o.value === asIsValue(optText))) {
        compileWarnings.push({ row, text: `Duplicate choice "${optText}": two choices with the same value in one question` });
    }
    list.push({ label: optText, value: choiceValue(comp, optText) });
}

// Bulk notes: a notes box under a question. Conditional = adds the term as a choice that opens a required box;
// always = an optional box with no extra choice. Hidden notes are kept (clearOnHide: false).
function buildNotes(question, term, conditional) {
    const notes = { label: term, key: question.key + '_notes', type: 'textarea', autoExpand: true, input: true, tableView: true, clearOnHide: false };
    if (conditional) {
        const value = choiceValue(question, term);
        (question.type === 'select' ? question.data.values : question.values).push({ label: term, value });
        notes.validate = { required: true };
        notes.conditional = { show: true, when: question.key, eq: value };
    }
    return notes;
}

// "Column" or "Grid.Column" → the grids that have it. Tries each period as the split,
// because column names like "Ext. Price" contain periods too.
function findGridColumn(target, grids) {
    const find = (gridLabel, colLabel) => (grids || []).filter(g => (!gridLabel || g.label === gridLabel) && g.cols.has(colLabel));
    let col = target.toLowerCase(), matches = find(null, col);
    for (let i = target.indexOf('.'); matches.length === 0 && i !== -1; i = target.indexOf('.', i + 1)) {
        col = target.slice(i + 1).trim().toLowerCase();
        matches = find(target.slice(0, i).trim().toLowerCase(), col);
    }
    return { matches, col };
}

// Every list of child components a component holds: components, columns, and table cells
const childListsOf = (c) => [c.components || [],
    ...(c.columns || []).map(col => col.components || []),
    ...(Array.isArray(c.rows) ? c.rows : []).flatMap(r => (r || []).map(cell => (cell && cell.components) || []))];

// Tables are containers: each component typed under [table] fills the next cell, left to right, top to bottom
const tableFill = new WeakMap(); // table → { next cell index, autoRows, warned }
function addToTable(table, comp, row) {
    const state = tableFill.get(table), cols = table.numCols;
    const r = Math.floor(state.next / cols), c = state.next % cols;
    if (r >= table.rows.length) {
        if (!state.autoRows && !state.warned) {
            compileWarnings.push({ row, text: `More fields than cells in this ${table.numRows}x${cols} table: extra rows added (use [table: ${cols}] to grow rows on purpose)` });
            state.warned = true;
        }
        table.rows.push(Array(cols).fill(0).map(() => ({ components: [] })));
        table.numRows = table.rows.length;
    }
    table.rows[r][c].components.push(comp);
    state.next++;
}

// The choice list of a radio / select / selectboxes component ([] for anything else)
const choicesOf = (c) => (c && (c.type === 'select' ? (c.data && c.data.values) : c.values)) || [];

// Turn a label-based formula into JavaScript for Form.io's calculateValue.
// Tokens: SUM(Column) / SUM(Grid.Column) / SUM("Quoted"), "Quoted Label", numbers, + - * / ( ), and plain labels.
// scope maps lowercase label → keys; grids lists editgrids for SUM; mode 'data' (form fields) or 'row' (inside a grid row).
function translateFormula(formula, comp, scope, grids, mode) {
    const problems = [];
    const ref = (key) => `(Number(${mode}.${key}) || 0)`;
    const resolveLabel = (label) => {
        const keys = scope.get(label.toLowerCase()) || [];
        if (keys.length === 0) problems.push(`no field labeled "${label}"`);
        else if (keys.length > 1) problems.push(`"${label}" matches ${keys.length} fields; labels in a formula must be unique`);
        else if (keys[0] === comp.key) problems.push(`"${label}" is this field itself`);
        else return ref(keys[0]);
        return '0';
    };
    const resolveSum = (target) => {
        if (mode === 'row') { problems.push('SUM() totals a whole grid; use it in a field below the grid'); return '0'; }
        const { matches, col } = findGridColumn(target, grids);
        if (matches.length === 0) { problems.push(`SUM: no grid column "${target}"`); return '0'; }
        if (matches.length > 1) { problems.push(`SUM: "${target}" is a column in ${matches.length} grids; write SUM(Grid Name.${target})`); return '0'; }
        return `(data.${matches[0].key} || []).reduce((s, r) => s + (Number(r.${matches[0].cols.get(col)}) || 0), 0)`;
    };
    const parts = [];
    const re = /SUM\(\s*(?:"([^"]+)"|([^)]*?))\s*\)|"([^"]*)"|([+\-*/()])|([^+\-*/()"]+)/gi;
    let m;
    while ((m = re.exec(formula))) {
        if (m[1] !== undefined || m[2] !== undefined) parts.push(resolveSum((m[1] || m[2]).trim()));
        else if (m[3] !== undefined) parts.push(resolveLabel(m[3].trim()));
        else if (m[4]) parts.push(m[4]);
        else {
            const t = m[5].trim();
            if (!t) continue;
            parts.push(/^\d+(\.\d+)?$/.test(t) ? t : resolveLabel(t));
        }
    }
    if (problems.some(p => p.startsWith('no field')) && /[+\-*/()]/.test(formula)) {
        problems.push('labels containing + - * / ( ) need quotes, e.g. "Travel / Equipment"');
    }
    return { expr: parts.join(' ') || '0', problems };
}

// Read-only calculated field; only currency rounds to cents
function applyCalculation(comp, expr, problems, row, description) {
    const money = comp.type === 'currency';
    comp.calculateValue = money ? `value = Math.round((${expr}) * 100) / 100;` : `value = ${expr};`;
    comp.disabled = true; // read-only: nobody types over a total
    if (problems.length) compileWarnings.push({ row, text: 'Formula problem: ' + problems.join('; ') });
    else compileHints.push({ row, text: `Calculated: ${description} (${money ? 'rounded to cents, ' : ''}read-only, updates live)` });
}

// Labels → keys for the whole built form, shared by formulas and charts.
// Grid columns are only reachable through SUM(), not as plain labels.
function buildLabelIndex(rootComponents) {
    const keysByLabel = new Map(), outputKeys = new Set(), compByKey = new Map(), grids = [];
    const walk = (list) => list.forEach(c => {
        outputKeys.add(c.key);
        compByKey.set(c.key, c);
        if (c.input && c.label) {
            const label = c.label.trim().toLowerCase();
            keysByLabel.set(label, [...(keysByLabel.get(label) || []), c.key]);
        }
        if (c.type === 'editgrid' || c.type === 'datagrid') {
            (c.components || []).forEach(k => compByKey.set(k.key, k));
            grids.push({ label: (c.label || '').trim().toLowerCase(), key: c.key, comp: c,
                cols: new Map((c.components || []).map(k => [(k.label || '').trim().toLowerCase(), k.key])) });
        } else {
            childListsOf(c).forEach(walk);
        }
    });
    walk(rootComponents);
    return { keysByLabel, outputKeys, compByKey, grids };
}

// --- Text reports saved in the entry: SUMMARY (counts), LIST BY (grouped list), LOG (one line per entry) ---
// Fields are found by label across every [repeat] copy. The *Text functions run inside the form
// (their source is embedded in calculateValue), so they use plain ES5.

// fs lookups save whatever the app's endpoint gives (maybe just an ID). A hidden twin copies the name the
// lookup DISPLAYS into the entry as text, and reports read that.
const isLookup = (c) => !!c && c.type === 'select' && !c.dataSrc && String(c.key).startsWith('fs');
function ensureNameCopy(lookup, rootComponents, done) {
    const nameKey = lookup.key + '_name';
    if (done.has(nameKey)) return nameKey;
    done.add(nameKey);
    const twin = { label: lookup.label + ' (name)', key: nameKey, type: 'hidden', input: true, tableView: false,
        // getView returns display HTML (e.g. <span>John Smith</span>): keep just the text
        calculateValue: "var w = instance.root.getComponent('" + lookup.key + "'); var box = document.createElement('div'); " +
            "box.innerHTML = w ? String(w.getView(w.dataValue) || '') : ''; value = box.textContent.trim();" };
    insertAfter(lookup, twin, rootComponents);
    return nameKey;
}

// One report field: every copy's key (name twins for lookups), its kind, and value → label for choices
function reportField(label, ctx) {
    const keys = ctx.keysByLabel.get(label.toLowerCase()) || [];
    if (!keys.length) return { error: `no field labeled "${label}"` };
    const first = ctx.compByKey.get(keys[0]);
    const lookup = isLookup(first);
    const choices = lookup ? [] : choicesOf(first);
    return {
        t: first.label,
        kind: first.type === 'datetime' ? 'date' : 'value',
        keys: lookup ? keys.map(k => ensureNameCopy(ctx.compByKey.get(k), ctx.rootComponents, ctx.done)) : keys,
        map: Object.fromEntries(choices.map(o => [o.value, o.label])),
        choices: choices.map(o => ({ l: o.label, v: o.value }))
    };
}
const splitLabels = (s) => (s.match(/("[^"]*"|[^,])+/g) || []).map(x => x.trim().replace(/^"|"$/g, '')).filter(Boolean);

// SUMMARY: per field, each value with count and %, most frequent first, zeros hidden.
// Fields with a choice list count those choices; others (e.g. worker names) count whatever was entered.
function summaryText(sections, data) {
    var lines = [];
    sections.forEach(function (s) {
        var counts;
        if (s.choices.length) {
            counts = s.choices.map(function (c) {
                var n = 0;
                s.keys.forEach(function (k) {
                    var x = data[k];
                    if (Array.isArray(x) ? x.indexOf(c.v) !== -1 : (x && typeof x === 'object' ? x[c.v] === true : x === c.v)) n++;
                });
                return { l: c.l, n: n };
            });
        } else {
            var seen = {};
            s.keys.forEach(function (k) {
                var x = data[k];
                if (x === undefined || x === null || x === '') return;
                (Array.isArray(x) ? x : [x]).forEach(function (v) { v = String(v); seen[v] = (seen[v] || 0) + 1; });
            });
            counts = Object.keys(seen).map(function (l) { return { l: l, n: seen[l] }; });
        }
        counts = counts.filter(function (c) { return c.n > 0; }).sort(function (a, b) { return b.n - a.n || a.l.localeCompare(b.l); });
        var total = counts.reduce(function (t, c) { return t + c.n; }, 0);
        var width = counts.reduce(function (w, c) { return Math.max(w, c.l.length); }, 0) + 4;
        lines.push(s.t + ' (' + total + ' total)');
        if (!counts.length) lines.push('  Nothing recorded yet');
        counts.forEach(function (c) {
            var label = c.l + ' ';
            while (label.length < width) label += '.';
            lines.push(label + ' ' + c.n + ' (' + Math.round(c.n / total * 100) + '%)');
        });
        lines.push('');
    });
    return lines.join('\n').trim();
}

// LIST BY (grouped under the first field) and LOG (one line per entry, oldest first) over aligned records
function reportText(mode, title, fields, records, data) {
    var show = function (f, k) {
        var x = k ? data[k] : '';
        if (x === undefined || x === null || x === '') return '';
        if (f.kind === 'date') return String(x).slice(0, 10);
        var one = function (v) { return f.map[v] !== undefined ? f.map[v] : String(v); };
        if (Array.isArray(x)) return x.map(one).join(', ');
        if (typeof x === 'object') return Object.keys(x).filter(function (v) { return x[v] === true; }).map(one).join(', ');
        return one(x);
    };
    var pad = function (s, w) { while (s.length < w) s += ' '; return s; };
    var rows = records.map(function (keys) { return keys.map(function (k, i) { return show(fields[i], k); }); })
        .filter(function (r) { return r.some(function (v) { return v; }); });
    var dateCol = -1;
    fields.forEach(function (f, i) { if (dateCol === -1 && f.kind === 'date') dateCol = i; });
    if (dateCol !== -1) rows.sort(function (a, b) { return (a[dateCol] || '9999').localeCompare(b[dateCol] || '9999'); });
    var first = mode === 'listby' ? 1 : 0; // LIST BY's group field isn't repeated on each line
    var widths = fields.map(function (f, i) { return rows.reduce(function (w, r) { return Math.max(w, r[i].length); }, 0); });
    var line = function (r) {
        return r.slice(first).map(function (v, i) { return i === r.length - first - 1 ? v : pad(v, widths[i + first]); }).join('  ');
    };
    var lines = [title.toUpperCase() + ' (' + rows.length + ' entr' + (rows.length === 1 ? 'y' : 'ies') + ')'];
    if (!rows.length) lines.push('  Nothing recorded yet');
    if (mode === 'log') {
        rows.forEach(function (r, n) { lines.push(pad((n + 1) + '.', 4) + line(r)); });
    } else {
        var groups = {};
        rows.forEach(function (r) { var g = r[0] || '(not entered)'; (groups[g] = groups[g] || []).push(r); });
        Object.keys(groups).sort(function (a, b) { return groups[b].length - groups[a].length || a.localeCompare(b); })
            .forEach(function (g) {
                lines.push(g + ' (' + groups[g].length + ')');
                groups[g].forEach(function (r) { lines.push('  - ' + line(r)); });
            });
    }
    return lines.join('\n');
}

// Line up fields into records (one per [repeat] copy, matched by the _1, _2... copy number)
function reportRecords(fields) {
    if (fields.every(f => f.keys.length <= 1)) return [fields.map(f => f.keys[0] || null)];
    const copyOf = (k) => (k.match(/_(\d+)(?:_name)?$/) || [])[1];
    const byCopy = new Map();
    fields.forEach((f, i) => {
        if (f.keys.length < 2) return; // a single field outside the repeat has no copy to line up with
        f.keys.forEach(k => {
            const n = copyOf(k);
            if (!n) return;
            if (!byCopy.has(n)) byCopy.set(n, fields.map(() => null));
            byCopy.get(n)[i] = k;
        });
    });
    return [...byCopy.keys()].sort((a, b) => a - b).map(n => byCopy.get(n));
}

// Puts a new component right after an existing one, wherever it sits in the form
function insertAfter(target, newComp, rootComponents) {
    const place = (list) => {
        const i = list.indexOf(target);
        if (i !== -1) { list.splice(i + 1, 0, newComp); return true; }
        return list.some(c => childListsOf(c).some(place));
    };
    place(rootComponents);
}

// Shared setup for report textareas. The textarea holds the DATA (calculated, saved, exported) but is hidden;
// an HTML element right after it SHOWS the saved text in <pre>, so line breaks and alignment survive in
// HTML-based PDFs that collapse text-box line breaks. The display hides itself when the report is empty
// (e.g. unticked in a report picker, which clears the hidden textarea).
function finishReport(comp, code, problems, row, what, ctx) {
    // Conditionally hidden (e.g. unticked in a report picker) → empty, so nothing is saved and the display hides.
    // (instance.visible reflects conditions only; the static "hidden" below doesn't count.)
    comp.calculateValue = 'if (instance && instance.visible === false) { value = ""; } else { ' + code + ' }';
    comp.disabled = true;
    comp.hidden = true;
    comp.clearOnHide = true;
    insertAfter(comp, {
        label: (comp.label || 'Report') + ' (display)', key: comp.key + '_display', type: 'htmlelement', tag: 'div',
        input: false, tableView: false, refreshOnChange: true,
        customConditional: "show = !!data['" + comp.key + "'];",
        content: '<div style="font-weight:600;margin-bottom:4px;">' + escapeHtml(comp.label || '') + '</div>' +
            '<pre style="white-space:pre-wrap;font-family:SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;margin:0;">{{ data[\'' + comp.key + '\'] }}</pre>'
    }, ctx.rootComponents);
    if (problems.length) compileWarnings.push({ row, text: 'Report problem: ' + problems.join('; ') });
    else compileHints.push({ row, text: what + ' (saved in the entry; shown as preformatted text so line breaks survive PDFs; updates live)' });
}

function applySummary(comp, argsText, ctx, row) {
    const problems = [], sections = [];
    splitLabels(argsText).forEach(label => {
        const f = reportField(label, ctx);
        if (f.error) return problems.push(f.error);
        sections.push({ t: f.t.toUpperCase(), keys: f.keys, choices: f.choices });
    });
    if (!sections.length) problems.push('list fields to summarize: =SUMMARY(Field One, Field Two)');
    finishReport(comp, `value = (${summaryText.toString()})(${JSON.stringify(sections)}, data);`, problems, row,
        `Summary: counts of ${sections.map(s => s.t.toLowerCase()).join(', ')}`, ctx);
}

// mode 'listby': "Group: Field, Field"; mode 'log': "Field, Field"
function applyListReport(comp, mode, argsText, ctx, row) {
    const problems = [];
    let labels = splitLabels(argsText);
    if (mode === 'listby') {
        const colon = argsText.indexOf(':');
        if (colon === -1) problems.push('write it as LIST BY(Group Field: Field, Field)');
        else labels = [argsText.slice(0, colon).trim().replace(/^"|"$/g, ''), ...splitLabels(argsText.slice(colon + 1))];
    }
    const fields = [];
    labels.forEach(l => { const f = reportField(l, ctx); if (f.error) problems.push(f.error); else fields.push(f); });
    if (fields.length < (mode === 'listby' ? 2 : 1)) problems.push('list the fields to show');
    const code = `value = (${reportText.toString()})(${JSON.stringify(mode)}, ${JSON.stringify(comp.label || '')}, ` +
        `${JSON.stringify(fields.map(f => ({ t: f.t, kind: f.kind, map: f.map })))}, ${JSON.stringify(reportRecords(fields))}, data);`;
    finishReport(comp, code, problems, row, mode === 'listby'
        ? `List: ${fields.slice(1).map(f => f.t).join(', ')} grouped by ${fields[0] ? fields[0].t : '?'}`
        : `Log: one line per entry with ${fields.map(f => f.t).join(', ')}, oldest first`, ctx);
}

// Top-level "[currency: =...]" formulas (and text reports), resolved once the whole form exists (labels can point anywhere)
function resolveFormulas(pending, rootComponents) {
    const { keysByLabel, outputKeys, compByKey, grids } = buildLabelIndex(rootComponents);
    const ctx = { keysByLabel, compByKey, rootComponents, done: new Set() };

    pending.forEach(({ comp, formula, row }) => {
        if (!outputKeys.has(comp.key)) {
            compileWarnings.push({ row, text: "Formulas inside a [repeat] or grid row aren't supported this way: ignored" });
            return;
        }
        const summary = formula.match(/^SUMMARY\((.*)\)$/i);
        if (summary) return applySummary(comp, summary[1], ctx, row);
        const listBy = formula.match(/^LIST\s+BY\((.*)\)$/i);
        if (listBy) return applyListReport(comp, 'listby', listBy[1], ctx, row);
        const log = formula.match(/^LOG\((.*)\)$/i);
        if (log) return applyListReport(comp, 'log', log[1], ctx, row);
        const { expr, problems } = translateFormula(formula, comp, keysByLabel, grids, 'data');
        applyCalculation(comp, expr, problems, row, `${comp.label} = ${formula}`);
    });
}

// --- Clean PDF: [print] Export Clean PDF ---
// Prints ONLY the form: copies it (with typed values, signatures as images) into an invisible print page that
// carries the app's stylesheets, adds a title/date header, and prints that. Nothing around the form can get in,
// whatever the app's layout. The PDF is named "Form Title - YYYY-MM-DD". Installed by the button's own HTML
// template, so it works on new and saved entries, in Edit and View.
// Its source lives in a hidden field's customConditional (re-checked whenever the form draws, in Edit and View),
// not in the button's HTML: the builder previews HTML content and a huge string stretches its layout.
function cleanPdfRun(btn) {
    var root = btn.closest('.formio-form') || btn.closest('form') || document.body;
    var clone = root.cloneNode(true);

    // Carry typed values over (cloning copies markup, not what was typed)
    var src = root.querySelectorAll('input, textarea, select'), dst = clone.querySelectorAll('input, textarea, select');
    for (var i = 0; i < src.length && i < dst.length; i++) {
        var s = src[i], d = dst[i];
        if (s.type === 'checkbox' || s.type === 'radio') {
            if (s.checked) d.setAttribute('checked', 'checked'); else d.removeAttribute('checked');
        } else if (s.tagName === 'SELECT') {
            for (var j = 0; j < s.options.length; j++) if (s.options[j].selected && d.options[j]) d.options[j].setAttribute('selected', 'selected');
        } else if (s.tagName === 'TEXTAREA') {
            // A div shows the full text; a textarea would cut long answers off
            var box = document.createElement('div');
            box.className = 'form-control clean-pdf-text';
            box.textContent = s.value;
            d.parentNode.replaceChild(box, d);
        } else {
            d.setAttribute('value', s.value);
        }
    }

    // Signatures and other drawings → images
    var srcCanvas = root.querySelectorAll('canvas'), dstCanvas = clone.querySelectorAll('canvas');
    for (var k = 0; k < srcCanvas.length && k < dstCanvas.length; k++) {
        try {
            var img = document.createElement('img');
            img.src = srcCanvas[k].toDataURL('image/png');
            img.style.maxWidth = '100%';
            dstCanvas[k].parentNode.replaceChild(img, dstCanvas[k]);
        } catch (err) { /* tainted canvas: leave it */ }
    }

    // Strip clutter: buttons, the print button itself, error text
    clone.querySelectorAll('button, .no-print, .formio-errors, .invalid-feedback, .choices__button, .signature-pad-refresh').forEach(function (el) { el.remove(); });

    var heading = root.querySelector('.card-title, legend, h1, h2, h3');
    var title = ((heading && heading.textContent) || document.title || 'Form').trim().replace(/\s+/g, ' ');
    var now = new Date();
    var stamp = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    var pdfName = (title + ' - ' + stamp).replace(/[\\/:*?"<>|]+/g, '-');
    var esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    var styles = Array.prototype.map.call(document.querySelectorAll('link[rel="stylesheet"], style'), function (n) { return n.outerHTML; }).join('');
    var css = 'body.clean-pdf { background: #fff; margin: 0; padding: 0; } ' +
        '.clean-pdf-header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 14px; font-size: 12px; } ' +
        '.clean-pdf-header strong { font-size: 16px; } ' +
        '.clean-pdf-text { height: auto; min-height: 38px; white-space: pre-wrap; } ' +
        '.form-group { break-inside: avoid; } ' +
        '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } ' +
        '@page { margin: 0.5in; @bottom-right { content: "Page " counter(page) " of " counter(pages); font-size: 9pt; } } ';

    var frame = document.createElement('iframe');
    frame.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: 0; visibility: hidden;';
    document.body.appendChild(frame);
    var doc = frame.contentDocument;
    doc.open();
    doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + esc(pdfName) + '</title>' + styles +
        '<style>' + css + '</style></head><body class="clean-pdf"><div class="clean-pdf-header"><strong>' + esc(title) +
        '</strong><span>Printed ' + esc(now.toLocaleString()) + '</span></div></body></html>');
    doc.close();
    doc.body.appendChild(doc.importNode(clone, true));

    // Print once the app's stylesheets have loaded in the print page (or after 3s at the latest)
    var links = doc.querySelectorAll('link[rel="stylesheet"]'), waiting = links.length, done = false;
    var go = function () {
        if (done) return;
        done = true;
        var oldTitle = document.title;
        document.title = pdfName; // some browsers name the PDF after the main page
        frame.contentWindow.focus();
        frame.contentWindow.print();
        setTimeout(function () { document.title = oldTitle; }, 1000);
        setTimeout(function () { frame.remove(); }, 60000);
    };
    links.forEach(function (l) { l.addEventListener('load', function () { if (--waiting <= 0) go(); }); l.addEventListener('error', function () { if (--waiting <= 0) go(); }); });
    if (!waiting) setTimeout(go, 50);
    setTimeout(go, 3000);
}

function buildCleanPdfButton(text) {
    const icon = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style="vertical-align:-2px;margin-right:6px;" aria-hidden="true">' +
        '<path d="M4 0h5.5L14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5 1.5V5h3.5L9 1.5zM5 8h6v1H5V8zm0 2h6v1H5v-1zm0 2h4v1H5v-1z"/></svg>';
    // Installer: runs on every conditional check (cheap after the first), keeps the hidden field "shown"
    const install = 'if (!window.__formioCleanPdf) {\n' +
        '  window.__formioCleanPdf = ' + cleanPdfRun.toString() + ';\n' +
        '  document.addEventListener("click", function (e) {\n' +
        '    var b = e.target.closest ? e.target.closest(".js-clean-pdf") : null;\n' +
        '    if (b) { e.preventDefault(); window.__formioCleanPdf(b); }\n' +
        '  });\n' +
        '}\nshow = true;';
    // An invisible Field Set (no legend) keeps [print] one draggable item; no-print keeps it out of the PDF
    return {
        label: text, legend: '', key: generateSmartKey('cleanPdf'), type: 'fieldset',
        input: false, tableView: false, customClass: 'no-print',
        components: [
            { label: 'Clean PDF Installer', key: generateSmartKey('cleanPdfInstaller'), type: 'hidden',
                input: true, tableView: false, persistent: false, clearOnHide: false, customConditional: install },
            { label: text, key: generateSmartKey('cleanPdfButton'), type: 'htmlelement', tag: 'div', input: false, tableView: false,
                // Only in read-only view (the card); hidden while filling out a new entry or editing
                customConditional: 'show = !!(instance && instance.options && instance.options.readOnly);',
                content: '<div style="text-align:right;"><button type="button" class="btn btn-outline-primary btn-sm js-clean-pdf" ' +
                    'title="Creates a clean, print-ready PDF of this form (charts and signatures included). Choose Save as PDF in the print window.">' +
                    icon + escapeHtml(text) + '</button></div>' }
        ]
    };
}

// --- Charts: [chart: Labor Total, Materials Total, SUM(Ext. Price)] Cost Breakdown ---
// A live HTML Element (refreshOnChange) drawing horizontal bars with inline styles and Bootstrap bg-* colors,
// so it looks the same in the Preview, the app, a viewed entry and a printout.
const CHART_COLORS = ['primary', 'success', 'info', 'secondary', 'dark', 'warning', 'danger'];
const chartOf = new WeakMap(); // chart component → its item list text, resolved once the whole form exists
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildChart(title, itemsStr) {
    const chart = { type: 'htmlelement', tag: 'div', label: title || 'Chart', key: generateSmartKey(title || 'chart'),
        input: false, tableView: false, refreshOnChange: true, content: '' };
    chartOf.set(chart, itemsStr || '');
    return chart;
}

// Shared bar drawing. setupJs must define `var items = [{ l: label, v: value, m: isMoney, c: bootstrapColor }]`.
function chartHtml(title, setupJs) {
    return `{% ${setupJs}
var total = 0, max = 0;
items.forEach(function (i) { i.v = Number(i.v) || 0; if (i.v > 0) { total += i.v; if (i.v > max) max = i.v; } }); %}
<div style="font-weight:600;margin-bottom:8px;">${escapeHtml(title)}</div>
{% if (!items.length) { %}<div style="color:#6c757d;">Nothing to chart yet.</div>{% } %}
{% items.forEach(function (i) {
    var w = max > 0 && i.v > 0 ? i.v / max * 100 : 0;
    var pct = total > 0 && i.v > 0 ? Math.round(i.v / total * 100) : 0;
    var amt = i.m ? i.v.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : i.v.toLocaleString('en-US'); %}
<div style="display:flex;align-items:center;margin:4px 0;">
  <div style="width:30%;padding-right:8px;">{{ i.l }}</div>
  <div style="flex:1;background:#e9ecef;border-radius:4px;height:18px;overflow:hidden;"><div class="bg-{{ i.c }}" style="width:{{ w }}%;height:100%;"></div></div>
  <div style="width:30%;padding-left:8px;text-align:right;white-space:nowrap;">{{ amt }} ({{ pct }}%)</div>
</div>
{% }); %}`;
}

// "[chart: COUNT BY(Near Miss Type)] Title": one bar per choice that was picked in a grid column,
// most frequent first, zero counts hidden. Multi-selects count each picked value.
function resolveCountByChart(comp, target, grids, compByKey, row) {
    const { matches, col } = findGridColumn(target, grids);
    if (matches.length !== 1) {
        compileWarnings.push({ row, text: matches.length ? `Chart problem: "${target}" is a column in ${matches.length} grids; write COUNT BY(Grid Name.${target})`
            : `Chart problem: COUNT BY: no grid column "${target}"` });
        comp.content = chartHtml(comp.label, 'var items = [];');
        return;
    }
    const grid = matches[0], column = compByKey.get(grid.cols.get(col));
    const choices = choicesOf(column).map(o => ({ l: o.label, v: o.value }));
    if (!choices.length) {
        compileWarnings.push({ row, text: `Chart problem: COUNT BY needs a radio or select column with choices; "${column.label}" is a ${column.type}` });
        comp.content = chartHtml(comp.label, 'var items = [];');
        return;
    }
    comp.content = chartHtml(comp.label,
`var rows = data.${grid.key} || [], colors = ${JSON.stringify(CHART_COLORS)};
var items = ${JSON.stringify(choices)}.map(function (c) {
    return { l: c.l, v: rows.filter(function (r) { var x = r.${column.key}; return Array.isArray(x) ? x.indexOf(c.v) !== -1 : x === c.v; }).length };
}).filter(function (i) { return i.v > 0; }).sort(function (a, b) { return b.v - a.v; });
items.forEach(function (i, n) { i.m = false; i.c = colors[n % colors.length]; });`);
    compileHints.push({ row, text: `Chart: how many rows picked each ${column.label} (most frequent first, zero counts hidden, updates live)` });
}

function resolveCharts(pending, rootComponents) {
    const { keysByLabel, outputKeys, compByKey, grids } = buildLabelIndex(rootComponents);
    pending.forEach(({ comp, itemsStr, row }) => {
        if (!outputKeys.has(comp.key)) {
            compileWarnings.push({ row, text: "Charts inside a [repeat] or grid row aren't supported: ignored" });
            return;
        }
        const countBy = itemsStr.trim().match(/^COUNT\s+BY\(\s*"?([^")]*)"?\s*\)$/i);
        if (countBy) return resolveCountByChart(comp, countBy[1].trim(), grids, compByKey, row);
        const problems = [];
        // Split on commas outside quotes; each item is a label, a "quoted label" or SUM(Column)
        const items = (itemsStr.match(/("[^"]*"|[^,])+/g) || []).map(s => s.trim()).filter(Boolean).map((text, i) => {
            const { expr, problems: p } = translateFormula(text, comp, keysByLabel, grids, 'data');
            problems.push(...p);
            const sum = text.match(/^SUM\(\s*"?([^")]*)"?\s*\)$/i);
            let label = sum ? sum[1].trim() : text.replace(/^"|"$/g, '');
            // Currency formatting follows the source field (for SUM, the grid column)
            const keyMatch = expr.match(sum ? /\br\.(\w+)\)/ : /\bdata\.(\w+)\)/); // SUM → the column, not the grid
            const source = keyMatch && compByKey.get(keyMatch[1]);
            if (source && !['number', 'currency'].includes(source.type)) problems.push(`"${label}" is a ${source.type}, not a number or currency field`);
            if (source && source.label) label = sum ? `${source.label} (total)` : source.label;
            return { label, expr, money: !!source && source.type === 'currency', color: CHART_COLORS[i % CHART_COLORS.length] };
        });
        if (items.length === 0) problems.push('list the fields to chart: [chart: Field One, Field Two] Title');

        const itemsJs = items.map(it => `{ l: ${JSON.stringify(it.label)}, v: ${it.expr}, m: ${it.money}, c: "${it.color}" }`).join(',\n');
        comp.content = chartHtml(comp.label, `var items = [\n${itemsJs}\n];`);
        if (problems.length) compileWarnings.push({ row, text: 'Chart problem: ' + problems.join('; ') });
        else compileHints.push({ row, text: `Chart: ${items.map(it => it.label).join(', ')} (bars + % of total, updates live)` });
    });
}

// "~showWhen: Near Miss Type = Other": show this field only when another field (by label) has that value.
// Inside a grid row it checks the same row first. Choices match by label or value, so it works with or without @.
// A required field that's hidden isn't validated, so "!" + showWhen = required only when shown.
// Sets one showWhen conditional. findKeys(label) → candidate keys; getComp(key) → component; scope = hint suffix
function setShowWhen(comp, text, row, findKeys, getComp, scope) {
    const warn = (t) => compileWarnings.push({ row, text: 'Show when: ' + t });
    const m = text.match(/^\s*"?([^"=]+?)"?\s*=\s*"?(.*?)"?\s*$/);
    if (!m || !m[2]) return warn('write it as ~showWhen: Field Label = Value');
    const label = m[1].trim(), wanted = m[2].trim();
    const keys = findKeys(label);
    if (keys.length === 0) return warn(`no field labeled "${label}"${scope ? scope.replace(/^ \(in/, ' in') : ''}`);
    if (keys.length > 1) return warn(`"${label}" matches ${keys.length} fields; labels used in showWhen must be unique`);
    if (keys[0] === comp.key) return warn(`"${label}" is this field itself`);
    const source = getComp(keys[0]);
    const choices = choicesOf(source);
    let eq = wanted;
    if (choices.length) {
        const choice = choices.find(o => String(o.label).toLowerCase() === wanted.toLowerCase() || String(o.value) === wanted);
        if (!choice) return warn(`"${wanted}" isn't one of ${source.label}'s choices`);
        eq = choice.value;
    }
    comp.conditional = { show: true, when: keys[0], eq };
    compileHints.push({ row, text: `Shows only when ${source.label} = ${wanted}${scope}` });
}

// Inside a [repeat]: resolved right away against the field's siblings in the group, before the copies are made.
// The repeater then points each copy's conditional at the same copy's field.
function showWhenInRepeat(comp, text, row, repeat) {
    const siblings = repeat.components;
    setShowWhen(comp, text, row,
        (label) => siblings.filter(c => c.input && (c.label || '').trim().toLowerCase() === label.toLowerCase()).map(c => c.key),
        (key) => siblings.find(c => c.key === key), ' (in the same copy)');
}

function resolveShowWhen(pending, rootComponents) {
    const { keysByLabel, compByKey, grids } = buildLabelIndex(rootComponents);
    pending.forEach(({ comp, text, row }) => {
        const grid = grids.find(g => (g.comp.components || []).includes(comp));
        setShowWhen(comp, text, row, (label) => {
            const inRow = grid && grid.cols.has(label.toLowerCase()) ? [grid.cols.get(label.toLowerCase())] : [];
            return inRow.length ? inRow : (keysByLabel.get(label.toLowerCase()) || []);
        }, (key) => compByKey.get(key), grid ? ' (in the same row)' : '');
    });
}

// Safety pass: every component gets a label, like the Form.io builder gives them.
// Some platform viewers lowercase every component's label and crash on one without (blank entry card).
// Only fills labels that are missing entirely; Content/HTML never display their label.
const DEFAULT_LABELS = { content: 'Content', htmlelement: 'HTML' };
function ensureLabels(list) {
    (list || []).forEach(c => {
        if (!c) return;
        if (c.label === undefined) c.label = DEFAULT_LABELS[c.type] || (c.type ? c.type.charAt(0).toUpperCase() + c.type.slice(1) : 'Component');
        ensureLabels(c.components);
        (c.columns || []).forEach(col => ensureLabels(col.components));
        (Array.isArray(c.rows) ? c.rows : []).forEach(r => (r || []).forEach(cell => ensureLabels(cell && cell.components)));
    });
}

function flagUnusedAsIs(def, row) {
    if (def && def.asIs && !['radio', 'select', 'selectboxes'].includes(def.type)) {
        compileWarnings.push({ row, text: '@ only applies to radio, select and checkbox-list choices: ignored here' });
    }
}

function compileShorthand() {
    const lines = shorthand.session.getDocument().getAllLines();
    const lineComps = []; // source row → component it produced (for cursor sync)
    usedLookupKeys = new Set();
    compileWarnings = [];
    compileHints = [];
    formTitle = '';
    const pendingFormulas = [];
    const pendingCharts = [];
    const pendingShowWhen = [];
    let rootComponents = [];
    let containerStack = [];
    let inBulkMode = false;
    let bulkDef = null;
    let lastFieldComponent = null;
    let settingsTarget = null;   // component (or bulk block) that a "~" line under it applies to
    const settingEntries = [];   // re-applied after formulas so ~ always wins over compiler defaults
    settingTargetTypes = [];

    // Bulk block settings apply to every question in the block, once the block is complete
    const applyBulkSettings = (bd) => {
        if (!bd || !bd.settings) return;
        bd.questions.forEach((q, n) => bd.settings.forEach(s => {
            applySetting(q, s.setting, s.row, n === 0);
            settingEntries.push({ comp: q, setting: s.setting, row: s.row });
        }));
    };

    let currentRow = 0;
    const pushComponent = (comp) => {
        const parent = containerStack[containerStack.length - 1];
        if (!parent) rootComponents.push(comp);
        else if (parent.type === 'table') addToTable(parent, comp, currentRow);
        else parent.components.push(comp);
    };

    for (let i = 0; i < lines.length; i++) {
        currentRow = i;
        let line = lines[i].trim();
        if (!line) {
            lastFieldComponent = null;
            settingsTarget = null;
            if (containerStack.length > 0) {
                let popped = containerStack.pop();
                if (popped.type === 'repeat') {
                    let unrolled = unrollRepeatGroup(popped);
                    unrolled.forEach(c => pushComponent(c));
                }
            }
            continue; 
        }

        if (/^#\s/.test(line)) {
            // "# Near Miss Log": the form's name (download file name, default favorite name); not a component
            formTitle = line.slice(1).trim();
            continue;
        }

        if (line.startsWith('+++')) {
            lastFieldComponent = null;
            if (inBulkMode) { applyBulkSettings(bulkDef); inBulkMode = false; bulkDef = null; settingsTarget = null; }
            else {
                inBulkMode = true;
                bulkDef = parseComponentDef(line.substring(3).trim());
                bulkDef.markdownChoices = [];
                bulkDef.settings = [];
                bulkDef.questions = [];
                settingsTarget = bulkDef;
                settingTargetTypes[i] = formioTypeOf(bulkDef.type);
                flagUnusedAsIs(bulkDef, i);
                // Text after the bracket switches on notes: "Notes?" = conditional + required, "Notes" = always + optional
                const term = (bulkDef.label || '').trim();
                bulkDef.notesConditional = term.endsWith('?');
                bulkDef.notesTerm = bulkDef.notesConditional ? term.slice(0, -1).trim() : term;
                bulkDef.row = i;
                if (bulkDef.notesTerm && !['radio', 'select'].includes(bulkDef.type)) {
                    compileWarnings.push({ row: i, text: `Notes ("${term}") only work with radio and select bulk blocks: ignored` });
                    bulkDef.notesTerm = '';
                }
            }
            continue;
        }

        if (line.startsWith('~')) {
            // ~ setting: applies to the component (or bulk block) directly above, until a blank line
            const setting = parseSettingLine(line);
            if (!setting) {
                compileWarnings.push({ row: i, text: 'Setting format: ~name or ~name: value   (e.g. ~rows: 5)' });
            } else if (!settingsTarget) {
                compileWarnings.push({ row: i, text: 'A ~ setting must sit under the component it belongs to, with no blank line in between' });
            } else if (setting.path === 'showWhen') {
                // Compiler setting: inside a [repeat] it's resolved now (before the copies exist); elsewhere once the whole form exists
                const repeat = containerStack[containerStack.length - 1];
                if (settingsTarget === bulkDef) compileWarnings.push({ row: i, text: "~showWhen isn't supported under a +++ bulk block" });
                else if (repeat && repeat.type === 'repeat' && repeat.components.includes(settingsTarget)) showWhenInRepeat(settingsTarget, String(setting.value), i, repeat);
                else pendingShowWhen.push({ comp: settingsTarget, text: String(setting.value), row: i });
                lineComps[i] = settingsTarget;
            } else if (settingsTarget === bulkDef) {
                bulkDef.settings.push({ setting, row: i });
            } else {
                applySetting(settingsTarget, setting, i, true);
                settingEntries.push({ comp: settingsTarget, setting, row: i });
                lineComps[i] = settingsTarget;
            }
            settingTargetTypes[i] = !settingsTarget ? null : settingsTarget === bulkDef ? formioTypeOf(bulkDef.type) : settingsTarget.type;
            continue;
        }

        if (inBulkMode && bulkDef) {
            settingTargetTypes[i] = formioTypeOf(bulkDef.type);
            if (line.startsWith('- ') || line === '-') {
                // Flag once here, not once per question below
                const opt = line.substring(2).trim();
                if (!opt) {
                    compileWarnings.push({ row: i, text: 'Empty choice: skipped' });
                } else {
                    if (bulkDef.asIs && bulkDef.markdownChoices.includes(opt)) {
                        compileWarnings.push({ row: i, text: `Duplicate choice "${opt}": two choices with the same value in one question` });
                    }
                    bulkDef.markdownChoices.push(opt);
                }
                continue;
            }

            const comp = buildComponent(bulkDef.type, line, bulkDef.choices, bulkDef.required, bulkDef.asIs);
            if (bulkDef.markdownChoices.length > 0) {
                if (comp.type === 'radio' || comp.type === 'selectboxes') {
                    comp.values = comp.values || [];
                    bulkDef.markdownChoices.forEach(opt => {
                        comp.values.push({ label: opt, value: choiceValue(comp, opt) });
                    });
                } else if (comp.type === 'select') {
                    comp.data = comp.data || { values: [] };
                    comp.data.values = comp.data.values || [];
                    bulkDef.markdownChoices.forEach(opt => {
                        comp.data.values.push({ label: opt, value: choiceValue(comp, opt) });
                    });
                }
            }
            pushComponent(comp);
            lineComps[i] = comp;
            bulkDef.questions.push(comp);
            if (bulkDef.notesTerm) {
                const listed = (comp.type === 'select' ? comp.data.values : comp.values).map(o => o.label);
                if (bulkDef.notesConditional && listed.includes(bulkDef.notesTerm) && !bulkDef.flaggedDup) {
                    compileWarnings.push({ row: bulkDef.row, text: `"${bulkDef.notesTerm}" is already a listed choice; it's added automatically, so it will appear twice` });
                    bulkDef.flaggedDup = true;
                }
                pushComponent(buildNotes(comp, bulkDef.notesTerm, bulkDef.notesConditional));
            }
            continue;
        }

        if (line.startsWith('=')) {
            // Row formula: must sit right under its [editgrid: ...] line (or another row formula)
            const grid = containerStack[containerStack.length - 1];
            if (grid && grid.type === 'editgrid') {
                lineComps[i] = grid;
                settingTargetTypes[i] = grid.type;
                addRowFormula(grid, line, i);
            } else {
                compileWarnings.push({ row: i, text: 'A "= Column: formula" line must come right after its [editgrid: ...] line' });
            }
            lastFieldComponent = null;
            continue;
        }

        if (line.match(/^[!@]*\[/)) {
            const def = parseComponentDef(line);
            if (def) {
                flagUnusedAsIs(def, i);
                const comp = buildComponent(def.type, def.label, def.choices, def.required, def.asIs);
                lineComps[i] = comp;
                settingsTarget = comp;
                settingTargetTypes[i] = comp.type;
                if (def.type === 'editgrid' && def.choices && comp.components.length > 5) {
                    compileWarnings.push({ row: i, text: `${comp.components.length} columns: more than 5 can get cramped in the saved-rows table` });
                }
                if (formulaOf.has(comp)) pendingFormulas.push({ comp, formula: formulaOf.get(comp), row: i });
                if (chartOf.has(comp)) pendingCharts.push({ comp, itemsStr: chartOf.get(comp), row: i });
                if (['panel', 'fieldset', 'editgrid', 'datagrid', 'well', 'repeat', 'table'].includes(def.type)) {
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
        } else if ((line.startsWith('- ') || line === '-') && lastFieldComponent) {
            lineComps[i] = lastFieldComponent;
            settingTargetTypes[i] = lastFieldComponent.type;
            addChoice(lastFieldComponent, line.substring(2).trim(), i);
        } else {
            lastFieldComponent = null;
            settingsTarget = null;
        }
    }
    if (inBulkMode) applyBulkSettings(bulkDef); // block left open at the end

    while (containerStack.length > 0) {
        let popped = containerStack.pop();
        if (popped.type === 'repeat') {
            let unrolled = unrollRepeatGroup(popped);
            unrolled.forEach(c => pushComponent(c));
        }
    }
    resolveFormulas(pendingFormulas, rootComponents);
    resolveCharts(pendingCharts, rootComponents);
    resolveShowWhen(pendingShowWhen, rootComponents);
    settingEntries.forEach(e => applySetting(e.comp, e.setting, e.row, false)); // ~ wins over formulas and defaults
    ensureLabels(rootComponents);

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
    settingJson = true;
    editor.setValue(JSON.stringify(finalOutput, null, 2), -1);
    settingJson = false;
    editor.session.setScrollTop(scrollTop);

    // Resolve each line's component to its key in the output (repeat copies are suffixed _1, _2, ...)
    const outputKeys = new Set();
    const collectKeys = (list) => list.forEach(c => { outputKeys.add(c.key); childListsOf(c).forEach(collectKeys); });
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

// Download: mobile → share sheet; desktop → straight to Downloads, no dialog.
// Named after the form (first panel/field set title, or first label); the browser adds (1), (2)... if the name exists.
document.getElementById('btn-download').addEventListener('click', async () => {
    const jsonStr = editor.getValue();
    const first = lastComponents[0] || {};
    const formName = String(formTitle || first.title || first.legend || first.label || 'form_schema').replace(/[\\/:*?"<>|]+/g, '-').trim().slice(0, 80) || 'form_schema';
    const suggestedName = formName + '.json';

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1); // iPadOS reports as Mac
    if (isMobile && navigator.canShare) {
        const file = new File([jsonStr], suggestedName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
            try { await navigator.share({ files: [file], title: suggestedName }); } catch (e) {} // dismissed
            return;
        }
    }

    const url = URL.createObjectURL(new Blob([jsonStr], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    a.click();
    URL.revokeObjectURL(url);
});

// --- Favorites Logic ---
const favModal = document.getElementById('fav-modal');
document.getElementById('btn-close-fav').addEventListener('click', () => favModal.classList.add('hidden'));

document.getElementById('btn-save-fav').addEventListener('click', () => {
    const name = prompt("Enter a name for this favorite session:", formTitle);
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
        // Built-in templates ship with the app, so backups only carry your own favorites
        const favs = req.result.filter(f => f.date !== 'System Default');
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
            
            // Merge: skip built-in templates and exact duplicates; same name with different content → "Name (imported)"
            const tx = db.transaction('favorites', 'readwrite');
            const store = tx.objectStore('favorites');
            const existingReq = store.getAll();
            let count = 0, skipped = 0;
            existingReq.onsuccess = () => {
                const existing = existingReq.result;
                const same = new Set(existing.map(f => f.name + '\u0000' + f.shorthand));
                const names = new Set(existing.map(f => f.name));
                favs.forEach(f => {
                    delete f.id;
                    if (!f.name || !f.shorthand) return;
                    if (f.date === 'System Default' || same.has(f.name + '\u0000' + f.shorthand)) { skipped++; return; }
                    if (names.has(f.name)) f.name += ' (imported)';
                    same.add(f.name + '\u0000' + f.shorthand);
                    names.add(f.name);
                    store.add(f);
                    count++;
                });
            };
            tx.oncomplete = () => {
                alert(`Imported ${count} favorite${count === 1 ? '' : 's'}` + (skipped ? `, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'} or built-in template${skipped === 1 ? '' : 's'}.` : '.'));
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
    { name: 'editgridcols', desc: 'Edit Grid with $ / # columns + row total', syntax: '[editgrid: ${2:Item(xl), Qty#(s), Price$, Line Total$}] ${1:Items}\n= ${3:Line Total: Qty * Price}' },
    { name: 'datagrid', desc: 'Data Grid', syntax: '[datagrid] ${1:Data Grid}' },
    { name: 'well', desc: 'Well Container', syntax: '[well] ${1:Well}' },
    { name: 'table', desc: 'Table Layout', syntax: '[table: ${2:2x2}] ${1:Table}' },
    { name: 'sidebyside', desc: 'Two fields side by side (no table)', syntax: '[${1:textfield}] ${2:Left Field}\n~customClass: "d-inline-block w-50 align-top pr-2"\n[${3:textfield}] ${4:Right Field}\n~customClass: "d-inline-block w-50 align-top"' },
    { name: 'textfield', desc: 'Text Field', syntax: '[textfield] ${1:Text Field}' },
    { name: 'textarea', desc: 'Text Area', syntax: '[textarea] ${1:Text Area}' },
    { name: 'number', desc: 'Number Input', syntax: '[number] ${1:Number}' },
    { name: 'numberrange', desc: 'Number (Min/Max)', syntax: '[number: ${2:1-5}] ${1:Number}' },
    { name: 'currency', desc: 'US Dollars ($)', syntax: '[currency] ${1:Amount}' },
    { name: 'total', desc: 'Calculated $ Total', syntax: '[currency: =${2:Hours * Rate}] ${1:Total}' },
    { name: 'chart', desc: 'Live bar chart of fields', syntax: '[chart: ${2:Field One, Field Two}] ${1:Chart Title}' },
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
    { name: 'print', desc: 'Export Clean PDF button', syntax: '[print] ${1:Export Clean PDF}' },
    { name: 'bulk', desc: 'Bulk Mode Wrapper', syntax: '+++ ![radio]\n- ${1:Choice 1}\n- ${2:Choice 2}\n${3:Question 1}\n${4:Question 2}\n+++' },
    { name: 'bulknotesif', desc: 'Bulk + notes when picked', syntax: '+++ ![radio] ${1:Notes}?\n- ${2:Choice 1}\n- ${3:Choice 2}\n${4:Question 1}\n${5:Question 2}\n+++' },
    { name: 'bulknotes', desc: 'Bulk + always-on notes', syntax: '+++ ![radio] ${1:Notes}\n- ${2:Choice 1}\n- ${3:Choice 2}\n${4:Question 1}\n${5:Question 2}\n+++' }
];

const stripPlaceholders = (syntax) => syntax.replace(/\$\{\d+:([^}]*)\}/g, '$1');

// Typing [ opens the menu; typed letters filter it; Enter/Tab inserts with the first placeholder selected
shorthand.completers = [{
    id: 'shorthandTags',
    identifierRegexps: [/[\[~\w.]/], // shared with the ~ settings menu so both see their full prefix
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
initSettings(); // adds the ~ settings menu (settings.js)

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
    compileWarnings.forEach(w => annotations.push({ row: w.row, column: 0, type: 'warning', text: w.text }));
    compileHints.forEach(h => annotations.push({ row: h.row, column: 0, type: 'info', text: h.text }));
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

// --- Cursor Sync: all three panes follow one component, centered ---
// The source can be the shorthand cursor, a click in the Preview, or the JSON cursor (including Ctrl+F matches).
// The other panes center on it whenever the component changes; the pane you're working in isn't moved.
let lineKeys = [];
let syncTimer = null;
let jsonSyncTimer = null;
let jsonSyncMarker = null;
let lastSyncKey = null;
let movingShorthand = false; // our own cursor moves shouldn't trigger a sync of their own
let settingJson = false;     // recompiling rewrites the JSON pane; those cursor moves aren't the user's

function scheduleSync() {
    if (movingShorthand) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncToCursor, 120);
}

function syncToCursor() {
    let row = shorthand.getCursorPosition().row;
    while (row >= 0 && !lineKeys[row]) row--; // blank or plain line: use the component above it
    syncAll(row >= 0 ? lineKeys[row] : null, 'shorthand');
}

// Shorthand row for a component key; repeat copies (key_2, key_3...) map to the line of copy 1
function rowForKey(key) {
    if (!key) return -1;
    let row = lineKeys.indexOf(key);
    const base = key.replace(/_\d+$/, '');
    if (row === -1) row = lineKeys.indexOf(base + '_1');
    if (row === -1) row = lineKeys.indexOf(base);
    return row;
}

function syncAll(key, source) {
    const changed = key !== lastSyncKey;
    lastSyncKey = key;
    highlightJson(key, changed && source !== 'json');
    if (source !== 'shorthand' && changed) {
        const row = rowForKey(key);
        if (row !== -1) {
            movingShorthand = true;
            shorthand.selection.moveTo(row, 0);
            shorthand.scrollToLine(row, true, true, () => {});
            setTimeout(() => { movingShorthand = false; }, 0);
        }
    }
    if (previewFrame && previewReady && layout.previewOpen) {
        previewFrame.contentWindow.postMessage({ type: 'focus', key, center: changed && source !== 'preview' }, '*');
    }
}

// The component whose { ... } block contains this JSON row (skips "validate": { } and choice objects)
function jsonKeyAtRow(row) {
    const lines = editor.session.getDocument().getAllLines();
    let limit = lines[row] ? lines[row].search(/\S/) + 1 : 0; // only objects that open above, less indented, enclose the row
    for (let r = row; r >= 0; r--) {
        const line = lines[r], indent = line.search(/\S/);
        if (indent < 0 || indent >= limit || !/\{$/.test(line.trim())) continue;
        limit = indent;
        if (line.trim() !== '{') continue;
        const keyStart = ' '.repeat(indent + 2) + '"key": ', close = ' '.repeat(indent) + '}';
        for (let s = r + 1; s < lines.length && !lines[s].startsWith(close); s++) {
            if (lines[s].startsWith(keyStart)) return JSON.parse(lines[s].slice(keyStart.length).replace(/,$/, ''));
        }
    }
    return null;
}

// JSON pane → others: clicking or finding (Ctrl+F) inside a component's block syncs the shorthand and Preview
editor.selection.on('changeCursor', () => {
    if (settingJson) return;
    clearTimeout(jsonSyncTimer);
    jsonSyncTimer = setTimeout(() => {
        const key = jsonKeyAtRow(editor.getCursorPosition().row);
        if (key) syncAll(key, 'json');
    }, 150);
});

// Preview → others: a click on a field reports its component classes; the first one that's a known key wins
window.addEventListener('message', (e) => {
    if (!previewFrame || e.source !== previewFrame.contentWindow || !e.data || e.data.type !== 'preview-click') return;
    const key = (e.data.keys || []).find(k => rowForKey(k) !== -1);
    if (key) syncAll(key, 'preview');
});

// ⤒ / ⤓: move all three panes to the top or bottom at once (handy without Home/End keys)
function jumpAll(toEnd) {
    movingShorthand = true; // a jump isn't a "go to this component"
    if (toEnd) shorthand.navigateFileEnd(); else shorthand.navigateFileStart();
    shorthand.scrollToLine(toEnd ? shorthand.session.getLength() : 0, false, true, () => {});
    setTimeout(() => { movingShorthand = false; }, 0);
    editor.scrollToLine(toEnd ? editor.session.getLength() : 0, false, true, () => {}); // scroll only: moving its cursor would sync
    if (previewFrame && previewReady && layout.previewOpen) previewFrame.contentWindow.postMessage({ type: 'scrollTo', end: toEnd }, '*');
}
document.getElementById('btn-jump-top').addEventListener('click', () => jumpAll(false));
document.getElementById('btn-jump-bottom').addEventListener('click', () => jumpAll(true));

// Highlight the component's whole { ... } block in the JSON pane, centering it when asked
function highlightJson(key, center) {
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
    if (center) editor.scrollToLine(start, true, true, () => {});
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


