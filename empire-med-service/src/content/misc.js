export const homeFaqs = [
  ['What does Empire Med Service do?', 'We handle medical billing, coding, accounts receivable follow-up, credentialing and coverage discovery for U.S. healthcare providers. You can use one service or hand us the full revenue cycle.'],
  ['What is in the free assessment?', 'You tell us about your practice and billing setup, we review the details, and we call you within one business day. A written summary follows the conversation.'],
  ['Are there setup fees or long-term contracts?', 'No. We do not charge setup fees or require a long-term contract.'],
  ['How much does it cost?', '[ADD PRICING MODEL, e.g. percentage of collections or flat fee]'],
  ['Do you work with practices in my state?', 'Yes. We work with providers in all 50 states.'],
  ['How do you protect patient information?', 'Our work is HIPAA-compliant. Please do not put patient details in our website forms. We set up a secure channel before any records are exchanged.'],
];

export const googleReviews = [
  { name: 'Ciara Ward', text: 'Empire Med Service has truly transformed my private practice. It took almost 5 years to find a billing team I trust and does things right and professionally.' },
  { name: 'John Thach', text: 'One stop shop for everything from credentialing to billing/denial work. I have been working with Empire Med for about 10 months now and my practice has grown tremendously. They are on top of everything with admin support. It’s hard to trust people now a days but you will find these guys are humble and always open to brainstorming/implementing change for efficiency! 100% recommend!' },
];

export const allFaqs = [
  { group: 'Getting started', items: [
    ...homeFaqs.slice(0, 2),
    ['Can I start with one service?', 'Yes. Many providers begin with a single need, such as older AR or credentialing, and decide later whether to add more.'],
  ]},
  { group: 'Security and compliance', items: [
    homeFaqs[5],
    ['Will you sign a business associate agreement?', 'Yes. A BAA is put in place before we access any protected health information.'],
    ['Can I send patient details through the contact form?', 'Please do not. The forms are for business enquiries only, and email is not the right place for patient details.'],
  ]},
  { group: 'Working together', items: [
    homeFaqs[4],
  ]},
];

export const process = [
  ['Tell us about your practice', 'Send a few details about your specialty, claim volume and what is getting in the way. Please leave out patient information.'],
  ['We review and call you', 'We look over your details and call within one business day to talk through your billing setup.'],
  ['Get a written summary', 'You receive a summary of what we discussed and our suggested next steps, with no obligation to continue.'],
];

export const whyUs = [
  ['shield', 'HIPAA-compliant work', 'Patient data stays out of website forms and moves only through the secure channels we set up with you.'],
  ['check', 'No setup fees', 'There is nothing to pay just to get started, so you can test the fit without an upfront cost.'],
  ['doc', 'No long-term contract', 'You stay with us because the work is useful to you, not because a contract says you must.'],
  ['pin', 'All 50 states', 'We work with U.S. providers nationwide and keep payer and state differences in view.'],
  ['chart', 'Numbers you can read', 'We report in plain language, so you can see what was collected, what is open and why.'],
  ['phone', 'A quick first response', 'After you reach out, we review your details and call within one business day.'],
];

