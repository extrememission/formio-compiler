// --- Fillable PDF: a "Download PDF" button for the Form.io Compiler ---
// Turns the compiled form (the same components the Preview shows) into a fillable PDF: text boxes, checkboxes,
// radio buttons and dropdowns that anyone can fill in with a PDF reader. Each PDF field is named after its
// component's key, so filled-in data lines up with the Form.io schema.
// Self-contained: adds its own button to the JSON pane, loads pdf-lib on first use, and only READS the compiler's
// output (lastComponents, formTitle, pdfLeaveOut, pdfRows). It changes nothing else in the app.
// Paper rules: fields that only show on a condition print with an "If ...:" line; every [repeat] copy prints
// (so [repeat: 3] = 3 copies) without its "Add another?" boxes; Edit Grids print as fillable tables.
(function () {
'use strict';

const PDF_LIB_CDN = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
const GRID_ROWS = 5; // blank rows printed for each Edit Grid / Data Grid (~rows: N under the grid overrides it)

// --- Text: the PDF's built-in Helvetica only has Western European characters (WinAnsi) ---
const WINANSI_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
const SWAP = { '‐': '-', '‑': '-', '‒': '-', '―': '-', '−': '-', '⁃': '-',
    '′': "'", '″': '"', '‛': "'", '‟': '"', '\t': ' ' };

// Anything Helvetica can't draw becomes a plain look-alike, a space, nothing (invisible characters) or "?"
function T(s) {
    let out = '';
    for (const ch of String(s == null ? '' : s)) {
        const code = ch.codePointAt(0);
        if (ch === '\n') out += ch;
        else if (code === 160) out += ' ';
        else if (code === 173) continue; // soft hyphen
        else if ((code >= 32 && code <= 126) || (code >= 161 && code <= 255)) out += ch;
        else if (WINANSI_EXTRA.includes(ch)) out += ch;
        else if (SWAP[ch] !== undefined) out += SWAP[ch];
        else if ((code >= 0x2000 && code <= 0x200A) || code === 0x202F || code === 0x205F || code === 0x3000) out += ' ';
        else if (code < 32 || (code >= 0x200B && code <= 0x200F) || code === 0x2060 || code === 0xFEFF || (code >= 0xFE00 && code <= 0xFE0F)) continue;
        else out += '?';
    }
    return out;
}

// Content / HTML components → plain text with line breaks
function htmlToText(html) {
    return String(html || '')
        .replace(/<\s*br\s*\/?>/gi, '\n')
        .replace(/<\s*li[^>]*>/gi, '\n- ')
        .replace(/<\/\s*(p|div|h[1-6]|ul|ol|tr|table|blockquote)\s*>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (m, n) => String.fromCharCode(Number(n))).replace(/&amp;/g, '&')
        .replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

// Word-wrap to a width; words longer than a whole line are split
function wrap(text, font, size, width) {
    const out = [];
    String(text).split('\n').forEach(para => {
        let line = '';
        para.split(/ +/).forEach(word => {
            const cand = line ? line + ' ' + word : word;
            if (font.widthOfTextAtSize(cand, size) <= width) { line = cand; return; }
            if (line) out.push(line);
            while (word.length > 1 && font.widthOfTextAtSize(word, size) > width) {
                let i = word.length - 1;
                while (i > 1 && font.widthOfTextAtSize(word.slice(0, i), size) > width) i--;
                out.push(word.slice(0, i));
                word = word.slice(i);
            }
            line = word;
        });
        out.push(line);
    });
    return out;
}

function clip(text, font, size, width) {
    if (font.widthOfTextAtSize(text, size) <= width) return text;
    while (text.length > 1 && font.widthOfTextAtSize(text + '…', size) > width) text = text.slice(0, -1);
    return text + '…';
}

const kids = (c) => [c.components || [],
    ...(c.columns || []).map(col => col.components || []),
    ...(Array.isArray(c.rows) ? c.rows : []).flatMap(r => (r || []).map(cell => (cell && cell.components) || []))];

// Keys the compiler says can't work on paper (SUMMARY / LIST BY / LOG reports); set for each build
let leaveOut = new Set();

// Parts of the compiled form that only make sense live in Form.io
function skip(c) {
    if (!c || c.hidden) return true;
    if (c.type === 'hidden' || c.type === 'button') return true;
    if (leaveOut.has(c.key)) return true;                                          // reports
    if (/\bno-print\b/.test(c.customClass || '')) return true;                  // [print]
    if (/^addAnother_/.test(c.key || '')) return true;                           // [repeat]'s "Add another?" boxes: every copy is printed
    if (c.type === 'htmlelement' && /\{%|\{\{/.test(c.content || '')) return true; // [chart], [allfields] ~htmlElement
    if (c.type === 'content' && /\{\{/.test(c.html || '')) return true;          // [allfields]
    if ((c.components || []).some(k => k && k.type === 'hidden' && /__formioDiag/.test(k.customConditional || ''))) return true; // [diagnostics]
    return false;
}

// --- Build the PDF from the compiled components ---
// opts: { leaveOut: Set of keys to skip, rows: Map of grid key → blank rows, long: one long page instead of Letter pages }
async function buildFormPdf(PDFLib, components, title, opts) {
    opts = opts || {};
    leaveOut = opts.leaveOut instanceof Set ? opts.leaveOut : new Set();
    const gridRows = opts.rows instanceof Map ? opts.rows : new Map();
    const { PDFDocument, StandardFonts, rgb, PDFName, PDFHexString } = PDFLib;
    const doc = await PDFDocument.create();
    const form = doc.getForm();
    const F = {
        reg: await doc.embedFont(StandardFonts.Helvetica),
        bold: await doc.embedFont(StandardFonts.HelveticaBold),
        ital: await doc.embedFont(StandardFonts.HelveticaOblique)
    };
    const C = {
        ink: rgb(0.13, 0.15, 0.18), muted: rgb(0.42, 0.45, 0.49), line: rgb(0.62, 0.65, 0.69),
        fill: rgb(0.96, 0.97, 0.99), head: rgb(0.91, 0.93, 0.96), bar: rgb(0.12, 0.33, 0.58),
        white: rgb(1, 1, 1), red: rgb(0.8, 0.15, 0.2)
    };
    // US Letter, in points. Long mode: Letter width, one page as tall as the form (PDF's limit is 200 in = 14400 pt;
    // a form longer than that continues on a second long page). The page is trimmed to the content at the end.
    const long = !!opts.long;
    const PAGE_W = 612, PAGE_H = long ? 14400 : 792, M = 48, TOP = PAGE_H - M, BOTTOM = M + 14, GAP = 10;
    const st = { page: null, y: TOP };
    const newPage = () => { st.page = doc.addPage([PAGE_W, PAGE_H]); st.y = TOP; };
    const need = (h) => { if (st.y - h < BOTTOM && st.y < TOP) newPage(); };
    newPage();

    // Every component by key, and the one just before it in its list (for "If ...:" lines)
    const byKey = new Map(), prevKey = new Map();
    const index = (list) => (list || []).forEach((c, i) => {
        if (!c) return;
        if (c.key) { byKey.set(c.key, c); if (i > 0 && list[i - 1]) prevKey.set(c.key, list[i - 1].key); }
        kids(c).forEach(index);
    });
    index(components);

    // A field that only shows on a condition: paper can't hide it, so say when it applies.
    // "If Hazard Type is Other:"; right under its question just "If Other:" (Bulk Mode notes)
    function condText(c) {
        const cond = c && c.conditional;
        if (!cond || !cond.when || /^addAnother_/.test(cond.when)) return ''; // [repeat] copies all print
        const target = byKey.get(cond.when);
        if (!target) return '';
        const not = String(cond.show) === 'false';
        const choices = (target.values && target.values.length ? target.values : (target.data && target.data.values) || []);
        const hit = choices.find(o => o && String(o.value) === String(cond.eq));
        let what = hit ? hit.label : String(cond.eq);
        if (target.type === 'checkbox') what = String(cond.eq) === 'true' ? 'checked' : 'not checked';
        const near = prevKey.get(c.key) === cond.when;
        if (target.type === 'checkbox') return T(`If ${near ? 'above is' : (target.label || '') + ' is'} ${what}:`);
        return T(near ? `If ${not ? 'not ' : ''}${what}:` : `If ${target.label || cond.when} is ${not ? 'not ' : ''}${what}:`);
    }

    // Field names must be unique; a period would nest fields, so it's replaced
    const usedNames = new Set();
    const fieldName = (base) => {
        const clean = String(base || 'field').replace(/[.\s]+/g, '_');
        let name = clean, n = 2;
        while (usedNames.has(name)) name = clean + '_' + n++;
        usedNames.add(name);
        return name;
    };
    // Tooltip shown when hovering a field (also read by screen readers)
    const tip = (field, text) => { try { if (text) field.acroField.dict.set(PDFName.of('TU'), PDFHexString.fromText(text)); } catch (e) { /* cosmetic only */ } };
    const look = { borderColor: C.line, borderWidth: 0.75, backgroundColor: C.fill, textColor: C.ink };
    const txt = (s, x, y, size, font, color) => { if (s) st.page.drawText(s, { x, y, size, font, color }); };
    const isReq = (c) => !!(c && c.validate && c.validate.required);

    // Lines with an optional red * at the end
    function drawLines(lines, x, top, size, font, color, lh, star) {
        lines.forEach((l, i) => {
            const y = top - size - i * lh;
            if (star && i === lines.length - 1 && l.endsWith('*')) {
                const s = l.slice(0, -1);
                txt(s, x, y, size, font, color);
                txt('*', x + font.widthOfTextAtSize(s, size), y, size, font, C.red);
            } else txt(l, x, y, size, font, color);
        });
    }

    function textBlock(text, x, w, top, draw, font, size, color) {
        if (!text) return 0;
        const lines = wrap(text, font, size, w), lh = size * 1.3;
        if (draw) drawLines(lines, x, top, size, font, color, lh, false);
        return lines.length * lh;
    }

    function labelBlock(c, x, w, top, draw) {
        if (c.hideLabel || !c.label) return 0;
        const req = isReq(c);
        const lines = wrap(T(c.label) + (req ? ' *' : ''), F.bold, 9.5, w);
        if (draw) drawLines(lines, x, top, 9.5, F.bold, C.ink, 12, req);
        return lines.length * 12 + 3;
    }

    function descBlock(c, x, w, top, draw) {
        const text = T(htmlToText(c.description || ''));
        const h = textBlock(text, x, w, top - 2, draw, F.ital, 8.5, C.muted);
        return h ? h + 2 : 0;
    }

    function textField(c, name, x, y, w, h, multiline, tipText) {
        const tf = form.createTextField(fieldName(name));
        if (multiline) tf.enableMultiline();
        const max = c && c.validate && Number(c.validate.maxLength);
        if (max > 0) tf.setMaxLength(max);
        tf.addToPage(st.page, Object.assign({ x, y, width: w, height: h, font: F.reg }, look));
        tf.setFontSize(10);
        const def = c && c.defaultValue;
        if (!multiline && c && !c.calculateValue && (typeof def === 'string' || typeof def === 'number') && String(def) !== '') {
            try { tf.setText(T(String(def)).slice(0, max > 0 ? max : undefined)); } catch (e) { /* leave blank */ }
        }
        tip(tf, tipText || T(c && c.label));
        return tf;
    }

    function checkBox(name, x, y, size, tipText, checked) {
        const cb = form.createCheckBox(fieldName(name));
        cb.addToPage(st.page, Object.assign({ x, y, width: size, height: size }, look));
        if (checked) cb.check();
        tip(cb, tipText);
        return cb;
    }

    // Radio / checkbox-list choices: in one row when they fit, otherwise one per line
    function choicesBlock(c, opts, x, w, top, draw, make) {
        const S = 9.5, ROW = 15, BOX = 11;
        const items = opts.map(o => { const t = T(o.label); return { o, t, tw: F.reg.widthOfTextAtSize(t, S) }; });
        const rowWidth = items.reduce((s, i) => s + BOX + 5 + i.tw + 16, 0);
        if (rowWidth <= w || c.inline) {
            let cx = 0, row = 0;
            items.forEach(i => {
                const iw = BOX + 5 + Math.min(i.tw, w - BOX - 5) + 16;
                if (cx > 0 && cx + iw > w) { cx = 0; row++; }
                if (draw) {
                    make(i.o, x + cx, top - row * ROW - BOX - 1, BOX);
                    txt(clip(i.t, F.reg, S, w - BOX - 5), x + cx + BOX + 5, top - row * ROW - 9.5, S, F.reg, C.ink);
                }
                cx += iw;
            });
            return items.length ? (row + 1) * ROW : 0;
        }
        let h = 0;
        items.forEach(i => {
            const lines = wrap(i.t, F.reg, S, w - BOX - 5);
            if (draw) {
                make(i.o, x, top - h - BOX - 1, BOX);
                drawLines(lines, x + BOX + 5, top - h, S, F.reg, C.ink, 12, false);
            }
            h += Math.max(ROW, lines.length * 12 + 3);
        });
        return h;
    }

    const uniqueByValue = (opts) => { const seen = new Set(); return opts.filter(o => o && !seen.has(String(o.value)) && seen.add(String(o.value))); };

    // One field with its "If ...:" line (when it only shows on a condition). Returns its height; draws only when draw is true.
    function leaf(c, x, w, top, draw) {
        const cond = condText(c);
        const ch = cond ? textBlock(cond, x, w, top, draw, F.ital, 8.5, C.muted) + 2 : 0;
        const h = leafBody(c, x, w, top - ch, draw);
        return h ? ch + h : 0;
    }

    // One field (label, box, description)
    function leafBody(c, x, w, top, draw) {
        const type = c.type;

        if (type === 'content') return textBlock(T(htmlToText(c.html)), x, w, top, draw, F.reg, 10, C.ink);
        if (type === 'htmlelement') {
            const tag = String(c.tag || 'p').toLowerCase();
            if (tag === 'hr') {
                if (draw) st.page.drawLine({ start: { x, y: top - 4 }, end: { x: x + w, y: top - 4 }, thickness: 0.75, color: C.line });
                return 8;
            }
            const sizes = { h1: 18, h2: 15, h3: 13, h4: 12, h5: 11, h6: 10 };
            const heading = sizes[tag] || ((c.properties && c.properties.repeatHeader) ? 11 : 0);
            return textBlock(T(htmlToText(c.content)), x, w, top, draw, heading ? F.bold : F.reg, heading || 10, C.ink);
        }

        if (type === 'checkbox') {
            const req = isReq(c);
            const lines = wrap(T(c.label || '') + (req ? ' *' : ''), F.reg, 10, w - 17);
            const bh = Math.max(12, lines.length * 12.5);
            if (draw) {
                checkBox(c.key, x, top - 11.5, 11, T(c.label), c.defaultValue === true);
                drawLines(lines, x + 17, top, 10, F.reg, C.ink, 12.5, req);
            }
            return bh + descBlock(c, x, w, top - bh, draw);
        }

        if (!c.input && !['signature', 'file'].includes(type)) return 0; // layout pieces this doesn't know

        const lh = labelBlock(c, x, w, top, draw);
        const y = top - lh; // top of the field itself
        let bh = 20;

        if (type === 'textarea') {
            bh = Math.max(2, Number(c.rows) || 3) * 13 + 6;
            if (draw) textField(c, c.key, x, y - bh, w, bh, true);
        } else if (type === 'radio' || type === 'selectboxes') {
            const opts = uniqueByValue(c.values || []);
            if (!opts.length) {
                if (draw) textField(c, c.key, x, y - bh, w, bh, false);
            } else if (type === 'radio') {
                let group = null;
                bh = choicesBlock(c, opts, x, w, y - 2, draw, (o, ox, oy, s) => {
                    if (!group) { group = form.createRadioGroup(fieldName(c.key)); tip(group, T(c.label)); }
                    group.addOptionToPage(String(o.value), st.page, Object.assign({ x: ox, y: oy, width: s, height: s }, look));
                }) + 2;
                if (draw && group && c.defaultValue !== undefined && opts.some(o => String(o.value) === String(c.defaultValue))) {
                    try { group.select(String(c.defaultValue)); } catch (e) { /* leave blank */ }
                }
            } else {
                const def = c.defaultValue && typeof c.defaultValue === 'object' ? c.defaultValue : {};
                bh = choicesBlock(c, opts, x, w, y - 2, draw, (o, ox, oy, s) => {
                    checkBox(c.key + '_' + o.value, ox, oy, s, T(c.label) + ': ' + T(o.label), def[o.value] === true);
                }) + 2;
            }
        } else if (type === 'select') {
            const opts = uniqueByValue((c.data && c.data.values) || []);
            const labels = [...new Set(opts.map(o => T(o.label)).filter(Boolean))];
            if (!labels.length) { // [fs...] lookups get their choices from the platform: a plain text box here
                if (draw) textField(c, c.key, x, y - bh, Math.min(w, 260), bh, false);
            } else {
                const widest = Math.max(...labels.map(l => F.reg.widthOfTextAtSize(l, 10)));
                const fw = Math.min(w, Math.max(180, widest + 30));
                if (c.multiple) bh = Math.min(labels.length, 6) * 12 + 6;
                if (draw) {
                    const field = c.multiple ? form.createOptionList(fieldName(c.key)) : form.createDropdown(fieldName(c.key));
                    field.addOptions(labels);
                    if (c.multiple) field.enableMultiselect();
                    field.addToPage(st.page, Object.assign({ x, y: y - bh, width: fw, height: bh, font: F.reg }, look));
                    field.setFontSize(10);
                    const pick = opts.find(o => String(o.value) === String(c.defaultValue));
                    if (pick) { try { field.select(T(pick.label)); } catch (e) { /* leave blank */ } }
                    tip(field, T(c.label));
                }
            }
        } else if (type === 'signature') {
            bh = 48;
            if (draw) {
                const bw = Math.min(w, 300);
                st.page.drawRectangle({ x, y: y - bh, width: bw, height: bh, color: C.fill, borderColor: C.line, borderWidth: 0.75 });
                st.page.drawLine({ start: { x: x + 12, y: y - bh + 12 }, end: { x: x + bw - 12, y: y - bh + 12 }, thickness: 0.5, color: C.line });
                txt('x', x + 14, y - bh + 15, 10, F.reg, C.muted);
            }
            if (c.footer) bh += textBlock(T(htmlToText(c.footer)), x, w, y - bh - 2, draw, F.ital, 8.5, C.muted) + 2;
        } else if (type === 'file') {
            bh = 13;
            if (draw) txt('(Attach files separately)', x, y - 10, 9, F.ital, C.muted);
        } else {
            // One-line box: text, email, phone, number, currency, date/time, and anything else that takes input
            const narrow = { number: 180, currency: 180, phoneNumber: 180, datetime: 170, day: 170, time: 170 }[type];
            const pre = T(c.prefix || (type === 'currency' ? '$' : ''));
            const suf = T(c.suffix || '');
            const preW = pre ? F.reg.widthOfTextAtSize(pre, 10) + 4 : 0;
            let hint = '';
            if (type === 'datetime') {
                const fmt = (c.widget && c.widget.format) || (c.enableTime === false ? 'yyyy-MM-dd' : 'yyyy-MM-dd hh:mm a');
                hint = fmt.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD').replace(/\ba\b/, 'AM/PM');
            }
            const after = [suf, hint].filter(Boolean).join('  ');
            const afterW = after ? Math.min(F.reg.widthOfTextAtSize(after, after === suf ? 10 : 8.5) + 6, w / 2) : 0;
            const fw = Math.max(40, Math.min(narrow || w, w - preW - afterW));
            if (draw) {
                if (pre) txt(pre, x, y - 14, 10, F.reg, C.ink);
                textField(c, c.key, x + preW, y - bh, fw, bh, false);
                if (suf) txt(suf, x + preW + fw + 5, y - 14, 10, F.reg, C.ink);
                if (hint) txt(hint, x + preW + fw + 5 + (suf ? F.reg.widthOfTextAtSize(suf, 10) + 8 : 0), y - 13.5, 8.5, F.ital, C.muted);
            }
        }
        return lh + bh + descBlock(c, x, w, y - bh, draw);
    }

    // --- Flow: places components down the page, starting new pages as needed ---
    function flowText(text, font, size, x, w, color) { // long Content blocks may run across pages
        const lh = size * 1.3;
        wrap(text, font, size, w).forEach(l => { need(lh); txt(l, x, st.y - size, size, font, color || C.ink); st.y -= lh; });
        st.y -= GAP;
    }

    function place(c, x, w) {
        if (c.type === 'content') {
            const cond = condText(c);
            if (cond) { flowText(cond, F.ital, 8.5, x, w, C.muted); st.y += GAP - 2; }
            const text = T(htmlToText(c.html));
            if (text) flowText(text, F.reg, 10, x, w);
            return;
        }
        const h = leaf(c, x, w, 0, false);
        if (!h) return;
        need(h);
        leaf(c, x, w, st.y, true);
        st.y -= h + GAP;
    }

    function flow(list, x, w) {
        (list || []).forEach(c => {
            if (skip(c)) return;
            const t = c.type;
            const container = ['panel', 'fieldset', 'well', 'container', 'editgrid', 'datagrid', 'table', 'columns'].includes(t);
            const cond = container ? condText(c) : '';
            if (cond) { flowText(cond, F.ital, 8.5, x, w, C.muted); st.y += GAP - 2; }
            if (t === 'panel') panel(c, x, w);
            else if (t === 'fieldset') fieldset(c, x, w);
            else if (t === 'well' || t === 'container') flow(c.components, x + 8, w - 8);
            else if (t === 'editgrid' || t === 'datagrid') grid(c, x, w);
            else if (t === 'table') cellsRow((c.rows || []).map(r => (r || []).map(cell => (cell && cell.components) || [])), null, x, w);
            else if (t === 'columns') cellsRow([(c.columns || []).map(col => col.components || [])], (c.columns || []).map(col => Number(col.width) || 0), x, w);
            else place(c, x, w);
        });
    }

    function panel(c, x, w) {
        const title = T(c.title || c.label || '');
        if (!title) return flow(c.components, x, w);
        const lines = wrap(title, F.bold, 11, w - 16), bar = lines.length * 13 + 8;
        need(bar + 50); // keep the heading with what follows
        st.page.drawRectangle({ x, y: st.y - bar, width: w, height: bar, color: C.bar });
        drawLines(lines, x + 8, st.y - 4, 11, F.bold, C.white, 13, false);
        st.y -= bar + 10;
        flow(c.components, x + 4, w - 8);
        st.y -= 4;
    }

    function fieldset(c, x, w) {
        const legend = T(c.legend || '');
        if (!legend) return flow(c.components, x, w);
        const lines = wrap(legend, F.bold, 11, w), h = lines.length * 13 + 4;
        need(h + 50);
        drawLines(lines, x, st.y, 11, F.bold, C.ink, 13, false);
        st.page.drawLine({ start: { x, y: st.y - h }, end: { x: x + w, y: st.y - h }, thickness: 0.75, color: C.line });
        st.y -= h + 8;
        flow(c.components, x + 8, w - 8);
        st.y -= 2;
    }

    // Edit Grid / Data Grid: a fillable table, column widths as in the app. Checkbox columns get a tick box per row;
    // money ($) columns get a Total box under them.
    function grid(c, x, w) {
        const cols = (c.components || []).filter(k => !skip(k) && k.input);
        const lh = labelBlock(c, x, w, 0, false);
        if (!cols.length) {
            if (lh) { need(lh); labelBlock(c, x, w, st.y, true); st.y -= lh + GAP; }
            return;
        }
        let widths = {};
        try { const m = ((c.templates && c.templates.header) || '').match(/var w = (\{[^}]*\})/); if (m) widths = JSON.parse(m[1]); } catch (e) { widths = {}; }
        const weights = cols.map(k => Number(widths[k.key]) || 2);
        const total = weights.reduce((a, b) => a + b, 0);
        const colW = weights.map(v => w * v / total);
        const colX = colW.map((_, i) => x + colW.slice(0, i).reduce((a, b) => a + b, 0));
        const HEAD = 16, ROW = 19, BOX = 11;
        const rows = Math.max(1, Math.min(200, Number(gridRows.get(c.key)) || GRID_ROWS));
        const header = () => {
            st.page.drawRectangle({ x, y: st.y - HEAD, width: w, height: HEAD, color: C.head });
            cols.forEach((k, i) => txt(clip(T(k.label || '') + (isReq(k) ? ' *' : ''), F.bold, 8.5, colW[i] - 6), colX[i] + 3, st.y - 11.5, 8.5, F.bold, C.ink));
            st.y -= HEAD + 1;
        };
        need(lh + HEAD + ROW * 2);
        labelBlock(c, x, w, st.y, true);
        st.y -= lh;
        header();
        for (let r = 1; r <= rows; r++) {
            if (st.y - ROW < BOTTOM) { newPage(); header(); }
            cols.forEach((k, i) => {
                const name = `${c.key}_${r}_${k.key}`, tipText = `${T(k.label)} (row ${r})`;
                if (k.type === 'checkbox') checkBox(name, colX[i] + (colW[i] - BOX) / 2, st.y - ROW + (ROW - BOX) / 2, BOX, tipText, false);
                else textField(k, name, colX[i] + 1, st.y - ROW + 2, colW[i] - 2, ROW - 3, false, tipText);
            });
            st.y -= ROW;
        }
        const money = cols.map((k, i) => k.type === 'currency' ? i : -1).filter(i => i !== -1);
        if (money.length) {
            if (st.y - ROW - 2 < BOTTOM) { newPage(); header(); }
            st.page.drawLine({ start: { x, y: st.y - 1 }, end: { x: x + w, y: st.y - 1 }, thickness: 1, color: C.ink });
            st.y -= 3;
            const label = 'Total', lw = F.bold.widthOfTextAtSize(label, 9);
            const lx = money[0] > 0 ? colX[money[0]] - lw - 5 : colX[0] + 3;
            txt(label, lx, st.y - ROW + 6.5, 9, F.bold, C.ink);
            money.forEach(i => {
                const k = cols[i];
                textField(k, `${c.key}_total_${k.key}`, colX[i] + 1, st.y - ROW + 2, colW[i] - 2, ROW - 3, false, `${T(k.label)} total`);
            });
            st.y -= ROW;
        }
        const dh = descBlock(c, x, w, st.y, true);
        st.y -= dh + GAP;
    }

    // Table rows and Columns: cells side by side, each a stack of fields; a row never splits across pages
    const flatten = (list, out = []) => {
        (list || []).forEach(c => {
            if (skip(c)) return;
            if (['editgrid', 'datagrid'].includes(c.type)) return; // too wide for a cell
            const inner = kids(c).flat();
            if (inner.length) flatten(inner, out); else out.push(c);
        });
        return out;
    };
    const stack = (list, x, w, top, draw) => {
        let h = 0;
        list.forEach(c => { const ch = leaf(c, x, w, top - h, draw); if (ch) h += ch + GAP; });
        return h ? h - GAP : 0;
    };
    function cellsRow(rows, widths, x, w) {
        const PAD = 8;
        rows.forEach(row => {
            const cells = row.map(list => flatten(list));
            if (!cells.length) return;
            const units = widths && widths.some(v => v > 0) ? widths.map(v => v || 1) : cells.map(() => 1);
            const sum = units.reduce((a, b) => a + b, 0);
            const cw = units.map(u => w * u / sum);
            const xs = cw.map((_, i) => x + cw.slice(0, i).reduce((a, b) => a + b, 0));
            const rh = Math.max(0, ...cells.map((list, i) => stack(list, xs[i], cw[i] - PAD, 0, false)));
            if (!rh) return;
            need(rh);
            cells.forEach((list, i) => stack(list, xs[i], cw[i] - PAD, st.y, true));
            st.y -= rh + GAP;
        });
    }

    // --- Title, body, page numbers ---
    const docTitle = T(title || '');
    if (docTitle) {
        const lines = wrap(docTitle, F.bold, 16, PAGE_W - 2 * M);
        drawLines(lines, M, st.y, 16, F.bold, C.ink, 19, false);
        st.y -= lines.length * 19 + 4;
        st.page.drawLine({ start: { x: M, y: st.y }, end: { x: PAGE_W - M, y: st.y }, thickness: 1.25, color: C.ink });
        st.y -= 14;
        doc.setTitle(docTitle);
    }

    // Wizard forms ("=== Page:" lines): the compiler's pages are top-level panels; each starts a new PDF page
    const isWizard = components.length > 1 && components.every(c => c && c.type === 'panel' && !c.theme && Array.isArray(c.components));
    if (isWizard && !long) components.forEach((p, i) => { if (i > 0 && st.y < TOP) newPage(); flow([p], M, PAGE_W - 2 * M); });
    else flow(components, M, PAGE_W - 2 * M);

    // Long mode: trim the last page to where the form ends (the visible page starts at "bottom")
    const pages = doc.getPages();
    const last = pages[pages.length - 1];
    const lastBottom = long ? Math.max(0, Math.floor(st.y - M)) : 0;
    if (lastBottom > 0) { last.setMediaBox(0, lastBottom, PAGE_W, PAGE_H - lastBottom); last.setCropBox(0, lastBottom, PAGE_W, PAGE_H - lastBottom); }
    pages.forEach((p, i) => {
        const label = (docTitle ? clip(docTitle, F.reg, 8, 360) : '') +
            (pages.length > 1 ? (docTitle ? '   ·   ' : '') + `Page ${i + 1} of ${pages.length}` : '');
        if (!label) return;
        const y = (p === last ? lastBottom : 0) + M - 20;
        p.drawText(label, { x: PAGE_W - M - F.reg.widthOfTextAtSize(label, 8), y, size: 8, font: F.reg, color: C.muted });
    });

    doc.setProducer('Form.io Compiler (pdf-lib)');
    doc.setCreator('Form.io Compiler');
    return doc.save(); // also draws every field's appearance, so the PDF looks right in any reader
}

// For testing outside the browser
if (typeof module === 'object' && module.exports) module.exports = { buildFormPdf, T, htmlToText };

// --- Browser: the button ---
if (typeof document === 'undefined') return;

let libPromise = null;
const loadPdfLib = () => libPromise || (libPromise = new Promise((resolve, reject) => {
    if (window.PDFLib) return resolve(window.PDFLib);
    const s = document.createElement('script');
    s.src = PDF_LIB_CDN;
    s.onload = () => window.PDFLib ? resolve(window.PDFLib) : reject(new Error('The PDF library loaded but did not start.'));
    s.onerror = () => { libPromise = null; s.remove(); reject(new Error('Could not load the PDF library. Check your internet connection.')); };
    document.head.appendChild(s);
}));

// Reads the compiler's latest output (app.js globals); never writes to them
function compiledForm() {
    try {
        /* global lastComponents, formTitle, pdfLeaveOut, pdfRows, pdfLong */
        return {
            components: lastComponents || [],
            title: typeof formTitle === 'string' ? formTitle : '',
            opts: {
                leaveOut: typeof pdfLeaveOut !== 'undefined' ? pdfLeaveOut : new Set(),
                rows: typeof pdfRows !== 'undefined' ? pdfRows : new Map(),
                long: typeof pdfLong !== 'undefined' && pdfLong
            }
        };
    } catch (e) {
        return null; // app.js not loaded
    }
}

// The current form as PDF bytes (the button, and the compiler's Preview in PDF mode)
async function currentPdf() {
    const src = compiledForm();
    if (!src) throw new Error('The compiler (app.js) needs to load before pdf.js.');
    const PDFLib = await loadPdfLib();
    return buildFormPdf(PDFLib, JSON.parse(JSON.stringify(src.components)), src.title, src.opts);
}
// Lock a FILLED PDF: flatten its fields so the answers become plain page content that can't be edited as a form.
// Appearances are redrawn from the saved values first; if that fails (e.g. characters Helvetica lacks), the
// reader's own drawing of each field is kept instead.
async function lockPdf(bytes) {
    const PDFLib = await loadPdfLib();
    let doc;
    try { doc = await PDFLib.PDFDocument.load(bytes); }
    catch (e) { throw new Error('This file is password-protected or not a valid PDF.'); }
    const form = doc.getForm();
    if (!form.getFields().length) throw new Error('This PDF has no fillable fields to lock.');
    try { form.flatten(); }
    catch (e) {
        doc = await PDFLib.PDFDocument.load(bytes);
        doc.getForm().flatten({ updateFieldAppearances: false });
    }
    return doc.save();
}
window.FormioPdf = { build: currentPdf, lock: lockPdf };

// Same naming rule as Download: "# Title" line, else the first panel / field set / label
function pdfFileName(src) {
    const first = src.components[0] || {};
    const name = String(src.title || first.title || first.legend || first.label || 'form')
        .replace(/[\\/:*?"<>|]+/g, '-').trim().slice(0, 80) || 'form';
    return name + '.pdf';
}

async function savePdf(bytes, name) {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    if (isMobile && navigator.canShare) {
        const file = new File([bytes], name, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
            try { await navigator.share({ files: [file], title: name }); return; }
            catch (e) { if (e && e.name === 'AbortError') return; } // dismissed; any other failure falls back to a download
        }
    }
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function addButton() {
    const anchor = document.getElementById('btn-download');
    if (!anchor || document.getElementById('btn-pdf')) return;
    const btn = document.createElement('button');
    btn.id = 'btn-pdf';
    btn.className = 'btn-text';
    btn.title = 'Download Fillable PDF';
    btn.innerHTML = '<i class="fa-solid fa-file-pdf"></i>';
    anchor.insertAdjacentElement('afterend', btn);

    btn.addEventListener('click', async () => {
        const src = compiledForm();
        if (!src) return alert('The compiler (app.js) needs to load before pdf.js.');
        if (!src.components.length) return alert('Nothing to export yet: add some components first.');
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        try {
            await savePdf(await currentPdf(), pdfFileName(src));
        } catch (err) {
            console.error(err);
            alert('Could not create the PDF: ' + ((err && err.message) || err));
        } finally {
            btn.disabled = false;
            btn.innerHTML = original;
        }
    });
}

// "Lock PDF": pick a filled-in PDF, get back a flattened copy named "<name> - locked.pdf"
function addLockButton() {
    const anchor = document.getElementById('btn-pdf');
    if (!anchor || document.getElementById('btn-pdf-lock')) return;
    const btn = document.createElement('button');
    btn.id = 'btn-pdf-lock';
    btn.className = 'btn-text';
    btn.title = 'Lock a Filled PDF: pick a filled-in PDF and save a copy whose answers can no longer be edited';
    btn.innerHTML = '<i class="fa-solid fa-lock"></i>';
    anchor.insertAdjacentElement('afterend', btn);

    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'application/pdf,.pdf';
    picker.hidden = true;
    document.body.appendChild(picker);

    btn.addEventListener('click', () => { picker.value = ''; picker.click(); });
    picker.addEventListener('change', async () => {
        const file = picker.files && picker.files[0];
        if (!file) return;
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        try {
            const bytes = await lockPdf(new Uint8Array(await file.arrayBuffer()));
            await savePdf(bytes, file.name.replace(/\.pdf$/i, '') + ' - locked.pdf');
        } catch (err) {
            console.error(err);
            alert('Could not lock the PDF: ' + ((err && err.message) || err));
        } finally {
            btn.disabled = false;
            btn.innerHTML = original;
        }
    });
}

const addButtons = () => { addButton(); addLockButton(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButtons);
else addButtons();
})();
