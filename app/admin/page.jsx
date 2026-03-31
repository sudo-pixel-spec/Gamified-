"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import {
  listStandards, createStandard, updateStandard, deleteStandard, restoreStandard,
  listSubjects, createSubject, updateSubject, deleteSubject, restoreSubject,
  listUnits, createUnit, updateUnit, deleteUnit, restoreUnit,
  listChapters, createChapter, updateChapter, deleteChapter, restoreChapter,
  listLessons, createLesson, updateLesson, deleteLesson, restoreLesson,
  restoreQuiz, getJobsStatus,
} from "../../lib/admin-api";
import LessonVideoPanel from "../../components/LessonVideoPanel";

/* ────────────────────────────── seed data ──────────────────────── */

const SEED_DATA = {
  standard: {
    code: "GR8",
    name: "Grade VIII",
    description: "Central Board of Secondary Education — Grade 8 curriculum",
    order: 8,
  },
  subject: {
    name: "Data Science",
    description:
      "A 12-hour skill module introducing data science concepts, data visualizations, and AI applications. Developed by CBSE in partnership with Microsoft India.",
    order: 1,
  },
  unit: {
    name: "Data Science Fundamentals",
    description:
      "Core unit covering data types, data science principles, visualization techniques, and an introduction to AI.",
    order: 1,
  },
  chapters: [
    {
      name: "Introduction to Data",
      description:
        "Understand what data is, its common types (text, image, video, numbers, sound), and how qualitative vs quantitative (discrete/continuous) data differ.",
      order: 1,
      lessons: [
        {
          title: "What is Data?",
          description:
            "Data refers to computer information that is either transmitted or stored. Covers data types, binary storage, qualitative vs quantitative data, and discrete vs continuous subtypes.",
          order: 1,
          content: `## What is Data?

Data is any kind of information — numbers, text, or pictures — that can be transmitted or stored by a computer. Internally, computers store data as a series of bits with a value of either 0 or 1.

### Common Types of Data
- Text
- Image
- Video
- Numbers
- Spreadsheets
- Sound

### Two Primary Categories

**Qualitative Data** — Descriptive information.
Example: *"What a nice day it is"*

**Quantitative Data** — Numerical information.
Example: *"1", "3.65"*

Quantitative data is further divided into:

| Type | Definition | Example |
|---|---|---|
| Discrete | Specific countable value | Number of months in a year |
| Continuous | Any value within a range (measurable) | Age of family members |`,
        },
        {
          title: "Real-World Examples of Data",
          description:
            "How video streaming platforms use data analysis to suggest relevant content. Benefits of data in entertainment: predicting interests, scheduling, customer insights, and targeted ads.",
          order: 2,
          content: `## Real-World Examples of Data

### Entertainment Industry — Video Recommendations

When you watch a video online, the platform analyses the videos that people usually watch next. It stores and studies viewing preferences, then an algorithm creates a pattern and shows you suggested videos.

### Benefits of Data in Entertainment
- **Predicting interests** of the audience
- **Optimised on-demand scheduling** of media streams
- **Insights from customer reviews**
- **Effective targeting** of advertisements

### Applied Project
Discuss how data analytics is applied in the airline industry to predict flight delays. Factors include:
- Weather conditions (extreme weather)
- Route restrictions / air traffic
- Mechanical delays
- Availability of runways`,
        },
      ],
    },
    {
      name: "Introduction to Data Science",
      description:
        "Learn what data science is, explore career paths (Data Scientist, BI Analyst, Data Engineer, Data Architect, Senior Data Scientist), and understand the five core question types data science answers.",
      order: 2,
      lessons: [
        {
          title: "A Brief Introduction to Data Science",
          description:
            "Every day our activities generate enormous amounts of data. Data science extracts meaningful interpretations from this data to improve decision-making across industries.",
          order: 1,
          content: `## A Brief Introduction to Data Science

Every day, through various means of lifestyle, a tremendous amount of data is generated:
- Buying groceries → purchase records
- Withdrawing from an ATM → banking transaction data
- Liking a post on social media → preference data
- Browsing tutorial videos → viewing history

**Data Science** investigates, organises, and carefully analyses this data to extract meaningful interpretations.

### What Data Science Helps With
- Helping industries serve customers better
- Assisting authorities in identifying criminal patterns
- Improving sporting performance through analytics`,
        },
        {
          title: "Careers in Data Science",
          description:
            "Overview of key job roles: Data Scientist, Business Intelligence Analyst, Data Engineer, Data Architect, and Senior Data Scientist.",
          order: 2,
          content: `## Careers in Data Science

### Common Job Titles

| Role | Responsibilities |
|---|---|
| **Data Scientist** | Gather & analyse large datasets; combine computer science, statistics, and mathematics to create actionable plans |
| **Business Intelligence Analyst** | Use data to assess markets and identify latest business trends; shape company strategy |
| **Data Engineer** | Mine data; create robust algorithms for deeper analysis |
| **Data Architect** | Create blueprints for centralising and integrating data sources |
| **Senior Data Scientist** | Anticipate future business needs; design new standards for analysis |`,
        },
        {
          title: "What Does Data Science Help Us Achieve?",
          description:
            "The five core question types: Classification, Anomaly Detection, Regression, Clustering, and Reinforcement Learning.",
          order: 3,
          content: `## What Does Data Science Help Us Achieve?

### 1. Classification — "Which class does this belong to?"
- Binary Classification: Yes/No, Hot/Cold
- Multiclass Classification: more than two choices

### 2. Anomaly Detection — "Is this an outlier?"
- Unexpected debit card transaction → fraud alert
- Is this email spam?

### 3. Regression — "What will the value of this variable be?"
- How much rainfall this year? → 100 mm
- How many runs will the winning team score? → 320

### 4. Clustering — "How is the data grouped?"
Separates data into distinct groups (unsupervised machine learning).

### 5. Reinforcement Learning — "What should be done now?"
Used for autonomous systems. Models trained through reward and punishment.`,
        },
      ],
    },
    {
      name: "Data Visualization",
      description:
        "What data visualization is, common chart types, the importance of data quality and completeness, and how to ask the right analytical questions.",
      order: 3,
      lessons: [
        {
          title: "Introduction to Data Visualization",
          description:
            "Recap of previous chapters and introduction to visualizing data and making predictions.",
          order: 1,
          content: `## Introduction

In previous chapters we learned how data is collected and interpreted. In this chapter we learn to **visualize data** and **make predictions**.`,
        },
        {
          title: "What is Data Visualization?",
          description:
            "Data visualization is the representation of data in a graph, chart, or other visual format to communicate trends, outliers, and patterns clearly.",
          order: 2,
          content: `## What is Data Visualization?

Data visualization is the **representation of data or information in a graph, chart, or other visual format**.

It helps users see and understand:
- Trends
- Outliers
- Patterns in data

### Common Types
- Charts (bar, pie, line)
- Graphs
- Tables
- Maps
- Histograms`,
        },
        {
          title: "Examples of Data Visualization",
          description:
            "Worked examples: a pie chart for food preferences of 50 students, and a line/bar chart for weekly class attendance (6–12 April).",
          order: 3,
          content: `## Examples of Data Visualization

### Example 1 — Pie Chart: Food Preferences (50 students)

| Food Item | Students | % |
|---|---|---|
| Pizza | 25 | 50% |
| Pasta | 10 | 20% |
| Dosa  | 15 | 30% |

Pizza is most preferred; Pasta is least preferred.

### Example 2 — Line Chart: Weekly Attendance

| Date   | Students Present |
|---|---|
| 06-Apr | 49 |
| 07-Apr | 42 |
| 08-Apr | 37 |
| 09-Apr | 48 |
| 10-Apr | 43 |
| 11-Apr | 36 |
| 12-Apr | 50 |`,
        },
        {
          title: "Importance of Data Visualization",
          description:
            "To get the right outcome, we must collect right and relevant data. Key considerations: data quality, completeness, and format.",
          order: 4,
          content: `## Importance of Data Visualization

To ensure the right outcome, we must collect the right data.

### Three Key Considerations

**1. Quality of Data**
The primary priority. Incomplete or skewed data will not produce correct output.

**2. Completeness of Data**
Data must be a complete set. Incomplete datasets cause discrepancies.

**3. Format of Data**
Data must be in a readable, accessible format. Convert if necessary before analysis.`,
        },
        {
          title: "Asking the Right Question",
          description:
            "Defining your goal, choosing statistical techniques (regression, cohort analysis, predictive analysis), understanding end-users, and selecting appropriate visualizations.",
          order: 5,
          content: `## Asking the Right Question

Asking the wrong question means you will never get the right answer.

### Step 1 — What do you wish to find?
Define your goal. Brainstorm and prepare guidelines for specific questions.

### Step 2 — Which statistical technique?

| Technique | Description |
|---|---|
| **Regression Analysis** | Find relationships between variables |
| **Cohort Analysis** | Compare how different groups behave over time |
| **Predictive Analysis** | Analyse historical data to predict future possibilities |

### Step 3 — Who will use the results?
Understand your end-users: their technical level, needs, and time constraints.

### Step 4 — Which visualization to pick?
Choose charts that correctly represent your insights for your audience. Tools like **Power BI** can assist with data cleaning and insight interpretation.`,
        },
      ],
    },
    {
      name: "Data Science and AI",
      description:
        "Real-world applications of data science (digital ads, speech recognition), text analytics, image analytics, and an overview of Artificial Intelligence and its sub-goals.",
      order: 4,
      lessons: [
        {
          title: "Introduction",
          description:
            "Recap of data visualization and introduction to applications of data science and the basics of AI.",
          order: 1,
          content: `## Introduction

In the previous chapter, we saw how to visualize data and make predictions. In this chapter, we learn about the **applications of data science** and the **basics of Artificial Intelligence (AI)**.`,
        },
        {
          title: "Applications of Data Science",
          description:
            "Key real-world applications: digital advertisements (tracking searches to serve relevant ads) and speech recognition (phones, consoles, smartwatches, Microsoft Cortana, home automation).",
          order: 2,
          content: `## Applications of Data Science

### Digital Advertisements
Data science algorithms track your searches and learn your preferences. When you open other apps, you see relevant advertisements based on your browsing data.

### Speech Recognition
Speech recognition is now part of everyday life:
- Mobile phones
- Game consoles
- Smartwatches
- Home automation devices

**Microsoft Cortana** uses speech recognition to take user inputs. Machine learning is making speech recognition significantly more accurate.`,
        },
        {
          title: "Analytics on Text Data",
          description:
            "Text analytics collects unstructured text and extracts structured information using NLP, data mining, and information retrieval. Key tasks: querying, mining, searching, analysing. Chatbots are a major use case.",
          order: 3,
          content: `## Analytics on Text Data

**Text analytics** collects unstructured text from various sources and extracts relevant information.

### Technical Areas
- Natural Language Processing (NLP)
- Data Mining
- Information Retrieval

### Four Basic Tasks
1. **Querying** — ask a database in plain English instead of SQL
2. **Mining** — discover patterns in large text datasets
3. **Searching** — retrieve documents based on text queries
4. **Analysing** — extract insights from text

### Chatbots
Chatbots use text analytics for querying and searching data, and retrieve documents based on what users are looking for.`,
        },
        {
          title: "Analytics on Image Data",
          description:
            "Image recognition processes images to identify people, patterns, logos, objects, or places. Applications include accessibility, interactive advertising, attendance checking, government ID, and content-based image search.",
          order: 4,
          content: `## Analytics on Image Data

**Image recognition** processes images to identify people, patterns, logos, objects, or places.

### How It Works
Machine learning tools can:
- Perform facial recognition
- Scan and name objects against a large database
- Recognize special patterns

Mobile phones use **computer vision** combined with cameras to achieve image recognition.

### Applications
- Accessibility for the visually impaired
- Interactive advertising
- Workplace attendance checking
- Government identification systems
- Content-based image search`,
        },
        {
          title: "Overview of AI",
          description:
            "AI is the science of making intelligent machines. AI ⊃ Machine Learning ⊃ Deep Learning. Six sub-goals: Logical Reasoning, Knowledge Representation, Planning & Navigation, NLP, Perception, and Emergent Intelligence.",
          order: 5,
          content: `## Overview of AI

**Artificial Intelligence (AI)** is the science and engineering of making intelligent machines — systems that take inputs from their environment and act on them as a human would.

### Relationship: AI ⊃ ML ⊃ Deep Learning
Each is a subset of the one above it.

### Six Sub-Goals of AI

| Sub-Goal | Description | Example |
|---|---|---|
| **Logical Reasoning** | Perform intelligent tasks requiring logic | Solving complex maths |
| **Knowledge Representation** | Describe real-world objects | Describing a car that violated traffic rules |
| **Planning & Navigation** | Travel from Point X to Point Y | Self-driving robot |
| **Natural Language Processing** | Understand and process human language | Web translator |
| **Perception** | Interact via touch, sound, smell, and sight | Sensor-based systems |
| **Emergent Intelligence** | Intelligence derived from AI, not explicitly programmed | Emotional intelligence; moral reasoning |`,
        },
      ],
    },
  ],
};

