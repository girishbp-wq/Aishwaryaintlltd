# Aishwarya International - Health Assessment Platform
## Complete GitHub Deployment & Setup Guide

### Overview
This guide walks you through deploying your health assessment platform on GitHub Pages with Google Sheets backend and automated daily emails.

---

## Part 1: GitHub Repository Setup

### Step 1: Prepare Your Repository

1. **Log in to GitHub**: https://github.com/girishbp-wq
2. **Navigate to your repository**: `Aishwaryaintlltd`
3. **Create the following folder structure** (if not already exists):
```
Aishwaryaintlltd/
├── index.html (the main application)
├── README.md
├── docs/
│   ├── SETUP.md
│   └── ADMIN_GUIDE.md
└── assets/
    └── (logo, images if needed)
```

### Step 2: Upload Files to GitHub

**Via GitHub Web Interface:**

1. Go to https://github.com/girishbp-wq/Aishwaryaintlltd
2. Click **"Add file"** > **"Upload files"**
3. Upload `index.html` to the root directory
4. Commit with message: "Add health assessment platform"

**Via Git Command Line:**
```bash
cd ~/path/to/Aishwaryaintlltd
git add index.html README.md
git commit -m "Add health assessment platform"
git push origin main
```

### Step 3: Enable GitHub Pages

1. Go to repository **Settings**
2. Click **"Pages"** in the left sidebar
3. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. GitHub will show: "Your site is live at: https://girishbp-wq.github.io/Aishwaryaintlltd/"

**Wait 1-2 minutes for deployment to complete.**

### Step 4: Test Your Site

Open: https://girishbp-wq.github.io/Aishwaryaintlltd/

You should see the registration page. Try:
- Register a test account
- Complete an assessment
- View results

---

## Part 2: Google Sheets & Apps Script Setup

### Step 1: Create Google Sheet

1. Go to https://sheets.google.com
2. Click **"+ New"** > **"Blank spreadsheet"**
3. Name it: **"Aishwarya Health Assessments"**
4. Copy the Sheet ID from the URL:
   - URL: `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit`
   - Sheet ID: `1a2b3c4d5e6f7g8h9i0j`

### Step 2: Create Google Apps Script

1. In your Google Sheet, go to **Extensions** > **Apps Script**
2. Delete any default code
3. Copy the entire content from `google_apps_script.gs`
4. Paste it into the script editor
5. Replace this line with your actual Sheet ID:
   ```javascript
   const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
   ```
   Change to:
   ```javascript
   const SHEET_ID = '1a2b3c4d5e6f7g8h9i0j'; // Your actual ID
   ```

### Step 3: Setup Sheet Structure

1. In the Apps Script editor, click **Run** > **setupSheets**
2. When prompted, authorize the script to access your Google Sheet
3. Wait for completion message: "Sheets setup complete!"

This creates the following sheets:
- **Registrations** - Tracks new user registrations
- **Assessments** - Stores completed health assessments
- **Consultations** - Logs consultation opt-ins
- **Daily Log** - Records email sending

### Step 4: Setup Daily Email Trigger

1. In the Apps Script editor, click **Run** > **setupDailyEmailTrigger**
2. Authorize if prompted
3. This schedules daily emails at 8:00 AM (Asia/Kolkata timezone)

**To change the timezone:**
- Find this line in the script:
  ```javascript
  .inTimezone('Asia/Kolkata')
  ```
- Replace with your timezone (e.g., 'Europe/London')
- Run `setupDailyEmailTrigger` again

### Step 5: Test the Email System

1. In Apps Script, click **Run** > **testDailyEmail**
2. You should receive a test email at aishwaryaintl@outlook.com within 2 minutes
3. If you don't receive it, check:
   - Gmail spam folder
   - Google Apps Script execution logs (View > Logs)
   - That the email address is correct

---

## Part 3: Connect Frontend to Backend

The current setup stores data in **browser localStorage** (local storage only). To connect to Google Sheets, we need an intermediary.

### Option A: Simple Solution (Uses Google Forms)

Create a hidden Google Form that receives submissions:

1. **Create a Google Form**:
   - Go to https://forms.google.com
   - Create a form with fields:
     - Name (Short answer)
     - Email (Short answer)
     - Phone (Short answer)
     - Assessment Data (Paragraph)

2. **Get Form URL for submissions**:
   - Form is set to collect responses in Google Sheet automatically

3. **In HTML, when user completes assessment**:
   - Data is logged to browser console
   - Admin copies data from console and pastes into sheet

### Option B: Professional Solution (Uses Google Apps Script Web App)

1. **Deploy Apps Script as Web App**:
   ```
   In Apps Script:
   Click "Deploy" > "New Deployment"
   Select type: "Web app"
   Execute as: Your account
   Allow access: "Anyone"
   Click Deploy
   ```

2. **Get deployment URL** - it will look like:
   ```
   https://script.google.com/macros/d/1a2b3c4d5e6f7g8h9i0j/usercopy
   ```

3. **Update HTML to send data to Apps Script**:
   
   Find this section in `index.html`:
   ```javascript
   // Log to console (in production, send to Google Apps Script)
   console.log('Assessment submitted:', assessmentData);
   ```

   Replace with:
   ```javascript
   // Send to Google Apps Script
   fetch('https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercopy', {
     method: 'POST',
     body: JSON.stringify(assessmentData)
   })
   .then(response => console.log('Data saved'))
   .catch(error => console.error('Error:', error));
   ```

---

## Part 4: Data Management

### View Your Data

1. **Direct Sheet Access**:
   - Open your Google Sheet
   - View tabs: Registrations, Assessments, Consultations, Daily Log

