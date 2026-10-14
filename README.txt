STBB MONTHLY ACADEMIC PROGRESS PORTAL (Classes I-V)
Developed by Muzafar Ali Solangi
WhatsApp Help: +92 300 0357397

PACKAGE:
- index.html (school signup, shared SEMIS login, private admin dashboard, reset requests)
- MPR_Online_Editor.html (the editable STBB course and native Excel Proforma export)

Publish BOTH HTML files at the ROOT of one static HTTPS site.
For GitHub Pages:
1. Create a NEW public GitHub repository.
2. Upload BOTH HTML files in the repository root.
3. Open Settings > Pages, choose Deploy from a branch, branch main, folder /(root).
4. Visit the resulting GitHub Pages URL when deployment finishes.

LIVE BACKEND:
This build is configured to use a secured Supabase Edge Function and separate mpr_* tables.
Only service-role server code can read account password hashes, session hashes and school reports.
Backend deployment must remain ACTIVE in its connected Supabase project.

SCHOOL LOGIN:
- ONE account per school.
- Username is the SEMIS Code.
- Shared numeric password must be 6-13 digits.
- HM may share credentials with teachers, who can edit the same report.
- Months are independently saved in the school account.
- Next month copies forward cumulative completed chapters.
- Simultaneous changes to the same month are conflict protected.

PASSWORD RESET:
- HM requests a reset from the site.
- Administrator verifies requester and approves.
- One-time code appears in admin dashboard and must be shared privately with HM.
- Existing school drafts and export files remain intact.

PRIVACY:
- School, teacher, draft, export information is accessible to that school via its shared password
  and to the administrator; not publicly listed.
- Visits are tracked by an anonymous session identifier.
- Feedback messages appear only in administrator dashboard.
- Administrator should change initial password in dashboard after first login.

NOTE:
The admin password is NEVER stored in these HTML files.
Online signup, drafts, history, admin views and feedback need internet connectivity.
The Excel editor keeps the embedded original Proforma export format.
