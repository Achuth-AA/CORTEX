// Document templates. Each builds a Quill "delta" (the editor's content format)
// so a new document can open pre-filled and nicely formatted.
//
// Quill delta basics:
//   inline text:   { insert: "text" }
//   inline format: { insert: "text", attributes: { bold: true } }
//   block format:  the attribute lives on the trailing "\n"
//                  e.g. heading => { insert: "Title" }, { insert: "\n", attributes: { header: 1 } }

const nl = (attrs) => (attrs ? { insert: "\n", attributes: attrs } : { insert: "\n" });
const txt = (insert, attrs) => (attrs ? { insert, attributes: attrs } : { insert });

// helper: a list of bullet/numbered items
const bullets = (items, type = "bullet") =>
  items.flatMap((it) => [txt(it), nl({ list: type })]);

const BLANK = { ops: [{ insert: "\n" }] };

const RESUME = {
  ops: [
    txt("Alex Morgan"), nl({ header: 1 }),
    txt("Senior Product Designer", { italic: true }), nl(),
    txt("San Francisco, CA · alex@example.com · (555) 010-2030 · linkedin.com/in/alex"), nl(),
    nl(),
    txt("Summary"), nl({ header: 2 }),
    txt(
      "Product designer with 8+ years crafting intuitive, accessible digital experiences for fast-growing startups. I care about design systems, clear writing, and shipping polished work quickly."
    ), nl(),
    nl(),
    txt("Experience"), nl({ header: 2 }),
    txt("Senior Product Designer — Acme Inc.", { bold: true }), nl(),
    txt("2021 — Present", { italic: true }), nl(),
    ...bullets([
      "Led the redesign of the core product, lifting activation by 32%.",
      "Built and maintained a 60-component design system used by 20 engineers.",
      "Mentored 3 junior designers and ran weekly design critiques.",
    ]),
    nl(),
    txt("Product Designer — Studio Lumen", { bold: true }), nl(),
    txt("2018 — 2021", { italic: true }), nl(),
    ...bullets([
      "Shipped 12+ client projects across fintech, health, and education.",
      "Introduced usability testing that cut support tickets by 18%.",
    ]),
    nl(),
    txt("Education"), nl({ header: 2 }),
    txt("B.A. Interaction Design — California College of the Arts", { bold: true }), nl(),
    txt("2014 — 2018", { italic: true }), nl(),
    nl(),
    txt("Skills"), nl({ header: 2 }),
    txt("Figma · Design Systems · Prototyping · User Research · HTML/CSS · Accessibility"), nl(),
  ],
};

const COLD_EMAIL = {
  ops: [
    txt("Cold Email"), nl({ header: 2 }),
    txt("Subject: ", { bold: true }),
    txt("Quick idea to help {{Company}} grow {{metric}}"), nl(),
    nl(),
    txt("Hi {{First name}},"), nl(),
    nl(),
    txt(
      "I noticed {{Company}} recently {{specific observation}} — impressive work. I work with teams like yours to {{outcome you deliver}}, and I had one concrete idea I think could move {{metric}} for you."
    ), nl(),
    nl(),
    txt("In short: ", { bold: true }),
    txt("{{one-sentence value proposition}}."), nl(),
    nl(),
    txt("A couple of teams I've helped:"), nl(),
    ...bullets([
      "{{Company A}} — {{result, e.g. +24% conversions in 6 weeks}}",
      "{{Company B}} — {{result}}",
    ]),
    nl(),
    txt(
      "Worth a quick 15-minute call next week? I'm happy to share the idea whether or not we work together."
    ), nl(),
    nl(),
    txt("Best,"), nl(),
    txt("{{Your name}}"), nl(),
    txt("{{Title}} · {{Company}} · {{phone}}", { italic: true }), nl(),
  ],
};

const COVER_LETTER = {
  ops: [
    txt("Your Name"), nl({ header: 1 }),
    txt("you@example.com · (555) 010-2030 · city, country"), nl(),
    nl(),
    txt("Dear Hiring Manager,"), nl(),
    nl(),
    txt(
      "I'm excited to apply for the {{Role}} position at {{Company}}. With {{X}} years of experience in {{field}}, I've consistently {{key achievement}}, and I'd love to bring that same impact to your team."
    ), nl(),
    nl(),
    txt(
      "In my current role at {{Current company}}, I {{accomplishment with a number}}. What draws me to {{Company}} specifically is {{genuine, specific reason}}."
    ), nl(),
    nl(),
    txt(
      "I'd welcome the chance to discuss how I can contribute. Thank you for your time and consideration."
    ), nl(),
    nl(),
    txt("Sincerely,"), nl(),
    txt("Your Name"), nl(),
  ],
};

