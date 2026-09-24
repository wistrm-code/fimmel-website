/* Fimmel Faktura – klickbar demo för hemsidan.
   Fristående HTML/JS som efterliknar appens design och flöden. Ingen data lämnar webbläsaren. */
(function () {
  'use strict';

  var DEMO_LIFETIME_MS = 60 * 60 * 1000;
  var DOWNLOAD_HREF = '#hamta';

  var host, S, timer = null;

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function num(v) { var n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; }
  function fmt(n) { return n.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()); }
  function fromIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function longDate(d) { return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function icon(name) {
    var p = {
      back: '<path d="M15 5l-7 7 7 7"/>',
      home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      people: '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4 1.6 4 4"/>',
      doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
      quote: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M12 10v7M14 11h-3a1.3 1.3 0 000 2.6h2a1.3 1.3 0 010 2.6h-3"/>',
      sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
      download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
      share: '<path d="M12 15V4M8 8l4-4 4 4M6 12v8h12v-8"/>',
      trash: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',
      chevron: '<path d="M9 5l7 7-7 7"/>',
      check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
      copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>',
      more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
      inbox: '<path d="M4 13l3-8h10l3 8v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/>',
      repeat: '<path d="M4 11V9a3 3 0 013-3h11M15 3l3 3-3 3M20 13v2a3 3 0 01-3 3H6M9 21l-3-3 3-3"/>',
      pencil: '<path d="M4 20l1-4L16 5l3 3L8 19zM14 7l3 3"/>',
      building: '<path d="M5 21V4h9v17M14 9h5v12M8 8h3M8 12h3M8 16h3"/>',
      help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 015 .5c0 1.7-2.5 2-2.5 3.6M12 17h.01"/>',
      undo: '<path d="M4 12a8 8 0 108-8 8 8 0 00-6 2.7M4 4v4h4M12 8v4l3 2"/>',
      bell: '<path d="M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21h4"/>'
    }[name] || '';
    return '<svg class="dm-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }

  /* ---------- seed data ---------- */

  function seed() {
    var t = today();
    function ago(n) { return addDays(t, -n); }
    var customers = [
      { id: 'c-anna', type: 'privat', name: 'Anna Lindqvist', address: 'Storgatan 12', zip: '753 31', city: 'Uppsala', country: 'SE', email: 'anna.lindqvist@example.com', currency: 'SEK', dueDays: 30 },
      { id: 'c-erik', type: 'privat', name: 'Erik Johansson', address: 'Vårgatan 7', zip: '756 45', city: 'Uppsala', country: 'SE', email: 'erik.johansson@example.com', currency: 'SEK', dueDays: 30 },
      { id: 'c-karl', type: 'foretag', name: 'Karlssons Bygg & Måleri AB', org: '556123-4567', address: 'Verkstadsgatan 3', zip: '414 58', city: 'Göteborg', country: 'SE', email: 'faktura@karlssonsbygg.example', currency: 'SEK', dueDays: 30, ref: 'Lars Karlsson' },
      { id: 'c-parl', type: 'foretag', name: 'Restaurang Pärlan AB', org: '559012-3456', address: 'Hamngatan 21', zip: '211 22', city: 'Malmö', country: 'SE', email: 'ekonomi@restaurangparlan.example', currency: 'SEK', dueDays: 20 },
      { id: 'c-nord', type: 'foretag', name: 'Nordic Design Studio ApS', org: 'DK12345678', address: 'Nyhavn 18', zip: '1051', city: 'København', country: 'DK', email: 'accounts@nordicdesign.example', currency: 'EUR', dueDays: 30 }
    ];
    function inv(n, cid, daysAgo, lines, o) {
      o = o || {};
      var c = customers.filter(function (x) { return x.id === cid; })[0];
      var d = ago(daysAgo);
      return {
        id: uid(), kind: 'invoice', number: t.getFullYear() + '-' + ('000' + n).slice(-4), customerId: cid,
        date: d, due: addDays(d, c.dueDays), lines: lines, deduction: o.deduction || '',
        currency: c.currency, paid: !!o.paid, reminderSent: false, credit: false
      };
    }
    var invoices = [
      inv(5, 'c-nord', 5, [{ desc: 'Webbdesign – konsulttimmar', qty: '10', price: '85', vat: 0, kind: 'arbete' }]),
      inv(4, 'c-parl', 12, [{ desc: 'Grundstädning av restauranglokal', qty: '8', price: '480', vat: 25, kind: 'arbete' }, { desc: 'Städmaterial', qty: '1', price: '350', vat: 25, kind: 'material' }]),
      inv(3, 'c-anna', 25, [{ desc: 'Storstädning, 4 rum', qty: '6', price: '650', vat: 25, kind: 'arbete' }], { deduction: 'RUT', paid: true }),
      inv(2, 'c-erik', 45, [{ desc: 'Badrumsrenovering – arbete', qty: '40', price: '550', vat: 25, kind: 'arbete' }, { desc: 'Kakel, fix och rörmaterial', qty: '1', price: '12000', vat: 25, kind: 'material' }], { deduction: 'ROT' }),
      inv(1, 'c-karl', 60, [{ desc: 'Målning av trapphus', qty: '25', price: '520', vat: 25, kind: 'arbete' }, { desc: 'Färg och material', qty: '1', price: '3800', vat: 25, kind: 'material' }], { paid: true })
    ];
    var od = ago(10);
    var offers = [{
      id: uid(), kind: 'offer', number: 'O-' + t.getFullYear() + '-0001', customerId: 'c-karl', date: od, due: addDays(od, 30),
      lines: [{ desc: 'Fasadmålning, villa', qty: '60', price: '520', vat: 25, kind: 'arbete' }, { desc: 'Fasadfärg och material', qty: '1', price: '9500', vat: 25, kind: 'material' }],
      deduction: '', currency: 'SEK', followUps: 0
    }];
    return {
      company: { name: 'Sundin Hemservice', org: '850615-1235', vat: 'SE850615123501', addr: 'Björkvägen 4', zip: '753 20', city: 'Uppsala', email: 'hej@sundinhemservice.se', phone: '070-123 45 67', bg: '123-4567', swish: '123 456 78 90' },
      customers: customers, invoices: invoices, offers: offers,
      settings: { rot: true, rut: true, offers: true, swishQr: true, ore: true, followUp: true },
      counters: { inv: 5, off: 1 },
      nav: [{ name: 'home' }], drawer: false, toastMsg: '', draft: null, filter: 'all', search: ''
    };
  }

  /* ---------- calculations ---------- */

  function calc(doc) {
    var sign = doc.credit ? -1 : 1, net = 0, tax = 0, labour = 0;
    doc.lines.forEach(function (l) {
      var n = num(l.qty) * num(l.price), t = n * (l.vat / 100);
      net += n; tax += t;
      if (l.kind === 'arbete') labour += n + t;
    });
    var gross = net + tax, ded = 0;
    if (doc.deduction === 'ROT') ded = labour * 0.3;
    if (doc.deduction === 'RUT') ded = labour * 0.5;
    var pay = gross - ded, rounding = 0;
    if (doc.currency === 'SEK' && S.settings.ore) { rounding = Math.round(pay) - pay; pay = Math.round(pay); }
    return { net: net * sign, tax: tax * sign, gross: gross * sign, ded: ded * sign, rounding: rounding * sign, pay: pay * sign };
  }
  function cust(id) { return S.customers.filter(function (c) { return c.id === id; })[0]; }
  function cur(c) { return c === 'EUR' ? 'EUR' : 'SEK'; }
  function isOverdue(i) { return !i.paid && i.due < today(); }

  /* ---------- navigation ---------- */

  function top() { return S.nav[S.nav.length - 1]; }
  function go(name, params) { S.nav.push({ name: name, p: params || {} }); S.drawer = false; render(true); }
  function back() { if (S.nav.length > 1) S.nav.pop(); S.drawer = false; render(true); }
  function goHome() { S.nav = [{ name: 'home' }]; S.drawer = false; render(true); }
  function replaceTop(name, params) { S.nav[S.nav.length - 1] = { name: name, p: params || {} }; render(true); }
  function toast(msg) {
    S.toastMsg = msg;
    var el = host.querySelector('.dm-toast');
    if (el) { el.textContent = msg; el.classList.add('on'); }
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { var e = host.querySelector('.dm-toast'); if (e) e.classList.remove('on'); }, 2600);
  }
  function inApp(what) { toast(what + ' finns i den riktiga appen.'); }

  /* ---------- shared UI pieces ---------- */

  function header(title, root) {
    var left = root
      ? '<button class="dm-ib" data-a="drawer" aria-label="Meny">' + icon('menu') + '</button>'
      : '<button class="dm-ib" data-a="back" aria-label="Tillbaka">' + icon('back') + '</button><button class="dm-ib" data-a="home" aria-label="Startsida">' + icon('home') + '</button>';
    return '<div class="dm-head"><div class="dm-head-l">' + left + '</div><div class="dm-title">' + esc(title) + '</div><button class="dm-avatar" data-a="avatar">' + esc(S.company.name.charAt(0)) + '</button></div>';
  }
  function badge(text, kind) { return '<span class="dm-badge ' + (kind || '') + '">' + esc(text) + '</span>'; }
  function row(title, sub, right, action, extra) {
    return '<button class="dm-row" data-a="' + action + '" ' + (extra || '') + '><span class="dm-row-main"><span class="dm-row-t">' + esc(title) + '</span><span class="dm-row-s">' + sub + '</span></span><span class="dm-row-r">' + (right || '') + '</span></button>';
  }
  function big(label, sub, action, cls, ic, extra) {
    return '<button class="dm-btn ' + (cls || '') + '" data-a="' + action + '" ' + (extra || '') + '>' + (ic ? icon(ic) : '') + '<span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span></button>';
  }

  /* ---------- fake QR ---------- */

  function qr() {
    var N = 21, s = 7, cells = '', seedv = 7;
    function rnd() { seedv = (seedv * 9301 + 49297) % 233280; return seedv / 233280; }
    function finder(x, y) { return x < 7 && y < 7 || x > 13 && y < 7 || x < 7 && y > 13; }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var on;
      if (finder(x, y)) {
        var fx = x % 14 % 7, fy = y % 14 % 7;
        on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
      } else on = rnd() > 0.5;
      if (on) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
    }
    return '<svg viewBox="0 0 ' + N + ' ' + N + '" width="46" height="46" shape-rendering="crispEdges" fill="#1E2A25">' + cells + '</svg>';
  }

  /* ---------- invoice paper ---------- */

  function paper(doc) {
    var c = cust(doc.customerId), co = S.company, t = calc(doc), k = cur(doc.currency);
    var isOffer = doc.kind === 'offer';
    var title = isOffer ? 'Offert' : (doc.credit ? 'Kreditfaktura' : 'Faktura');
    var eng = c.country !== 'SE';
    var rows = doc.lines.filter(function (l) { return l.desc.trim(); }).map(function (l) {
      var n = num(l.qty) * num(l.price) * (doc.credit ? -1 : 1);
      return '<tr><td>' + esc(l.desc) + '</td><td class="r">' + esc(l.qty) + '</td><td class="r">' + fmt(num(l.price)) + '</td><td class="r">' + l.vat + '%</td><td class="r">' + fmt(n) + '</td></tr>';
    }).join('');
    var dedLine = doc.deduction ? '<div class="dm-p-tot"><span>' + doc.deduction + '-avdrag (' + (doc.deduction === 'ROT' ? '30' : '50') + ' %)</span><span>−' + fmt(Math.abs(t.ded)) + '</span></div>' : '';
    var rnd = Math.abs(t.rounding) > 0.004 ? '<div class="dm-p-tot"><span>Öresutjämning</span><span>' + fmt(t.rounding) + '</span></div>' : '';
    var pay = doc.deduction ? 'Summa att betala efter avdrag' : 'Summa att betala';
    var qrBlock = (!isOffer && S.settings.swishQr && doc.currency === 'SEK') ? '<div class="dm-p-qr">' + qr() + '<small>Scanna med Swish-appen</small></div>' : '';
    var note = doc.deduction ? '<div class="dm-p-note">Faktura med ' + doc.deduction + '-avdrag. Kunden betalar endast summan efter skattereduktion.</div>' : '';
    return '<div class="dm-paper">'
      + '<div class="dm-p-top"><div class="dm-p-co">' + esc(co.name) + '</div><div class="dm-p-title">' + title + '</div></div>'
      + '<div class="dm-p-meta"><div><small>' + (isOffer ? 'OFFERTMOTTAGARE' : 'FAKTURAMOTTAGARE') + '</small><b>' + esc(c.name) + '</b>' + esc(c.address || '') + '<br>' + esc(c.zip || '') + ' ' + esc(c.city || '') + (c.ref ? '<br>Kundens referens: ' + esc(c.ref) : '') + '</div>'
      + '<div class="r"><span>' + (isOffer ? 'Offertnummer' : 'Fakturanummer') + ': ' + esc(doc.number || 'Utkast') + '</span><span>' + (isOffer ? 'Offertdatum' : 'Fakturadatum') + ': ' + iso(doc.date) + '</span><span>' + (isOffer ? 'Giltig till' : 'Förfallodatum') + ': ' + iso(doc.due) + '</span>' + (eng ? '<span>Valuta: EUR</span>' : '') + '</div></div>'
      + (!isOffer ? '<div class="dm-p-pay"><div><small>BETALAS TILL</small>Bankgiro: ' + esc(co.bg) + (S.settings.swishQr ? '<br>Swish: ' + esc(co.swish) : '') + '</div>' + qrBlock + '</div>' : '')
      + '<table><thead><tr><th>Beskrivning</th><th class="r">Antal</th><th class="r">À-pris</th><th class="r">Moms</th><th class="r">Belopp</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<div class="dm-p-totals"><div class="dm-p-tot"><span>Summa exkl. moms</span><span>' + fmt(t.net) + ' ' + k + '</span></div><div class="dm-p-tot"><span>Moms</span><span>' + fmt(t.tax) + ' ' + k + '</span></div>' + dedLine + rnd
      + '<div class="dm-p-tot big"><span>' + pay + '</span><span>' + fmt(t.pay) + ' ' + k + '</span></div></div>' + note
      + '<div class="dm-p-foot"><div><b>' + esc(co.name) + '</b><br>' + esc(co.addr) + '<br>' + esc(co.zip) + ' ' + esc(co.city) + '<br>' + esc(co.phone) + '</div><div>Org.nummer: ' + esc(co.org) + '<br>Momsreg.nr: ' + esc(co.vat) + '<br>Godkänd för F-skatt</div></div>'
      + '</div>';
  }

  /* ---------- draft helpers ---------- */

  function newDraft(kind, customerId, from) {
    var c = cust(customerId), d = today();
    var lines = from ? from.lines.map(function (l) { return { desc: l.desc, qty: l.qty, price: l.price, vat: l.vat, kind: l.kind }; }) : [{ desc: '', qty: '1', price: '', vat: 25, kind: 'arbete' }];
    S.draft = {
      kind: kind, customerId: customerId, credit: false, date: d, due: addDays(d, kind === 'offer' ? 30 : c.dueDays),
      lines: lines, deduction: from ? from.deduction : '', currency: c.currency, number: ''
    };
  }

  /* ---------- screens ---------- */

  var screens = {};

  screens.home = function () {
    var o = S.settings.offers ? '<hr class="dm-hr">' + big('Skapa offert', '', 'to-offer-customers', 'outline', 'quote') : '';
    return {
      body: header(S.company.name, true) + '<div class="dm-scroll dm-center"><h1 class="dm-h1">Vem vill du fakturera?</h1><div class="dm-stack">'
        + big('Ny kund', 'Lägg till kunduppgifter', 'new-customer', 'primary', 'plus') + big('Befintlig kund', '', 'to-customers', 'outline', 'people') + o + '</div></div>'
    };
  };

  screens.customers = function (p) {
    var mode = p.mode || 'invoice';
    var q = S.search.toLowerCase();
    var list = S.customers.filter(function (c) { return !q || c.name.toLowerCase().indexOf(q) > -1; });
    var latest = {};
    S.invoices.forEach(function (i) { if (!latest[i.customerId] || i.date > latest[i.customerId]) latest[i.customerId] = i.date; });
    list.sort(function (a, b) { return (latest[b.id] || 0) - (latest[a.id] || 0); });
    var rows = list.map(function (c) { return row(c.name, c.type === 'privat' ? 'Privatperson' : 'Företag', icon('chevron'), 'pick-customer', 'data-id="' + c.id + '" data-mode="' + mode + '"'); }).join('');
    return {
      body: header(mode === 'browse' ? 'Kunder' : 'Kunder') + '<div class="dm-scroll"><div class="dm-search">' + icon('people') + '<input data-bind="search" placeholder="Sök kund" value="' + esc(S.search) + '"></div><div class="dm-list">' + (rows || '<p class="dm-empty">Inga kunder hittades.</p>') + '</div></div>'
        + '<div class="dm-foot">' + big('Lägg till ny kund', '', 'new-customer', 'primary center', 'plus', 'data-mode="' + mode + '"') + '</div>'
    };
  };

  screens.customerForm = function (p) {
    var f = S.form || (S.form = { type: 'foretag', name: '', email: '', city: '' });
    return {
      body: header('Ny kund') + '<div class="dm-scroll"><div class="dm-chips"><button class="dm-chip ' + (f.type === 'foretag' ? 'on' : '') + '" data-a="ftype" data-v="foretag">Företag</button><button class="dm-chip ' + (f.type === 'privat' ? 'on' : '') + '" data-a="ftype" data-v="privat">Privatperson</button></div>'
        + '<label class="dm-f"><span>Namn</span><input data-bind="form.name" value="' + esc(f.name) + '" placeholder="' + (f.type === 'foretag' ? 'Företagsnamn' : 'För- och efternamn') + '"></label>'
        + '<label class="dm-f"><span>E-post</span><input data-bind="form.email" type="email" value="' + esc(f.email) + '" placeholder="namn@exempel.se"></label>'
        + '<label class="dm-f"><span>Ort</span><input data-bind="form.city" value="' + esc(f.city) + '" placeholder="Ort"></label>'
        + '<p class="dm-hint">I riktiga appen fyller du också i adress, organisationsnummer, betalvillkor, valuta och mer.</p></div>'
        + '<div class="dm-foot">' + big('Spara kund', '', 'save-customer', 'primary center', 'check', 'data-mode="' + (p.mode || 'invoice') + '"') + '</div>'
    };
  };

  screens.customerStart = function (p) {
    var c = cust(p.id), mine = S.invoices.filter(function (i) { return i.customerId === c.id; }), offs = S.offers.filter(function (o) { return o.customerId === c.id; });
    var mode = p.mode;
    if (mode === 'offer') {
      return { body: header('Ny offert') + '<div class="dm-scroll dm-center"><div class="dm-who"><small>Offert till</small><h2>' + esc(c.name) + '</h2></div><div class="dm-stack">' + big('Ny offert', 'Börja med tomt utkast', 'start-offer', 'primary', 'plus', 'data-id="' + c.id + '"') + '</div></div>' };
    }
    return {
      body: header('Ny faktura') + '<div class="dm-scroll dm-center"><div class="dm-who"><small>Fakturera</small><h2>' + esc(c.name) + '</h2></div><div class="dm-stack">'
        + big('Ny faktura', 'Börja med tomt utkast', 'start-invoice', 'primary', 'plus', 'data-id="' + c.id + '"')
        + big('Kopiera tidigare faktura', 'Återanvänd uppgifter i tidigare faktura', 'copy-invoice', 'outline' + (mine.length ? '' : ' disabled'), 'copy', 'data-id="' + c.id + '"')
        + big('Kreditera utfärdad faktura', 'Rätta eller ta bort en tidigare faktura', 'credit-invoice', 'outline' + (mine.length ? '' : ' disabled'), 'doc', 'data-id="' + c.id + '"')
        + (S.settings.offers ? big('Fakturera från offert', 'Skapa faktura utifrån en skickad offert', 'invoice-from-offer', 'outline' + (offs.length ? '' : ' disabled'), 'quote', 'data-id="' + c.id + '"') : '')
        + '</div></div>'
    };
  };

  screens.pickInvoice = function (p) {
    var mine = S.invoices.filter(function (i) { return i.customerId === p.id; });
    var rows = mine.map(function (i) { return row(i.number, iso(i.date), fmt(calc(i).pay) + ' ' + cur(i.currency), p.credit ? 'do-credit' : 'do-copy', 'data-inv="' + i.id + '"'); }).join('');
    return { body: header(p.credit ? 'Kreditera faktura' : 'Kopiera faktura') + '<div class="dm-scroll"><div class="dm-list">' + rows + '</div></div>' };
  };

  screens.pickOffer = function (p) {
    var rows = S.offers.filter(function (o) { return o.customerId === p.id; }).map(function (o) { return row(o.number, iso(o.date), fmt(calc(o).pay) + ' ' + cur(o.currency), 'do-from-offer', 'data-off="' + o.id + '"'); }).join('');
    return { body: header('Välj offert') + '<div class="dm-scroll"><div class="dm-list">' + rows + '</div></div>' };
  };

  screens.form = function () {
    var d = S.draft, c = cust(d.customerId), isOffer = d.kind === 'offer';
    var ded = (S.settings.rot || S.settings.rut) && !isOffer ? '<div class="dm-card"><div class="dm-label">Avdrag (ROT / RUT)</div><div class="dm-chips"><button class="dm-chip ' + (!d.deduction ? 'on' : '') + '" data-a="ded" data-v="">Ingen</button>'
      + (S.settings.rot ? '<button class="dm-chip ' + (d.deduction === 'ROT' ? 'on' : '') + '" data-a="ded" data-v="ROT">ROT</button>' : '')
      + (S.settings.rut ? '<button class="dm-chip ' + (d.deduction === 'RUT' ? 'on' : '') + '" data-a="ded" data-v="RUT">RUT</button>' : '') + '</div>'
      + (d.deduction ? '<p class="dm-hint">Ange om varje rad är arbete eller material – avdraget räknas bara på arbetet.</p>' : '') + '</div>' : '';
    var typeRow = !isOffer ? '<div class="dm-chips"><button class="dm-chip ' + (!d.credit ? 'on' : '') + '" data-a="credit" data-v="0">Faktura</button><button class="dm-chip ' + (d.credit ? 'on' : '') + '" data-a="credit" data-v="1">Kreditfaktura</button></div>' : '';
    var lines = d.lines.map(function (l, i) {
      return '<div class="dm-card dm-line"><div class="dm-line-h"><span class="dm-label">Rad ' + (i + 1) + '</span>' + (d.lines.length > 1 ? '<button class="dm-ib red" data-a="del-line" data-i="' + i + '" aria-label="Ta bort rad">' + icon('trash') + '</button>' : '') + '</div>'
        + '<label class="dm-f"><span>Beskrivning</span><input data-bind="line.' + i + '.desc" value="' + esc(l.desc) + '" placeholder="T.ex. Konsulttimmar"></label>'
        + '<div class="dm-3"><label class="dm-f"><span>Antal</span><input data-bind="line.' + i + '.qty" inputmode="decimal" value="' + esc(l.qty) + '"></label>'
        + '<label class="dm-f"><span>À-pris</span><input data-bind="line.' + i + '.price" inputmode="decimal" value="' + esc(l.price) + '" placeholder="0"></label>'
        + '<label class="dm-f"><span>Moms</span><select data-bind="line.' + i + '.vat">' + [25, 12, 6, 0].map(function (v) { return '<option value="' + v + '"' + (l.vat === v ? ' selected' : '') + '>' + v + ' %</option>'; }).join('') + '</select></label></div>'
        + (d.deduction ? '<div class="dm-chips small"><button class="dm-chip ' + (l.kind === 'arbete' ? 'on' : '') + '" data-a="kind" data-i="' + i + '" data-v="arbete">Arbete</button><button class="dm-chip ' + (l.kind === 'material' ? 'on' : '') + '" data-a="kind" data-i="' + i + '" data-v="material">Material</button></div>' : '')
        + '</div>';
    }).join('');
    return {
      body: header(isOffer ? 'Ny offert' : (d.credit ? 'Ny kreditfaktura' : 'Ny faktura')) + '<div class="dm-scroll">' + typeRow
        + '<div class="dm-card"><div class="dm-label">' + (isOffer ? 'Offert till' : 'Fakturera') + '</div><div class="dm-cust"><b>' + esc(c.name) + '</b><button class="dm-link" data-a="change-customer">Byt kund</button></div>'
        + '<label class="dm-f inline"><span>' + (isOffer ? 'Offertdatum' : 'Fakturadatum') + '</span><input type="date" data-bind="date" value="' + iso(d.date) + '"></label>'
        + '<label class="dm-f inline"><span>' + (isOffer ? 'Giltig till' : 'Förfallodatum') + '</span><input type="date" data-bind="due" value="' + iso(d.due) + '"></label></div>'
        + ded + '<div class="dm-sect">' + icon('doc') + (isOffer ? 'OFFERTRADER' : 'FAKTURARADER') + '</div>' + lines
        + '<button class="dm-btn outline center" data-a="add-line">' + icon('plus') + '<span><b>Lägg till rad</b></span></button><div class="dm-live" id="dmLive"></div></div>'
        + '<div class="dm-foot">' + big('Förhandsgranska', '', 'preview', 'primary center', 'chevron') + '</div>'
    };
  };

  screens.preview = function () {
    var d = S.draft, isOffer = d.kind === 'offer';
    return {
      body: header('Förhandsgranskning') + '<div class="dm-scroll dm-paperwrap">' + paper(Object.assign({}, d, { number: d.number || (isOffer ? 'O-' + today().getFullYear() + '-' + ('000' + (S.counters.off + 1)).slice(-4) : today().getFullYear() + '-' + ('000' + (S.counters.inv + 1)).slice(-4)) })) + '</div>'
        + '<div class="dm-foot col">' + big('E-post', '', 'send', 'primary center', 'mail') + '<div class="dm-2">' + big('Spara PDF', '', 'save-pdf', 'outline center', 'download') + big('Dela', '', 'send', 'outline center', 'share') + '</div></div>'
    };
  };

  screens.sent = function (p) {
    var isOffer = p.kind === 'offer';
    return {
      body: '<div class="dm-scroll dm-center dm-sent"><div class="dm-ok">' + icon('check') + '</div><h1 class="dm-h1 small">' + (isOffer ? 'Offert skickad' : 'Faktura skickad') + '</h1><p>' + esc(p.number) + ' till ' + esc(p.name) + ' har lagts i ' + (isOffer ? 'offertarkivet' : 'fakturaarkivet') + '.</p><div class="dm-stack">'
        + big(isOffer ? 'Till offertarkiv' : 'Till fakturaarkiv', '', isOffer ? 'to-offers' : 'to-archive', 'primary center', 'doc') + big('Till startsidan', '', 'home', 'outline center') + '</div><p class="dm-hint">I riktiga appen skickas PDF:en här via e-post eller delningsmenyn.</p></div>'
    };
  };

  screens.archive = function () {
    var f = S.filter;
    var list = S.invoices.filter(function (i) { return f === 'all' || (f === 'unpaid' && !i.paid) || (f === 'paid' && i.paid); });
    var rows = list.map(function (i) {
      var st = i.paid ? badge('Betald', 'ok') : (isOverdue(i) ? badge('Förfallen', 'bad') : badge('Skickad', ''));
      return row(cust(i.customerId).name, i.number + ' · ' + longDate(i.date) + ' ' + st + (i.reminderSent ? ' ' + badge('Påminnelse skickad', 'warn') : ''), '<span class="dm-amt">' + fmt(calc(i).pay) + ' ' + cur(i.currency) + '</span>', 'view-invoice', 'data-id="' + i.id + '"');
    }).join('');
    return {
      body: header('Fakturaarkiv') + '<div class="dm-scroll"><div class="dm-chips"><button class="dm-chip ' + (f === 'all' ? 'on' : '') + '" data-a="filter" data-v="all">Alla</button><button class="dm-chip ' + (f === 'unpaid' ? 'on' : '') + '" data-a="filter" data-v="unpaid">Obetalda</button><button class="dm-chip ' + (f === 'paid' ? 'on' : '') + '" data-a="filter" data-v="paid">Betalda</button></div><div class="dm-list">' + (rows || '<p class="dm-empty">Inga fakturor.</p>') + '</div></div>'
    };
  };

  screens.viewInvoice = function (p) {
    var i = S.invoices.filter(function (x) { return x.id === p.id; })[0];
    var acts = big(i.paid ? 'Markera som obetald' : 'Markera som betald', '', 'toggle-paid', 'primary center', 'check', 'data-id="' + i.id + '"');
    if (!i.paid) acts += big(i.reminderSent ? 'Skicka påminnelse igen' : 'Skicka påminnelse', isOverdue(i) ? 'Fakturan har förfallit' : '', 'remind', 'outline center', 'bell', 'data-id="' + i.id + '"');
    acts += '<div class="dm-2">' + big('Spara PDF', '', 'save-pdf', 'outline center', 'download') + big('Dela', '', 'send-old', 'outline center', 'share') + '</div>';
    return { body: header(i.number) + '<div class="dm-scroll dm-paperwrap">' + paper(i) + '</div><div class="dm-foot col">' + acts + '</div>' };
  };

  screens.offers = function () {
    var rows = S.offers.map(function (o) {
      var due = o.due < today() ? badge('Utgången', 'bad') : badge('Obesvarad', 'warn');
      return row(cust(o.customerId).name, o.number + ' · ' + longDate(o.date) + ' ' + due, '<span class="dm-amt">' + fmt(calc(o).pay) + ' ' + cur(o.currency) + '</span>', 'view-offer', 'data-id="' + o.id + '"');
    }).join('');
    return { body: header('Offertarkiv') + '<div class="dm-scroll"><div class="dm-list">' + (rows || '<p class="dm-empty">Inga offerter ännu.</p>') + '</div></div>' };
  };

  screens.viewOffer = function (p) {
    var o = S.offers.filter(function (x) { return x.id === p.id; })[0];
    var acts = big('Skapa faktura från offert', '', 'offer-to-invoice', 'primary center', 'doc', 'data-id="' + o.id + '"');
    if (S.settings.followUp) acts += big('Följ upp offerten', o.followUps ? o.followUps + ' påminnelse(r) skickade' : 'Skicka en vänlig påminnelse', 'follow-up', 'outline center', 'bell', 'data-id="' + o.id + '"');
    return { body: header(o.number) + '<div class="dm-scroll dm-paperwrap">' + paper(o) + '</div><div class="dm-foot col">' + acts + '</div>' };
  };

  screens.settings = function () {
    function tog(key, label, hint) {
      return '<button class="dm-tog" data-a="toggle" data-k="' + key + '"><span class="dm-tog-t"><b>' + label + '</b><small>' + hint + '</small></span><span class="dm-sw ' + (S.settings[key] ? 'on' : '') + '"><i></i></span></button>';
    }
    return {
      body: header('Inställningar') + '<div class="dm-scroll"><div class="dm-sect">' + icon('sliders') + 'ALLMÄNNA INSTÄLLNINGAR</div><div class="dm-card nopad">'
        + tog('rot', 'ROT-avdrag', 'Visa ROT som val på fakturor')
        + tog('rut', 'RUT-avdrag', 'Visa RUT som val på fakturor')
        + tog('offers', 'Offerter', 'Skapa och följ upp offerter')
        + tog('followUp', 'Offertuppföljning (Pro)', 'Påminnelser om obesvarade offerter')
        + tog('swishQr', 'Swish-QR på fakturan', 'Kunden scannar och betalar direkt')
        + tog('ore', 'Öresutjämning', 'Avrunda totalen till hela kronor')
        + '</div><div class="dm-list mt">'
        + row('Fakturaserie', 'Prefix, år och löpnummer', icon('chevron'), 'stub', 'data-w="Fakturaserie"')
        + row('Bokföringskonton för SIE-export', 'BAS-konton för din bokföring', icon('chevron'), 'stub', 'data-w="SIE-export"')
        + row('Licens och molnsynk', 'Dela data mellan enheter (Pro)', icon('chevron'), 'stub', 'data-w="Molnsynk"') + '</div></div>'
    };
  };

  /* ---------- drawer ---------- */

  function drawerHtml() {
    var items = [
      ['people', 'Kunder', 'to-browse'], ['doc', 'Fakturaarkiv', 'to-archive'], S.settings.offers ? ['quote', 'Offertarkiv', 'to-offers'] : null,
      ['pencil', 'Arbetsdagbok', 'stub', 'Arbetsdagbok'], ['repeat', 'Återkommande fakturering', 'stub', 'Återkommande fakturering'], ['inbox', 'Utkast', 'stub', 'Utkast'],
      ['building', 'Företagsprofiler', 'stub', 'Företagsprofiler'], ['sliders', 'Inställningar', 'to-settings'], ['undo', 'Exportera', 'stub', 'Export till bokföring'], ['help', 'Vanliga frågor och support', 'stub', 'Support']
    ].filter(Boolean).map(function (x) { return '<button class="dm-di" data-a="' + x[2] + '"' + (x[3] ? ' data-w="' + x[3] + '"' : '') + '>' + icon(x[0]) + '<span>' + x[1] + '</span></button>'; }).join('');
    return '<div class="dm-drawer-bg" data-a="drawer"></div><div class="dm-drawer"><div class="dm-drawer-t serif">Meny</div>' + items + '<div class="dm-drawer-f">Har du idéer eller synpunkter?<br><span>Maila gärna feedback@fimmel.se</span></div></div>';
  }

  /* ---------- rendering ---------- */

  function render(scrollTop) {
    var n = top(), fn = screens[n.name], out = fn(n.p || {});
    var prevScroll = 0, sc = host.querySelector('.dm-scroll');
    if (sc && !scrollTop) prevScroll = sc.scrollTop;
    host.innerHTML = '<div class="dm-app">' + out.body + (S.drawer ? drawerHtml() : '') + '<div class="dm-toast ' + (S.toastMsg ? '' : '') + '"></div></div>';
    if (!scrollTop) { var s2 = host.querySelector('.dm-scroll'); if (s2) s2.scrollTop = prevScroll; }
    if (S.expired) host.querySelector('.dm-app').insertAdjacentHTML('beforeend', overlayHtml());
    updateLive();
  }

  function updateLive() {
    var el = host.querySelector('#dmLive');
    if (!el || !S.draft) return;
    var t = calc(S.draft), k = cur(S.draft.currency);
    el.innerHTML = '<div><span>Summa exkl. moms</span><b>' + fmt(t.net) + ' ' + k + '</b></div><div><span>Moms</span><b>' + fmt(t.tax) + ' ' + k + '</b></div>'
      + (S.draft.deduction ? '<div><span>' + S.draft.deduction + '-avdrag</span><b>−' + fmt(Math.abs(t.ded)) + ' ' + k + '</b></div>' : '')
      + '<div class="tot"><span>Att betala</span><b>' + fmt(t.pay) + ' ' + k + '</b></div>';
  }

  function overlayHtml() {
    return '<div class="dm-overlay"><div class="dm-overlay-card"><h3 class="serif">Demon har nollställts</h3><p>Gillar du appen? Ladda ner den <a href="' + DOWNLOAD_HREF + '" target="_top">här</a>!</p><button class="dm-btn primary center" data-a="close-overlay"><span><b>Prova igen</b></span></button></div></div>';
  }

  /* ---------- actions ---------- */

  function finishDraft() {
    var d = S.draft, c = cust(d.customerId), isOffer = d.kind === 'offer', y = today().getFullYear();
    if (isOffer) {
      S.counters.off++;
      var o = { id: uid(), kind: 'offer', number: 'O-' + y + '-' + ('000' + S.counters.off).slice(-4), customerId: d.customerId, date: d.date, due: d.due, lines: d.lines.filter(function (l) { return l.desc.trim(); }), deduction: '', currency: d.currency, followUps: 0 };
      S.offers.unshift(o);
      S.draft = null;
      replaceTop('sent', { kind: 'offer', number: o.number, name: c.name });
    } else {
      S.counters.inv++;
      var i = { id: uid(), kind: 'invoice', number: y + '-' + ('000' + S.counters.inv).slice(-4), customerId: d.customerId, date: d.date, due: d.due, lines: d.lines.filter(function (l) { return l.desc.trim(); }), deduction: d.deduction, currency: d.currency, paid: false, reminderSent: false, credit: d.credit };
      S.invoices.unshift(i);
      S.draft = null;
      replaceTop('sent', { kind: 'invoice', number: i.number, name: c.name });
    }
  }

  function validDraft() {
    var d = S.draft;
    var ok = d.lines.some(function (l) { return l.desc.trim() && num(l.price) > 0; });
    if (!ok) { toast('Fyll i minst en rad med beskrivning och pris.'); return false; }
    return true;
  }

  function onAction(el) {
    var a = el.getAttribute('data-a'), id = el.getAttribute('data-id'), v = el.getAttribute('data-v');
    switch (a) {
      case 'drawer': S.drawer = !S.drawer; render(); break;
      case 'back': back(); break;
      case 'home': goHome(); break;
      case 'avatar': toast('Här byter du företagsprofil i den riktiga appen.'); break;
      case 'stub': inApp(el.getAttribute('data-w') || 'Det här'); break;
      case 'to-customers': S.search = ''; go('customers', { mode: 'invoice' }); break;
      case 'to-offer-customers': S.search = ''; go('customers', { mode: 'offer' }); break;
      case 'to-browse': S.search = ''; S.nav = [{ name: 'home' }]; go('customers', { mode: 'invoice' }); break;
      case 'to-archive': S.nav = [{ name: 'home' }]; S.filter = 'all'; go('archive'); break;
      case 'to-offers': S.nav = [{ name: 'home' }]; go('offers'); break;
      case 'to-settings': S.nav = [{ name: 'home' }]; go('settings'); break;
      case 'new-customer': S.form = null; go('customerForm', { mode: el.getAttribute('data-mode') || 'invoice' }); break;
      case 'ftype': S.form.type = v; render(); break;
      case 'save-customer':
        if (!S.form || !S.form.name.trim()) { toast('Ange ett namn på kunden.'); break; }
        var nc = { id: 'c-' + uid(), type: S.form.type, name: S.form.name.trim(), email: S.form.email, city: S.form.city, country: 'SE', currency: 'SEK', dueDays: 30, address: '', zip: '' };
        S.customers.push(nc); S.form = null;
        replaceTop('customerStart', { id: nc.id, mode: el.getAttribute('data-mode') || 'invoice' });
        break;
      case 'pick-customer':
        if (el.getAttribute('data-mode') === 'change') { var pc = cust(id); S.draft.customerId = id; S.draft.currency = pc.currency; back(); break; }
        go('customerStart', { id: id, mode: el.getAttribute('data-mode') }); break;
      case 'start-invoice': newDraft('invoice', id); go('form'); break;
      case 'start-offer': newDraft('offer', id); go('form'); break;
      case 'copy-invoice': if (el.classList.contains('disabled')) { toast('Kunden har inga tidigare fakturor.'); break; } go('pickInvoice', { id: id }); break;
      case 'credit-invoice': if (el.classList.contains('disabled')) { toast('Kunden har inga fakturor att kreditera.'); break; } go('pickInvoice', { id: id, credit: true }); break;
      case 'invoice-from-offer': if (el.classList.contains('disabled')) { toast('Kunden har inga offerter.'); break; } go('pickOffer', { id: id }); break;
      case 'do-copy': var src = S.invoices.filter(function (x) { return x.id === el.getAttribute('data-inv'); })[0]; newDraft('invoice', src.customerId, src); replaceTop('form'); break;
      case 'do-credit': var s2 = S.invoices.filter(function (x) { return x.id === el.getAttribute('data-inv'); })[0]; newDraft('invoice', s2.customerId, s2); S.draft.credit = true; replaceTop('form'); break;
      case 'do-from-offer': var of = S.offers.filter(function (x) { return x.id === el.getAttribute('data-off'); })[0]; newDraft('invoice', of.customerId, of); replaceTop('form'); break;
      case 'offer-to-invoice': var o2 = S.offers.filter(function (x) { return x.id === id; })[0]; newDraft('invoice', o2.customerId, o2); go('form'); break;
      case 'change-customer': S.search = ''; go('customers', { mode: 'change' }); break;
      case 'ded': S.draft.deduction = v; render(); break;
      case 'credit': S.draft.credit = v === '1'; render(); break;
      case 'kind': S.draft.lines[+el.getAttribute('data-i')].kind = v; render(); break;
      case 'add-line': S.draft.lines.push({ desc: '', qty: '1', price: '', vat: 25, kind: 'arbete' }); render(); break;
      case 'del-line': S.draft.lines.splice(+el.getAttribute('data-i'), 1); render(); break;
      case 'preview': if (validDraft()) go('preview'); break;
      case 'save-pdf': toast('Att spara PDF finns i den riktiga appen — inte i demon.'); break;
      case 'send-old': toast('Att dela fakturan finns i den riktiga appen — inte i demon.'); break;
      case 'send': finishDraft(); break;
      case 'filter': S.filter = v; render(); break;
      case 'view-invoice': go('viewInvoice', { id: id }); break;
      case 'toggle-paid': var iv = S.invoices.filter(function (x) { return x.id === id; })[0]; iv.paid = !iv.paid; render(); toast(iv.paid ? 'Markerad som betald.' : 'Markerad som obetald.'); break;
      case 'remind': var ir = S.invoices.filter(function (x) { return x.id === id; })[0]; ir.reminderSent = true; render(); toast('Påminnelse skickad (i demon skickas inget).'); break;
      case 'view-offer': go('viewOffer', { id: id }); break;
      case 'follow-up': var of2 = S.offers.filter(function (x) { return x.id === id; })[0]; of2.followUps++; render(); toast('Uppföljning skickad (i demon skickas inget).'); break;
      case 'toggle': S.settings[el.getAttribute('data-k')] = !S.settings[el.getAttribute('data-k')]; render(); break;
      case 'close-overlay': S.expired = false; render(); break;
    }
  }

  function onInput(el) {
    var b = el.getAttribute('data-bind'), val = el.value;
    if (b === 'search') { S.search = val; var keep = el.selectionStart; render(); var i = host.querySelector('[data-bind="search"]'); if (i) { i.focus(); i.setSelectionRange(keep, keep); } return; }
    if (b.indexOf('form.') === 0) { S.form[b.slice(5)] = val; return; }
    if (b === 'date') { if (val) S.draft.date = fromIso(val); return; }
    if (b === 'due') { if (val) S.draft.due = fromIso(val); return; }
    var m = b.match(/^line\.(\d+)\.(\w+)$/);
    if (m) { S.draft.lines[+m[1]][m[2]] = m[2] === 'vat' ? +val : val; updateLive(); }
  }

  /* ---------- lifecycle ---------- */

  function armTimer() {
    if (timer) return;
    timer = setTimeout(function () {
      var expired = seed();
      expired.expired = true;
      S = expired; timer = null; render(true);
    }, DEMO_LIFETIME_MS);
  }

  function start(el) {
    host = el;
    S = seed();
    clearTimeout(timer); timer = null;
    host.classList.add('dm');
    host.onclick = function (e) {
      armTimer();
      var t = e.target.closest('[data-a]');
      if (t && host.contains(t)) { e.preventDefault(); onAction(t); }
    };
    host.oninput = function (e) { if (e.target.getAttribute && e.target.getAttribute('data-bind')) onInput(e.target); };
    host.onchange = host.oninput;
    render(true);
  }

  window.FimmelDemo = { start: start };
})();
