/**
 * Aishwarya International - Health Assessment backend (v5: password reset by email code)
 *
 * Create this while signed in as bpg2504@gmail.com, so that account owns the sheet and the data.
 *
 * What this does:
 *  - Receives registrations, logins, assessments, consultation requests,
 *    password resets and delete-my-data requests from health-assessment.html (doPost).
 *  - Emails a 6-digit code (valid for 30 minutes) when someone forgets their password.
 *  - Records consent choices with a timestamp and the privacy notice version.
 *  - Sends a daily digest email covering the last 24 hours.
 *  - Deletes everything about a person after RETENTION_DAYS without activity.
 *
 * One-time setup:
 *  1. Paste the Sheet ID into SHEET_ID below and save (Ctrl+S).
 *  2. Run setupSheets, then setupDailyEmailTrigger, then testDailyEmail.
 *  3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 *  4. Send the Web app URL (ends in /exec) so it can go into health-assessment.html.
 *
 * If you edit this code later: Deploy > Manage deployments > pencil icon >
 * Version: New version > Deploy. Otherwise the website keeps using the old code.
 */

// ---- Configuration ----
const SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';    // only the part between /d/ and /edit in the sheet URL
const ADMIN_EMAIL = 'aishwaryaintl@outlook.com'; // who receives the daily digest
const TIMEZONE = 'Europe/London';
const DIGEST_HOUR = 8;                            // 8 AM UK time
const RETENTION_DAYS = 730;                       // 24 months without activity, then deleted (matches privacy notice)
const RESET_MINUTES = 30;                         // how long a password reset code stays valid
const RESET_MAX_PER_HOUR = 3;                     // reset emails allowed per person per hour
const RESET_MAX_ATTEMPTS = 5;                     // wrong codes allowed before a new code is needed

const SHEETS = {
  registrations: 'Registrations',
  assessments: 'Assessments',
  consultations: 'Consultations',
  dailyLog: 'Daily Log',
  deletionLog: 'Deletion Log',
  resets: 'Password Resets'
};

const HEADERS = {
  'Registrations': ['Timestamp', 'Name', 'Email', 'Phone', 'Password Hash', 'Aged 18+',
                    'Health Data Consent', 'Contact Consent', 'Privacy Notice Version'],
  'Assessments': ['Timestamp', 'Email', 'Name', 'Age', 'Sex', 'Height (cm)', 'Weight (kg)', 'BMI', 'BMI Category',
                  'Lifestyle Level', 'Nutrients To Watch', 'Lifestyle Answers (Yes)', 'Water', 'Sleep', 'Stress', 'Smoker',
                  'Prescription Medicine', 'Blood Thinner', 'Pregnant/Breastfeeding', 'Allergies',
                  'Health Conditions', 'Everyday Challenges'],
  'Consultations': ['Timestamp', 'Email', 'Name', 'Phone', 'Wants Consultation', 'Follow-up Status', 'Notes'],
  'Daily Log': ['Date', 'Registrations', 'Assessments', 'Consultation Requests', 'Records Purged', 'Sent At'],
  'Deletion Log': ['Timestamp', 'Reason', 'Rows Deleted'],
  'Password Resets': ['Timestamp', 'Email', 'Code Hash', 'Expires', 'Wrong Attempts', 'Used']
};

// ---- One-time setup ----

