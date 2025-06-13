import {
  loadPriceList,
  parseInputBuffer,
  preprocess
} from './matchService.js';
import PriceItem from '../models/PriceItem.js';

const EMBEDDING_MODEL = process.env.COHERE_EMBEDDING_MODEL || 'embed-english-v3.0';
const BATCH_SIZE = 96;
const API_URL = 'https://api.cohere.ai/v1/embed';
const FUZZY_THRESHOLD = 0.4;
const FALLBACK_CANDIDATES = 5;

async function loadPriceItemsFromDb() {
  const docs = await PriceItem.find({
    rate: { $ne: null },
    unit: { $exists: true, $ne: '' }
  }).lean();
  return docs.map(d => ({
    code: d.code || '',
    description: d.description,
    unit: d.unit || '',
    rate: d.rate,
    descClean: preprocess(d.description)
  }));
}

async function loadPriceItemsFromDbV2() {
  const docs = await PriceItem.find({
    rate: { $ne: null },
    unit: { $exists: true, $ne: '' }
  }).lean();
  return docs.map(d => ({
    code: d.code || '',
    description: d.description,
    unit: d.unit || '',
    rate: d.rate,
    category: d.category || '',
    subCategory: d.subCategory || '',
    text: preprocessV2(d.fullContext || ''),
    simpleDesc: d.description || ''
  }));
}

function buildTexts(items) {
  return items.map(p => p.descClean);
}

function buildTextsV2(items) {
  return items.map(p => p.text);
}

function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function l2Norm(v) {
  let sum = 0;
  for (const x of v) sum += x * x;
  return Math.sqrt(sum);
}

function normalize(vecs) {
  return vecs.map(v => {
    const n = l2Norm(v) || 1;
    return v.map(x => x / n);
  });
}

// --- v2 helpers ---
function preprocessV2(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/mm\./g, 'mm')
    .replace(/cm\./g, 'cm')
    .replace(/r\.c\.c\./g, 'rcc')
    .replace(/reinforced cement concrete/g, 'rcc')
    .trim();
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function ratio(a, b) {
  if (!a && !b) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length, 1);
}

function tokenSortRatio(a, b) {
  const sortTokens = s => s.split(/\s+/).filter(Boolean).sort().join(' ');
  return ratio(sortTokens(a), sortTokens(b));
}

