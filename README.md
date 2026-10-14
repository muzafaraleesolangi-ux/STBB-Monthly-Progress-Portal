# STBB Monthly Academic Progress Portal

**Developed by Muzafar Ali Solangi**  
WhatsApp Help & Support: [0300 0357397](https://wa.me/923000357397)

## Features
- Premium responsive Class I–V Sindhi-medium monthly progress interface.
- One shared account per school (SEMIS username).
- HM first selects the classes offered by the school, then adds teachers with Name, PID and designation, assigns each teacher to one or more selected classes, and assigns their teaching subjects.
- Course builder allows subject renaming, adding/removing subjects and chapters, and collapsible Save & Close cards.
- Each teacher can update their own assigned monthly subjects on a separate phone; subject-level saves use version checks to prevent silent overwrites.
- Monthly progress carry-forward, teachers, classes, subjects, and chapter editing.
- Excel export in the school's original one-sheet Proforma format, export history, and downloads.
- Private admin dashboard with school profiles (View / Edit / Add / Deactivate / Restore), visits, feedback, export history and reset requests.
- Forgot Password: admin verifies HM, approves request, and manually sends a private one-time reset link through the WhatsApp button; HM sets a new password on the existing school account without losing drafts or exports. No recovery code entry.
- School account and admin data stored via Supabase backend; no admin password embedded in public HTML.

## Deployment
Publish `index.html` and `MPR_Online_Editor.html` from repository root using GitHub Pages.
Open **Settings → Pages → Build and deployment** and choose **Deploy from a branch** → **main** → **/(root)** → **Save** if GitHub Pages has not already been enabled.

Site address (after GitHub Pages activation):
https://muzafaraleesolangi-ux.github.io/STBB-Monthly-Progress-Portal/

**Privacy:** Site tracks visits; school profile, teachers, and saved export records are accessible only to the school's shared account and the administrator. Staff should check records for accuracy before use. Do not enter unnecessary student personal data.

**Security:** Change initial admin password immediately after first login. One SEMIS login is shared by all teachers in the school, so users must avoid sharing passwords outside staff.


## Privacy and recovery details
WhatsApp messages are **not** sent automatically. After approval the administrator reviews the prefilled message and presses Send in WhatsApp. Recovery links expire after 48 hours. Soft-deactivated school accounts retain previous drafts and reports until restored. The account must only be issued to an authorized HM. Teachers using the same school account should work on their own assigned subjects.
