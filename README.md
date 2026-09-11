# Aishwarya International website

Live site: https://girishbp-wq.github.io/Aishwaryaintlltd/

## Pages

| File | What it is |
|------|------------|
| `index.html` | Aishwarya International homepage |
| `health-assessment.html` | Health & Nutrition Check: register, answer questions, see a supplement list and lifestyle changes |
| `privacy.html` | Privacy Notice for the Health & Nutrition Check |
| `google_apps_script.gs` | Backend code. It runs in Google Apps Script, not on GitHub |

## How the Health & Nutrition Check works

- Visitors register with explicit consent (18+, health data consent, optional contact consent).
- The questionnaire has five parts: about you, the 15 questions from the Nutrilite lifestyle assessment sheet (plus water, sleep and stress), health conditions from Dr Strand's book, everyday health challenges (e.g. constipation, bloating, plantar fasciitis), and safety questions.
- The lifestyle answers are scored with the sheet's grid to give a Level A, B or C for 11 nutrients: vitamin A, B vitamins, vitamin C, vitamin D, vitamin E, calcium, iron, other minerals, protein, omega-3 and fibre.
- Answers go to a Google Sheet owned by bpg2504@gmail.com through an Apps Script web app. Nothing is stored on GitHub.
- Results follow chapter 17 of Ray D. Strand, MD, *What Your Doctor Doesn't Know About Nutritional Medicine May Be Killing You* (2002): the basics for everyone, then extras for each health area.
- Nutrilite UK products are listed first. Anything the book mentions that Nutrilite UK doesn't sell is marked "Buy anywhere".
- Safety questions (medicines, blood thinners, pregnancy, allergies, smoking) add warnings to the results.
- People can delete their own data. Records are deleted automatically after 24 months without activity.
- A daily digest goes to aishwaryaintl@outlook.com at 8 AM UK time.

## Updating

- **Product list or wording:** edit `NUTRILITE`, `ELSEWHERE` and `GUIDES` near the top of the script in `health-assessment.html`. Product details were checked on amway.co.uk in September 2026.
- **Backend:** paste `google_apps_script.gs` into the Apps Script project, save, then Deploy > Manage deployments > edit > Version: New version > Deploy.
- **Web app URL:** set `SCRIPT_URL` in `health-assessment.html`.
- **Privacy Notice:** if you change what data is collected or why, update `privacy.html` and `PRIVACY_VERSION` in `health-assessment.html`.

## Setting up the backend (one time)

1. Sign in to Google as bpg2504@gmail.com and create a blank Google Sheet.
2. In the sheet: Extensions > Apps Script. Paste `google_apps_script.gs` and set `SHEET_ID`.
3. Save. Run `setupSheets`, then `setupDailyEmailTrigger`, then `testDailyEmail`.
4. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
5. Put the web app URL into `SCRIPT_URL` in `health-assessment.html`, then commit and push.

Aishwarya Intl Ltd is an independent Amway Business Owner. Nutrilite™ is a trademark of Amway.
