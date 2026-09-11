/**
 * Aishwarya International - Health Assessment backend
 *
 * What this does:
 *  - Receives registrations, logins, assessments and consultation requests
 *    from health-assessment.html (via doPost) and saves them to your Google Sheet.
 *  - Sends a daily digest email covering the last 24 hours.
 *
 * Setup (one time):
 *  1. Paste your Sheet ID into SHEET_ID below, then save.
 *  2. Run setupSheets, then setupDailyEmailTrigger, then testDailyEmail.
 *  3. Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 *  4. Send the Web app URL (ends in /exec) so it can go into health-assessment.html.
 *
 * If you edit this code later: Deploy > Manage deployments > pencil icon >
 * Version: New version > Deploy. Otherwise the website keeps using the old code.
 */

// ---- Configuration ----
const SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE'; // only the part between /d/ and /edit in the sheet URL
const ADMIN_EMAIL = 'bpg2504@gmail.com';     // who receives the daily digest
const TIMEZONE = 'Europe/London';
const DIGEST_HOUR = 8;                        // 8 AM UK time

const SHEETS = {
  registrations: 'Registrations',
  assessments: 'Assessments',
  consultations: 'Consultations',
  dailyLog: 'Daily Log'
};

const HEADERS = {
  'Registrations': ['Timestamp', 'Name', 'Email', 'Phone', 'Password Hash', 'Consent Given'],
  'Assessments': ['Timestamp', 'Email', 'Name', 'Age', 'Gender', 'Height (cm)', 'Weight (kg)', 'BMI',
                  'BMI Category', 'Exercise', 'Diet', 'Sleep', 'Stress', 'Health Concerns'],
  'Consultations': ['Timestamp', 'Email', 'Name', 'Phone', 'Wants Consultation', 'Follow-up Status', 'Notes'],
  'Daily Log': ['Date', 'Registrations', 'Assessments', 'Consultation Requests', 'Sent At']
};

// ---- One-time setup ----

function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Object.keys(HEADERS).forEach(function (name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS[name]);
      sheet.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });
  Logger.log('Sheets setup complete: ' + ss.getUrl());
}

function setupDailyEmailTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendDailyDigestEmail') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendDailyDigestEmail')
    .timeBased()
    .everyDays(1)
    .atHour(DIGEST_HOUR)
    .inTimezone(TIMEZONE)
    .create();
  Logger.log('Daily digest scheduled for around ' + DIGEST_HOUR + ':00 ' + TIMEZONE + ', sent to ' + ADMIN_EMAIL);
}

function testDailyEmail() {
  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: '[TEST] Aishwarya Health Assessment email',
    htmlBody: '<p>If you can read this, the digest email works.</p>'
  });
  Logger.log('Test email sent to ' + ADMIN_EMAIL);
}

// ---- Web app endpoints (called by health-assessment.html) ----

