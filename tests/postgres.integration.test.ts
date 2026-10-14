import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
test.after(async () => { await db.$disconnect(); });

test("PostgreSQL persists owner-scoped missions and consumes approvals once", async () => {
  const suffix = randomUUID();
  const owner = await db.owner.create({ data: { id: "test-" + suffix, username: "thara-test-" + suffix.slice(0, 8), passwordHash: "test-only" } });
  try {
    const now = Date.now();
    const mission = await db.mission.create({ data: {
      id: suffix, ownerId: owner.id, title: "PostgreSQL integration test", goal: "Validate transactional approval consumption",
      plan: ["Prepare", "Approve", "Verify"], planHash: "test-plan-" + suffix,
      actions: ["engineering.plan"], status: "approved", createdAt: now, updatedAt: now
    } });
    const approvalId = randomUUID();
    await db.approval.create({ data: {
      id: approvalId, ownerId: owner.id, missionId: mission.id, planHash: mission.planHash,
      actions: ["engineering.plan"], status: "approved", requestedBy: owner.id,
      requestedAt: now, expiresAt: now + 30_000, approvedBy: owner.id, approvedAt: now,
      tokenJti: suffix, tokenExpiresAt: now + 5 * 60_000
    } });

    const first = await db.$transaction(async tx => {
      const consumed = await tx.approval.updateMany({
        where: { id: approvalId, ownerId: owner.id, status: "approved", tokenJti: suffix, usedAt: null, tokenExpiresAt: { gt: Date.now() } },
        data: { usedAt: Date.now(), status: "consumed" }
      });
      if (consumed.count !== 1) return false;
      const running = await tx.mission.updateMany({ where: { id: mission.id, ownerId: owner.id, status: "approved" }, data: { status: "running", updatedAt: Date.now() } });
      if (running.count !== 1) throw new Error("Mission state transition was not atomic");
      return true;
    });
    assert.equal(first, true);

    const replay = await db.approval.updateMany({
      where: { id: approvalId, ownerId: owner.id, status: "approved", tokenJti: suffix, usedAt: null },
      data: { usedAt: Date.now(), status: "consumed" }
    });
    assert.equal(replay.count, 0, "a consumed approval must not be replayable");
    assert.equal(await db.mission.findFirst({ where: { id: mission.id, ownerId: owner.id } }).then(x => x?.status), "running");
    assert.equal(await db.mission.findFirst({ where: { id: mission.id, ownerId: "different-owner" } }), null);
  } finally {
    await db.owner.delete({ where: { id: owner.id } });
  }
});
