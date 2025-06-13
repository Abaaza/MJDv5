import { Router } from 'express';
import Quote from '../models/Quote.js';

const router = Router();

const memory = [];

// List all quotes
router.get('/', async (_req, res) => {
  if (process.env.CONNECTION_STRING) {
    const qs = await Quote.find().sort({ date: -1 }).lean();
    return res.json(qs);
  }
  res.json(memory);
});

// Create or update a quote
router.post('/', async (req, res) => {
  const { id, client, project, value, status, date, items } = req.body || {};
  if (!(id && client && project && date && Array.isArray(items))) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    if (process.env.CONNECTION_STRING) {
      const doc = await Quote.findOneAndUpdate(
        { id },
        { id, client, project, value, status, date, items },
        { upsert: true, new: true }
      );
      return res.status(201).json(doc);
    }
    const idx = memory.findIndex(q => q.id === id);
    const data = { id, client, project, value, status, date, items };
    if (idx >= 0) memory[idx] = data; else memory.push(data);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single quote
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (process.env.CONNECTION_STRING) {
    const doc = await Quote.findOne({ id }).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const q = memory.find(q => q.id === id);
  if (!q) return res.status(404).json({ message: 'Not found' });
  res.json(q);
});

// Delete quote
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (process.env.CONNECTION_STRING) {
    await Quote.findOneAndDelete({ id });
    return res.json({ message: 'Deleted' });
  }
  const idx = memory.findIndex(q => q.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  memory.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

export default router;
