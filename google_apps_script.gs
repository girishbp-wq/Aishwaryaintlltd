/**
 * Aishwarya International Health Assessment Platform
 * Google Apps Script for data management and email notifications
 *
 * Setup Instructions:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Copy this entire code into the script editor
 * 4. Update SHEET_ID and ADMIN_EMAIL below
 * 5. Save the project
 * 6. Run setupSheets() to create the structure
 */

// Configuration
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your sheet ID
const ADMIN_EMAIL = 'aishwaryaintl@outlook.com';
const SHEET_NAMES = {
  registrations: 'Registrations',
  assessments: 'Assessments',
  consultations: 'Consultations',
  dailyLog: 'Daily Log'
};

/**
 * Setup sheets structure when script is first deployed
 */
function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // Create Registrations sheet
  createSheetIfNotExists(ss, SHEET_NAMES.registrations);
  let sheet = ss.getSheetByName(SHEET_NAMES.registrations);
  if (sheet.getLastRow() == 0) {
    sheet.appendRow([
      'Timestamp',
      'Name',
      'Email',
      'Phone',
      'Registered At',
      'Status'
    ]);
  }

  // Create Assessments sheet
  createSheetIfNotExists(ss, SHEET_NAMES.assessments);
  sheet = ss.getSheetByName(SHEET_NAMES.assessments);
  if (sheet.getLastRow() == 0) {
    sheet.appendRow([
      'Timestamp',
      'Email',
      'Name',
      'Age',
      'Gender',
      'Height (cm)',
      'Weight (kg)',
      'BMI',
      'Risk Level',
      'Exercise Level',
      'Diet Quality',
      'Sleep Quality',
      'Stress Level',
      'Health Conditions',
      'Completed At'
    ]);
  }

  // Create Consultations sheet
  createSheetIfNotExists(ss, SHEET_NAMES.consultations);
  sheet = ss.getSheetByName(SHEET_NAMES.consultations);
  if (sheet.getLastRow() == 0) {
    sheet.appendRow([
      'Timestamp',
      'Email',
      'Name',
      'Phone',
      'Opt-In Status',
      'Follow-up Status',
      'Notes'
    ]);
  }

  // Create Daily Log sheet
  createSheetIfNotExists(ss, SHEET_NAMES.dailyLog);
  sheet = ss.getSheetByName(SHEET_NAMES.dailyLog);
  if (sheet.getLastRow() == 0) {
    sheet.appendRow([
      'Date',
      'New Registrations',
      'New Assessments',
      'Consultation Opt-Ins',
      'Email Sent',
      'Details'
    ]);
  }

  Logger.log('Sheets setup complete!');
}

/**
 * Helper function to create sheet if it doesn't exist
 */
function createSheetIfNotExists(ss, name) {
  if (!ss.getSheetByName(name)) {
    ss.insertSheet(name);
  }
}

/**
 * Handle registration form submission
 * Call this from your frontend with data
 */
function handleRegistration(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.registrations);

    const row = [
      new Date(),
      data.name,
      data.email,
      data.phone || '',
      data.registeredAt,
      'Active'
    ];

    sheet.appendRow(row);

    Logger.log('Registration recorded: ' + data.email);
    return { success: true, message: 'Registration recorded' };
  } catch (e) {
    Logger.log('Error in handleRegistration: ' + e);
    return { success: false, error: e.message };
  }
}

/**
 * Handle assessment submission
 */
function handleAssessment(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.assessments);

    const row = [
      new Date(),
      data.user.email,
      data.user.name,
      data.age,
      data.gender,
      data.height,
      data.weight,
      data.bmi,
      data.riskLevel,
      data.exercise,
      data.diet,
      data.sleep,
      data.stress,
      data.conditions.join(', '),
      data.completedAt
    ];

    sheet.appendRow(row);

    Logger.log('Assessment recorded: ' + data.user.email);
    return { success: true, message: 'Assessment recorded' };
  } catch (e) {
    Logger.log('Error in handleAssessment: ' + e);
    return { success: false, error: e.message };
  }
}

/**
 * Handle consultation preference
 */
function handleConsultation(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAMES.consultations);

    const row = [
      new Date(),
      data.user.email,
      data.user.name,
      data.phone || '',
      data.consultationOptIn ? 'Yes' : 'No',
      'Pending',
      ''
    ];

    sheet.appendRow(row);

    Logger.log('Consultation preference recorded: ' + data.user.email);
    return { success: true, message: 'Preference recorded' };
  } catch (e) {
    Logger.log('Error in handleConsultation: ' + e);
    return { success: false, error: e.message };
  }
}

/**
 * Generate and send daily digest email
 * Schedule this to run daily at a specific time
 */
