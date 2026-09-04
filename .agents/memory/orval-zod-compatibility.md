---
name: Orval and Zod compatibility
description: Compatibility constraint discovered while generating the shared API schemas.
---

When this workspace is using the installed Zod 3 runtime, avoid OpenAPI integer schemas in generated API contracts because the current Orval output emits `zod.int()`, which Zod 3 does not provide. Use numeric schemas unless the generator/runtime versions are upgraded together.

**Why:** The generated library typecheck fails after codegen even though Orval itself completes successfully.

**How to apply:** Check the installed Zod major version before adding integer fields to OpenAPI; if it is still Zod 3, represent integral values as numbers at the API boundary and enforce integer semantics in application validation when needed.