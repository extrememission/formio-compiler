let isDarkTheme = true;
let currentFontSize = 14;

const templates = [
    {
        name: "10-Question T/F Quiz",
        shorthand: "[panel] True or False Quiz\n+++ ![radio]\n- True\n- False\n1. Question One\n2. Question Two\n3. Question Three\n4. Question Four\n5. Question Five\n6. Question Six\n7. Question Seven\n8. Question Eight\n9. Question Nine\n10. Question Ten\n+++"
    },
    {
        name: "General Acknowledgement",
        shorthand: "[panel] General Acknowledgement\n[content] <p style=\"margin-bottom: 15px;\">By checking the box below and providing my signature, I formally acknowledge that I have received, read, and fully understand the contents of this document. I agree to abide by the guidelines, procedures, and expectations outlined herein, and I understand that it is my responsibility to seek clarification on any points I do not understand.</p>\n![checkbox] I have read and understand the contents of this document.\n![signature] Employee Signature\n![date] Date Signed"
    },
    {
        name: "Jobsite Hazard Assessment",
        shorthand: "[panel] Jobsite Hazard Assessment (JHA)\n[textfield] Project Name\n[textfield] Job Location\n![date] Date of Assessment\n![textfield] Supervisor / Competent Person\n\n[well] Required PPE\n[selectboxes] Personal Protective Equipment (PPE) Check\n- Hard Hat\n- Safety Glasses\n- Steel Toe Boots\n- High Visibility Vest\n- Gloves\n- Fall Protection\n- Hearing Protection\n\n[panel] Hazard Identification\n[content] <p>Please list the potential hazards identified for today's tasks and the control measures that will be implemented.</p>\n[repeat: 5] Hazard & Control Measure\n![textfield] Task / Activity\n![select] Hazard Type\n- Fall Hazard\n- Electrical\n- Struck-By\n- Caught-In/Between\n- Chemical / Hazardous Material\n- Ergonomic / Manual Lifting\n![textarea] Mitigation / Control Strategy\n\n\n[panel] Crew Sign-Off\n[content] <p>All crew members must sign below indicating they have been briefed on the hazards and controls.</p>\n[signature] Crew Member 1\n[signature] Crew Member 2\n[signature] Crew Member 3"
    },
    {
        name: "Time & Materials",
        shorthand: "[panel] Time & Materials\n[textfield] Job Description\n![date] Work Date\n[fieldset] Labor\n![number] Labor Hours\n![currency] Hourly Rate\n[currency: =Labor Hours * Hourly Rate] Labor Total\n\n[fieldset] Materials\n[currency] Materials Cost\n[number: 0-100] Markup Percent\n[currency: =Materials Cost + Materials Cost * Markup Percent / 100] Materials Total\n\n[fieldset] Totals\n[currency: =Labor Total + Materials Total] Subtotal\n[number: 0-20] Tax Rate Percent\n[currency: =Subtotal * Tax Rate Percent / 100] Tax\n[currency: =Subtotal + Tax] Grand Total\n\n[chart: Labor Total, Materials Total, Tax] Cost Breakdown"
    },
    {
        name: "Service Record (T&M)",
        shorthand: "[panel] Materials & Parts Used\n[editgrid: Qty#(s), !Part # / Description(xl), Unit(s), Unit Price$, Ext. Price$] Materials\n= Ext. Price: Qty * Unit Price\n\n\n[panel] Labor & Other Charges\n[editgrid: !Labor / Charge Description(l), Hours#(s), Rate$, Amount$, Notes(l)] Labor\n= Amount: Hours * Rate\n\n\n[panel] Summary / Billing\n[textarea] Technician Recommendations\n[currency: =SUM(Ext. Price)] Materials Subtotal\n[currency: =SUM(Amount)] Labor Subtotal\n[currency] Travel / Equipment\n[currency] Other Charges\n[currency] Sales Tax\n[currency: =Materials Subtotal + Labor Subtotal + \"Travel / Equipment\" + Other Charges + Sales Tax] Total"
    },
    {
        name: "How-To: Formulas & Charts",
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
        name: "~ Settings Showcase",
        shorthand: "[panel] ~ Settings Showcase\n~collapsible\n[content] <p>Every field here is customized with <strong>~ lines</strong>. Hover the ⓘ in the margin next to any ~ line to see what it does, or type <strong>~</strong> on a new line under any field to browse all of its settings.</p>\n[textfield] Full Name\n~placeholder: \"First and last name\"\n~tooltip: \"As it appears on your ID\"\n~validate.maxLength: 60\n~showCharCount\n![email] Email\n~description: \"We'll only use this for receipts\"\n[textfield] Employee ID\n~labelPosition: left-left\n~labelWidth: 25\n~prefix: \"#\"\n[number] Hours Worked\n~suffix: \"hrs\"\n~validate.min: 0\n~validate.max: 24\n[select] Department\n~widget: html5\n~placeholder: \"Choose a department\"\n- Field Operations\n- Service\n- Office\n[radio] Shift\n~inline\n- Day\n- Night\n- Weekend\n[textarea] Work Summary\n~rows: 4\n~showWordCount\n~validate.maxWords: 200\n[signature] Technician Signature\n~footer: \"Sign above the line\""
    },
    {
        name: "Fillable PDF Showcase",
        shorthand: [
            '# Equipment Inspection',
            '#! pdf',
            '[panel] Inspection Details',
            '![textfield] Site',
            '![date] Inspection Date',
            '![textfield] Inspector',
            '!@[radio] Shift',
            '- Day',
            '- Night',
            '',
            '[panel] Checklist',
            '+++ ![radio] Notes?',
            '- Pass',
            '- Fail',
            'Guards and shields in place?',
            'Emergency stop works?',
            'Fluid levels correct?',
            '+++',
            '!@[radio] Overall Condition',
            '- Good',
            '- Needs Repair',
            '- Out of Service',
            '![textarea] Repair Needed',
            '~showWhen: Overall Condition = Needs Repair',
            '',
            '[panel] Parts & Labor',
            '[editgrid: Date, !Task(xl), Hours#(s), Done?(s), Cost$] Work Log',
            '~rows: 8',
            '',
            '',
            '[panel] Defects Found',
            '[repeat: 2] Defect',
            '[textfield] Defect',
            '[textarea] Action Taken',
            '',
            '',
            '[panel] Sign Off',
            '![signature] Inspector Signature',
            '![date] Date Signed'
        ].join('\n')
    },
    {
        name: "Mobile PDF (Phone)",
        shorthand: [
            '# Daily Field Report',
            '#! pdf phone',
            '[panel] Report',
            '![date] Report Date',
            '![textfield] Job Site',
            '![textfield] Foreman',
            '!@[radio] Weather',
            '- Clear',
            '- Rain',
            '- Snow',
            '- Wind',
            '[number] Crew Size',
            '',
            '[panel] Site Checks',
            '+++ ![radio] Notes?',
            '- Yes',
            '- No',
            'Toolbox talk held?',
            'Site secured overnight?',
            'Any injuries today?',
            '+++',
            '',
            '[panel] Hours',
            '[editgrid: !Worker(l), Trade, Hours#(s), Overtime?(s)] Crew Hours',
            '~rows: 6',
            '',
            '',
            '[panel] Notes & Sign Off',
            '[textarea] Work Completed Today',
            '[textarea] Delays or Issues',
            '![signature] Foreman Signature'
        ].join('\n')
    },
    {
        name: "Upload Diagnostics",
        shorthand: "# Upload Diagnostics\n[print]\n[panel] Upload Diagnostics\n![textfield] Company\n![textfield] Your Name\n[diagnostics] Device, Connection & Photo Test\n[textarea] Anything else we should know?\n~placeholder: \"What happens when uploads fail? Which device, where, how often?\""
    }
];

const editor = ace.edit("json-editor");
editor.setTheme("ace/theme/tomorrow_night");
editor.session.setMode("ace/mode/json");
editor.setReadOnly(true);
editor.setOptions({
    fontSize: currentFontSize + "px",
    showPrintMargin: false,
    tabSize: 2,
    useWorker: false
});

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

const layout = { leftWidth: null, previewWidth: null, previewOpen: false };
try { Object.assign(layout, JSON.parse(localStorage.getItem('layout')) || {}); } catch (e) {}
const saveLayout = () => { try { localStorage.setItem('layout', JSON.stringify(layout)); } catch (e) {} };