function sendDailyDigestEmail() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const today = new Date();
    const todayString = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');

    // Get today's registrations
    const regSheet = ss.getSheetByName(SHEET_NAMES.registrations);
    const regData = regSheet.getDataRange().getValues();
    const todayRegistrations = regData.filter(row => {
      const rowDate = new Date(row[0]);
      return Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') === todayString;
    }).slice(1); // Skip header

    // Get today's assessments
    const assSheet = ss.getSheetByName(SHEET_NAMES.assessments);
    const assData = assSheet.getDataRange().getValues();
    const todayAssessments = assData.filter(row => {
      const rowDate = new Date(row[0]);
      return Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') === todayString;
    }).slice(1); // Skip header

    // Get today's consultation opt-ins
    const conSheet = ss.getSheetByName(SHEET_NAMES.consultations);
    const conData = conSheet.getDataRange().getValues();
    const todayConsultations = conData.filter(row => {
      const rowDate = new Date(row[0]);
      return Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') === todayString &&
             row[4] === 'Yes'; // Opt-in = Yes
    }).slice(1); // Skip header

    // Build email HTML
    let emailBody = '<h2>Aishwarya International - Daily Health Assessment Report</h2>';
    emailBody += '<p><strong>Date:</strong> ' + todayString + '</p>';

    emailBody += '<h3>📊 Summary</h3>';
    emailBody += '<ul>';
    emailBody += '<li><strong>New Registrations:</strong> ' + todayRegistrations.length + '</li>';
    emailBody += '<li><strong>Completed Assessments:</strong> ' + todayAssessments.length + '</li>';
    emailBody += '<li><strong>Consultation Requests:</strong> ' + todayConsultations.length + '</li>';
    emailBody += '</ul>';

    if (todayRegistrations.length > 0) {
      emailBody += '<h3>👤 New Registrations</h3>';
      emailBody += '<table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">';
      emailBody += '<tr><th>Name</th><th>Email</th><th>Phone</th></tr>';
      todayRegistrations.forEach(reg => {
        emailBody += '<tr><td>' + reg[1] + '</td><td>' + reg[2] + '</td><td>' + reg[3] + '</td></tr>';
      });
      emailBody += '</table>';
    }

    if (todayAssessments.length > 0) {
      emailBody += '<h3>📋 New Assessments Completed</h3>';
      emailBody += '<table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">';
      emailBody += '<tr><th>Name</th><th>Email</th><th>Age</th><th>Risk Level</th><th>Conditions</th></tr>';
      todayAssessments.forEach(ass => {
        emailBody += '<tr><td>' + ass[2] + '</td><td>' + ass[1] + '</td><td>' + ass[3] + '</td><td>' + ass[8] + '</td><td>' + ass[13] + '</td></tr>';
      });
      emailBody += '</table>';
    }

    if (todayConsultations.length > 0) {
      emailBody += '<h3>📞 Consultation Requests</h3>';
      emailBody += '<table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">';
      emailBody += '<tr><th>Name</th><th>Email</th><th>Phone</th></tr>';
      todayConsultations.forEach(con => {
        emailBody += '<tr><td>' + con[2] + '</td><td>' + con[1] + '</td><td>' + con[3] + '</td></tr>';
      });
      emailBody += '</table>';
    }

    emailBody += '<p><br><strong>Dashboard:</strong> <a href="https://docs.google.com/spreadsheets/d/' + SHEET_ID + '">View Full Data</a></p>';
    emailBody += '<p style="color: #999; font-size: 12px;">Automated email from Aishwarya International Health Assessment Platform</p>';

    // Send email only if there is new data
    if (todayRegistrations.length > 0 || todayAssessments.length > 0 || todayConsultations.length > 0) {
      GmailApp.sendEmail(ADMIN_EMAIL, 'Aishwarya Health Assessment - Daily Report (' + todayString + ')', '', {
        htmlBody: emailBody
      });

      // Log in Daily Log sheet
      const logSheet = ss.getSheetByName(SHEET_NAMES.dailyLog);
      logSheet.appendRow([
        todayString,
        todayRegistrations.length,
        todayAssessments.length,
        todayConsultations.length,
        new Date(),
        'Email sent successfully'
      ]);

      Logger.log('Daily digest email sent to ' + ADMIN_EMAIL);
    } else {
      Logger.log('No new data today, email not sent');
    }

  } catch (e) {
    Logger.log('Error in sendDailyDigestEmail: ' + e);
    GmailApp.sendEmail(ADMIN_EMAIL, 'ERROR: Health Assessment Daily Report', 'Error occurred: ' + e);
  }
}

/**
 * Setup daily email trigger
 * Run this once to schedule daily emails at 8:00 AM
 */
function setupDailyEmailTrigger() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sendDailyDigestEmail') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new trigger for daily at 8:00 AM
  ScriptApp.newTrigger('sendDailyDigestEmail')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .inTimezone('Asia/Kolkata') // Change to your timezone
    .create();

  Logger.log('Daily email trigger setup complete');
}

/**
 * Get all registrations (for admin dashboard)
 */
function getAllRegistrations() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.registrations);
  const data = sheet.getDataRange().getValues();

  // Return as objects
  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Get all assessments (for admin dashboard)
 */
function getAllAssessments() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.assessments);
  const data = sheet.getDataRange().getValues();

  // Return as objects
  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Get consultation requests (for admin dashboard)
 */
function getConsultationRequests() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.consultations);
  const data = sheet.getDataRange().getValues();

  // Return as objects
  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Export data as CSV
 */
function exportDataAsCSV(sheetName) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();

  let csv = '';
  data.forEach(row => {
    csv += row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      if (String(cell).includes(',') || String(cell).includes('"')) {
        return '"' + String(cell).replace(/"/g, '""') + '"';
      }
      return cell;
    }).join(',') + '\n';
  });

  return csv;
}

/**
 * Test function - uncomment to test email
 */
function testDailyEmail() {
  // This will send a test email
  const testBody = '<h2>Test Email from Google Apps Script</h2>';
  testBody += '<p>If you receive this, the email system is working!</p>';

  GmailApp.sendEmail(ADMIN_EMAIL, '[TEST] Aishwarya Health Assessment Email System', '', {
    htmlBody: testBody
  });

  Logger.log('Test email sent');
}