function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Object.keys(HEADERS).forEach(function (name) {
    let sheet = ss.getSheetByName(name);
    // Reusing a sheet from the earlier version: move the old tab aside so columns don't get mixed up
    if (sheet && sheet.getLastRow() > 0) {
      const current = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].join('|');
      if (current !== HEADERS[name].join('|')) {
        sheet.setName(name + ' (old ' + Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HHmm') + ')');
        Logger.log('Old "' + name + '" tab renamed. Delete it once you have checked it.');
        sheet = null;
      }
    }
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS[name]);
      sheet.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
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
      case 'deleteAccount': return json_(deleteAccount_(data));
      case 'requestReset': return json_(requestReset_(data));
      case 'resetPassword': return json_(resetPassword_(data));
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
  if (!d.ageConfirmed || !d.healthConsent) {
    return { ok: false, error: 'We need your confirmation that you are 18+ and your consent to store your health answers.' };
  }
  if (findRegistration_(email)) {
    return { ok: false, code: 'exists', error: 'You are already registered with this email address.' };
  }
  sheet_(SHEETS.registrations).appendRow([
    new Date(), safe_(d.name), email, safe_(d.phone), d.passwordHash, 'Yes',
    'Yes', d.contactConsent ? 'Yes' : 'No', safe_(d.privacyVersion)
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
    new Date(), email, safe_(d.name), d.age, safe_(d.gender), d.height, d.weight, d.bmi, safe_(d.bmiCategory),
    safe_(d.lifestyleLevel), safe_(d.nutrientsToWatch), safe_(d.lifestyleYes), safe_(d.water), safe_(d.sleep), safe_(d.stress),
    safe_(d.smoker), safe_(d.prescription), safe_(d.bloodThinner), safe_(d.pregnant), safe_(d.allergies),
    safe_(d.conditions), safe_(d.symptoms)
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

function requestReset_(d) {
  const email = normaliseEmail_(d.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Please enter a valid email address.' };
  const sent = { ok: true, message: 'If an account exists for ' + email + ', we have emailed a 6-digit code. It can take a minute to arrive, so check your spam folder too.' };
  const reg = findRegistration_(email);
  if (!reg) return sent;

  const sheet = sheet_(SHEETS.resets);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = sheet.getDataRange().getValues().slice(1).filter(function (r) {
    return String(r[1]).toLowerCase() === email && r[0] instanceof Date && r[0] > hourAgo;
  });
  if (recent.length >= RESET_MAX_PER_HOUR) {
    return { ok: false, error: 'Too many reset requests. Please wait an hour, or use the last code we sent you.' };
  }

  // Random 6-digit code from a secure UUID. Only a hash of it is stored.
  const code = String(parseInt(Utilities.getUuid().replace(/-/g, '').slice(0, 12), 16) % 900000 + 100000);
  sheet.appendRow([new Date(), email, sha256_(email + ':' + code), new Date(Date.now() + RESET_MINUTES * 60 * 1000), 0, 'No']);

  const firstName = String(reg[1]).split(' ')[0];
  MailApp.sendEmail({
    to: email,
    name: 'Aishwarya International',
    replyTo: ADMIN_EMAIL,
    subject: 'Your password reset code: ' + code,
    body: 'Hi ' + firstName + ',\n\nYour code to reset your Health & Nutrition Check password is ' + code +
      '.\n\nIt works for ' + RESET_MINUTES + ' minutes. If you did not ask for this, ignore this email and your password stays the same.\n\nAishwarya International',
    htmlBody: '<p>Hi ' + escape_(firstName) + ',</p><p>Your code to reset your Health &amp; Nutrition Check password is:</p>' +
      '<p style="font-size:28px;font-weight:bold;letter-spacing:4px">' + code + '</p>' +
      '<p>It works for ' + RESET_MINUTES + ' minutes. If you did not ask for this, ignore this email and your password stays the same.</p><p>Aishwarya International</p>'
  });
  return sent;
}

function resetPassword_(d) {
  const email = normaliseEmail_(d.email);
  const code = String(d.code || '').trim();
  if (!/^\d{6}$/.test(code)) return { ok: false, error: 'Please enter the 6-digit code from the email.' };
  if (!d.passwordHash) return { ok: false, error: 'Please choose a new password.' };

  const sheet = sheet_(SHEETS.resets);
  const values = sheet.getDataRange().getValues();
  for (let i = values.length - 1; i >= 1; i--) {
    const r = values[i];
    if (String(r[1]).toLowerCase() !== email || r[5] === 'Yes') continue;
    // Only the most recent unused code counts
    if (!(r[3] instanceof Date) || r[3] < new Date()) return { ok: false, error: 'That code has expired. Please ask for a new one.' };
    if (Number(r[4]) >= RESET_MAX_ATTEMPTS) return { ok: false, error: 'Too many wrong attempts. Please ask for a new code.' };
    if (r[2] !== sha256_(email + ':' + code)) {
      sheet.getRange(i + 1, 5).setValue(Number(r[4]) + 1);
      return { ok: false, error: "That code isn't right. Please check the email and try again." };
    }
    const reg = findRegistrationRow_(email);
    if (!reg) return { ok: false, error: 'We could not find your account. Please register again.' };
    sheet_(SHEETS.registrations).getRange(reg.row, 5).setValue(d.passwordHash);
    sheet.getRange(i + 1, 6).setValue('Yes');
    return { ok: true, name: String(reg.values[1]), phone: String(reg.values[3] || '') };
  }
  return { ok: false, error: 'There is no active code for that email. Please ask for a new one.' };
}

function deleteAccount_(d) {
  const email = normaliseEmail_(d.email);
  const row = findRegistration_(email);
  if (!row || row[4] !== d.passwordHash) return { ok: false, error: 'Email or password is incorrect.' };
  const removed = deleteRowsForEmails_([email]);
  sheet_(SHEETS.deletionLog).appendRow([new Date(), 'Deleted at user request', removed]);
  return { ok: true };
}

// ---- Daily digest and retention ----

function sendDailyDigestEmail() {
  const purged = purgeOldRecords_();
  purgeOldResetCodes_();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const regs = rowsSince_(SHEETS.registrations, since);
  const assessments = rowsSince_(SHEETS.assessments, since);
  const consults = rowsSince_(SHEETS.consultations, since).filter(function (r) { return r[4] === 'Yes'; });

  const today = Utilities.formatDate(new Date(), TIMEZONE, 'dd MMM yyyy');
  if (!regs.length && !assessments.length && !consults.length) {
    Logger.log('Nothing new in the last 24 hours. No email sent. Purged rows: ' + purged);
    return;
  }

  let html = '<h2>Health Assessment digest - ' + today + '</h2>' +
    '<p>Last 24 hours: <b>' + regs.length + '</b> registrations, <b>' + assessments.length +
    '</b> assessments, <b>' + consults.length + '</b> consultation requests.</p>' +
    '<p style="color:#a00">Contains health information. Do not forward.</p>';

  if (consults.length) {
    html += '<h3>Call these people first (asked for a consultation)</h3>' +
      table_(['Name', 'Email', 'Phone'], consults.map(function (r) { return [r[2], r[1], r[3]]; }));
  }
  if (assessments.length) {
    const c = col_('Assessments');
    html += '<h3>Assessments completed</h3>' +
      table_(['Name', 'Email', 'Age', 'BMI', 'Lifestyle level', 'Nutrients to watch', 'Health conditions', 'Everyday challenges', 'Safety flags'],
        assessments.map(function (r) {
          const flags = [];
          if (r[c['Prescription Medicine']] === 'Yes') flags.push('prescription medicine');
          if (r[c['Blood Thinner']] === 'Yes' || r[c['Blood Thinner']] === 'Not sure') flags.push('blood thinner: ' + r[c['Blood Thinner']]);
          if (r[c['Pregnant/Breastfeeding']] === 'Yes') flags.push('pregnant/breastfeeding');
          if (r[c['Allergies']] && r[c['Allergies']] !== 'None') flags.push('allergies: ' + r[c['Allergies']]);
          if (r[c['Smoker']] === 'Yes') flags.push('smoker');
          return [r[c['Name']], r[c['Email']], r[c['Age']], r[c['BMI']] + ' (' + r[c['BMI Category']] + ')', r[c['Lifestyle Level']],
            r[c['Nutrients To Watch']], r[c['Health Conditions']], r[c['Everyday Challenges']], flags.join('; ') || 'none'];
        }));
  }
  if (regs.length) {
    html += '<h3>New registrations</h3>' +
      table_(['Name', 'Email', 'Phone', 'OK to contact?'], regs.map(function (r) { return [r[1], r[2], r[3], r[7]]; }));
  }
  html += '<p><a href="https://docs.google.com/spreadsheets/d/' + SHEET_ID + '">Open the full sheet</a></p>';

  MailApp.sendEmail({ to: ADMIN_EMAIL, subject: 'Health Assessment digest - ' + today, htmlBody: html });
  sheet_(SHEETS.dailyLog).appendRow([today, regs.length, assessments.length, consults.length, purged, new Date()]);
}

function purgeOldRecords_() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const lastActivity = {};
  [SHEETS.registrations, SHEETS.assessments, SHEETS.consultations].forEach(function (name) {
    const emailCol = name === SHEETS.registrations ? 2 : 1;
    sheet_(name).getDataRange().getValues().slice(1).forEach(function (r) {
      const email = String(r[emailCol]).toLowerCase();
      if (!(r[0] instanceof Date)) return;
      if (!lastActivity[email] || r[0] > lastActivity[email]) lastActivity[email] = r[0];
    });
  });
  const stale = Object.keys(lastActivity).filter(function (e) { return lastActivity[e] < cutoff; });
  if (!stale.length) return 0;
  const removed = deleteRowsForEmails_(stale);
  sheet_(SHEETS.deletionLog).appendRow([new Date(), 'Retention period ended (' + stale.length + ' people)', removed]);
  return removed;
}

function purgeOldResetCodes_() {
  const sheet = sheet_(SHEETS.resets);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const values = sheet.getDataRange().getValues();
  for (let i = values.length - 1; i >= 1; i--) {
    if (!(values[i][0] instanceof Date) || values[i][0] < dayAgo) sheet.deleteRow(i + 1);
  }
}

function deleteRowsForEmails_(emails) {
  const set = {};
  emails.forEach(function (e) { set[e] = true; });
  let removed = 0;
  [SHEETS.registrations, SHEETS.assessments, SHEETS.consultations, SHEETS.resets].forEach(function (name) {
    const sheet = sheet_(name);
    const emailCol = name === SHEETS.registrations ? 2 : 1;
    const values = sheet.getDataRange().getValues();
    for (let i = values.length - 1; i >= 1; i--) {
      if (set[String(values[i][emailCol]).toLowerCase()]) {
        sheet.deleteRow(i + 1);
        removed++;
      }
    }
  });
  return removed;
}

// ---- Helpers ----

// Column number for each header name, so the digest doesn't break if columns are added
function col_(sheetName) {
  const map = {};
  HEADERS[sheetName].forEach(function (h, i) { map[h] = i; });
  return map;
}

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
  const found = findRegistrationRow_(email);
  return found ? found.values : null;
}

function findRegistrationRow_(email) {
  if (!email) return null;
  const values = sheet_(SHEETS.registrations).getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][2]).toLowerCase() === email) return { row: i + 1, values: values[i] };
  }
  return null;
}

function sha256_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(function (b) { return ((b < 0 ? b + 256 : b).toString(16)).padStart(2, '0'); }).join('');
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
  const cell = 'style="border:1px solid #ccc;padding:6px;text-align:left;vertical-align:top"';
  return '<table style="border-collapse:collapse">' +
    '<tr>' + headers.map(function (h) { return '<th ' + cell + '>' + escape_(h) + '</th>'; }).join('') + '</tr>' +
    rows.map(function (r) {
      return '<tr>' + r.map(function (v) { return '<td ' + cell + '>' + escape_(v) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</table>';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
