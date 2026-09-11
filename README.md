# Aishwarya International - Health Assessment Platform

![Aishwarya International](https://img.shields.io/badge/Aishwarya-International-darkgreen)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0-blue)

## 🌿 Overview

A professional nutritional health assessment platform for Aishwarya International's Amway Nutrilite distributorship. Based on Ray D. Strand's "What Your Doctor Doesn't Know About Nutritional Medicine May Be Killing You," this platform helps customers and team members discover their personalized supplement recommendations.

**Live Platform**: https://girishbp-wq.github.io/Aishwaryaintlltd/

---

## ✨ Features

### User Experience
- 🔐 **Secure Registration & Login** - Protected user accounts
- 📋 **Comprehensive Health Assessment** - 15+ health conditions, 20+ questions
- 📊 **Personalized Recommendations** - 3-tier product suggestions (Must-Have, Recommended, Optional)
- 🏃 **Lifestyle Guidance** - Exercise, nutrition, and stress management plans
- 📱 **Print/PDF Export** - Download your recommendations
- 📧 **Consultation Requests** - Easy follow-up process

### For Aishwarya Team
- 📧 **Daily Digest Emails** - New registrations, assessments, and leads
- 📊 **Google Sheets Integration** - All data automatically stored
- 🎯 **Lead Management** - Track consultation requests
- 📈 **Growth Tracking** - Monitor sign-ups and assessments
- 🔒 **Data Privacy** - Only you can see user details

---

## 🎯 Health Conditions Covered

✅ Heart Disease & Cardiovascular Health  
✅ Diabetes (Type 1 & 2)  
✅ Arthritis & Osteoporosis  
✅ Cancer Prevention & Recovery  
✅ Alzheimer's & Dementia  
✅ Parkinson's Disease  
✅ Multiple Sclerosis  
✅ Autoimmune Diseases  
✅ Chronic Fatigue & Fibromyalgia  
✅ Lung Disease & Asthma  
✅ Eye Health (Cataracts, Macular Degeneration)  
✅ High Cholesterol  
✅ High Blood Pressure  
✅ Allergies & Sinusitis  
✅ General Wellness & Prevention  

---

## 📚 Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (no frameworks)
- **Hosting**: GitHub Pages (free, secure, fast)
- **Backend**: Google Apps Script
- **Database**: Google Sheets (100% private)
- **Email**: Gmail (via Google Apps Script)
- **Authentication**: Client-side with localStorage

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Visit the Platform
Open: https://girishbp-wq.github.io/Aishwaryaintlltd/

### Step 2: Create Account
- Enter name, email, password
- Agree to share assessment for consultation

### Step 3: Complete Assessment
- Answer 20 health questions
- Takes 10-15 minutes
- Fully personalized

### Step 4: Get Recommendations
- View your health profile & BMI
- See 3-tier supplement recommendations
- Read lifestyle & eating habits
- Choose if you want consultation follow-up

---

## 🔧 Setup Instructions

### For Admin (Girish)

Complete setup requires:
1. **Push this code to GitHub** (10 minutes)
2. **Enable GitHub Pages** (5 minutes)
3. **Create Google Sheet** (5 minutes)
4. **Setup Google Apps Script** (10 minutes)
5. **Test the system** (5 minutes)

**Total Setup Time**: ~35 minutes

👉 **[See Full Setup Guide](GITHUB_DEPLOYMENT_GUIDE.md)**

---

## 📊 How It Works

### User Journey
```
1. Registration → 2. Health Assessment → 3. Results → 4. Opt-in for Consultation
```

### Data Flow
```
User Registration/Assessment → Google Apps Script → Google Sheets → Daily Email to Admin
```

### What Gets Stored
- Name, email, phone
- Age, gender, height, weight, BMI
- Health conditions selected
- Lifestyle information (exercise, diet, sleep, stress)
- Assessment results
- Consultation preference

---

## 📧 Daily Digest Example

Every morning at 8:00 AM, you receive an email with:

```
📊 Aishwarya Health Assessment - Daily Report (2026-09-11)

Summary:
- New Registrations: 5
- Completed Assessments: 3
- Consultation Requests: 2

New Registrations:
[Table with names, emails, phone numbers]

New Assessments Completed:
[Table with assessment summaries]

Consultation Requests:
[List of people who want follow-up]
```

---

## 🎨 Customization

### Add Nutrilite Products
Edit `index.html` and update the `recommendations` object with your actual Amway UK Nutrilite products:

```javascript
heart_disease: {
    mustHave: [
        "Amway Nutrilite CoQ10 Plus (Code: 123456)",
        "Nutrilite Omega-3 Complex (Code: 123457)",
        // ... etc
    ]
}
```

### Update Branding
- Change header colors, logo, company name
- Add social media links
- Update contact information

### Modify Health Conditions
Add or remove conditions based on your priorities.

---

## 📈 Metrics You Can Track

- **Registrations per day/week/month**
- **Completed assessments**
- **Most common health conditions**
- **Consultation opt-in rate**
- **Follow-up conversion rate**

---

## 🔒 Security & Privacy

✅ **End-to-End Privacy**
- Google Sheet is private (only you access)
- Users' data visible only to you
- No third-party data sharing
- HTTPS secure connection (GitHub Pages)

✅ **Data Protection**
- Encrypted passwords (hashed client-side)
- No sensitive data in URLs
- Google Sheets backup protection

---

## 📱 Browser Compatibility

Works on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ✅ Tablets

---

## 🆘 Troubleshooting

### Site not loading
- Clear browser cache
- Try incognito window
- Wait 2-3 minutes after GitHub Pages enabled

### Registration not working
- Check browser console (F12)
- Ensure JavaScript is enabled
- Try different browser

### Email not arriving
- Check Gmail spam folder
- Verify email address in Apps Script
- Run `testDailyEmail()` function

### Data not saving
- Check Sheet ID is correct
- Verify sheet names match
- Run `setupSheets()` again

👉 **[Full Troubleshooting Guide](GITHUB_DEPLOYMENT_GUIDE.md#troubleshooting)**

---

## 📞 Support & Next Steps

### Immediate Actions (This Week)
1. Push files to GitHub ✓
2. Enable GitHub Pages ✓
3. Create Google Sheet ✓
4. Setup Apps Script ✓
5. Test system ✓

### Next Phase (This Month)
- Add Nutrilite product details
- Customize branding
- Launch marketing
- Start collecting leads
- Begin follow-ups

### Future Enhancements
- Admin dashboard
- Mobile app version
- Appointment booking integration
- Product pricing display
- Customer testimonials
- Video tutorials

---

## 📄 File Structure

```
Aishwaryaintlltd/
├── index.html (Main app - 750+ lines)
├── google_apps_script.gs (Backend - 400+ lines)
├── README.md (This file)
├── GITHUB_DEPLOYMENT_GUIDE.md (Setup instructions)
└── docs/
    ├── SETUP.md
    └── ADMIN_GUIDE.md
```

---

## 🎓 Based On

This platform is based on medical research and clinical practices outlined in:

**"What Your Doctor Doesn't Know About Nutritional Medicine May Be Killing You"**  
By Ray D. Strand, M.D.

Key Principle: *"Oxidative stress is the underlying cause of almost all chronic degenerative diseases"*

Recommendations follow Dr. Strand's three-pronged approach:
1. 🏃 **Regular Exercise** (30+ minutes, 5+ days/week)
2. 🥗 **Healthy Diet** (7+ servings fruits/vegetables daily)
3. 💊 **Quality Supplements** (optimized nutritional support)

---

## 📜 License & Usage

This platform is proprietary to Aishwarya International Ltd.

**Authorized Use**: Aishwarya team members and partners only  
**Modifications**: Contact original developer  
**Redistribution**: Not permitted without consent

---

## 👥 About Aishwarya International

**Aishwarya International** is an Amway Nutrilite distributorship dedicated to helping people achieve optimal health through personalized nutrition recommendations and high-quality supplements.

- 🌍 **Location**: Sunbury on Thames, UK
- 🏢 **Products**: Amway Nutrilite Supplements
- 🎯 **Mission**: Empower people with knowledge about nutritional medicine
- 💼 **Services**: Health assessments, supplement recommendations, team training

---

## 📧 Contact

For support, customization, or questions:

**Email**: aishwaryaintl@outlook.com  
**GitHub**: https://github.com/girishbp-wq/Aishwaryaintlltd

---

## 📊 Statistics

- **Health Conditions**: 15+
- **Assessment Questions**: 20+
- **Recommendation Tiers**: 3 (Must-Have, Recommended, Optional)
- **Lifestyle Categories**: 5 (Exercise, Diet, Sleep, Stress, Additional)
- **Supplement Types**: 20+
- **Lines of Code**: 1,500+
- **Setup Time**: ~35 minutes
- **Time to First Assessment**: ~10 minutes

---

## ✅ Status

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend App | ✅ Ready | HTML/CSS/JS complete |
| Registration System | ✅ Ready | Secure with localStorage |
| Assessment Engine | ✅ Ready | 15 conditions, personalized |
| Google Integration | ✅ Ready | Apps Script backend ready |
| Email System | ✅ Ready | Daily digests configured |
| GitHub Pages | ✅ Ready | Auto-deploy enabled |

---

**Version**: 1.0  
**Last Updated**: September 2026  
**Deployment Status**: ✅ Ready to Launch

🚀 **Ready to transform Aishwarya's business with data-driven health recommendations!**

---

## 🎉 Next Steps

1. **Deploy to GitHub**: Push files to your repository
2. **Test Registration**: Sign up and complete assessment
3. **Set Up Google Sheet**: Create sheet and Apps Script
4. **Start Collecting Leads**: Share link with customers
5. **Monitor Results**: Review daily digest emails
6. **Scale Up**: Add team members to help with follow-ups

Good luck! 🌿

