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
- Private admin dashboard with school profiles (View / Edit / Add / Permanent Delete), visits, feedback, export history and reset requests.
- Forgot Password: admin verifies HM, approves request, and manually sends a private one-time reset link through the WhatsApp button; HM re-registers access using Create New Account via that approved private WhatsApp link, preserving their previous teachers, drafts and exports. There is no manual recovery-code entry.
- School account and admin data stored via Supabase backend; no admin password embedded in public HTML.

## Fast Reporting Guide — HM & Teachers (October 2026)

1. **First-time HM setup:** Select school classes, add teachers, select teaching classes. Use **All Offered Classes** to avoid repeating class ticks. Assign each teacher’s subjects from the preloaded classwise checklist. A class can have several teachers, but each class–subject can belong to only one teacher.
2. **Returning school:** If teachers, classes and subjects are already set up, the Guided School Studio opens **Monthly Progress · Quick Fill** directly. The top banner also provides shortcuts to **Monthly Quick Fill** and **Teacher Subjects**.
3. **Choose reporting month:** Pick a new month or use one of the **recent saved-month** shortcuts. The latest existing month is not overwritten automatically.
4. **On each teacher’s mobile:** Choose their name from **Teacher Profile**. They may optionally select **Remember my teacher profile on this device**; this saves only a local teacher preference, not a separate account or password.
5. **Enter progress quickly:** Search for a class/subject/teacher or choose **Pending Only**. Type just two chapter numbers (**Previous** and **This Month**) directly in the large cells. **Remaining** recalculates automatically. Press Enter to move to the next cell.
6. **Only if needed:** Open **Notebook, Test & Notes (Optional)** for notebook maintenance, cleanliness, tests and suggestions. New reports do not invent ratings: assessment fields start with **Not entered** until reviewed.
7. **Save and export:** Subject progress saves to the school cloud separately, or press **Save All Changes**. Use **Review & Export Excel** after verifying pending subjects. Background refresh will not replace an actively edited input.

**Privacy and concurrency:** Different schools’ working sessions remain isolated in the browser. Assignments and subject progress use server-side version checks; if a teacher edits the same subject concurrently, a conflict must be resolved rather than silently overwriting saved data. Do not share a school login outside authorized staff.

## Deployment
Publish `index.html` and `MPR_Online_Editor.html` from repository root using GitHub Pages.
Open **Settings → Pages → Build and deployment** and choose **Deploy from a branch** → **main** → **/(root)** → **Save** if GitHub Pages has not already been enabled.

Site address (after GitHub Pages activation):
https://muzafaraleesolangi-ux.github.io/STBB-Monthly-Progress-Portal/

**Privacy:** Site tracks visits; school profile, teachers, and saved export records are accessible only to the school's shared account and the administrator. Staff should check records for accuracy before use. Do not enter unnecessary student personal data.

**Security:** Change initial admin password immediately after first login. One SEMIS login is shared by all teachers in the school, so users must avoid sharing passwords outside staff.


## Privacy and recovery details
WhatsApp messages are **not** sent automatically. After approval the administrator reviews the prefilled message and presses Send in WhatsApp. Recovery links expire after 48 hours. Password reset never deletes drafts or reports. Admin Delete is a separate irreversible action that removes the school and its associated teacher setup, drafts, subject entries, and saved Excel report history. To confirm Delete, the administrator must type the exact SEMIS Code. The account must only be issued to an authorized HM. Teachers using the same school account should work on their own assigned subjects.


## Account reset flow
1. On Forgot Password, enter school SEMIS, official school name, Head Teacher name and the HM WhatsApp number.
2. The request appears in the private Admin → Reset Requests view with that same WhatsApp number. Admin independently verifies the HM and clicks **Approve & Send WhatsApp**.
3. WhatsApp opens a **prefilled approval message**, addressed to the supplied number; the admin presses **Send** manually.
4. The private single-use link takes the school to **Create New Account**, where the same school data and a new password restore access to the existing account. Reports are preserved.
