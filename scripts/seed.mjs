import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "Demo1234!";

const EMPLOYERS = [
  {
    email: "hiring@northwindlabs.buildr.test",
    name: "Northwind Labs",
    jobs: [
      {
        title: "Founding Frontend Engineer",
        company: "Northwind Labs",
        description:
          "First frontend hire at a 3-person team building developer tools for API observability. You'll own the entire dashboard UI.",
        skillsRequired: ["React", "TypeScript", "Design systems"],
        location: "Remote",
        stage: "Pre-seed",
      },
      {
        title: "Product Designer",
        company: "Northwind Labs",
        description: "Design the core workflow for our observability dashboard, from empty states to power-user views.",
        skillsRequired: ["Figma", "Prototyping", "User research"],
        location: "Remote",
        stage: "Pre-seed",
      },
    ],
  },
  {
    email: "team@fernway.buildr.test",
    name: "Fernway",
    jobs: [
      {
        title: "Backend Engineer",
        company: "Fernway",
        description: "Own the payments and settlement infrastructure for a logistics marketplace processing 10k+ orders/day.",
        skillsRequired: ["Node.js", "Postgres", "AWS"],
        location: "Bengaluru",
        stage: "Seed",
      },
    ],
  },
  {
    email: "jobs@cursive.buildr.test",
    name: "Cursive",
    jobs: [
      {
        title: "Growth Marketer",
        company: "Cursive",
        description: "First marketing hire. Own paid acquisition, SEO, and lifecycle email for a B2B SaaS tool.",
        skillsRequired: ["SEO", "Paid acquisition", "Analytics"],
        location: "Mumbai",
        stage: "Series A",
      },
      {
        title: "Data Analyst",
        company: "Cursive",
        description: "Build out our internal analytics stack and dashboards used by every team.",
        skillsRequired: ["SQL", "Python", "Analytics"],
        location: "Mumbai",
        stage: "Series A",
      },
    ],
  },
  {
    email: "careers@altosystems.buildr.test",
    name: "Alto Systems",
    jobs: [
      {
        title: "ML Engineer",
        company: "Alto Systems",
        description: "Build the recommendation engine that powers our core product. Greenfield ML infra work.",
        skillsRequired: ["Python", "Machine Learning", "AWS"],
        location: "Pune",
        stage: "Seed",
      },
    ],
  },
];

const CLIENTS = [
  {
    email: "hello@brandloom.buildr.test",
    name: "Brandloom Studio",
    gigs: [
      {
        title: "Landing page redesign",
        description: "Redesign a 5-page marketing site for a seed-stage startup. Figma to Webflow handoff.",
        skillsRequired: ["Figma", "Webflow"],
        budgetMin: 15000,
        budgetMax: 25000,
      },
      {
        title: "Brand copywriting",
        description: "Website copy plus tagline exploration for a fintech rebrand launching next quarter.",
        skillsRequired: ["Copywriting", "Brand voice"],
        budgetMin: 10000,
        budgetMax: 18000,
      },
    ],
  },
  {
    email: "ops@pinwheel.buildr.test",
    name: "Pinwheel Media",
    gigs: [
      {
        title: "3-part explainer video series",
        description: "Short-form explainer videos for a product launch — scripting, motion graphics, and edit.",
        skillsRequired: ["Video editing", "Motion graphics"],
        budgetMin: 20000,
        budgetMax: 40000,
      },
    ],
  },
  {
    email: "contact@stackforge.buildr.test",
    name: "Stackforge",
    gigs: [
      {
        title: "API integration work",
        description: "Connect our CRM to three third-party APIs (Stripe, Twilio, HubSpot). Two-week scope.",
        skillsRequired: ["Node.js", "REST APIs"],
        budgetMin: 30000,
        budgetMax: 50000,
      },
      {
        title: "Internal admin dashboard",
        description: "Build a small internal tool for our ops team to manage inventory records.",
        skillsRequired: ["React", "Node.js"],
        budgetMin: 25000,
        budgetMax: 45000,
      },
    ],
  },
];

