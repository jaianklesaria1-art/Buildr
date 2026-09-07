import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppHeader from "@/components/app/AppHeader";

const ZONE_CONFIG = {
  JOB_SEEKER: { label: "Job Seeker", profileHref: "/profile/job-seeker", feedHref: "/feed", gradient: "from-blue-500 to-indigo-600" },
  COFOUNDER: { label: "Cofounder", profileHref: "/profile/cofounder", feedHref: "/feed", gradient: "from-fuchsia-500 to-purple-600" },
  FREELANCER: { label: "Freelancer", profileHref: "/profile/freelancer", feedHref: "/feed", gradient: "from-amber-500 to-orange-600" },
} as const;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      jobSeekerProfile: true,
      cofounderProfile: true,
      freelancerProfile: true,
    },
  });
  if (!user) redirect("/login");

  const profileByZone = {
    JOB_SEEKER: user.jobSeekerProfile,
    COFOUNDER: user.cofounderProfile,
    FREELANCER: user.freelancerProfile,
  } as const;

  return (
    <>
      <AppHeader active="dashboard" userName={user.name} />
      <main id="main-content" className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-neutral-500">Your zones and their status.</p>

        <div className="mt-8 flex flex-col gap-4">
          {user.zones
            .filter((zone): zone is keyof typeof ZONE_CONFIG => zone in ZONE_CONFIG)
            .map((zone) => {
              const config = ZONE_CONFIG[zone];
              const profile = profileByZone[zone];
              const isComplete = profile?.isComplete ?? false;

              return (
                <div key={zone} className="overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                  <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">{config.label}</h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          isComplete
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isComplete ? "Profile complete" : "Profile incomplete"}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-3 text-sm">
                      <a
                        href={config.profileHref}
                        className="rounded-full border border-neutral-200 px-4 py-2 font-medium transition-colors hover:bg-neutral-50"
                      >
                        {isComplete ? "Edit profile" : "Complete profile"}
                      </a>
                      {isComplete && (
                        <a
                          href={config.feedHref}
                          className={`rounded-full bg-gradient-to-r px-4 py-2 font-medium text-white ${config.gradient}`}
                        >
                          Start swiping
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </main>
    </>
  );
}
