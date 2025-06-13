import {
  loadPriceList,
  parseInputBuffer,
  preprocess
} from './matchService.js';
import PriceItem from '../models/PriceItem.js';

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-large';
const BATCH_SIZE = 100;

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

function buildTexts(items) {
  return items.map(p => p.descClean);
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
  return vecs.map((v) => {
    const n = l2Norm(v) || 1;
    return v.map((x) => x / n);
  });
}

async function fetchEmbeddings(apiKey, texts) {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
  const out = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    console.log('Requesting embeddings batch', i / BATCH_SIZE + 1);
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers,
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: batch })
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`OpenAI API error: ${res.status} ${msg}`);
    }
    const data = await res.json();
    if (!data.data) throw new Error('Invalid OpenAI response');
    out.push(...data.data.map((d) => d.embedding));
  }
  return out;
}

async function openAiMatch(priceItems, inputItems, apiKey) {
  const priceTexts = buildTexts(priceItems);
  const inputTexts = buildTexts(inputItems);

  console.log('Fetching embeddings for price list');
  const priceEmbeds = await fetchEmbeddings(apiKey, priceTexts);
  console.log('Fetching embeddings for input items');
  const inputEmbeds = await fetchEmbeddings(apiKey, inputTexts);

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
      engine: 'openai',
      matches: [
        {
          engine: 'openai',
          code: best.code,
          description: `${best.description} (openai)`,
          unit: best.unit,
          unitRate: best.rate,
          confidence: Math.round(bestScore * 1000) / 1000
        }
      ]
    };
  });
  console.log('OpenAI matcher done');
  return results;
}

export async function openAiMatchFromFiles(priceFile, inputBuffer, apiKey) {
  console.log('OpenAI matcher loading files');
  const priceItems = loadPriceList(priceFile);
  const inputItems = parseInputBuffer(inputBuffer);
  console.log('Price items:', priceItems.length, 'Input items:', inputItems.length);
  return openAiMatch(priceItems, inputItems, apiKey);
}

export async function openAiMatchFromDb(inputBuffer, apiKey) {
  console.log('OpenAI matcher loading from DB');
  const priceItems = await loadPriceItemsFromDb();
  const inputItems = parseInputBuffer(inputBuffer);
  console.log('Price items:', priceItems.length, 'Input items:', inputItems.length);
  return openAiMatch(priceItems, inputItems, apiKey);
}