const COFOUNDERS = [
  {
    email: "priya.menon@buildr.test",
    name: "Priya Menon",
    skills: ["Product", "Fundraising"],
    stage: "IDEA",
    sector: "Fintech",
    riskTolerance: "HIGH",
    equityExpectation: "20-30%",
    ideaSummary: "A savings app for gig workers that auto-invests spare change based on income volatility.",
    location: "Bengaluru",
  },
  {
    email: "rohan.iyer@buildr.test",
    name: "Rohan Iyer",
    skills: ["Backend", "Machine Learning"],
    stage: "PROTOTYPE",
    sector: "EdTech",
    riskTolerance: "MEDIUM",
    equityExpectation: "15-20%",
    ideaSummary: "Adaptive practice platform for competitive exam prep, already has a working prototype and 200 beta users.",
    location: "Delhi",
  },
  {
    email: "ananya.desai@buildr.test",
    name: "Ananya Desai",
    skills: ["Sales", "Operations"],
    stage: "PRE_SEED",
    sector: "Healthtech",
    riskTolerance: "MEDIUM",
    equityExpectation: "10-15%",
    ideaSummary: "B2B platform connecting diagnostic labs with clinics for same-day sample pickup and results.",
    location: "Hyderabad",
  },
  {
    email: "vikram.shah@buildr.test",
    name: "Vikram Shah",
    skills: ["Backend", "Supply chain"],
    stage: "IDEA",
    sector: "Logistics",
    riskTolerance: "HIGH",
    equityExpectation: "25-35%",
    ideaSummary: "Route optimization for last-mile delivery fleets in tier-2 Indian cities.",
    location: "Pune",
  },
  {
    email: "neha.kapoor@buildr.test",
    name: "Neha Kapoor",
    skills: ["Design", "Product"],
    stage: "SEED",
    sector: "Consumer",
    riskTolerance: "LOW",
    equityExpectation: "8-12%",
    ideaSummary: "A subscription box for regional Indian snacks curated by state, already doing ₹4L MRR.",
    location: "Mumbai",
  },
  {
    email: "arjun.reddy@buildr.test",
    name: "Arjun Reddy",
    skills: ["Marketing", "Growth"],
    stage: "PROTOTYPE",
    sector: "Climate",
    riskTolerance: "MEDIUM",
    equityExpectation: "15-20%",
    ideaSummary: "Marketplace for verified carbon offset credits targeted at Indian SMEs.",
    location: "Chennai",
  },
];

async function main() {
  const existing = await prisma.user.findFirst({ where: { email: { endsWith: "@buildr.test" } } });
  if (existing) {
    console.log("Seed data already present (found a @buildr.test user) — skipping. Delete manually to reseed.");
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const employer of EMPLOYERS) {
    const user = await prisma.user.create({
      data: { name: employer.name, email: employer.email, passwordHash, zones: ["EMPLOYER"] },
    });
    for (const job of employer.jobs) {
      await prisma.jobListing.create({ data: { postedByUserId: user.id, ...job } });
    }
  }

  for (const client of CLIENTS) {
    const user = await prisma.user.create({
      data: { name: client.name, email: client.email, passwordHash, zones: ["CLIENT"] },
    });
    for (const gig of client.gigs) {
      await prisma.gigListing.create({ data: { postedByUserId: user.id, ...gig } });
    }
  }

  for (const cofounder of COFOUNDERS) {
    const user = await prisma.user.create({
      data: { name: cofounder.name, email: cofounder.email, passwordHash, zones: ["COFOUNDER"] },
    });
    await prisma.cofounderProfile.create({
      data: {
        userId: user.id,
        skills: cofounder.skills,
        stage: cofounder.stage,
        sector: cofounder.sector,
        riskTolerance: cofounder.riskTolerance,
        equityExpectation: cofounder.equityExpectation,
        ideaSummary: cofounder.ideaSummary,
        location: cofounder.location,
        isComplete: true,
      },
    });
  }

  const jobCount = await prisma.jobListing.count();
  const gigCount = await prisma.gigListing.count();
  const cofounderCount = await prisma.cofounderProfile.count();

  console.log(`Seeded ${EMPLOYERS.length} employers with ${jobCount} job listings.`);
  console.log(`Seeded ${CLIENTS.length} clients with ${gigCount} gig listings.`);
  console.log(`Seeded ${cofounderCount} complete cofounder profiles.`);
  console.log(`All fake accounts share the password: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