function doGet() {
  return json_({ ok: true, service: 'Aishwarya Health Assessment' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const data = JSON.parse(e.postData.contents);
    switch (data.action) {
      case 'register': return json_(register_(data));
      case 'login': return json_(login_(data));
      case 'assessment': return json_(saveAssessment_(data));
      case 'consultation': return json_(saveConsultation_(data));
      default: return json_({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return json_({ ok: false, error: 'Server error: ' + err });
  } finally {
    lock.releaseLock();
  }
}

function register_(d) {
  const email = normaliseEmail_(d.email);
  if (!email || !d.name || !d.passwordHash) return { ok: false, error: 'Missing name, email or password.' };
  if (findRegistration_(email)) {
    return { ok: false, error: 'An account with this email already exists. Please log in instead.' };
  }
  sheet_(SHEETS.registrations).appendRow([
    new Date(), safe_(d.name), email, safe_(d.phone), d.passwordHash, d.consent ? 'Yes' : 'No'
  ]);
  return { ok: true, name: d.name, phone: d.phone || '' };
}

function login_(d) {
  const row = findRegistration_(normaliseEmail_(d.email));
  if (!row || row[4] !== d.passwordHash) return { ok: false, error: 'Email or password is incorrect.' };
  return { ok: true, name: String(row[1]), phone: String(row[3] || '') };
}

function saveAssessment_(d) {
  const email = normaliseEmail_(d.email);
  if (!findRegistration_(email)) return { ok: false, error: 'Please register first.' };
  sheet_(SHEETS.assessments).appendRow([
    new Date(), email, safe_(d.name), d.age, safe_(d.gender), d.height, d.weight, d.bmi,
    safe_(d.bmiCategory), safe_(d.exercise), safe_(d.diet), safe_(d.sleep), safe_(d.stress),
    safe_(d.conditions)
  ]);
  return { ok: true };
}

function saveConsultation_(d) {
  const email = normaliseEmail_(d.email);
  if (!findRegistration_(email)) return { ok: false, error: 'Please register first.' };
  sheet_(SHEETS.consultations).appendRow([
    new Date(), email, safe_(d.name), safe_(d.phone), d.wantsConsultation ? 'Yes' : 'No',
    d.wantsConsultation ? 'To contact' : 'No follow-up', ''
  ]);
  return { ok: true };
}

// ---- Daily digest ----

function sendDailyDigestEmail() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const regs = rowsSince_(SHEETS.registrations, since);
  const assessments = rowsSince_(SHEETS.assessments, since);
  const consults = rowsSince_(SHEETS.consultations, since).filter(function (r) { return r[4] === 'Yes'; });

  if (!regs.length && !assessments.length && !consults.length) {
    Logger.log('Nothing new in the last 24 hours. No email sent.');
    return;
  }

  const today = Utilities.formatDate(new Date(), TIMEZONE, 'dd MMM yyyy');
  let html = '<h2>Health Assessment digest - ' + today + '</h2>' +
    '<p>Last 24 hours: <b>' + regs.length + '</b> registrations, <b>' + assessments.length +
    '</b> assessments, <b>' + consults.length + '</b> consultation requests.</p>';

  if (consults.length) {
    html += '<h3>Call these people first (asked for a consultation)</h3>' +
      table_(['Name', 'Email', 'Phone'], consults.map(function (r) { return [r[2], r[1], r[3]]; }));
  }
  if (assessments.length) {
    html += '<h3>Assessments completed</h3>' +
      table_(['Name', 'Email', 'Age', 'BMI', 'Health concerns'],
        assessments.map(function (r) { return [r[2], r[1], r[3], r[7] + ' (' + r[8] + ')', r[13]]; }));
  }
  if (regs.length) {
    html += '<h3>New registrations</h3>' +
      table_(['Name', 'Email', 'Phone'], regs.map(function (r) { return [r[1], r[2], r[3]]; }));
  }
  html += '<p><a href="https://docs.google.com/spreadsheets/d/' + SHEET_ID + '">Open the full sheet</a></p>';

  MailApp.sendEmail({ to: ADMIN_EMAIL, subject: 'Health Assessment digest - ' + today, htmlBody: html });
  sheet_(SHEETS.dailyLog).appendRow([today, regs.length, assessments.length, consults.length, new Date()]);
}

// ---- Helpers ----

function sheet_(name) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
  if (!sheet) throw new Error('Sheet "' + name + '" not found. Run setupSheets first.');
  return sheet;
}

function rowsSince_(name, since) {
  const values = sheet_(name).getDataRange().getValues().slice(1); // skip header row
  return values.filter(function (r) { return r[0] instanceof Date && r[0] >= since; });
}

function findRegistration_(email) {
  if (!email) return null;
  const values = sheet_(SHEETS.registrations).getDataRange().getValues().slice(1);
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][2]).toLowerCase() === email) return values[i];
  }
  return null;
}

function normaliseEmail_(email) {
  return String(email || '').trim().toLowerCase();
}

// Stops text like "+44..." or "=..." being read as a formula by Sheets
function safe_(value) {
  const s = value === undefined || value === null ? '' : String(value).slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function escape_(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/^'/, '');
}

function table_(headers, rows) {
  const cell = 'style="border:1px solid #ccc;padding:6px;text-align:left"';
  return '<table style="border-collapse:collapse">' +
    '<tr>' + headers.map(function (h) { return '<th ' + cell + '>' + escape_(h) + '</th>'; }).join('') + '</tr>' +
    rows.map(function (r) {
      return '<tr>' + r.map(function (v) { return '<td ' + cell + '>' + escape_(v) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</table>';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
