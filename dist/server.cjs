"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_vite = require("vite");
var import_supabase_js = require("@supabase/supabase-js");

// utils/entryOpenLock.ts
var LOCKED_ENTRY_YEAR = 115;
var ENTRY_OPEN_AT_ISO = "2026-07-07T10:55:00+08:00";
var ENTRY_OPEN_AT_LABEL = "115/07/07 10:55";
var isEntryYearLocked = (year, now = Date.now()) => {
  return Number(year) === LOCKED_ENTRY_YEAR && now < Date.parse(ENTRY_OPEN_AT_ISO);
};
var ENTRY_LOCK_MESSAGE = `115 \u5E74\u5206\u4EAB\u5C1A\u672A\u958B\u653E\uFF0C\u958B\u653E\u6642\u9593\u70BA ${ENTRY_OPEN_AT_LABEL}`;

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((0, import_cors.default)());
app.use(import_express.default.json());
var supabase = null;
var supabaseUrl = process.env.VITE_SUPABASE_URL || "";
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
if (supabaseUrl && supabaseKey) {
  supabase = (0, import_supabase_js.createClient)(supabaseUrl, supabaseKey);
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", supabase: !!supabase });
});
app.get("/api/entries", async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: "Supabase is not configured" });
  }
  try {
    const { data, error } = await supabase.from("score_entries").select("*").order("timestamp", { ascending: false });
    if (error) {
      throw error;
    }
    const formattedData = data.map((entry) => ({
      ...entry,
      scores: typeof entry.scores === "string" ? JSON.parse(entry.scores) : entry.scores,
      studentIdentity: entry.student_identity ?? entry.studentIdentity ?? "\u4E00\u822C\u751F"
    }));
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching entries from Supabase:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});
app.post("/api/entries", async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: "Supabase is not configured" });
  }
  try {
    const { entry } = req.body;
    if (!entry) {
      return res.status(400).json({ error: "Missing entry data" });
    }
    if (isEntryYearLocked(entry.year)) {
      return res.status(403).json({ status: "error", message: ENTRY_LOCK_MESSAGE });
    }
    const payload = {
      id: entry.id,
      year: entry.year,
      school: entry.school,
      department: entry.department || null,
      student_identity: entry.studentIdentity ?? "\u4E00\u822C\u751F",
      region: entry.region,
      scores: typeof entry.scores === "string" ? JSON.parse(entry.scores) : entry.scores,
      total_points: entry.totalPoints,
      total_credits: entry.totalCredits ?? null,
      notes: entry.notes || "",
      timestamp: entry.timestamp
    };
    const supabaseClient = supabase;
    const { data, error } = await supabaseClient.from("score_entries").insert([payload]);
    if (error) {
      throw error;
    }
    res.json({ status: "success" });
  } catch (error) {
    console.error("Error saving entry to Supabase:", error);
    res.status(500).json({ status: "error", message: "Failed to save entry" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
