// --- ~ Settings: Form.io settings on lines under a component ---
// [select] Country
// ~widget: html5          → "widget": "html5"
// ~multiple               → "multiple": true
// ~validate.minLength: 3  → "validate": { "minLength": 3 }
// The ~ menu, explanations and defaults come from Form.io's own settings forms, loaded on first use.
// Loaded before app.js; app.js calls initSettings() once the shorthand editor exists.

const PROTECTED_SETTINGS = ['label', 'key', 'type', 'input']; // owned by the shorthand itself
const COMPILER_MANAGED = ['dataSrc', 'data', 'values', 'calculateValue', 'templates', 'components', 'conditional']; // compiler features depend on these
const SETTINGS_FORMIO_CDN = 'https://cdn.jsdelivr.net/npm/formiojs@4/dist/formio.full.min.js';

let settingTargetTypes = [];   // shorthand row → Form.io type a "~" on that row (or the next) would apply to; filled by compileShorthand
const settingsCatalog = {};    // Form.io type → [{ path, label, help, group, kind, options, def }] or null (not a Form.io type)
const catalogWaiters = {};     // Form.io type → callbacks waiting for it to load
let settingsFrame = null;
let settingsFrameReady = false;

// "~name" or "~name: value"; values parse as JSON when they can (5, true, "text", [..]), otherwise as plain text (html5)
function parseSettingLine(line) {
    const m = line.match(/^~\s*([A-Za-z_][\w.]*)\s*(?::\s*(.*))?$/);
    if (!m) return null;
    if (m[2] === undefined) return { path: m[1], value: true };
    const raw = m[2].trim();
    try { return { path: m[1], value: JSON.parse(raw) }; } catch (e) { return { path: m[1], value: raw }; }
}

// Shorthand types that compile to a different Form.io type
function formioTypeOf(shorthandType) {
    if (shorthandType === 'date' || shorthandType === 'time') return 'datetime';
    if (shorthandType === 'phonenumber') return 'phoneNumber';
    if (shorthandType.startsWith('fs') && shorthandType.length > 2) return 'select';
    return shorthandType;
}

const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
function setPath(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const parent = keys.reduce((o, k) => (o[k] = (o[k] && typeof o[k] === 'object') ? o[k] : {}), obj);
    parent[last] = value;
}
const shortText = (v) => { const s = v === undefined ? 'not set' : JSON.stringify(v); return s.length > 40 ? s.slice(0, 37) + '...' : s; };

// undefined = catalog not loaded yet; null = not a known setting for this type
function catalogEntry(type, path) {
    const cat = settingsCatalog[type];
    if (!cat) return undefined;
    return cat.find(e => e.path === path) || null;
}

// Writes one ~ setting into a component. ~ always wins; report = add margin hints/flags (only on the first pass)
function applySetting(comp, setting, row, report) {
    const warn = (text) => { if (report) compileWarnings.push({ row, text }); };
    const hint = (text) => { if (report) compileHints.push({ row, text }); };
    if (comp.type === 'repeat') return warn("~ settings don't apply to [repeat]; it isn't a real Form.io component");
    if (PROTECTED_SETTINGS.includes(setting.path)) return warn(`~${setting.path} is set by the shorthand itself and can't be changed here`);

    const entry = catalogEntry(comp.type, setting.path);
    let value = setting.value;
    if (entry && entry.kind === 'number' && typeof value === 'string' && value.trim() !== '' && !isNaN(value)) value = Number(value);
    const before = getPath(comp, setting.path);
    setPath(comp, setting.path, value);
    if (!report) return;

    if (entry === undefined) requestCatalog(comp.type);
    if (entry === null) warn(`"${setting.path}" isn't a known ${comp.type} setting in Form.io 4 (applied anyway)`);
    if (entry && entry.kind === 'choice' && entry.options && !entry.options.map(String).includes(String(value))) {
        warn(`${setting.path}: "${value}" isn't one of: ${entry.options.join(', ')}`);
    }
    if (before !== undefined && JSON.stringify(before) !== JSON.stringify(value)) {
        (COMPILER_MANAGED.includes(setting.path.split('.')[0]) ? warn : hint)(`Overrides the compiler's value ${shortText(before)}`);
    }
    if (entry) hint(`${entry.label}${entry.help ? ': ' + entry.help : ''} (Form.io default: ${shortText(entry.def)})`);
}