export const posts = [
  {
    slug: 'revenue-cycle-numbers-to-check-monthly', icon: 'chart', topic: 'Revenue cycle', date: '2026-11-02', read: '4 min read',
    title: 'Five revenue cycle numbers practice owners should check each month',
    excerpt: 'A short monthly review can show billing trouble long before it reaches your bank account. Here is what to look at and how each number is worked out.',
    body: `<p>Your bank balance tells you what has already happened. By the time collections feel low, the cause may be weeks old. These five measures give you an earlier signal, and you do not need to be a billing specialist to follow them.</p>
<h2>1. Days in accounts receivable</h2>
<p>This is roughly how long it takes to turn a charge into cash. A common formula divides your total AR balance by your average daily charges. Watch the direction over several months, and ask about any sustained rise.</p>
<h2>2. Clean claim rate</h2>
<p>This is the share of claims accepted and processed on first submission, without rework. When it falls, look upstream at registration, eligibility and coding before blaming the payer.</p>
<h2>3. Denial rate</h2>
<p>Divide claims denied by claims submitted in the same period. The overall figure matters less than the breakdown: ask which payers and which reason codes make up most of it, because that points to the fix.</p>
<h2>4. Net collection rate</h2>
<p>This shows how much you collected out of what you were actually allowed to collect. A common formula is payments divided by charges minus contractual adjustments. Gross collection rate cannot tell you this, because it depends on how high your fee schedule is set.</p>
<h2>5. AR over 90 days</h2>
<p>Look at the share of AR older than 90 days, separately for insurance and patient balances. Older balances are harder to collect, and some may be getting close to a payer's filing or appeal limit.</p>
<h2>How to use them</h2>
<p>Compare each number with your own recent months, using the same definitions each time. If you get reports from a biller, ask how each figure is calculated. Two reports can use the same name for different formulas, and that difference can hide a real problem.</p>`,
  },
  {
    slug: 'how-to-read-a-claim-denial', icon: 'doc', topic: 'Denials', date: '2026-11-02', read: '5 min read',
    title: 'How to read a claim denial: a guide to CARC and RARC codes',
    excerpt: 'The codes on a remittance tell you who is responsible and what to do next, once you know how to read them.',
    body: `<p>The explanation on an electronic remittance advice can look like alphabet soup, but it follows a pattern. Learning that pattern helps your team route each denial to the right person on the first try.</p>
<h2>The group code: who is responsible</h2>
<p>The two letters at the start show who carries the adjustment:</p>
<ul><li><strong>CO</strong> (contractual obligation): generally the provider's responsibility, and not billable to the patient.</li><li><strong>PR</strong> (patient responsibility): can be billed to the patient, such as a deductible or copay.</li><li><strong>OA</strong> (other adjustment): used when the others do not apply.</li><li><strong>PI</strong> (payer initiated reduction): a reduction the payer made that is not the patient's responsibility.</li></ul>
<h2>CARC and RARC: why it happened</h2>
<p>A Claim Adjustment Reason Code (CARC) gives the reason for the adjustment. A Remittance Advice Remark Code (RARC) can add detail. Read them together, because the CARC alone can be broad.</p>
<h2>Denials you are likely to see</h2>
<ul><li><strong>CO-16:</strong> the claim lacks information or has a submission error. The remark code usually tells you what is missing.</li><li><strong>CO-18:</strong> an exact duplicate. Check the original claim's status before sending anything else.</li><li><strong>CO-29:</strong> the filing time limit has passed. Look for proof of timely filing.</li><li><strong>CO-50:</strong> the payer does not consider the service medically necessary. Compare the note with the coverage policy.</li><li><strong>CO-197:</strong> precertification or authorization is absent. Check whether one exists and whether it matches the service.</li></ul>
<h2>Correct, appeal or write off?</h2>
<p>Start with the cause. A data error usually calls for a corrected claim. If you believe a claim was correct and the payer's decision was wrong, an appeal is usually the right route, within the payer's deadline. Any write-off should follow a written policy, so that denials are not simply adjusted away.</p>
<h2>Track the root cause</h2>
<p>Tracking denials by payer and reason code shows you what keeps repeating. Fixing one recurring front-desk error can do more than working many individual appeals.</p>`,
  },
  {
    slug: 'credentialing-vs-payer-enrollment', icon: 'badge', topic: 'Credentialing', date: '2026-11-02', read: '4 min read',
    title: 'Credentialing and payer enrollment: what is the difference?',
    excerpt: 'People often use the two terms interchangeably, but they are separate steps. Mixing them up is one way a new provider ends up unable to bill.',
    body: `<p>When you add a provider or open a new location, "getting credentialed" often means several different pieces of work. Knowing them apart helps you plan a start date you can rely on.</p>
<h2>Credentialing checks the provider</h2>
<p>Credentialing verifies a provider's qualifications, including licensure, education, training, work history and malpractice coverage. Many commercial payers draw on the CAQH ProView profile for this information.</p>
<h2>Enrollment connects the provider to the payer</h2>
<p>Payer enrollment is what links a provider to a plan, and usually to your group and tax ID as well, so that claims can be processed and paid. A provider can pass credentialing and still not be set up to bill correctly if this step is incomplete. Medicare enrollment is handled through PECOS or the CMS application forms.</p>
<h2>What to prepare</h2>
<ul><li>Individual and group NPIs, along with the tax ID</li><li>Current state license and any DEA registration</li><li>Malpractice insurance details</li><li>Education, training and a complete work history</li><li>Practice locations, hours and banking details for EFT</li></ul>
<h2>Plan for the wait</h2>
<p>Processing times differ by payer and state, and many applications take several months. Start as early as you can. Also ask each payer about the effective date and whether it can be retroactive, since policies vary and that determines how to handle claims for early visits.</p>
<h2>It does not end at approval</h2>
<p>CAQH profiles generally need re-attesting every 120 days, Medicare has periodic revalidation, and commercial payers recredential on their own schedules. A shared calendar of these dates is a simple way to avoid an interruption in payments.</p>`,
  },
  {
    slug: 'using-modifier-25-correctly', icon: 'code', topic: 'Coding', date: '2026-11-02', read: '3 min read',
    title: 'Using modifier 25 correctly on same-day visits',
    excerpt: 'Modifier 25 is routine in many specialties, and it is also easy to overuse. Here is what the documentation needs to show.',
    body: `<p>Modifier 25 tells a payer that a significant, separately identifiable evaluation and management (E/M) service was provided on the same day as a procedure, by the same physician or other qualified professional. Used well, it allows for fair payment of both services. Used by habit, it can attract audits.</p>
<h2>Ask one question first</h2>
<p>Did the provider do meaningful work beyond the usual evaluation that comes with the procedure? Minor procedures already include a brief pre-service assessment. If the visit only led to the decision to do that minor procedure, there may be no separately billable E/M.</p>
<h2>What it can look like</h2>
<p>A patient comes in for a scheduled joint injection and also raises a new concern about blood pressure, which the provider evaluates and manages. The note supports both services. By contrast, a brief check of the same joint before the scheduled injection normally does not support a separate E/M.</p>
<h2>Documentation that helps</h2>
<ul><li>Make clear which work relates to the E/M and which to the procedure</li><li>Record the assessment and plan for the separate problem</li><li>Base the E/M level only on the work outside the procedure</li></ul>
<p>A different diagnosis can help tell the story, but it is not required, and having one does not automatically justify the modifier. The documented work is what counts.</p>
<h2>Check your own pattern</h2>
<p>If modifier 25 appears on nearly every procedure visit, review a sample of charts. It is better to find and correct a habit yourself than to learn about it from a payer audit. Payer policies vary, so check the rules for your main plans.</p>`,
  },
];