const leftPane = document.getElementById('left-pane');
const previewPane = document.getElementById('preview-pane');
const previewResizer = document.getElementById('preview-resizer');
const MIN_PANE = 120;

function applyLayout() {
    if (layout.leftWidth) {
        leftPane.style.width = layout.leftWidth + 'px';
        leftPane.style.flex = 'none';
    }
    previewPane.classList.toggle('collapsed', !layout.previewOpen);
    previewResizer.classList.toggle('hidden', !layout.previewOpen);
    if (layout.previewOpen) {
        const maxPreview = window.innerWidth - leftPane.offsetWidth - MIN_PANE;
        previewPane.style.width = Math.max(MIN_PANE, Math.min(layout.previewWidth, maxPreview)) + 'px';
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
        if (previewFrame) previewFrame.style.pointerEvents = 'none';
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
    if (x > MIN_PANE && x < window.innerWidth - previewPane.offsetWidth - MIN_PANE) {
        layout.leftWidth = x;
        leftPane.style.width = x + 'px';
        leftPane.style.flex = 'none';
    }
});

makeResizer(previewResizer, (x) => {
    const w = window.innerWidth - x;
    if (w > MIN_PANE && x > leftPane.offsetWidth + MIN_PANE) {
        layout.previewWidth = w;
        previewPane.style.width = w + 'px';
    }
});

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
        if (c.type === 'file' && !c.storage) c.storage = 'base64';
        childListsOf(c).forEach(addDemo);
    });
    addDemo(components);
    return { display: 'form', components };
}

function sendPreview() {
    if (!layout.previewOpen) return;
    if (pdfMode && window.FormioPdf) return sendPdfPreview();
    if (pdfPreviewFrame) pdfPreviewFrame.style.display = 'none';
    if (previewFrame) previewFrame.style.display = '';
    if (previewFrame && previewReady) {
        previewFrame.contentWindow.postMessage({ type: 'render', schema: previewSchema() }, '*');
    }
}

function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(sendPreview, pdfMode ? 1200 : 400);
}

let pdfPreviewFrame = null, pdfPreviewUrl = null, pdfPreviewRun = 0;
function sendPdfPreview() {
    if (!pdfPreviewFrame) {
        pdfPreviewFrame = document.createElement('iframe');
        pdfPreviewFrame.id = 'preview-pdf';
        pdfPreviewFrame.style.cssText = 'flex: 1; width: 100%; border: none; background: #fff;';
        document.getElementById('preview-frame-wrap').appendChild(pdfPreviewFrame);
    }
    if (previewFrame) previewFrame.style.display = 'none';
    pdfPreviewFrame.style.display = '';
    const run = ++pdfPreviewRun;
    window.FormioPdf.build().then(bytes => {
        if (run !== pdfPreviewRun) return;
        const old = pdfPreviewUrl;
        pdfPreviewUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
        pdfPreviewFrame.removeAttribute('srcdoc');
        pdfPreviewFrame.src = pdfPreviewUrl + '#view=FitH';
        if (old) setTimeout(() => URL.revokeObjectURL(old), 5000);
    }).catch(err => {
        if (run !== pdfPreviewRun) return;
        pdfPreviewFrame.removeAttribute('src');
        pdfPreviewFrame.srcdoc = '<p style="font: 14px monospace; color: #b00020; padding: 16px;">Could not build the PDF: ' +
            escapeHtml((err && err.message) || err) + '</p>';
    });
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
        focusPreview();
    }
});

function focusPreview() {
    if (previewFrame && previewReady && layout.previewOpen && lastSyncKey) {
        previewFrame.contentWindow.postMessage({ type: 'focus', key: lastSyncKey, center: true }, '*');
    }
}

