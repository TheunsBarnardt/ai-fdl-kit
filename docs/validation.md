---
title: Validation
layout: default
nav_order: 10
description: "Validate FDL blueprints against the schema. Check structure, naming conventions, and cross-references."
---

# Validation

Check that all blueprints are valid:

```bash
# Validate everything
node scripts/validate.js

# Validate one blueprint
node scripts/validate.js blueprints/auth/login.blueprint.yaml

# Watch mode (re-validates on file changes)
npm run validate:watch
```

The validator checks:
- Blueprint structure matches the schema
- All required sections are present
- Naming conventions are followed
- Related features point to blueprints that exist
- Outcomes have the correct structure (given/then/result)
- Expression syntax in `when:` clauses is valid
