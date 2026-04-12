import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseExpression, validateExpression, extractFields } from "../scripts/expression.js";

// ─── validateExpression ──────────────────────────────────

describe("validateExpression", () => {
  it("accepts simple comparison with number", () => {
    const result = validateExpression("amount > 1000");
    assert.equal(result.valid, true);
  });

  it("accepts equality with string literal", () => {
    const result = validateExpression('status == "submitted"');
    assert.equal(result.valid, true);
  });

  it("accepts compound and expression", () => {
    const result = validateExpression('amount > 1000 and status == "submitted"');
    assert.equal(result.valid, true);
  });

  it("accepts compound or expression", () => {
    const result = validateExpression("request_count > 10 or ip_blocked == true");
    assert.equal(result.valid, true);
  });

  it("accepts is null", () => {
    const result = validateExpression("user.email is null");
    assert.equal(result.valid, true);
  });

  it("accepts is not null", () => {
    const result = validateExpression("user.email is not null");
    assert.equal(result.valid, true);
  });

  it("accepts duration subtraction from now", () => {
    const result = validateExpression("token.created_at < now - 60m");
    assert.equal(result.valid, true);
  });

  it("accepts boolean literal", () => {
    const result = validateExpression("is_active == true");
    assert.equal(result.valid, true);
  });

  it("accepts dotted field references", () => {
    const result = validateExpression("user.profile.age >= 18");
    assert.equal(result.valid, true);
  });

  it("accepts all comparison operators", () => {
    for (const op of ["==", "!=", ">", ">=", "<", "<="]) {
      const result = validateExpression(`count ${op} 5`);
      assert.equal(result.valid, true, `operator ${op} should be valid`);
    }
  });

  it("accepts duration literals (s, m, h, d)", () => {
    for (const dur of ["5s", "10m", "1h", "7d"]) {
      const result = validateExpression(`elapsed > ${dur}`);
      assert.equal(result.valid, true, `duration ${dur} should be valid`);
    }
  });

  it("accepts single-quoted strings", () => {
    const result = validateExpression("status == 'active'");
    assert.equal(result.valid, true);
  });

  it("accepts parenthesized grouping", () => {
    const result = validateExpression("(amount > 100 and status == \"open\") or priority == 1");
    assert.equal(result.valid, true);
  });

  it("rejects empty input", () => {
    const result = validateExpression("");
    assert.equal(result.valid, false);
  });

  it("rejects unterminated string", () => {
    const result = validateExpression('status == "open');
    assert.equal(result.valid, false);
    assert.match(result.error, /unterminated/i);
  });

  it("rejects unexpected character", () => {
    const result = validateExpression("amount @ 5");
    assert.equal(result.valid, false);
    assert.match(result.error, /unexpected/i);
  });

  it("rejects trailing tokens after complete expression", () => {
    const result = validateExpression("amount > 5 extra_stuff");
    assert.equal(result.valid, false);
    assert.match(result.error, /unexpected/i);
  });
});

// ─── parseExpression ─────────────────────────────────────

describe("parseExpression", () => {
  it("returns AST with comparison node for simple expression", () => {
    const ast = parseExpression("count > 5");
    assert.equal(ast.type, "comparison");
    assert.equal(ast.operator, ">");
    assert.equal(ast.left.type, "field_ref");
    assert.equal(ast.left.path, "count");
    assert.equal(ast.right.type, "number");
    assert.equal(ast.right.value, 5);
  });

  it("returns AST with logical node for and expression", () => {
    const ast = parseExpression("a > 1 and b < 2");
    assert.equal(ast.type, "logical");
    assert.equal(ast.operator, "and");
  });

  it("parses duration correctly", () => {
    const ast = parseExpression("elapsed > 30d");
    assert.equal(ast.right.type, "duration");
    assert.equal(ast.right.amount, 30);
    assert.equal(ast.right.unit, "d");
  });

  it("parses is null as comparison", () => {
    const ast = parseExpression("field is null");
    assert.equal(ast.type, "comparison");
    assert.equal(ast.operator, "is_null");
  });

  it("parses is not null as comparison", () => {
    const ast = parseExpression("field is not null");
    assert.equal(ast.type, "comparison");
    assert.equal(ast.operator, "is_not_null");
  });

  it("parses arithmetic (now - duration)", () => {
    const ast = parseExpression("timestamp < now - 60m");
    assert.equal(ast.type, "comparison");
    assert.equal(ast.right.type, "arithmetic");
    assert.equal(ast.right.operator, "-");
  });

  it("throws on invalid input", () => {
    assert.throws(() => parseExpression(""), /unexpected/i);
  });
});

// ─── extractFields ───────────────────────────────────────

describe("extractFields", () => {
  it("extracts single field reference", () => {
    const fields = extractFields("amount > 100");
    assert.deepEqual(fields, ["amount"]);
  });

  it("extracts multiple field references", () => {
    const fields = extractFields('amount > 100 and status == "open"');
    assert.ok(fields.includes("amount"));
    assert.ok(fields.includes("status"));
    assert.equal(fields.length, 2);
  });

  it("extracts dotted field references", () => {
    const fields = extractFields("user.profile.age >= 18");
    assert.ok(fields.includes("user.profile.age"));
  });

  it("does not include literals as fields", () => {
    const fields = extractFields("count > 5");
    assert.ok(!fields.includes("5"));
    assert.equal(fields.length, 1);
  });

  it("extracts fields from compound expression with now", () => {
    const fields = extractFields("token.created_at < now - 60m");
    assert.ok(fields.includes("token.created_at"));
    // 'now' is a special value, not a field
    assert.ok(!fields.includes("now"));
  });
});
