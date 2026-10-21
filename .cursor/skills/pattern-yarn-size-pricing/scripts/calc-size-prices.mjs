#!/usr/bin/env node
/**
 * Scale whole-dollar retail prices by yarn (or other) amount per pattern size.
 * Fixed labor+tag stays flat; remainder scales with amount ratio vs anchor.
 *
 * Usage:
 *   node calc-size-prices.mjs [--format json|markdown] [--mode fixed|proportional] < input.json
 *   node calc-size-prices.mjs --file path/to/input.json [--format markdown]
 */

import { readFileSync } from "node:fs";

function usage() {
  console.error(`Usage:
  node calc-size-prices.mjs [--format json|markdown] [--mode fixed|proportional] < input.json
  node calc-size-prices.mjs --file <path> [--format json|markdown] [--mode fixed|proportional]`);
  process.exit(1);
}

function parseArgs(argv) {
  let format = "markdown";
  let mode = "fixed";
  let file = null;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--format") {
      format = argv[++i];
    } else if (a === "--mode") {
      mode = argv[++i];
    } else if (a === "--file") {
      file = argv[++i];
    } else if (a === "--help" || a === "-h") {
      usage();
    } else {
      console.error(`Unknown argument: ${a}`);
      usage();
    }
  }
  if (format !== "json" && format !== "markdown") {
    console.error("--format must be json or markdown");
    process.exit(1);
  }
  if (mode !== "fixed" && mode !== "proportional") {
    console.error("--mode must be fixed or proportional");
    process.exit(1);
  }
  return { format, mode, file };
}

function readInput(file) {
  const raw = file ? readFileSync(file, "utf8") : readFileSync(0, "utf8");
  return JSON.parse(raw);
}

function normalizeSize(s) {
  return String(s).trim().toLowerCase();
}

function priceForSize(fixedUsd, anchorPrice, anchorAmount, amount, mode) {
  if (anchorAmount <= 0) {
    throw new Error("Anchor amount must be positive");
  }
  const ratio = amount / anchorAmount;
  if (mode === "proportional") {
    return Math.round(anchorPrice * ratio);
  }
  const variablePool = anchorPrice - fixedUsd;
  return Math.round(fixedUsd + variablePool * ratio);
}

function calc(input, mode) {
  const { anchor, yarnBySize } = input;
  const fixedUsd = input.fixedUsd ?? 0;
  const unit = input.unit ?? "yards";

  if (!anchor?.size || anchor.priceUsd == null) {
    throw new Error("Missing anchor.size or anchor.priceUsd");
  }
  if (!Array.isArray(yarnBySize) || yarnBySize.length === 0) {
    throw new Error("yarnBySize must be a non-empty array");
  }

  const anchorKey = normalizeSize(anchor.size);
  const anchorRow = yarnBySize.find((r) => normalizeSize(r.size) === anchorKey);
  if (!anchorRow) {
    throw new Error(
      `Anchor size "${anchor.size}" not found in yarnBySize (${yarnBySize.map((r) => r.size).join(", ")})`
    );
  }
  const anchorAmount = Number(anchorRow.amount);
  if (!Number.isFinite(anchorAmount)) {
    throw new Error(`Invalid anchor amount for size ${anchorRow.size}`);
  }

  const warnings = [];
  if (mode === "fixed" && fixedUsd >= anchor.priceUsd) {
    warnings.push(
      `fixedUsd (${fixedUsd}) >= anchor price (${anchor.priceUsd}); variable pool is not positive`
    );
  }

  const rows = yarnBySize.map((row) => {
    const amount = Number(row.amount);
    if (!Number.isFinite(amount)) {
      throw new Error(`Invalid amount for size ${row.size}`);
    }
    const priceUsd = priceForSize(
      fixedUsd,
      anchor.priceUsd,
      anchorAmount,
      amount,
      mode
    );
    return {
      size: row.size,
      amount,
      unit,
      priceUsd,
      isAnchor: normalizeSize(row.size) === anchorKey,
    };
  });

  return {
    source: input.source ?? null,
    unit,
    mode,
    fixedUsd: mode === "fixed" ? fixedUsd : null,
    anchor: { size: anchorRow.size, priceUsd: anchor.priceUsd, amount: anchorAmount },
    warnings,
    rows,
    prices: Object.fromEntries(rows.map((r) => [r.size, r.priceUsd])),
  };
}

function formatMarkdown(result) {
  const lines = [];
  if (result.source) {
    lines.push(`**Source:** ${result.source}`, "");
  }
  const unitLabel =
    result.unit === "yards"
      ? "Yards"
      : result.unit.charAt(0).toUpperCase() + result.unit.slice(1);
  lines.push(`| Size | ${unitLabel} | Price |`, "|------|------:|------:|");
  for (const r of result.rows) {
    const mark = r.isAnchor ? " · anchor" : "";
    lines.push(`| ${r.size}${mark} | ${r.amount} | $${r.priceUsd} |`);
  }
  lines.push("");
  lines.push(
    `**Anchor:** ${result.anchor.size} · $${result.anchor.priceUsd} (${result.anchor.amount} ${result.unit})`
  );
  if (result.mode === "fixed") {
    lines.push(`**Fixed (labor + tag):** $${result.fixedUsd}`);
  } else {
    lines.push("**Mode:** proportional (no fixed component)");
  }
  if (result.warnings.length) {
    lines.push("", "**Warnings:**");
    for (const w of result.warnings) {
      lines.push(`- ${w}`);
    }
  }
  return lines.join("\n");
}

const { format, mode, file } = parseArgs(process.argv);
let input;
try {
  input = readInput(file);
} catch (e) {
  console.error("Failed to read or parse JSON input:", e.message);
  process.exit(1);
}

let result;
try {
  result = calc(input, mode);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

if (format === "json") {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(formatMarkdown(result));
}
