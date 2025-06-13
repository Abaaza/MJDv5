import { Router } from 'express';
import Quotation from '../models/Quotation.js';
import sampleQuotations from '../sampleQuotations.js';

const router = Router();

router.get('/', async (_req, res) => {
  if (process.env.CONNECTION_STRING) {
    const docs = await Quotation.find().sort({ date: -1 });
    return res.json(docs);
  }
  res.json(sampleQuotations);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (process.env.CONNECTION_STRING) {
    const doc = await Quotation.findOne({ id });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  }
  const q = sampleQuotations.find(q => q.id === id);
  if (!q) return res.status(404).json({ message: 'Not found' });
  res.json(q);
});

router.post('/', async (req, res) => {
  const data = req.body;
  if (!data || !data.id) return res.status(400).json({ message: 'Missing id' });

  if (process.env.CONNECTION_STRING) {
    try {
      const doc = await Quotation.findOneAndUpdate(
        { id: data.id },
        data,
        { new: true, upsert: true }
      );
      return res.status(201).json(doc);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  const idx = sampleQuotations.findIndex(q => q.id === data.id);
  if (idx >= 0) sampleQuotations[idx] = data;
  else sampleQuotations.push(data);
  res.status(201).json(data);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (process.env.CONNECTION_STRING) {
    const doc = await Quotation.findOneAndDelete({ id });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'deleted' });
  }

  const idx = sampleQuotations.findIndex(q => q.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  sampleQuotations.splice(idx, 1);
  res.json({ message: 'deleted' });
});

export default router;