2. **Daily Email**:
   - Receives automated digest at 8:00 AM
   - Shows:
     - New registrations
     - Completed assessments
     - Consultation requests
     - Quick summary table

3. **Export Data**:
   - In Google Sheet, select sheet
   - File > Download > CSV

### Follow-up Process

When you receive daily digests:
1. Review new registrations
2. Check assessment results
3. Contact users who opted for consultation
4. Mark follow-up status in "Consultations" sheet

---

## Part 5: Customization

### Add Nutrilite Products

1. **Edit `index.html`**:
   - Find the `recommendations` object (around line 400)
   - For each condition, replace placeholder supplement names with your Nutrilite products
   
   **Example:**
   ```javascript
   heart_disease: {
       name: "Heart Disease & Cardiovascular Health",
       mustHave: [
           "Amway Nutrilite CoQ10 Plus (Code: 123456)",
           "Nutrilite Omega 3 Complex (Code: 123457)",
           // ... etc
       ]
   }
   ```

2. **Commit changes**:
   ```bash
   git add index.html
   git commit -m "Update with Nutrilite UK products"
   git push
   ```

3. **GitHub Pages auto-deploys in 1-2 minutes**

### Add Your Logo/Branding

1. **In `index.html`, find the header**:
   ```html
   <h1>🌿 Aishwarya International</h1>
   ```

2. **Customize with your details**:
   ```html
   <h1>🌿 Aishwarya International - Health Assessment</h1>
   <p>Transform Your Health with Nutrilite Supplements</p>
   ```

3. **Add CSS customization** (find `.header` section):
   - Change colors, fonts, add logo image
   - Example:
   ```css
   .header {
       background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
   }
   ```

### Change Email Settings

1. **Edit `google_apps_script.gs`**:
   ```javascript
   const ADMIN_EMAIL = 'aishwaryaintl@outlook.com';
   ```

2. **Change timezone for daily emails**:
   ```javascript
   .inTimezone('Europe/London') // or your timezone
   ```

3. **Save and redeploy** Apps Script

---

## Part 6: Troubleshooting

### Site not showing after GitHub Pages enabled
- **Solution**: Wait 2-3 minutes, clear browser cache, try incognito window
- Check: Settings > Pages shows correct URL

### Email not being sent
- **Check 1**: Verify SHEET_ID is correct
- **Check 2**: Run `testDailyEmail()` function
- **Check 3**: Check Gmail spam folder
- **Check 4**: View Apps Script > Logs for errors

### Data not saving in Google Sheet
- **Check 1**: Sheet ID is correct in Apps Script
- **Check 2**: Sheet names match (Registrations, Assessments, etc.)
- **Check 3**: Run `setupSheets()` again to recreate structure

### Users can't complete registration
- **Check 1**: Are they using a modern browser?
- **Check 2**: JavaScript enabled?
- **Check 3**: Browser console errors (F12 > Console tab)

---

## Part 7: Marketing & Sharing

### Share Your Platform

**Email to Prospects:**
```
Hi there,

Take 5 minutes to discover your personalized health recommendations!

Visit: https://girishbp-wq.github.io/Aishwaryaintlltd/

Our health assessment platform will show you which Nutrilite supplements are right for your specific health goals.

Best regards,
Aishwarya International Team
```

**WhatsApp Share:**
```
🌿 Discover Your Personalized Health Plan

Take our quick health assessment and get expert recommendations for your wellness journey!

Link: https://girishbp-wq.github.io/Aishwaryaintlltd/
```

**Social Media:**
```
Do you know which supplements your body really needs? 

Our NEW health assessment platform analyzes your health profile and recommends the perfect Nutrilite supplements for YOU.

Take the assessment: [link]
```

---

## Part 8: Admin Dashboard (Future)

To create a private admin dashboard where you can view all data:

1. Create a separate HTML file `admin.html`
2. Add password protection
3. Display data from Google Sheet via Apps Script
4. Add follow-up tracking features

Contact me if you want this built.

---

## Part 9: Security Notes

**Current Setup:**
- Passwords are client-side encoded (suitable for internal use)
- Data stored in your private Google Sheet
- Email notifications go only to you

**For Production:**
- Implement server-side password hashing
- Add HTTPS SSL certificate (GitHub Pages provides this)
- Add GDPR compliance notice
- Implement data deletion policy

---

## Support & Next Steps

### Immediate (This Week):
1. ✅ Push `index.html` to GitHub
2. ✅ Enable GitHub Pages
3. ✅ Create Google Sheet & Apps Script
4. ✅ Test registration and assessment
5. ✅ Verify daily email works

### Next Phase:
1. Add Nutrilite product details
2. Customize branding
3. Launch marketing campaign
4. Monitor daily reports
5. Track conversion metrics

### Questions?

**For technical help:**
- Google Apps Script documentation: https://developers.google.com/apps-script
- GitHub Pages help: https://docs.github.com/en/pages

**To modify:**
- Report any bugs
- Request feature additions
- Need custom styling

---

## File Structure Summary

Your repository should look like:
```
Aishwaryaintlltd/
├── index.html (Main application - 700+ lines)
├── google_apps_script.gs (Backend script)
├── README.md (Repository intro)
├── GITHUB_DEPLOYMENT_GUIDE.md (This file)
└── docs/
    ├── SETUP.md (Setup instructions)
    └── ADMIN_GUIDE.md (How to manage data)
```

---

## Access Links (After Setup)

- **Public Site**: https://girishbp-wq.github.io/Aishwaryaintlltd/
- **GitHub Repo**: https://github.com/girishbp-wq/Aishwaryaintlltd
- **Google Sheet**: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID
- **Daily Email**: aishwaryaintl@outlook.com

---

**Last Updated**: September 2026
**Platform Version**: 1.0
**Status**: ✅ Ready to Deploy