const SEED_CHAPTER_COUNT = SEED_DATA.chapters.length;
const SEED_LESSON_COUNT = SEED_DATA.chapters.reduce(
  (total, chapter) => total + chapter.lessons.length,
  0
);

/* ────────────────────────────── seed runner ────────────────────── */

function extractId(res) {
  return res?.data?._id ?? res?.data?.id ?? res?._id ?? res?.id ?? null;
}

async function runSeed(onLog) {
  onLog({ text: "Creating Standard: Grade VIII…", status: "running" });
  const stdRes = await createStandard(SEED_DATA.standard);
  const standardId = extractId(stdRes);
  if (!standardId) throw new Error("Failed to get Standard ID from response");
  onLog({ text: `✓ Standard created (${standardId})`, status: "done" });

  onLog({ text: "Creating Subject: Data Science…", status: "running" });
  const subRes = await createSubject({ ...SEED_DATA.subject, standardId });
  const subjectId = extractId(subRes);
  if (!subjectId) throw new Error("Failed to get Subject ID from response");
  onLog({ text: `✓ Subject created (${subjectId})`, status: "done" });

  onLog({ text: "Creating Unit: Data Science Fundamentals…", status: "running" });
  const unitRes = await createUnit({ ...SEED_DATA.unit, subjectId });
  const unitId = extractId(unitRes);
  if (!unitId) throw new Error("Failed to get Unit ID from response");
  onLog({ text: `✓ Unit created (${unitId})`, status: "done" });

  for (const chapter of SEED_DATA.chapters) {
    const { lessons, ...chapterData } = chapter;
    onLog({ text: `Creating Chapter ${chapterData.order}: ${chapterData.name}…`, status: "running" });
    const chRes = await createChapter({ ...chapterData, unitId });
    const chapterId = extractId(chRes);
    if (!chapterId) throw new Error(`Failed to get Chapter ID for "${chapterData.name}"`);
    onLog({ text: `✓ Chapter ${chapterData.order} created (${chapterId})`, status: "done" });

    for (const lesson of lessons) {
      onLog({ text: `  Creating Lesson ${chapterData.order}.${lesson.order}: ${lesson.title}…`, status: "running" });
      const lRes = await createLesson({ ...lesson, chapterId });
      const lessonId = extractId(lRes);
      onLog({ text: `  ✓ Lesson created (${lessonId})`, status: "done" });
    }
  }

  onLog({ text: "🎉 Seed complete! 1 Standard · 1 Subject · 1 Unit · 4 Chapters · 15 Lessons", status: "success" });
}

