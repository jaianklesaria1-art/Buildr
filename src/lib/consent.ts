import { prisma } from "@/lib/prisma";

export const CONSENT_NOTICE_VERSION = "2026-09-07";

export function recordConsent(userId: string, context: string) {
  return prisma.consentRecord.create({
    data: { userId, context, noticeVersion: CONSENT_NOTICE_VERSION },
  });
}
