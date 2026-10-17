---
title: "architecting multi-tenancy: workspaces, roles & tenant isolation in zentro"
description: "how we modeled organizations, workspaces, and row-level tenant security in postgresql with drizzle orm and trpc."
date: "2026-08-14"
tags:
  - "architecture"
  - "next.js"
  - "postgresql"
  - "drizzle"
  - "saas"
published: true
---

# architecting multi-tenancy: workspaces, roles & tenant isolation in zentro

when building collaborative saas tools, multi-tenancy is often treated as an afterthought—a quick `tenant_id` column sprinkled across tables. but as permission complexity scales, that naive approach quickly breaks down.

in **zentro**, our goal was to support nested organization boundaries, granular workspace roles, and real-time activity feeds without risking data leakage across organizational walls.

## the tenancy data model

instead of relying on separate database schemas per organization, we opted for a pooled relational model using postgresql and drizzle orm:

```typescript
// schema/tenancy.ts
export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  orgId: text("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  visibility: text("visibility").default("private"),
});

export const memberships = pgTable("memberships", {
  userId: text("user_id").notNull(),
  orgId: text("org_id").notNull(),
  role: text("role", { enum: ["owner", "admin", "member", "guest"] }).default("member"),
});
```

## row-level security and context injection

every incoming trpc mutation or server action resolves the authenticated session and extracts the active `orgId` and `workspaceId` headers.

```typescript
export const orgProtectedProcedure = t.procedure
  .use(async ({ ctx, next }) => {
    const org = await resolveActiveOrg(ctx.session.user.id, ctx.headers.get("x-org-id"));
    if (!org) {
      throw new TRPCError({ code: "FORBIDDEN", message: "tenant boundary violated" });
    }
    return next({ ctx: { ...ctx, org } });
  });
```

## key takeaways

1. **isolate at the query builder layer**: never trust client-provided IDs without verifying membership records in the same transaction.
2. **activity feeds require audit trails**: every mutation records an idempotent audit event with actor, action, timestamp, and tenant scope.
3. **soft deletes must respect tenancy**: when querying, ensure deleted records don't linger across workspace renames.