async function fetchEmbeddings(apiKey, texts, inputType) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
  const out = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    console.log('Requesting Cohere embeddings batch', i / BATCH_SIZE + 1);
    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        texts: batch,
        model: EMBEDDING_MODEL,
        input_type: inputType
      })
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Cohere API error: ${res.status} ${msg}`);
    }
    const data = await res.json();
    if (!Array.isArray(data.embeddings)) throw new Error('Invalid Cohere response');
    out.push(...data.embeddings);
  }
  return out;
}

export async function cohereMatchFromFiles(priceFile, inputBuffer, apiKey) {
  console.log('Cohere matcher loading files');
  const priceItems = loadPriceList(priceFile);
  const inputItems = parseInputBuffer(inputBuffer);
  console.log('Price items:', priceItems.length, 'Input items:', inputItems.length);
  return cohereMatch(priceItems, inputItems, apiKey);
}

async function cohereMatch(priceItems, inputItems, apiKey) {
  const priceTexts = buildTexts(priceItems);
  const inputTexts = buildTexts(inputItems);

  console.log('Fetching embeddings for price list');
  const priceEmbeds = await fetchEmbeddings(
    apiKey,
    priceTexts,
    'search_document'
  );
  console.log('Fetching embeddings for input items');
  const inputEmbeds = await fetchEmbeddings(
    apiKey,
    inputTexts,
    'search_query'
  );

  const normPrice = normalize(priceEmbeds);
  const normInput = normalize(inputEmbeds);

  console.log('Calculating similarities');
  const results = inputItems.map((it, idx) => {
    let bestIdx = 0;
    let bestScore = -Infinity;
    for (let j = 0; j < normPrice.length; j++) {
      const s = dot(normInput[idx], normPrice[j]);
      if (s > bestScore) {
        bestScore = s;
        bestIdx = j;
      }
    }
    const best = priceItems[bestIdx];
    return {
      inputDescription: it.description,
      quantity: it.qty,
      engine: 'cohere',
      matches: [
        {
          engine: 'cohere',
          code: best.code,
          description: `${best.description} (cohere)`,
          unit: best.unit,
          unitRate: best.rate,
          confidence: Math.round(bestScore * 1000) / 1000
        }
      ]
    };
  });
  console.log('Cohere matcher done');
  return results;
}

export async function cohereMatchFromDb(inputBuffer, apiKey) {
  console.log('Cohere matcher loading from DB');
  const priceItems = await loadPriceItemsFromDb();
  const inputItems = parseInputBuffer(inputBuffer);
  console.log('Price items:', priceItems.length, 'Input items:', inputItems.length);
  return cohereMatch(priceItems, inputItems, apiKey);
}

// ----- Version 2 matching -----
export async function cohereMatchFromFilesV2(priceFile, inputBuffer, apiKey) {
  console.log('Cohere v2 matcher loading files');
  const priceItems = loadPriceList(priceFile).map(p => ({
    ...p,
    text: preprocessV2(
      `Description: ${p.description || ''} | Code: ${p.code || ''} | Unit: ${p.unit || ''} | Rate: ${p.rate ?? ''}`
    ),
    simpleDesc: p.description || ''
  }));
  const inputRaw = parseInputBuffer(inputBuffer);
  const inputItems = inputRaw.map(it => ({
    description: it.description,
    qty: it.qty,
    text: preprocessV2(it.description)
  }));
  console.log('Price items:', priceItems.length, 'Input items:', inputItems.length);
  return cohereMatchV2(priceItems, inputItems, apiKey);
}

export async function cohereMatchFromDbV2(inputBuffer, apiKey) {
  console.log('Cohere v2 matcher loading from DB');
  const priceItems = await loadPriceItemsFromDbV2();
  const inputRaw = parseInputBuffer(inputBuffer);
  const inputItems = inputRaw.map(it => ({
    description: it.description,
    qty: it.qty,
    text: preprocessV2(it.description)
  }));
  console.log('Price items:', priceItems.length, 'Input items:', inputItems.length);
  return cohereMatchV2(priceItems, inputItems, apiKey);
}

async function cohereMatchV2(priceItems, inputItems, apiKey) {
  const priceTexts = buildTextsV2(priceItems);
  const inputTexts = buildTextsV2(inputItems);

  console.log('Fetching embeddings for price list');
  const priceEmbeds = await fetchEmbeddings(apiKey, priceTexts, 'search_document');
  console.log('Fetching embeddings for input items');
  const inputEmbeds = await fetchEmbeddings(apiKey, inputTexts, 'search_query');

  const normPrice = normalize(priceEmbeds);
  const normInput = normalize(inputEmbeds);

  console.log('Calculating similarities');
  return inputItems.map((it, idx) => {
      const sims = normPrice.map(vec => dot(normInput[idx], vec));
      let bestIdx = 0;
      let bestScore = sims[0];
      for (let j = 1; j < sims.length; j++) {
        if (sims[j] > bestScore) {
          bestScore = sims[j];
          bestIdx = j;
        }
      }
      if (bestScore < FUZZY_THRESHOLD) {
        const top = sims
          .map((s, j) => ({ s, j }))
          .sort((a, b) => b.s - a.s)
          .slice(0, FALLBACK_CANDIDATES);
        let comboIdx = bestIdx;
        let comboScore = bestScore;
        for (const cand of top) {
          const fuzzy = tokenSortRatio(it.text, priceItems[cand.j].simpleDesc.toLowerCase());
          const combined = 0.7 * cand.s + 0.3 * fuzzy;
          if (combined > comboScore) {
            comboScore = combined;
            comboIdx = cand.j;
          }
        }
        bestIdx = comboIdx;
        bestScore = comboScore;
      }
      const best = priceItems[bestIdx];
      return {
        inputDescription: it.description,
        quantity: it.qty,
        engine: 'cohere',
        matches: [
          {
            engine: 'cohere',
            code: best.code,
            description: `${best.description} (cohere)`,
            unit: best.unit,
            unitRate: best.rate,
            confidence: Math.round(bestScore * 1000) / 1000
          }
        ]
      };
  });
}