const MEETING_NOTES = {
  ops: [
    txt("Meeting Notes"), nl({ header: 1 }),
    txt("Date: ", { bold: true }), txt("{{date}}   "),
    txt("Attendees: ", { bold: true }), txt("{{names}}"), nl(),
    nl(),
    txt("Agenda"), nl({ header: 2 }),
    ...bullets(["Topic one", "Topic two", "Topic three"], "ordered"),
    nl(),
    txt("Discussion"), nl({ header: 2 }),
    txt("Key points and decisions captured here…"), nl(),
    nl(),
    txt("Action Items"), nl({ header: 2 }),
    ...bullets([
      "Owner — task — due date",
      "Owner — task — due date",
    ]),
    nl(),
    txt("Next Meeting"), nl({ header: 2 }),
    txt("{{date / time / location}}"), nl(),
  ],
};

const PROJECT_PROPOSAL = {
  ops: [
    txt("Project Proposal"), nl({ header: 1 }),
    txt("{{Project name}} · Prepared by {{you}} · {{date}}", { italic: true }), nl(),
    nl(),
    txt("Overview"), nl({ header: 2 }),
    txt("A short paragraph describing the project and the problem it solves."), nl(),
    nl(),
    txt("Goals"), nl({ header: 2 }),
    ...bullets(["Primary goal", "Secondary goal", "Stretch goal"]),
    nl(),
    txt("Scope"), nl({ header: 2 }),
    txt("What's included — and explicitly what's not."), nl(),
    nl(),
    txt("Timeline"), nl({ header: 2 }),
    ...bullets([
      "Phase 1 — Discovery — {{dates}}",
      "Phase 2 — Build — {{dates}}",
      "Phase 3 — Launch — {{dates}}",
    ], "ordered"),
    nl(),
    txt("Budget"), nl({ header: 2 }),
    txt("Estimated cost and breakdown."), nl(),
  ],
};

const BLOG_POST = {
  ops: [
    txt("Your Catchy Headline Goes Here"), nl({ header: 1 }),
    txt("By {{author}} · {{date}} · {{read time}}", { italic: true }), nl(),
    nl(),
    txt(
      "Open with a hook — a surprising fact, a bold claim, or a question your reader is already asking."
    ), nl(),
    nl(),
    txt("Why this matters"), nl({ header: 2 }),
    txt("Set up the problem and why the reader should keep reading."), nl(),
    nl(),
    txt("The main idea"), nl({ header: 2 }),
    txt("Make your point. Support it with:"), nl(),
    ...bullets(["A clear example", "Data or a story", "A practical takeaway"]),
    nl(),
    txt("Conclusion"), nl({ header: 2 }),
    txt("Summarise and end with a call to action."), nl(),
    nl(),
    txt("“A great quote can anchor your whole piece.”", { blockquote: true }), nl({ blockquote: true }),
  ],
};

export const TEMPLATES = [
  {
    id: "blank",
    name: "Blank document",
    desc: "Start from a clean page",
    icon: "📄",
    color: "#64748b",
    title: "Untitled document",
    delta: BLANK,
  },
  {
    id: "resume",
    name: "Resume / CV",
    desc: "Land the interview",
    icon: "🧑‍💼",
    color: "#4f46e5",
    title: "My Resume",
    delta: RESUME,
  },
  {
    id: "cold-email",
    name: "Cold Email",
    desc: "Outreach that gets replies",
    icon: "✉️",
    color: "#0ea5e9",
    title: "Cold Email",
    delta: COLD_EMAIL,
  },
  {
    id: "cover-letter",
    name: "Cover Letter",
    desc: "Make it personal",
    icon: "💌",
    color: "#ec4899",
    title: "Cover Letter",
    delta: COVER_LETTER,
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    desc: "Agenda & action items",
    icon: "🗒️",
    color: "#f59e0b",
    title: "Meeting Notes",
    delta: MEETING_NOTES,
  },
  {
    id: "project-proposal",
    name: "Project Proposal",
    desc: "Pitch with structure",
    icon: "📐",
    color: "#10b981",
    title: "Project Proposal",
    delta: PROJECT_PROPOSAL,
  },
  {
    id: "blog-post",
    name: "Blog Post",
    desc: "Draft & publish ideas",
    icon: "✍️",
    color: "#8b5cf6",
    title: "Blog Post Draft",
    delta: BLOG_POST,
  },
];
