import { Router } from "express";
import multer from "multer";
import path from "path";
import { EventEmitter } from "events";
import { nanoid } from "nanoid";
import {
  openAiMatchFromFiles,
  openAiMatchFromDb,
} from "../services/openAiService.js";
import {
  cohereMatchFromFiles,
  cohereMatchFromDb,
  cohereMatchFromFilesV2,
  cohereMatchFromDbV2,
} from "../services/cohereService.js";
import { matchFromFiles } from "../services/matchService.js";
import { fileURLToPath } from "url";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
export const matchEmitter = new EventEmitter();
const jobMap = new Map();

router.get("/logs", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  const send = (msg) => res.write(`data: ${msg}\n\n`);
  matchEmitter.on("log", send);
  req.on("close", () => {
    matchEmitter.off("log", send);
  });
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Resolve to the repo root's frontend price list file
// Current file is located at backend/src/routes, so go up three levels
// to reach the repo root before appending the frontend path
const PRICE_FILE = path.resolve(__dirname, "../../MJD-PRICELIST.xlsx");

function scheduleCleanup(id) {
  setTimeout(() => jobMap.delete(id), 60 * 60 * 1000);
}

router.get("/:jobId", (req, res) => {
  const job = jobMap.get(req.params.jobId);
  if (!job) return res.status(404).json({ message: "Job not found" });
  if (job.error) {
    const { message } = job.error;
    jobMap.delete(req.params.jobId);
    return res.status(400).json({ status: "error", message });
  }
  if (!job.done) return res.json({ status: "running" });
  const result = job.result;
  jobMap.delete(req.params.jobId);
  res.json({ status: "done", result });
});

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const origLog = console.log;
  console.log = (...args) => {
    origLog(...args);
    matchEmitter.emit("log", args.join(" "));
  };
  console.log("Price match upload:", {
    name: req.file.originalname,
    size: req.file.size,
  });
  const { openaiKey, cohereKey, version = 'v0' } = req.body;
  console.log("OpenAI key provided:", !!openaiKey);
  console.log("Cohere key provided:", !!cohereKey);
  console.log("Version selected:", version);

  const run = async () => {
    let results;
    const useDb = !!process.env.CONNECTION_STRING;
    if (version === 'v2') {
      if (cohereKey) {
        console.log('Calling Cohere v2 matcher');
        results = await (useDb
          ? cohereMatchFromDbV2(req.file.buffer, cohereKey)
          : cohereMatchFromFilesV2(PRICE_FILE, req.file.buffer, cohereKey));
      } else {
        results = matchFromFiles(PRICE_FILE, req.file.buffer);
      }
    } else if (version === 'v1') {
      if (cohereKey) {
        console.log('Calling Cohere matcher');
        results = await (useDb
          ? cohereMatchFromDb(req.file.buffer, cohereKey)
          : cohereMatchFromFiles(PRICE_FILE, req.file.buffer, cohereKey));
      } else {
        results = matchFromFiles(PRICE_FILE, req.file.buffer);
      }
    } else {
      if (openaiKey && cohereKey) {
        console.log('Calling OpenAI matcher');
        const openaiResults = await (useDb
          ? openAiMatchFromDb(req.file.buffer, openaiKey)
          : openAiMatchFromFiles(PRICE_FILE, req.file.buffer, openaiKey));
        console.log('Calling Cohere matcher');
        const cohereResults = await (useDb
          ? cohereMatchFromDb(req.file.buffer, cohereKey)
          : cohereMatchFromFiles(PRICE_FILE, req.file.buffer, cohereKey));
        results = openaiResults.map((o, idx) => {
          const c = cohereResults[idx] || { matches: [] };
          const openaiBest = o.matches[0];
          const cohereBest = (c.matches || [])[0];
          return {
            inputDescription: o.inputDescription,
            quantity: o.quantity,
            matches: [openaiBest, cohereBest].filter(Boolean),
          };
        });
      } else if (openaiKey) {
        console.log('Calling OpenAI matcher');
        results = await (useDb
          ? openAiMatchFromDb(req.file.buffer, openaiKey)
          : openAiMatchFromFiles(PRICE_FILE, req.file.buffer, openaiKey));
      } else if (cohereKey) {
        console.log('Calling Cohere matcher');
        results = await (useDb
          ? cohereMatchFromDb(req.file.buffer, cohereKey)
          : cohereMatchFromFiles(PRICE_FILE, req.file.buffer, cohereKey));
      } else {
        // Fallback to built-in matcher when no external API key is provided
        results = matchFromFiles(PRICE_FILE, req.file.buffer);
      }
    }
    console.log('Price match results:', results.length);
    matchEmitter.emit('log', 'DONE');
    return results;
  };

  const asyncMode = String(req.query.async) === "1";
  try {
    if (asyncMode) {
      const jobId = nanoid();
      jobMap.set(jobId, { done: false });
      run()
        .then((result) => {
          jobMap.set(jobId, { done: true, result });
          scheduleCleanup(jobId);
        })
        .catch((err) => {
          jobMap.set(jobId, { done: true, error: err });
          scheduleCleanup(jobId);
        })
        .finally(() => {
          console.log = origLog;
        });
      return res.json({ jobId });
    }

    const results = await run();
    res.json(results);
  } catch (err) {
    console.error("Price match error:", err);
    res.status(400).json({ message: err.message });
  } finally {
    if (!asyncMode) console.log = origLog;
  }
});

export default router;
