import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EXPORTABLE_TABLES = [
  "users",
  "job-seeker-profiles",
  "cofounder-profiles",
  "freelancer-profiles",
  "interactions",
  "matches",
  "messages",
  "consents",
];

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.isAdmin) redirect("/dashboard");

  const [
    totalUsers,
    jobSeekerCount,
    cofounderCount,
    freelancerCount,
    jobSeekerComplete,
    cofounderComplete,
    freelancerComplete,
    totalMatches,
    mutualMatches,
    totalMessages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { zones: { has: "JOB_SEEKER" } } }),
    prisma.user.count({ where: { zones: { has: "COFOUNDER" } } }),
    prisma.user.count({ where: { zones: { has: "FREELANCER" } } }),
    prisma.jobSeekerProfile.count({ where: { isComplete: true } }),
    prisma.cofounderProfile.count({ where: { isComplete: true } }),
    prisma.freelancerProfile.count({ where: { isComplete: true } }),
    prisma.match.count(),
    prisma.match.count({ where: { status: "MUTUAL" } }),
    prisma.message.count(),
  ]);

  const zoneRows = [
    { label: "Job Seeker", signups: jobSeekerCount, completed: jobSeekerComplete },
    { label: "Cofounder", signups: cofounderCount, completed: cofounderComplete },
    { label: "Freelancer", signups: freelancerCount, completed: freelancerComplete },
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Signups, zone breakdown, and data export.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <Stat label="Total signups" value={totalUsers} />
        <Stat label="Matches (mutual)" value={`${mutualMatches} / ${totalMatches}`} />
        <Stat label="Messages sent" value={totalMessages} />
      </div>

      <h2 className="mt-10 text-lg font-medium">Zone breakdown</h2>
      <table className="mt-3 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-2">Zone</th>
            <th className="py-2">Signups</th>
            <th className="py-2">Profile complete</th>
            <th className="py-2">Completion rate</th>
          </tr>
        </thead>
        <tbody>
          {zoneRows.map((row) => (
            <tr key={row.label} className="border-b border-neutral-100">
              <td className="py-2">{row.label}</td>
              <td className="py-2">{row.signups}</td>
              <td className="py-2">{row.completed}</td>
              <td className="py-2">
                {row.signups ? `${Math.round((row.completed / row.signups) * 100)}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-10 text-lg font-medium">Export raw data</h2>
      <p className="mt-1 text-sm text-neutral-500">Downloads the underlying table as CSV.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXPORTABLE_TABLES.map((table) => (
          <a
            key={table}
            href={`/api/admin/export/${table}`}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm underline"
          >
            {table}.csv
          </a>
        ))}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