/* ────────────────────────────── config ─────────────────────────── */

const AREA_FIELDS = {
  standards: [
    { key: "code", label: "Code", required: true, minLength: 3 },
    { key: "name", label: "Name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "order", label: "Order", type: "number" },
  ],
  subjects: [
    { key: "name", label: "Name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "standardId", label: "Standard ID", required: true },
    { key: "order", label: "Order", type: "number" },
  ],
  units: [
    { key: "name", label: "Name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "subjectId", label: "Subject ID", required: true },
    { key: "order", label: "Order", type: "number" },
  ],
  chapters: [
    { key: "name", label: "Name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "unitId", label: "Unit ID", required: true },
    { key: "order", label: "Order", type: "number" },
  ],
  lessons: [
    { key: "title", label: "Title", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "chapterId", label: "Chapter ID", required: true },
    { key: "content", label: "Content (Markdown)", type: "textarea" },
    { key: "order", label: "Order", type: "number" },
  ],
};

const AREAS = [
  { key: "standards", label: "Standards", icon: "verified",    list: listStandards, create: createStandard, update: updateStandard, remove: deleteStandard, restore: restoreStandard },
  { key: "subjects",  label: "Subjects",  icon: "menu_book",   list: listSubjects,  create: createSubject,  update: updateSubject,  remove: deleteSubject,  restore: restoreSubject },
  { key: "units",     label: "Units",     icon: "folder_open",  list: listUnits,     create: createUnit,     update: updateUnit,     remove: deleteUnit,     restore: restoreUnit },
  { key: "chapters",  label: "Chapters",  icon: "auto_stories", list: listChapters,  create: createChapter,  update: updateChapter,  remove: deleteChapter,  restore: restoreChapter },
  { key: "lessons",   label: "Lessons",   icon: "co_present",   list: listLessons,   create: createLesson,   update: updateLesson,   remove: deleteLesson,   restore: restoreLesson },
  { key: "quizzes",   label: "Quizzes",   icon: "quiz",         restore: restoreQuiz },
];

/* ────────────────────────────── helpers ────────────────────────── */

function extract(res) {
  if (!res) return [];
  const d = res?.data?.items ?? res?.data ?? res?.items ?? res;
  return Array.isArray(d) ? d : [];
}

function getItemId(item) {
  return item?._id ?? item?.id ?? null;
}

function hasValue(value) {
  return value != null && String(value).trim() !== "";
}

function getPreviewText(value, maxLength = 220) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/* ────────────────────────────── page ───────────────────────────── */

export default function AdminPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();

  const [counts, setCounts] = useState({ standards: 0, lessons: 0, quizzes: 0 });
  const [jobs, setJobs] = useState(null);
  const [activeArea, setActiveArea] = useState(null);
  const [items, setItems] = useState([]);
  const [areaLoading, setAreaLoading] = useState(false);
  const [tab, setTab] = useState("home");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Seed modal state
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedLogs, setSeedLogs] = useState([]);
  const [seedRunning, setSeedRunning] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const seedPreview = useMemo(
    () =>
      SEED_DATA.chapters.map((chapter) => ({
        ...chapter,
        lessonCount: chapter.lessons.length,
      })),
    []
  );

  /* ── summary data ── */
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    (async () => {
      const [stdsRes, lessonsRes, jobsRes] = await Promise.allSettled([
        listStandards(),
        listLessons(),
        getJobsStatus(),
      ]);
      if (cancelled) return;

      const stds = stdsRes.status === "fulfilled" ? stdsRes.value : null;
      const lessons = lessonsRes.status === "fulfilled" ? lessonsRes.value : null;
      const jobsData = jobsRes.status === "fulfilled" ? jobsRes.value : [];

      if (stdsRes.status === "rejected" || lessonsRes.status === "rejected" || jobsRes.status === "rejected") {
        console.warn("Admin summary partially failed", {
          standardsError: stdsRes.status === "rejected" ? stdsRes.reason : null,
          lessonsError: lessonsRes.status === "rejected" ? lessonsRes.reason : null,
          jobsError: jobsRes.status === "rejected" ? jobsRes.reason : null,
        });
      }

      setCounts({
        standards: extract(stds).length,
        lessons: extract(lessons).length,
        quizzes: 0,
      });
      setJobs(jobsData?.data ?? jobsData);
    })();
    return () => { cancelled = true; };
  }, [authLoading]);

  /* ── load area items ── */
  const openArea = useCallback(async (area) => {
    if (!area.list) return;
    setActiveArea(area);
    setAreaLoading(true);
    const res = await area.list();
    setItems(extract(res));
    setAreaLoading(false);
  }, []);

  const closeArea = () => {
    setActiveArea(null);
    setItems([]);
    setShowForm(false);
    setEditingItem(null);
  };

  /* ── form helpers ── */
  const openCreateForm = () => { setEditingItem(null); setFormData({}); setFormError(""); setShowForm(true); };
  const openEditForm = (item) => { setEditingItem(item); setFormData({ ...item }); setFormError(""); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingItem(null); setFormData({}); setFormError(""); };

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!activeArea) return;
    setFormLoading(true);
    setFormError("");
    try {
      const fields = AREA_FIELDS[activeArea.key] || [];
      const payload = {};
      for (const f of fields) {
        const val = formData[f.key];
        if (val !== undefined && val !== "") {
          payload[f.key] = f.type === "number" ? Number(val) : val;
        }
      }
      if (editingItem) {
        await activeArea.update(editingItem._id || editingItem.id, payload);
      } else {
        await activeArea.create(payload);
      }
      const res = await activeArea.list();
      setItems(extract(res));
      closeForm();
    } catch (err) {
      setFormError(err?.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  }, [activeArea, formData, editingItem]);

  /* ── CRUD handlers ── */
  const handleDelete = useCallback(async (area, id) => {
    if (!area.remove) return;
    await area.remove(id);
    const res = await area.list();
    setItems(extract(res));
  }, []);

  const handleRestore = useCallback(async (area, id) => {
    if (!area.restore) return;
    await area.restore(id);
    if (area.list) {
      const res = await area.list();
      setItems(extract(res));
    }
  }, []);

  /* ── seed handler ── */
  const openSeedModal = () => {
    setSeedLogs([]);
    setSeedDone(false);
    setShowSeedModal(true);
  };

  const handleRunSeed = async () => {
    setSeedRunning(true);
    setSeedLogs([]);
    setSeedDone(false);
    try {
      await runSeed((log) => {
        setSeedLogs((prev) => [...prev, log]);
      });
      setSeedDone(true);
      // Refresh counts
      const [stds, lessons] = await Promise.all([listStandards(), listLessons()]);
      setCounts((prev) => ({
        ...prev,
        standards: extract(stds).length,
        lessons: extract(lessons).length,
      }));
    } catch (err) {
      setSeedLogs((prev) => [
        ...prev,
        { text: `❌ Error: ${err.message}`, status: "error" },
      ]);
    } finally {
      setSeedRunning(false);
    }
  };

  /* ── loading state ── */
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const jobEntries = Array.isArray(jobs) ? jobs : jobs ? [jobs] : [];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">

      {/* ══════ Header ══════ */}
      <header className="flex items-center justify-between p-4 sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">dashboard_customize</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex size-10 items-center justify-center rounded-full bg-card-dark border border-white/10 hover:border-primary transition-colors"
        >
          <span className="material-symbols-outlined text-white">account_circle</span>
        </button>
      </header>

      <main className="flex flex-col gap-6 p-4">

        {/* ══════ Stats ══════ */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard label="Total Standards" value={counts.standards} up />
          <StatCard label="Active Lessons" value={counts.lessons} up />
          <StatCard label="Pending Quizzes" value={counts.quizzes} className="col-span-2 md:col-span-1" />
        </section>

        {/* ══════ Seed Banner ══════ */}
        <section className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-bold text-sm">CBSE Grade VIII — Data Science</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Seed the complete handbook: 1 Standard · 1 Subject · 1 Unit · {SEED_CHAPTER_COUNT} Chapters · {SEED_LESSON_COUNT} Lessons
            </p>
          </div>
          <button
            onClick={openSeedModal}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            Seed
          </button>
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold">Seed Data Preview</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                This is the exact curriculum structure the seed action inserts.
              </p>
            </div>
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              Read Only
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3 mb-4">
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Standard</p>
              <p className="font-semibold">{SEED_DATA.standard.name}</p>
              <p className="text-xs text-slate-500 mt-1">Code: {SEED_DATA.standard.code} · Order: {SEED_DATA.standard.order}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Subject</p>
              <p className="font-semibold">{SEED_DATA.subject.name}</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{SEED_DATA.subject.description}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Unit</p>
              <p className="font-semibold">{SEED_DATA.unit.name}</p>
              <p className="text-xs text-slate-500 mt-1">Order: {SEED_DATA.unit.order}</p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {seedPreview.map((chapter) => (
              <div
                key={chapter.order}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                      Chapter {chapter.order}
                    </p>
                    <p className="font-semibold">{chapter.name}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary uppercase">
                    {chapter.lessonCount} lessons
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{chapter.description}</p>
                <div className="space-y-2">
                  {chapter.lessons.map((lesson) => (
                    <div
                      key={`${chapter.order}-${lesson.order}`}
                      className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark/40 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{lesson.title}</p>
                        <span className="text-[10px] font-bold text-slate-500">{chapter.order}.{lesson.order}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{lesson.description}</p>
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                        {getPreviewText(lesson.content, 160)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════ Management Areas ══════ */}
        <section>
          <h2 className="text-lg font-bold mb-4 px-1">Management Areas</h2>
          <div className="grid grid-cols-2 gap-3">
            {AREAS.map((area) => (
              <button
                key={area.key}
                onClick={() => openArea(area)}
                className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark p-5 hover:border-primary/50 transition-all active:scale-95 group text-left"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">{area.icon}</span>
                </div>
                <span className="font-bold">{area.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ══════ Job Status ══════ */}
        <section className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold">Job Status</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase">Live</span>
          </div>
          {jobEntries.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No active jobs</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {jobEntries.map((job, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-2 rounded-full ${job.status === "running" ? "bg-amber-500 animate-pulse" : job.status === "done" ? "bg-emerald-500" : "bg-slate-400"}`} />
                    <div>
                      <p className="text-sm font-semibold">{job.name || `Job ${i + 1}`}</p>
                      <p className="text-xs text-slate-500">{job.detail || job.status || "Queued"}</p>
                    </div>
                  </div>
                  {job.progress != null ? (
                    <div className="text-right">
                      <p className="text-xs font-medium">{job.progress}%</p>
                      <div className="w-16 h-1 bg-slate-200 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className="bg-primary h-full transition-all" style={{ width: `${job.progress}%` }} />
                      </div>
                    </div>
                  ) : job.status === "done" ? (
                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">Pending</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ══════ Seed Modal ══════ */}
      {showSeedModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Seed Handbook Data</p>
                  <p className="text-[11px] text-slate-500">CBSE Grade VIII · Data Science</p>
                </div>
              </div>
              {!seedRunning && (
                <button
                  onClick={() => setShowSeedModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>

            {/* What will be created */}
            {seedLogs.length === 0 && !seedRunning && (
              <div className="p-4 space-y-3">
                <p className="text-sm text-slate-500">This will insert the following records into your database:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "verified", label: "1 Standard", sub: "Grade VIII" },
                    { icon: "menu_book", label: "1 Subject", sub: "Data Science" },
                    { icon: "folder_open", label: "1 Unit", sub: "DS Fundamentals" },
                    { icon: "auto_stories", label: "4 Chapters", sub: "All handbook chapters" },
                    { icon: "co_present", label: "15 Lessons", sub: "All chapter sections" },
                    { icon: "description", label: "Rich Content", sub: "Markdown included" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <span className="material-symbols-outlined text-primary text-[18px]">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{item.label}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Only run this once. Running it multiple times will create duplicate records.
                  </p>
                </div>
              </div>
            )}

            {/* Logs */}
            {seedLogs.length > 0 && (
              <div className="p-4 max-h-64 overflow-y-auto space-y-1.5">
                {seedLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[10px] font-mono mt-0.5 shrink-0 ${
                      log.status === "done" ? "text-emerald-500" :
                      log.status === "error" ? "text-red-400" :
                      log.status === "success" ? "text-primary font-bold" :
                      "text-slate-400"
                    }`}>
                      {log.status === "running" ? "›" : log.status === "done" ? "✓" : log.status === "error" ? "✗" : "★"}
                    </span>
                    <p className={`text-xs font-mono leading-relaxed ${
                      log.status === "error" ? "text-red-400" :
                      log.status === "success" ? "text-primary font-bold" :
                      log.status === "done" ? "text-slate-600 dark:text-slate-300" :
                      "text-slate-500"
                    }`}>
                      {log.text}
                    </p>
                  </div>
                ))}
                {seedRunning && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-xs text-slate-400">Working…</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer actions */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 flex gap-2">
              {seedDone ? (
                <button
                  onClick={() => setShowSeedModal(false)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition-all active:scale-95 text-sm"
                >
                  Done
                </button>
              ) : (
                <>
                  {!seedRunning && (
                    <button
                      onClick={() => setShowSeedModal(false)}
                      className="flex-1 border border-slate-200 dark:border-white/10 font-bold py-2.5 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-white/5 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleRunSeed}
                    disabled={seedRunning}
                    className="flex-1 bg-primary hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {seedRunning ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Seeding…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                        Run Seed
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════ Area Detail Drawer ══════ */}
      {activeArea && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background-light dark:bg-background-dark">
          <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <button onClick={showForm ? closeForm : closeArea} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="text-lg font-bold">
                {showForm
                  ? (editingItem ? "Edit" : "Create") + " " + activeArea.label.replace(/s$/, "")
                  : activeArea.label}
              </h2>
            </div>
            {!showForm && activeArea.create && AREA_FIELDS[activeArea.key] && (
              <button
                onClick={openCreateForm}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-4">
            {showForm ? (
              <form onSubmit={handleFormSubmit} className="max-w-lg mx-auto space-y-4">
                {formError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">{formError}</div>
                )}
                {(AREA_FIELDS[activeArea.key] || []).map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium mb-1.5">
                      {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        className="w-full px-3 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-sm min-h-[100px] resize-y"
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        required={field.required}
                        placeholder={field.label}
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        className="w-full px-3 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-primary transition text-sm"
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        required={field.required}
                        minLength={field.minLength}
                        placeholder={field.label}
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : editingItem ? "Update" : "Create"}
                </button>
              </form>
            ) : areaLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-slate-500 py-12">No {activeArea.label.toLowerCase()} found</p>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item) => {
                  const itemId = getItemId(item);
                  const detailFields = (AREA_FIELDS[activeArea.key] || []).filter(
                    (field) => hasValue(item[field.key])
                  );
                  const metaFields = detailFields.filter(
                    (field) => !["description", "content"].includes(field.key)
                  );
                  const textFields = detailFields.filter((field) =>
                    ["description", "content"].includes(field.key)
                  );

                  return (
                    <div
                      key={itemId}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-dark p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold break-words">
                            {item.name || item.title || item.label || itemId}
                          </p>
                          {item.deletedAt && <span className="text-[10px] text-rose-400 font-medium">Deleted</span>}
                          {itemId && (
                            <p className="text-[11px] text-slate-400 mt-1 break-all">ID: {itemId}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {activeArea.update && AREA_FIELDS[activeArea.key] && !item.deletedAt && (
                            <button
                              onClick={() => openEditForm(item)}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                          )}
                          {item.deletedAt && activeArea.restore ? (
                            <button
                              onClick={() => handleRestore(activeArea, itemId)}
                              className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                              title="Restore"
                            >
                              <span className="material-symbols-outlined text-[20px]">restore</span>
                            </button>
                          ) : (
                            activeArea.remove && (
                              <button
                                onClick={() => handleDelete(activeArea, itemId)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {metaFields.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {metaFields.map((field) => (
                            <span
                              key={field.key}
                              className="rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[11px] text-slate-600 dark:text-slate-300"
                            >
                              {field.label}: {String(item[field.key])}
                            </span>
                          ))}
                        </div>
                      )}

                      {textFields.length > 0 && (
                        <div className="mt-3 space-y-3">
                          {textFields.map((field) => (
                            <div
                              key={field.key}
                              className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-background-dark/30 p-3"
                            >
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                                {field.label}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words line-clamp-6">
                                {getPreviewText(item[field.key], field.key === "content" ? 320 : 220)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeArea.key === "lessons" && !item.deletedAt && (
                        <LessonVideoPanel
                          lessonId={itemId}
                          lessonTitle={item.title}
                          lessonContent={item.contentText ?? item.content ?? ""}
                          currentVideoUrl={item.videoUrl ?? ""}
                          onSaved={(url) =>
                            setItems((prev) =>
                              prev.map((i) =>
                                getItemId(i) === itemId ? { ...i, videoUrl: url } : i
                              )
                            )
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════ Bottom Nav ══════ */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-white/10 bg-white/90 dark:bg-background-dark/90 backdrop-blur-lg px-4 pb-6 pt-2 z-40">
        <div className="mx-auto flex max-w-md gap-2">
          <button
            onClick={() => setTab("home")}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors ${tab === "home" ? "text-primary" : "text-slate-400 hover:text-primary"}`}
          >
            <span className="material-symbols-outlined" style={tab === "home" ? { fontVariationSettings: "'FILL' 1" } : undefined}>home</span>
            <p className="text-[10px] font-bold uppercase tracking-widest">Home</p>
          </button>
          <button
            onClick={() => setTab("search")}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors ${tab === "search" ? "text-primary" : "text-slate-400 hover:text-primary"}`}
          >
            <span className="material-symbols-outlined">search</span>
            <p className="text-[10px] font-bold uppercase tracking-widest">Search</p>
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors ${tab === "settings" ? "text-primary" : "text-slate-400 hover:text-primary"}`}
          >
            <span className="material-symbols-outlined">settings</span>
            <p className="text-[10px] font-bold uppercase tracking-widest">Settings</p>
          </button>
        </div>
      </nav>
    </div>
  );
}

/* ────────────────────────────── StatCard ───────────────────────── */

function StatCard({ label, value, up, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 shadow-sm ${className}`}>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold">{value}</p>
        {up != null && (
          <span className={`text-xs font-bold flex items-center mb-1 ${up ? "text-emerald-500" : "text-rose-500"}`}>
            <span className="material-symbols-outlined text-sm">{up ? "trending_up" : "trending_down"}</span>
          </span>
        )}
      </div>
    </div>
  );
}
