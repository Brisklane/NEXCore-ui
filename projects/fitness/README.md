# @nexcore/fitness

The Fitness app: front desk, member records, memberships and billing, class timetable and
bookings, personal training, access control, retention, staff and reporting.

Built for the people who run a gym, not for the people who buy the software. The screens that
matter most — the front desk, the kiosk, the class roster — are the ones designed to be used
standing up, between conversations, on a touchscreen, by somebody who has not been trained.

## Two rules this library keeps

**No card data, anywhere.** Payments are recorded, never processed. A stored payment method is a
provider token plus the brand, last four and expiry the desk needs to recognise it. Nothing here
accepts, transmits or renders a card number.

**Special-category data is treated as such.** Medical flags, PAR-Q answers, assessments and
progress photos are access-controlled, their reads are audited server-side, and they are excluded
from ordinary exports. Progress photos need the member's explicit consent before the UI will show
or upload one.