document.getElementById('btn-preview-open').addEventListener('click', () => {
    if (!layout.previewWidth) {
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

const phoneQuery = window.matchMedia('(max-width: 767px)');
const tabButtons = document.querySelectorAll('#mobile-tabs button');
function showTab(tab) {
    document.body.dataset.tab = tab;
    tabButtons.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    if (tab === 'preview') {
        layout.previewOpen = true;
        ensurePreviewFrame();
        sendPreview();
        focusPreview();
    }
    requestAnimationFrame(() => {
        if (tab === 'shorthand') { shorthand.resize(true); shorthand.renderer.scrollCursorIntoView(null, 0.5); }
        if (tab === 'json') { editor.resize(true); if (lastSyncKey) highlightJson(lastSyncKey, true); }
    });
}
tabButtons.forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
function applyPhoneLayout() {
    if (phoneQuery.matches) showTab(document.body.dataset.tab || 'shorthand');
    else {
        delete document.body.dataset.tab;
        try { layout.previewOpen = (JSON.parse(localStorage.getItem('layout')) || {}).previewOpen || false; } catch (e) {}
        applyLayout();
    }
}
phoneQuery.addEventListener('change', applyPhoneLayout);
if (phoneQuery.matches) document.body.dataset.tab = 'shorthand';

const lookupLabels = { fsworkers: 'Worker', fsproject: 'Project', fsequipment: 'Equipment', fscompany: 'Company', fsdivision: 'Division' };
let usedLookupKeys = new Set();
const repeatFirstKey = new WeakMap();
const asIsComps = new WeakSet();
let compileWarnings = [];
let formTitle = '';
let compileHints = [];
let pdfMode = false;
let pdfPage = 'letter';
let pdfLeaveOut = new Set();
let pdfRows = new Map();
const formulaOf = new WeakMap();

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
        const marker = text.match(/[^\s]([$#?])$/);
        if (marker) { type = { $: 'currency', '#': 'number', '?': 'checkbox' }[marker[1]]; text = text.slice(0, -1).trim(); }
        return { label: text, type, required, width };
    });
}

function gridColumnUnits(columns) {
    const weights = columns.map(c => WIDTH_WEIGHTS[c.width]);
    const total = weights.reduce((a, b) => a + b, 0);
    const units = weights.map(w => Math.max(1, Math.round(w * 10 / total)));
    let diff = 10 - units.reduce((a, b) => a + b, 0);
    while (diff !== 0) {
        const i = units.indexOf(Math.max(...units));
        if (diff < 0 && units[i] <= 1) break;
        units[i] += Math.sign(diff);
        diff -= Math.sign(diff);
    }
    return units;
}

function gridTemplates(widthByKey) {
    const w = JSON.stringify(widthByKey);
    return {
        header: `<div class="row">{% var w = ${w}; %}{% util.eachComponent(components, function(component) { %}{% if (displayValue(component)) { %}<div class="col-sm-{{ w[component.key] || 2 }}">{{ t(component.label) }}</div>{% } %}{% }) %}<div class="col-sm-2"></div></div>`,
        row: `<div class="row">{% var w = ${w}; %}{% util.eachComponent(components, function(component) { %}{% if (displayValue(component)) { %}<div class="col-sm-{{ w[component.key] || 2 }}">{{ isVisibleInRow(component) ? getView(component, row[component.key]) : '' }}</div>{% } %}{% }) %}{% if (!instance.options.readOnly && !instance.disabled) { %}<div class="col-sm-2"><div class="btn-group pull-right"><button class="btn btn-default btn-light btn-sm editRow"><i class="{{ iconClass('edit') }}"></i></button>{% if (!instance.hasRemoveButtons || instance.hasRemoveButtons()) { %}<button class="btn btn-danger btn-sm removeRow"><i class="{{ iconClass('trash') }}"></i></button>{% } %}</div></div>{% } %}</div>`
    };
}

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

const asIsValue = (opt) => String(opt).trim().replace(/\s+/g, ' ');
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
            properties: { repeatHeader: 'true' },
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
            clone.clearOnHide = false;
            if (clone.conditional && groupKeys.has(clone.conditional.when)) {
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
                clearOnHide: false
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
            comp.title = label;
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
    if (type === 'diagnostics') return buildDiagnostics(label || 'Upload Diagnostics');
    if (type === 'allfields') return buildAllFields(label || 'Entry Summary');

    if (type.startsWith('fs') && type.length > 2) {
        const key = usedLookupKeys.has(type) ? generateSmartKey(type) : type;
        usedLookupKeys.add(type);
        const lookupLabel = label || lookupLabels[type] || type.charAt(2).toUpperCase() + type.slice(3);
        const lookup = { label: lookupLabel, key: key, type: 'select', placeholder: 'Type to select...', input: true, tableView: true };
        if (type === 'fscompany') lookup.multiple = true;
        if (isRequired) lookup.validate = { required: true };
        return lookup;
    }

    const base = { label: label, key: generateSmartKey(label), type: type, input: true, tableView: true };
    if (isRequired) base.validate = { required: true };
    if (asIs && ['radio', 'select', 'selectboxes'].includes(type)) asIsComps.add(base);

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
        base.autoExpand = true;
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
        base.currency = 'USD';
        base.delimiter = true;
        base.decimalLimit = 2;
        base.requireDecimal = true;
    } else if (type === 'phonenumber') {
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
            base.validate.step = "1";
            base.validate.customMessage = "Please enter a number from " + min + " to " + max + ".";
            
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
    const prefix = str.match(/^[!@]*/)[0];
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

function findGridColumn(target, grids) {
    const find = (gridLabel, colLabel) => (grids || []).filter(g => (!gridLabel || g.label === gridLabel) && g.cols.has(colLabel));
    let col = target.toLowerCase(), matches = find(null, col);
    for (let i = target.indexOf('.'); matches.length === 0 && i !== -1; i = target.indexOf('.', i + 1)) {
        col = target.slice(i + 1).trim().toLowerCase();
        matches = find(target.slice(0, i).trim().toLowerCase(), col);
    }
    return { matches, col };
}

const childListsOf = (c) => [c.components || [],
    ...(c.columns || []).map(col => col.components || []),
    ...(Array.isArray(c.rows) ? c.rows : []).flatMap(r => (r || []).map(cell => (cell && cell.components) || []))];

const tableFill = new WeakMap();
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

const choicesOf = (c) => (c && (c.type === 'select' ? (c.data && c.data.values) : c.values)) || [];

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

function applyCalculation(comp, expr, problems, row, description) {
    const money = comp.type === 'currency';
    comp.calculateValue = money ? `value = Math.round((${expr}) * 100) / 100;` : `value = ${expr};`;
    comp.disabled = true;
    if (problems.length) compileWarnings.push({ row, text: 'Formula problem: ' + problems.join('; ') });
    else compileHints.push({ row, text: `Calculated: ${description} (${money ? 'rounded to cents, ' : ''}read-only, updates live)` });
}

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

const isLookup = (c) => !!c && c.type === 'select' && !c.dataSrc && String(c.key).startsWith('fs');
const lookupNameCalc = (lookupKey) => "var w = instance.root.getComponent('" + lookupKey + "'); var box = document.createElement('div'); " +
    "box.innerHTML = w && !w.isEmpty(w.dataValue) ? String(w.getView(w.dataValue) || '') : ''; value = box.textContent.trim();";
function ensureNameCopy(lookup, rootComponents, done) {
    const nameKey = lookup.key + '_name';
    if (done.has(nameKey)) return nameKey;
    done.add(nameKey);
    const twin = { label: lookup.label + ' (name)', key: nameKey, type: 'hidden', input: true, tableView: false,
        calculateValue: lookupNameCalc(lookup.key) };
    insertAfter(lookup, twin, rootComponents);
    return nameKey;
}

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
    var first = mode === 'listby' ? 1 : 0;
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

function reportRecords(fields) {
    if (fields.every(f => f.keys.length <= 1)) return [fields.map(f => f.keys[0] || null)];
    const copyOf = (k) => (k.match(/_(\d+)(?:_name)?$/) || [])[1];
    const byCopy = new Map();
    fields.forEach((f, i) => {
        if (f.keys.length < 2) return;
        f.keys.forEach(k => {
            const n = copyOf(k);
            if (!n) return;
            if (!byCopy.has(n)) byCopy.set(n, fields.map(() => null));
            byCopy.get(n)[i] = k;
        });
    });
    return [...byCopy.keys()].sort((a, b) => a - b).map(n => byCopy.get(n));
}

function insertAfter(target, newComp, rootComponents) {
    const place = (list) => {
        const i = list.indexOf(target);
        if (i !== -1) { list.splice(i + 1, 0, newComp); return true; }
        return list.some(c => childListsOf(c).some(place));
    };
    place(rootComponents);
}

function finishReport(comp, code, problems, row, what) {
    comp.calculateValue = 'if (instance && instance.visible === false) { value = ""; } else { ' + code + ' }';
    comp.disabled = true;
    comp.customClass = ((comp.customClass || '') + ' text-monospace font-monospace').trim();
    if (problems.length) compileWarnings.push({ row, text: 'Report problem: ' + problems.join('; ') });
    else compileHints.push({ row, text: what + ' (saved in the entry, updates live)' });
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

function resolveFormulas(pending, rootComponents) {
    const { keysByLabel, outputKeys, compByKey, grids } = buildLabelIndex(rootComponents);
    const ctx = { keysByLabel, compByKey, rootComponents, done: new Set() };

    pending.forEach(({ comp, formula, row }) => {
        if (!outputKeys.has(comp.key)) {
            compileWarnings.push({ row, text: "Formulas inside a [repeat] or grid row aren't supported this way: ignored" });
            return;
        }
        if (/^(SUMMARY|LIST\s+BY|LOG)\(/i.test(formula)) pdfLeaveOut.add(comp.key);
        const summary = formula.match(/^SUMMARY\((.*)\)$/i);
        if (summary) return applySummary(comp, summary[1], ctx, row);
        const listBy = formula.match(/^LIST\s+BY\((.*)\)$/i);
        if (listBy) return applyListReport(comp, 'listby', listBy[1], ctx, row);
        const log = formula.match(/^LOG\((.*)\)$/i);
        if (log) return applyListReport(comp, 'log', log[1], ctx, row);
        const lone = (keysByLabel.get(formula.replace(/^"(.*)"$/, '$1').trim().toLowerCase()) || []).map(k => compByKey.get(k));
        if (lone.length === 1 && isLookup(lone[0])) {
            comp.calculateValue = lookupNameCalc(lone[0].key);
            comp.disabled = true;
            compileHints.push({ row, text: `Shows the name picked in ${lone[0].label} (read-only, updates live)` });
            return;
        }
        const { expr, problems } = translateFormula(formula, comp, keysByLabel, grids, 'data');
        applyCalculation(comp, expr, problems, row, `${comp.label} = ${formula}`);
    });
}

function cleanPdfRun(btn) {
    var root = btn.closest('.formio-form') || btn.closest('form') || document.body;
    var clone = root.cloneNode(true);

    var src = root.querySelectorAll('input, textarea, select'), dst = clone.querySelectorAll('input, textarea, select');
    for (var i = 0; i < src.length && i < dst.length; i++) {
        var s = src[i], d = dst[i];
        if (s.type === 'checkbox' || s.type === 'radio') {
            if (s.checked) d.setAttribute('checked', 'checked'); else d.removeAttribute('checked');
        } else if (s.tagName === 'SELECT') {
            for (var j = 0; j < s.options.length; j++) if (s.options[j].selected && d.options[j]) d.options[j].setAttribute('selected', 'selected');
        } else if (s.tagName === 'TEXTAREA') {
            var box = document.createElement('div');
            box.className = 'form-control clean-pdf-text';
            box.textContent = s.value;
            d.parentNode.replaceChild(box, d);
        } else {
            d.setAttribute('value', s.value);
        }
    }

    var srcCanvas = root.querySelectorAll('canvas'), dstCanvas = clone.querySelectorAll('canvas');
    for (var k = 0; k < srcCanvas.length && k < dstCanvas.length; k++) {
        try {
            var img = document.createElement('img');
            img.src = srcCanvas[k].toDataURL('image/png');
            img.style.maxWidth = '100%';
            dstCanvas[k].parentNode.replaceChild(img, dstCanvas[k]);
        } catch (err) { }
    }

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

    var links = doc.querySelectorAll('link[rel="stylesheet"]'), waiting = links.length, done = false;
    var go = function () {
        if (done) return;
        done = true;
        var oldTitle = document.title;
        document.title = pdfName;
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
    const install = 'if (!window.__formioCleanPdf) {\n' +
        '  window.__formioCleanPdf = ' + cleanPdfRun.toString() + ';\n' +
        '  document.addEventListener("click", function (e) {\n' +
        '    var b = e.target.closest ? e.target.closest(".js-clean-pdf") : null;\n' +
        '    if (b) { e.preventDefault(); window.__formioCleanPdf(b); }\n' +
        '  });\n' +
        '}\nshow = true;';
    return {
        label: text, legend: '', key: generateSmartKey('cleanPdf'), type: 'fieldset',
        input: false, tableView: false, customClass: 'no-print',
        components: [
            { label: 'Clean PDF Installer', key: generateSmartKey('cleanPdfInstaller'), type: 'hidden',
                input: true, tableView: false, persistent: false, clearOnHide: false, customConditional: install },
            { label: text, key: generateSmartKey('cleanPdfButton'), type: 'htmlelement', tag: 'div', input: false, tableView: false,
                customConditional: 'show = !!(instance && instance.options && instance.options.readOnly);',
                content: '<div style="text-align:right;"><button type="button" class="btn btn-outline-primary btn-sm js-clean-pdf" ' +
                    'title="Creates a clean, print-ready PDF of this form (charts and signatures included). Choose Save as PDF in the print window.">' +
                    icon + escapeHtml(text) + '</button></div>' }
        ]
    };
}

function diagRun(instance, keys) {
    var root = instance && instance.root;
    if (!root || (instance.options && instance.options.readOnly)) return;
    var st = window.__formioDiagState || (window.__formioDiagState = { picked: [], batch: 0 });
    var dev = root.getComponent(keys.device), con = root.getComponent(keys.connection), pho = root.getComponent(keys.photos);
    if (!dev || !con || !pho) {
        if (!st.retry) st.retry = setTimeout(function () { st.retry = null; window.__formioDiag(instance, keys); }, 500);
        return;
    }
    var size = function (b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; };
    var big = function (b) { return b >= 1073741824 ? (b / 1073741824).toFixed(1) + ' GB' : size(b); };

    if (!st.listening) {
        st.listening = true;
        var note = function (list) {
            var batch = ++st.batch, now = Date.now();
            Array.prototype.forEach.call(list || [], function (f) {
                var rec = { name: f.name, size: f.size, t0: now, batch: batch };
                st.picked.push(rec);
                if (/^image\//.test(f.type) && window.URL && URL.createObjectURL) {
                    var img = new Image(), u = URL.createObjectURL(f);
                    img.onload = function () { rec.dims = img.naturalWidth + ' x ' + img.naturalHeight; URL.revokeObjectURL(u); };
                    img.onerror = function () { URL.revokeObjectURL(u); };
                    img.src = u;
                }
            });
        };
        document.addEventListener('change', function (e) { if (e.target && e.target.type === 'file') note(e.target.files); }, true);
        document.addEventListener('drop', function (e) { if (e.dataTransfer) note(e.dataTransfer.files); }, true);
    }

    if (!dev.dataValue && !st.gathering) {
        st.gathering = true;
        var n = navigator, ua = n.userAgent || '', uad = n.userAgentData;
        var high = uad && uad.getHighEntropyValues ? uad.getHighEntropyValues(['platformVersion', 'model', 'fullVersionList']).catch(function () { return null; }) : Promise.resolve(null);
        var store = n.storage && n.storage.estimate ? n.storage.estimate().catch(function () { return null; }) : Promise.resolve(null);
        Promise.all([high, store]).then(function (r) {
            var h = r[0] || {}, s = r[1], m, notShared = 'not shared by this browser';
            var browser = 'Unknown';
            var brand = (h.fullVersionList || []).filter(function (b) { return !/Not.?A.?Brand|Chromium/i.test(b.brand); })[0];
            if (brand) browser = brand.brand + ' ' + brand.version;
            else if ((m = ua.match(/Edg\w*\/([\d.]+)/))) browser = 'Edge ' + m[1];
            else if ((m = ua.match(/OPR\/([\d.]+)/))) browser = 'Opera ' + m[1];
            else if ((m = ua.match(/SamsungBrowser\/([\d.]+)/))) browser = 'Samsung Internet ' + m[1];
            else if ((m = ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/))) browser = 'Firefox ' + m[1];
            else if ((m = ua.match(/(?:Chrome|CriOS)\/([\d.]+)/))) browser = 'Chrome ' + m[1];
            else if ((m = ua.match(/Version\/([\d.]+).*Safari/))) browser = 'Safari ' + m[1];
            var tablet = /iPad/.test(ua) || (/Macintosh/.test(ua) && n.maxTouchPoints > 1) || (/Android/.test(ua) && !/Mobile/.test(ua));
            var os = 'Unknown';
            if ((m = ua.match(/(?:iPhone|CPU) OS (\d+)_(\d+)/))) os = (tablet ? 'iPadOS ' : 'iOS ') + m[1] + '.' + m[2];
            else if (tablet && /Macintosh/.test(ua)) os = 'iPadOS';
            else if ((m = ua.match(/Android ([\d.]+)/))) os = 'Android ' + m[1];
            else if (/Windows/.test(ua)) os = h.platformVersion ? 'Windows ' + (parseInt(h.platformVersion, 10) >= 13 ? '11' : '10') : 'Windows 10 or 11';
            else if ((m = ua.match(/Mac OS X ([\d_]+)/))) os = 'macOS' + (h.platformVersion ? ' ' + h.platformVersion : '');
            else if (/CrOS/.test(ua)) os = 'ChromeOS';
            else if (/Linux/.test(ua)) os = 'Linux';
            var kind = tablet ? 'Tablet' : (uad ? uad.mobile : /Mobi|iPhone|Android/.test(ua)) ? 'Phone' : 'Desktop / laptop';
            var gpu = notShared;
            try {
                var gl = document.createElement('canvas').getContext('webgl');
                var ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
                if (gl) gpu = gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
            } catch (err) {}
            var now = new Date(), zone = '';
            try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (err) {}
            dev.setValue([
                'Tested:      ' + now.toLocaleString() + (zone ? ' (' + zone + ')' : ''),
                'Browser:     ' + browser,
                'System:      ' + os,
                'Device:      ' + kind + (h.model ? ' (' + h.model + ')' : ''),
                'Screen:      ' + screen.width + ' x ' + screen.height + ', window ' + innerWidth + ' x ' + innerHeight + ', pixel ratio ' + (window.devicePixelRatio || 1),
                'Touch:       ' + (n.maxTouchPoints > 0 ? 'yes' : 'no'),
                'CPU cores:   ' + (n.hardwareConcurrency || notShared),
                'Memory:      ' + (n.deviceMemory ? 'about ' + n.deviceMemory + ' GB (rounded by the browser)' : notShared),
                'Graphics:    ' + gpu,
                'Language:    ' + (n.language || notShared),
                'Cookies:     ' + (n.cookieEnabled ? 'on' : 'off')
            ].join('\n'));
            var c = n.connection || n.mozConnection || n.webkitConnection;
            con.setValue([
                'Status:      ' + (n.onLine ? 'Online' : 'OFFLINE'),
                'Type:        ' + (c && c.effectiveType ? c.effectiveType + (c.type ? ' (' + c.type + ')' : '') : notShared),
                'Est. speed:  ' + (c && c.downlink ? c.downlink + ' Mbps (browser estimate, rounded)' : notShared),
                'Round trip:  ' + (c && c.rtt ? c.rtt + ' ms' : notShared),
                'Data saver:  ' + (c && 'saveData' in c ? (c.saveData ? 'ON' : 'off') : notShared),
                'Storage:     ' + (s && s.quota ? big(s.usage || 0) + ' used of ' + big(s.quota) + ' allowed' : notShared)
            ].join('\n'));
            st.gathering = false;
        });
    }

    if (!st.picked.length) return;
    var list = [];
    root.everyComponent(function (c) {
        var v = c.dataValue;
        if (Array.isArray(v) && v.length && v.every(function (x) { return x && typeof x === 'object' && (x.name || x.originalName) && 'size' in x; })) {
            list = list.concat(v);
        }
    });
    var now = Date.now(), lines = [], total = 0, largest = null, batches = {}, pending = st.picked.slice();
    list.forEach(function (f, i) {
        var name = f.originalName || f.name || 'file';
        var rec = null;
        for (var j = 0; j < pending.length; j++) if (pending[j].name === name && (!f.size || pending[j].size === f.size)) { rec = pending.splice(j, 1)[0]; break; }
        var bytes = f.size || (rec && rec.size) || 0;
        total += bytes;
        if (!largest || bytes > largest.bytes) largest = { name: name, bytes: bytes };
        var took = '';
        if (rec) {
            if (!rec.t1) rec.t1 = now;
            var b = batches[rec.batch] || (batches[rec.batch] = { bytes: 0, t0: rec.t0, t1: rec.t1 });
            b.bytes += bytes; b.t1 = Math.max(b.t1, rec.t1);
            took = '  uploaded in ' + ((rec.t1 - rec.t0) / 1000).toFixed(1) + ' s';
        }
        lines.push((i + 1) + '. ' + name + '  ' + size(bytes) + (rec && rec.dims ? '  ' + rec.dims : '') + took);
    });
    var timedBytes = 0, timedMs = 0;
    Object.keys(batches).forEach(function (k) { timedBytes += batches[k].bytes; timedMs += batches[k].t1 - batches[k].t0; });
    var head = ['Photos:      ' + list.length + ', ' + size(total) + ' in all' + (largest ? ', largest ' + largest.name + ' (' + size(largest.bytes) + ')' : '')];
    if (timedMs > 0) head.push('Upload:      ' + size(timedBytes) + ' in ' + (timedMs / 1000).toFixed(1) + ' s = ' + (timedBytes * 8 / (timedMs / 1000) / 1e6).toFixed(1) + ' Mbps');
    if (pending.length) head.push('Not uploaded: ' + pending.map(function (p) { return p.name; }).join(', ') + ' (failed, removed, or still uploading)');
    var text = head.concat(lines.length ? [''].concat(lines) : []).join('\n');
    if (pho.dataValue !== text) pho.setValue(text);
}

function buildDiagnostics(title) {
    const keys = { photos: generateSmartKey('diagPhotoResults'), device: generateSmartKey('diagDevice'), connection: generateSmartKey('diagConnection') };
    const install = 'if (!window.__formioDiag) window.__formioDiag = ' + diagRun.toString() + ';\n' +
        'window.__formioDiag(instance, ' + JSON.stringify(keys) + ');\nshow = true;';
    const report = (label, key, rows) => ({ label, key, type: 'textarea', input: true, tableView: false, disabled: true, autoExpand: true,
        rows, placeholder: 'Fills in by itself', customClass: 'text-monospace font-monospace' });
    return {
        title, label: title, legend: title, key: generateSmartKey(title), type: 'fieldset', input: false, tableView: false,
        components: [
            { label: 'Notice', key: generateSmartKey('diagNotice'), type: 'content', input: false, tableView: false,
                html: '<p>This section records your device, browser and connection details, plus the size and upload time of the photos you add, to help troubleshoot uploads. Nothing else is collected.</p>' },
            { label: 'Test Photos', key: generateSmartKey('diagPhotos'), type: 'file', input: true, tableView: false, multiple: true, image: true,
                description: 'Add a few typical photos, the way you normally would.' },
            report('Photo Upload Results', keys.photos, 3),
            report('Device', keys.device, 11),
            report('Connection', keys.connection, 6),
            { label: 'Diagnostics Installer', key: generateSmartKey('diagInstaller'), type: 'hidden',
                input: true, tableView: false, persistent: false, clearOnHide: false, customConditional: install }
        ]
    };
}

function allFieldsRun(instance, showBlanks) {
    var root = instance && instance.root;
    if (!root) return '';
    if (instance.options && instance.options.readOnly) return instance.dataValue || '';
    var esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    var text = function (html) { var d = document.createElement('div'); d.innerHTML = String(html == null ? '' : html); return (d.textContent || '').trim(); };
    var out = [], pending = [];
    var heading = function (level, title) {
        pending = pending.filter(function (p) { return p.level < level; });
        if (title) pending.push({ level: level, title: title });
    };
    var line = function (label, answer) {
        pending.forEach(function (p) { out.push('<br><b>' + esc(p.title) + '</b><br>'); });
        pending = [];
        out.push('<b>' + esc(label) + ':</b> ' + answer + '<br>');
    };
    var answerOf = function (c) {
        var comp = c.component, v = c.dataValue;
        var empty = v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length) ||
            (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).some(function (k) { return v[k]; }));
        if (empty) return null;
        if (comp.type === 'signature') return 'Signed';
        if (comp.type === 'checkbox') return 'Checked';
        if (comp.type === 'file') {
            var images = v.every(function (f) { return /^image\//.test(f.type || '') || /\.(jpe?g|png|gif|heic|webp)$/i.test(f.originalName || f.name || ''); });
            return v.length + (images ? ' photo' : ' file') + (v.length === 1 ? '' : 's');
        }
        if (comp.type === 'editgrid' || comp.type === 'datagrid') {
            var cols = comp.components || [];
            return v.map(function (row, i) {
                return '<br>' + (i + 1) + '. ' + cols.filter(function (k) { return row[k.key] !== undefined && row[k.key] !== ''; })
                    .map(function (k) { return esc(k.label) + ': ' + esc(row[k.key]); }).join('; ');
            }).join('');
        }
        var shown = '';
        try { shown = text(c.getView(v)); } catch (e) { shown = typeof v === 'object' ? JSON.stringify(v) : String(v); }
        return esc(shown).replace(/\r?\n/g, '<br>');
    };
    var walk = function (list, level) {
        (list || []).forEach(function (c) {
            if (!c || !c.component || c === instance) return;
            var comp = c.component, type = comp.type;
            if (c.visible === false) return;
            var kids = (type === 'editgrid' || type === 'datagrid') ? null : c.components;
            if (Array.isArray(kids) && kids.length) {
                var title = type === 'fieldset' ? comp.legend : (type === 'panel' ? comp.title : '');
                heading(level, title);
                walk(kids, title ? level + 1 : level);
                heading(level, null);
                return;
            }
            if (type === 'htmlelement' && (/^h[1-6]$/.test(comp.tag || '') || (comp.properties && comp.properties.repeatHeader))) {
                heading(level, text(comp.content));
                return;
            }
            if (!comp.input || ['button', 'hidden', 'content', 'htmlelement'].indexOf(type) !== -1 || comp.persistent === false) return;
            if (/^addAnother_/.test(comp.key)) return;
            var answer = answerOf(c);
            if (answer === null && !showBlanks) return;
            line(text(comp.label) || comp.key, answer !== null ? answer : type === 'checkbox' ? 'Not checked' : '-');
        });
    };
    walk(root.pages && root.pages.length ? root.pages : root.components, 1);
    return out.join('');
}

const allFieldsHidden = new WeakMap();
const allFieldsCalc = (showBlanks) =>
    'if (!window.__formioAllFields) window.__formioAllFields = ' + allFieldsRun.toString() + ';\n' +
    'value = window.__formioAllFields(instance, ' + (showBlanks ? 'true' : 'false') + ');';

function buildAllFields(title) {
    const dataKey = generateSmartKey('allFields');
    const hidden = { label: title + ' (data)', key: dataKey, type: 'hidden', input: true, tableView: false, clearOnHide: false,
        calculateValue: allFieldsCalc(false) };
    const wrapper = {
        label: title, legend: '', key: generateSmartKey(title), type: 'fieldset', input: false, tableView: false,
        components: [
            hidden,
            { label: title, key: generateSmartKey('allFieldsView'), type: 'content', input: false, tableView: false, refreshOnChange: true,
                html: '<b>' + escapeHtml(title) + '</b><br>{{ data.' + dataKey + ' }}' }
        ]
    };
    allFieldsHidden.set(wrapper, hidden);
    return wrapper;
}

const CHART_COLORS = ['primary', 'success', 'info', 'secondary', 'dark', 'warning', 'danger'];
const chartOf = new WeakMap();
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildChart(title, itemsStr) {
    const chart = { type: 'htmlelement', tag: 'div', label: title || 'Chart', key: generateSmartKey(title || 'chart'),
        input: false, tableView: false, refreshOnChange: true, content: '' };
    chartOf.set(chart, itemsStr || '');
    return chart;
}

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
        const items = (itemsStr.match(/("[^"]*"|[^,])+/g) || []).map(s => s.trim()).filter(Boolean).map((text, i) => {
            const { expr, problems: p } = translateFormula(text, comp, keysByLabel, grids, 'data');
            problems.push(...p);
            const sum = text.match(/^SUM\(\s*"?([^")]*)"?\s*\)$/i);
            let label = sum ? sum[1].trim() : text.replace(/^"|"$/g, '');
            const keyMatch = expr.match(sum ? /\br\.(\w+)\)/ : /\bdata\.(\w+)\)/);
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

function normalizeChoiceDefaults(list) {
    (list || []).forEach(c => {
        const choices = choicesOf(c);
        if (choices.length && c.defaultValue !== undefined && c.defaultValue !== '') {
            const norm = (s) => String(s).replace(/[\s_]+/g, ' ').trim().toLowerCase();
            const toValue = (v) => { const hit = choices.find(o => norm(o.label) === norm(v) || norm(o.value) === norm(v)); return hit ? hit.value : v; };
            if (c.defaultValue && typeof c.defaultValue === 'object' && !Array.isArray(c.defaultValue)) {
                c.defaultValue = Object.fromEntries(Object.entries(c.defaultValue).map(([k, on]) => [toValue(k), on]));
            } else if (Array.isArray(c.defaultValue)) {
                c.defaultValue = c.defaultValue.map(toValue);
            } else {
                c.defaultValue = toValue(c.defaultValue);
            }
        }
        childListsOf(c).forEach(normalizeChoiceDefaults);
    });
}

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

let compilingRow = 0;
function compileShorthand() {
    try {
        compileShorthandUnsafe();
    } catch (err) {
        console.error(err);
        const existing = shorthand.session.getAnnotations().filter(a => a.type !== 'error');
        shorthand.session.setAnnotations(existing.concat([{ row: compilingRow, column: 0, type: 'error',
            text: 'The compiler stopped at this line (' + err.message + '). The JSON shows the last version that compiled. Fix this line or tell Claude.' }]));
    }
}

function compileShorthandUnsafe() {
    const lines = shorthand.session.getDocument().getAllLines();
    const lineComps = [];
    usedLookupKeys = new Set();
    compileWarnings = [];
    compileHints = [];
    formTitle = '';
    pdfMode = false;
    pdfPage = 'letter';
    pdfLeaveOut = new Set();
    pdfRows = new Map();
    const pdfNotes = [];
    const pendingFormulas = [];
    const pendingCharts = [];
    const pendingShowWhen = [];
    let rootComponents = [];
    let containerStack = [];
    let inBulkMode = false;
    let bulkDef = null;
    let lastFieldComponent = null;
    let settingsTarget = null;
    const settingEntries = [];
    settingTargetTypes = [];

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
    const pages = [];
    pageRows = new Map();
    const popContainer = () => {
        const popped = containerStack.pop();
        if (popped.type === 'repeat') unrollRepeatGroup(popped).forEach(c => pushComponent(c));
    };

    for (let i = 0; i < lines.length; i++) {
        currentRow = i;
        compilingRow = i;
        let line = lines[i].trim();
        if (!line) {
            lastFieldComponent = null;
            settingsTarget = null;
            if (containerStack.length > 0 && !pages.includes(containerStack[containerStack.length - 1])) popContainer();
            continue;
        }

        const pdfLine = line.match(/^#!\s*pdf\b\s*(.*)$/i);
        if (pdfLine) {
            pdfMode = true;
            const option = pdfLine[1].trim().toLowerCase();
            if (option === 'long' || option === 'phone') pdfPage = option;
            else if (option) compileWarnings.push({ row: i, text: `Unknown PDF option "${pdfLine[1].trim()}": use #! pdf (Letter pages), #! pdf long (one long page) or #! pdf phone (one long phone-width page)` });
            const pageText = { letter: '', long: ', one long page (for tablets)', phone: ', one long phone-width page (tables stack row by row)' }[pdfPage];
            compileHints.push({ row: i, text: 'PDF mode' + pageText + ': the Preview shows the fillable PDF, and the margin flags what changes on paper' });
            continue;
        }

        if (/^#\s/.test(line)) {
            formTitle = line.slice(1).trim();
            continue;
        }

        const pageMatch = line.match(/^===\s*(?:Page\s*:)?\s*(.*)$/i);
        if (pageMatch) {
            if (inBulkMode) { applyBulkSettings(bulkDef); inBulkMode = false; bulkDef = null; }
            while (containerStack.length > 0) popContainer();
            const title = pageMatch[1].trim() || 'Page ' + (pages.length + 1);
            const page = { title, label: title, key: generateSmartKey(title), type: 'panel', input: false, tableView: false, components: [] };
            pages.push(page);
            pageRows.set(i, page);
            rootComponents.push(page);
            containerStack.push(page);
            lineComps[i] = null;
            lastFieldComponent = null;
            settingsTarget = null;
            continue;
        }

        if (line.startsWith('+++')) {
            lastFieldComponent = null;
            if (inBulkMode) { applyBulkSettings(bulkDef); inBulkMode = false; bulkDef = null; settingsTarget = null; }
            else if (!parseComponentDef(line.substring(3).trim())) {
                compileWarnings.push({ row: i, text: 'A Bulk block must start with a type, e.g. "+++ ![radio]". This "+++" has none and no block is open, so it was skipped. Check the line that should open this block.' });
            } else {
                inBulkMode = true;
                bulkDef = parseComponentDef(line.substring(3).trim());
                bulkDef.markdownChoices = [];
                bulkDef.settings = [];
                bulkDef.questions = [];
                settingsTarget = bulkDef;
                settingTargetTypes[i] = formioTypeOf(bulkDef.type);
                flagUnusedAsIs(bulkDef, i);
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
            const setting = parseSettingLine(line);
            if (!setting) {
                compileWarnings.push({ row: i, text: 'Setting format: ~name or ~name: value   (e.g. ~rows: 5)' });
            } else if (!settingsTarget) {
                compileWarnings.push({ row: i, text: 'A ~ setting must sit under the component it belongs to, with no blank line in between' });
            } else if (setting.path === 'showWhen') {
                const repeat = containerStack[containerStack.length - 1];
                if (settingsTarget === bulkDef) compileWarnings.push({ row: i, text: "~showWhen isn't supported under a +++ bulk block" });
                else if (repeat && repeat.type === 'repeat' && repeat.components.includes(settingsTarget)) showWhenInRepeat(settingsTarget, String(setting.value), i, repeat);
                else pendingShowWhen.push({ comp: settingsTarget, text: String(setting.value), row: i });
                lineComps[i] = settingsTarget;
            } else if (setting.path === 'htmlElement' && allFieldsHidden.has(settingsTarget)) {
                const view = settingsTarget.components[1];
                settingsTarget.components[1] = { label: view.label, key: generateSmartKey('allFieldsView'), type: 'htmlelement', tag: 'div',
                    input: false, tableView: false, refreshOnChange: true, content: view.html };
                compileHints.push({ row: i, text: 'Shown by an HTML Element instead of a Content component' });
                lineComps[i] = settingsTarget;
            } else if (setting.path === 'rows' && ['editgrid', 'datagrid'].includes(settingsTarget.type)) {
                const n = parseInt(setting.value, 10);
                if (!(n >= 1 && n <= 200)) compileWarnings.push({ row: i, text: '~rows: a number of rows from 1 to 200' });
                else { pdfRows.set(settingsTarget.key, n); compileHints.push({ row: i, text: `Fillable PDF: ${n} blank rows` }); }
                lineComps[i] = settingsTarget;
            } else if (setting.path === 'showBlanks') {
                const hidden = allFieldsHidden.get(settingsTarget);
                if (!hidden) compileWarnings.push({ row: i, text: '~showBlanks only applies to [allfields]' });
                else { hidden.calculateValue = allFieldsCalc(setting.value !== false); compileHints.push({ row: i, text: 'Unanswered fields are listed as "-" (unticked checkboxes as "Not checked")' }); }
                lineComps[i] = settingsTarget;
            } else if (settingsTarget === bulkDef) {
                bulkDef.settings.push({ setting, row: i });
            } else {
                applySetting(settingsTarget, setting, i, true);
                settingEntries.push({ comp: settingsTarget, setting, row: i });
                lineComps[i] = settingsTarget;
            }
            settingTargetTypes[i] = !settingsTarget ? null : settingsTarget === bulkDef ? formioTypeOf(bulkDef.type)
                : allFieldsHidden.has(settingsTarget) ? 'allfields' : settingsTarget.type;
            continue;
        }

        if (inBulkMode && bulkDef) {
            settingTargetTypes[i] = formioTypeOf(bulkDef.type);
            if (line.startsWith('- ') || line === '-') {
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
                settingTargetTypes[i] = allFieldsHidden.has(comp) ? 'allfields' : comp.type;
                if (def.type === 'editgrid' && def.choices && comp.components.length > 5 && !pdfMode) {
                    compileWarnings.push({ row: i, text: `${comp.components.length} columns: more than 5 can get cramped in the saved-rows table` });
                }
                const leftOut = { chart: 'Charts', allfields: '[allfields]', diagnostics: '[diagnostics]', print: '[print]' }[def.type];
                if (leftOut) pdfNotes.push({ row: i, warn: true, text: `${leftOut} can't work in a PDF: left out` });
                else if (formulaOf.has(comp) && /^(SUMMARY|LIST\s+BY|LOG)\(/i.test(formulaOf.get(comp))) pdfNotes.push({ row: i, warn: true, text: "Reports can't work in a PDF: left out" });
                else if (formulaOf.has(comp)) pdfNotes.push({ row: i, text: 'In the PDF: a plain box (the formula only calculates in Form.io)' });
                else if (def.type.startsWith('fs') && def.type.length > 2) pdfNotes.push({ row: i, text: 'In the PDF: a plain text box (the list comes from the platform)' });
                else if (def.type === 'file') pdfNotes.push({ row: i, text: 'In the PDF: "(Attach files separately)"' });
                else if (def.type === 'repeat') pdfNotes.push({ row: i, text: `In the PDF: ${comp.max} copies, no "Add another?" boxes` });
                else if (def.type === 'editgrid' || def.type === 'datagrid') pdfNotes.push({ row: i, text: 'In the PDF: a fillable table (~rows: N sets how many rows; 5 by default)' });
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
    if (inBulkMode) applyBulkSettings(bulkDef);
    if (pdfMode) pdfNotes.forEach(n => (n.warn ? compileWarnings : compileHints).push({ row: n.row, text: n.text }));

    while (containerStack.length > 0) popContainer();
    if (pages.length) {
        const loose = rootComponents.filter(c => !pages.includes(c));
        if (loose.length) pages[0].components.unshift(...loose);
        rootComponents = pages.slice();
    }
    resolveFormulas(pendingFormulas, rootComponents);
    resolveCharts(pendingCharts, rootComponents);
    resolveShowWhen(pendingShowWhen, rootComponents);
    settingEntries.forEach(e => applySetting(e.comp, e.setting, e.row, false));
    normalizeChoiceDefaults(rootComponents);
    ensureLabels(rootComponents);

    lastComponents = rootComponents;
    renderOutput();

    const outputKeys = new Set();
    const collectKeys = (list) => list.forEach(c => { outputKeys.add(c.key); childListsOf(c).forEach(collectKeys); });
    collectKeys(rootComponents);
    lineKeys = lineComps.map(c => !c ? null
        : outputKeys.has(c.key) ? c.key
        : outputKeys.has(c.key + '_1') ? c.key + '_1'
        : repeatFirstKey.get(c) || null);

    schedulePreview();
    checkBadChars();
    scheduleSync();
}

function renderOutput() {
    const list = lastComponents;
    let finalOutput = list;
    if (outputMode === 'component') {
        finalOutput = list.length === 1 ? list[0]
            : { title: 'Panel', label: 'Panel', key: generateSmartKey('Panel'), type: 'panel', theme: 'primary', input: false, tableView: false, components: list };
    }
    const scrollTop = editor.session.getScrollTop();
    settingJson = true;
    editor.setValue(JSON.stringify(finalOutput, null, 2), -1);
    settingJson = false;
    editor.session.setScrollTop(scrollTop);
}

let outputMode = 'components';
try { outputMode = localStorage.getItem('outputMode') === 'component' ? 'component' : 'components'; } catch (e) {}

const wrapperCheck = document.getElementById('chk-wrapper');
wrapperCheck.checked = outputMode === 'component';
wrapperCheck.addEventListener('change', () => {
    outputMode = wrapperCheck.checked ? 'component' : 'components';
    try { localStorage.setItem('outputMode', outputMode); } catch (e) {}
    renderOutput();
});

let compileQueued = false;
shorthand.session.on('change', () => {
    if (compileQueued) return;
    compileQueued = true;
    setTimeout(() => { compileQueued = false; compileShorthand(); showFile(); rememberSession(); }, 0);
});
document.getElementById('btn-copy').addEventListener('click', () => {
    const text = armedPage ? JSON.stringify(armedPage.components, null, 2) : editor.getValue();
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('btn-copy');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check" style="color:var(--accent);"></i>';
        setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
    });
});

function formFileName() {
    const first = lastComponents[0] || {};
    return String(formTitle || first.title || first.legend || first.label || 'form').replace(/[\\/:*?"<>|]+/g, '-').trim().slice(0, 80) || 'form';
}

async function downloadFile(data, name, type) {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    if (isMobile && navigator.canShare) {
        const file = new File([data], name, { type });
        if (navigator.canShare({ files: [file] })) {
            try { await navigator.share({ files: [file], title: name }); return; }
            catch (e) { if (e && e.name === 'AbortError') return; }
        }
    }
    const url = URL.createObjectURL(new Blob([data], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}

document.getElementById('btn-download').addEventListener('click', () => downloadFile(editor.getValue(), formFileName() + '.json', 'application/json'));

const fileLabel = document.getElementById('file-name');
const fileInput = document.getElementById('file-open');
const txtTypes = [{ description: 'Shorthand', accept: { 'text/plain': ['.txt'] } }];
let fileHandle = null, fileName = '', savedText = '';

function showFile() {
    const dirty = shorthand.getValue() !== savedText;
    fileLabel.textContent = (fileName || 'Untitled') + (dirty ? ' •' : '');
    fileLabel.title = dirty ? 'Unsaved changes (Ctrl+S to save)' : 'Saved';
}

function rememberSession() {
    try { localStorage.setItem('session', JSON.stringify({ text: shorthand.getValue(), fileName, savedText })); } catch (e) {}
}

function loadShorthand(text, name, handle) {
    fileHandle = handle || null;
    fileName = name || '';
    savedText = text;
    shorthand.setValue(text, -1);
    shorthand.focus();
}

const okToReplace = () => {
    const text = shorthand.getValue();
    return text === savedText || !text.trim() || confirm('Discard your unsaved changes?');
};

async function saveFile(saveAs) {
    const text = shorthand.getValue();
    const suggested = fileName || formFileName() + '.txt';
    try {
        if (!window.showSaveFilePicker) {
            await downloadFile(text, suggested, 'text/plain');
            fileName = suggested;
        } else {
            if (saveAs || !fileHandle) fileHandle = await window.showSaveFilePicker({ suggestedName: suggested, types: txtTypes });
            const out = await fileHandle.createWritable();
            await out.write(text);
            await out.close();
            fileName = fileHandle.name;
        }
        savedText = text;
        showFile();
        rememberSession();
    } catch (e) {
        if (e.name !== 'AbortError') alert('Could not save: ' + e.message);
    }
}

async function openFile() {
    if (!okToReplace()) return;
    if (!window.showOpenFilePicker) return fileInput.click();
    try {
        const [handle] = await window.showOpenFilePicker({ types: txtTypes });
        const file = await handle.getFile();
        loadShorthand(await file.text(), file.name, handle);
    } catch (e) {
        if (e.name !== 'AbortError') alert('Could not open: ' + e.message);
    }
}

fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (file) loadShorthand(await file.text(), file.name);
});

document.getElementById('btn-open').addEventListener('click', openFile);
document.getElementById('btn-save').addEventListener('click', (e) => saveFile(e.shiftKey));
document.getElementById('btn-clear').addEventListener('click', () => { if (okToReplace()) loadShorthand(''); });

window.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k !== 's' && !(k === 'o' && !e.shiftKey)) return;
    e.preventDefault();
    e.stopPropagation();
    if (k === 's') saveFile(e.shiftKey); else openFile();
}, true);

const snippetModal = document.getElementById('snippet-modal');
document.getElementById('btn-help').addEventListener('click', () => snippetModal.classList.remove('hidden'));
document.getElementById('btn-close-modal').addEventListener('click', () => snippetModal.classList.add('hidden'));

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

const templateList = document.createElement('div');
templateList.className = 'snippet-category';
templateList.innerHTML = '<h3>📋 Start from a Template</h3>';
templates.forEach(t => {
    const row = document.createElement('div');
    row.className = 'snippet-row';
    const name = document.createElement('code');
    name.textContent = t.name;
    const btn = document.createElement('button');
    btn.className = 'btn-insert';
    btn.textContent = 'Open';
    btn.title = 'Replace the shorthand with this template';
    btn.addEventListener('click', () => {
        if (!okToReplace()) return;
        snippetModal.classList.add('hidden');
        loadShorthand(t.shorthand);
    });
    row.append(name, btn);
    templateList.append(row);
});
document.querySelector('.snippet-columns').prepend(templateList);

const quickSnippets = [
    { name: 'panel', desc: 'Panel Container', syntax: '[panel] ${1:Panel}' },
    { name: 'fieldset', desc: 'Field Set Container', syntax: '[fieldset] ${1:Field Set}' },
    { name: 'repeat', desc: 'Super Group Repeater', syntax: '[repeat: ${2:3}] ${1:Repeat Group}' },
    { name: 'editgrid', desc: 'Edit Grid', syntax: '[editgrid] ${1:Edit Grid}' },
    { name: 'editgridcols', desc: 'Edit Grid with $ / # columns + row total', syntax: '[editgrid: ${2:Item(xl), Qty#(s), Price$, Line Total$}] ${1:Items}\n= ${3:Line Total: Qty * Price}' },
    { name: 'pdftable', desc: 'Fillable PDF table: rows, ? tick boxes, $ total', syntax: '[editgrid: ${2:Date, !Task(xl), Hours#(s), Done?(s), Cost$}] ${1:Daily Log}\n~rows: ${3:10}' },
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
    { name: 'diagnostics', desc: 'Device, connection & photo upload test', syntax: '[diagnostics] ${1:Upload Diagnostics}' },
    { name: 'allfields', desc: 'Summary of every answered field (prints formatted)', syntax: '[allfields] ${1:Entry Summary}' },
    { name: 'bulk', desc: 'Bulk Mode Wrapper', syntax: '+++ ![radio]\n- ${1:Choice 1}\n- ${2:Choice 2}\n${3:Question 1}\n${4:Question 2}\n+++' },
    { name: 'bulknotesif', desc: 'Bulk + notes when picked', syntax: '+++ ![radio] ${1:Notes}?\n- ${2:Choice 1}\n- ${3:Choice 2}\n${4:Question 1}\n${5:Question 2}\n+++' },
    { name: 'bulknotes', desc: 'Bulk + always-on notes', syntax: '+++ ![radio] ${1:Notes}\n- ${2:Choice 1}\n- ${3:Choice 2}\n${4:Question 1}\n${5:Question 2}\n+++' }
];

const stripPlaceholders = (syntax) => syntax.replace(/\$\{\d+:([^}]*)\}/g, '$1');

shorthand.completers = [{
    id: 'shorthandTags',
    identifierRegexps: [/[\[~\w.]/],
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
initSettings();

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

function goToNextLine(ed) {
    const row = ed.getCursorPosition().row;
    if (row + 1 < ed.session.getLength() && ed.session.getLine(row + 1).trim() === '') {
        ed.selection.moveTo(row + 1, 0);
    } else {
        ed.navigateLineEnd();
        ed.insert('\n');
    }
}

shorthand.commands.removeCommand('indent');
shorthand.commands.removeCommand('outdent');
shorthand.commands.addCommand({ name: 'nextLine', bindKey: { win: 'Tab', mac: 'Tab' }, exec: goToNextLine });

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

let lineKeys = [];
let syncTimer = null;
let jsonSyncTimer = null;
let jsonSyncMarker = null;
let lastSyncKey = null;
let movingShorthand = false;
let settingJson = false;

function scheduleSync() {
    if (movingShorthand) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncToCursor, 120);
}

function syncToCursor() {
    let row = shorthand.getCursorPosition().row;
    armPage(pageRows.get(row));
    if (armedPage) {
        lastSyncKey = armedPage.key;
        highlightJson(null);
        if (previewFrame && previewReady && layout.previewOpen) previewFrame.contentWindow.postMessage({ type: 'focus', key: armedPage.key, center: true }, '*');
        return;
    }
    while (row >= 0 && !lineKeys[row]) row--;
    syncAll(row >= 0 ? lineKeys[row] : null, 'shorthand');
}

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

function jsonKeyAtRow(row) {
    const lines = editor.session.getDocument().getAllLines();
    let limit = lines[row] ? lines[row].search(/\S/) + 1 : 0;
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

editor.selection.on('changeCursor', () => {
    if (settingJson) return;
    clearTimeout(jsonSyncTimer);
    jsonSyncTimer = setTimeout(() => {
        const key = jsonKeyAtRow(editor.getCursorPosition().row);
        if (key) syncAll(key, 'json');
    }, 150);
});

window.addEventListener('message', (e) => {
    if (!previewFrame || e.source !== previewFrame.contentWindow || !e.data || e.data.type !== 'preview-click') return;
    const key = (e.data.keys || []).find(k => rowForKey(k) !== -1);
    if (key) syncAll(key, 'preview');
});

function jumpAll(toEnd) {
    movingShorthand = true;
    if (toEnd) shorthand.navigateFileEnd(); else shorthand.navigateFileStart();
    shorthand.scrollToLine(toEnd ? shorthand.session.getLength() : 0, false, true, () => {});
    setTimeout(() => { movingShorthand = false; }, 0);
    editor.scrollToLine(toEnd ? editor.session.getLength() : 0, false, true, () => {});
    if (previewFrame && previewReady && layout.previewOpen) previewFrame.contentWindow.postMessage({ type: 'scrollTo', end: toEnd }, '*');
}
document.getElementById('btn-jump-top').addEventListener('click', () => jumpAll(false));
document.getElementById('btn-jump-bottom').addEventListener('click', () => jumpAll(true));

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

let pageRows = new Map();
let armedPage = null;
let pageMarker = null;
const copyBtn = document.getElementById('btn-copy');

function armPage(page) {
    const session = editor.session;
    if (pageMarker !== null) { session.removeMarker(pageMarker); pageMarker = null; }
    armedPage = null;
    copyBtn.classList.remove('page-armed');
    copyBtn.title = 'Copy Schema';
    if (!page) return;
    const lines = session.getDocument().getAllLines();
    const keyRow = lines.findIndex(l => l.trim().replace(/,$/, '') === '"key": ' + JSON.stringify(page.key));
    if (keyRow === -1) return;
    const indent = ' '.repeat(lines[keyRow].search(/\S/));
    let start = keyRow;
    while (start > 0 && lines[start] !== indent.slice(2) + '{') start--;
    while (start < lines.length && !lines[start].startsWith(indent + '"components": [')) start++;
    let end = start;
    if (!/\[\],?$/.test(lines[start])) while (end < lines.length - 1 && lines[end] !== indent + ']' && lines[end] !== indent + '],') end++;
    if (start >= lines.length) return;
    armedPage = page;
    pageMarker = session.addMarker(new Range(start, lines[start].indexOf('['), end, lines[end].lastIndexOf(']') + 1), 'page-copy', 'text');
    copyBtn.classList.add('page-armed');
    copyBtn.title = 'Copy page "' + page.title + '" [ ]';
    editor.scrollToLine(Math.max(0, start - 1), false, true, () => {});
}

let restored = null;
try { restored = JSON.parse(localStorage.getItem('session')); } catch (e) {}
if (!restored || typeof restored.text !== 'string') restored = { text: `[panel] Employee Onboarding
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
` };
fileName = restored.fileName || '';
savedText = typeof restored.savedText === 'string' ? restored.savedText : restored.text;
shorthand.setValue(restored.text, -1);
compileShorthand();
showFile();