// --- Settings catalog: read from Form.io's own component settings forms, in a hidden frame ---
const SETTINGS_FRAME_HTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
<script src="${SETTINGS_FORMIO_CDN}"><\/script>
<script>
function get(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? undefined : a[k]; }, o); }
function catalog(type) {
    var C = (Formio.Components && Formio.Components.components) || {};
    var cls = C[type];
    if (!cls || !cls.editForm) return null;
    var form = cls.editForm(), schema = cls.schema ? cls.schema() : {}, out = [], seen = {};
    function walk(list, group) {
        (list || []).forEach(function (c) {
            if (!c) return;
            if (c.type === 'tabs') { (c.components || []).forEach(function (tab) { walk(tab.components, tab.label || tab.key); }); return; }
            // Settings are input fields with a key; skip code editors (as: javascript/json belongs in the builder)
            // but keep rich-text ones (as: html), e.g. description and tooltip
            if (c.input && c.key && c.type !== 'button' && (!c.editor || c.as === 'html') && !seen[c.key]) {
                seen[c.key] = 1;
                var opts = (c.data && c.data.values) || c.values;
                var kind = c.type === 'checkbox' ? 'boolean' : c.type === 'number' ? 'number'
                    : (opts && opts.length) ? 'choice'
                    : ['datagrid', 'editgrid', 'tags', 'datamap'].indexOf(c.type) !== -1 ? 'json' : 'text';
                var def = get(schema, c.key);
                try { def = def === undefined ? undefined : JSON.parse(JSON.stringify(def)); } catch (e) { def = undefined; }
                out.push({ path: c.key, label: c.label || c.key, help: c.tooltip || c.description || '', group: group || 'Other', kind: kind,
                    options: kind === 'choice' ? opts.map(function (o) { return o.value; }).filter(function (v) { return v !== '' && v != null; }) : null,
                    def: def });
                return; // an input's own sub-fields (e.g. the rows of a values grid) aren't settings
            }
            if (c.components) walk(c.components, group);
            if (c.columns) c.columns.forEach(function (col) { walk(col.components, group); });
            if (Array.isArray(c.rows)) c.rows.forEach(function (r) { (r || []).forEach(function (cell) { walk(cell && cell.components, group); }); });
        });
    }
    walk(form.components, null);
    return out;
}
window.addEventListener('message', function (e) {
    if (e.source !== parent || !e.data || e.data.type !== 'catalog-request') return;
    var entries = null;
    try { entries = typeof Formio === 'undefined' ? null : catalog(e.data.compType); } catch (err) { entries = null; }
    parent.postMessage({ type: 'catalog', compType: e.data.compType, entries: entries }, '*');
});
parent.postMessage({ type: 'settings-ready' }, '*');
<\/script></body></html>`;

function requestCatalog(type, callback) {
    if (type in settingsCatalog) { if (callback) callback(settingsCatalog[type]); return; }
    const first = !catalogWaiters[type];
    catalogWaiters[type] = catalogWaiters[type] || [];
    if (callback) catalogWaiters[type].push(callback);
    if (!settingsFrame) {
        settingsFrame = document.createElement('iframe');
        settingsFrame.style.display = 'none';
        settingsFrame.srcdoc = SETTINGS_FRAME_HTML;
        document.body.appendChild(settingsFrame);
    } else if (settingsFrameReady && first) {
        settingsFrame.contentWindow.postMessage({ type: 'catalog-request', compType: type }, '*');
    }
}

// Which settings are already written for the component around this row (for ✓ in the menu)
function usedSettingsAt(row) {
    const lines = shorthand.session.getDocument().getAllLines();
    const used = new Set();
    const boundary = (l) => !l.trim() || /^[!@]*\[/.test(l.trim()) || l.trim().startsWith('+++');
    const collect = (l) => { const m = l.trim().match(/^~\s*([\w.]+)/); if (m) used.add(m[1]); };
    for (let r = row - 1; r >= 0 && !boundary(lines[r]); r--) collect(lines[r]);
    for (let r = row + 1; r < lines.length && !boundary(lines[r]); r++) collect(lines[r]);
    return used;
}

const escapeSnippet = (s) => String(s).replace(/[$}\\]/g, '\\$&');
function settingSnippet(e) {
    if (e.kind === 'boolean') return e.def === true ? `~${e.path}: false` : `~${e.path}`;
    const start = e.options ? (e.def !== undefined && e.def !== '' ? e.def : e.options[0])
        : (e.def === undefined || e.def === '' ? '' : (typeof e.def === 'string' ? e.def : JSON.stringify(e.def)));
    return `~${e.path}: \${1:${escapeSnippet(start)}}`;
}

// "~" at the start of a line lists every setting for the component above; "~name: " lists that setting's options
const settingsCompleter = {
    id: 'componentSettings',
    identifierRegexps: [/[\[~\w.]/],
    triggerCharacters: ['~'],
    getCompletions(ed, session, pos, prefix, callback) {
        const before = session.getLine(pos.row).slice(0, pos.column);
        const type = settingTargetTypes[pos.row] || settingTargetTypes[pos.row - 1];
        if (!type || type === 'repeat') return callback(null, []);

        const valueStage = before.match(/^\s*~\s*([\w.]+)\s*:\s*([\w.-]*)$/);
        if (valueStage) {
            return requestCatalog(type, (cat) => {
                const e = cat && cat.find(x => x.path === valueStage[1]);
                if (!e || !e.options) return callback(null, []);
                callback(null, e.options.map((o, i) => ({ caption: String(o), value: String(o), meta: o === e.def ? 'default' : e.label, score: 100 - i })));
            });
        }

        if (!prefix.startsWith('~') || before.trim() !== prefix) return callback(null, []);
        requestCatalog(type, (cat) => {
            if (!cat) return callback(null, []);
            const used = usedSettingsAt(pos.row);
            callback(null, cat.filter(e => !PROTECTED_SETTINGS.includes(e.path)).map((e, i) => ({
                caption: '~' + e.path,
                snippet: settingSnippet(e),
                meta: (used.has(e.path) ? '✓ ' : '') + e.group,
                docText: `${e.label}${e.help ? '\n' + e.help : ''}\nForm.io default: ${shortText(e.def)}`,
                score: 1000 - i
            })));
        });
    }
};

function initSettings() {
    shorthand.completers.push(settingsCompleter);
    window.addEventListener('message', (e) => {
        if (!settingsFrame || e.source !== settingsFrame.contentWindow || !e.data) return;
        if (e.data.type === 'settings-ready') {
            settingsFrameReady = true;
            Object.keys(catalogWaiters).forEach(type => settingsFrame.contentWindow.postMessage({ type: 'catalog-request', compType: type }, '*'));
        }
        if (e.data.type === 'catalog') {
            settingsCatalog[e.data.compType] = e.data.entries;
            (catalogWaiters[e.data.compType] || []).forEach(cb => cb(e.data.entries));
            delete catalogWaiters[e.data.compType];
            // Re-run the compile so ~ lines for this type get their explanations and checks
            if (/^\s*~/m.test(shorthand.getValue())) compileShorthand();
        }
    });
}
