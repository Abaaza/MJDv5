import { Router } from 'express';
import PriceItem from '../models/PriceItem.js';

const router = Router();

function buildFullContext(d) {
  return [
    `Description: ${d.description || ''}`,
    `Keywords: ${(d.keywords || []).join(', ')}`,
    `Phrases: ${(d.phrases || []).join(', ')}`,
    `Code: ${d.code || ''}`,
    `Category: ${d.category || ''}`,
    `SubCategory: ${d.subCategory || ''}`,
    `Unit: ${d.unit || ''}`,
    `Rate: ${d.rate ?? ''}`,
    `Ref: ${d.ref || ''}`
  ].join(' | ');
}

// List price items with pagination, sorting and optional search
router.get('/', async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 50, 1);
  const sortParam = req.query.sort || 'description';
  const sort = {};
  if (typeof sortParam === 'string') {
    if (sortParam.startsWith('-')) {
      sort[sortParam.slice(1)] = -1;
    } else {
      sort[sortParam] = 1;
    }
  }

  const q = String(req.query.q || '').trim();
  const categoriesParam = req.query.categories;
  const filter = {};
  if (q) {
    const regex = new RegExp(q, 'i');
    Object.assign(filter, {
      $or: [
        { description: regex },
        { code: regex },
        { ref: regex },
        { category: regex },
        { subCategory: regex },
        { keywords: regex },
        { phrases: regex },
      ],
    });
  }
  if (categoriesParam) {
    const list = Array.isArray(categoriesParam)
      ? categoriesParam
      : String(categoriesParam).split(',');
    const cats = list.map(c => c.trim()).filter(Boolean);
    if (cats.length) Object.assign(filter, { category: { $in: cats } });
  }

  const [items, total] = await Promise.all([
    PriceItem.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    PriceItem.countDocuments(filter),
  ]);
  res.json({ items, total });
});

// Search by code, description or other fields
router.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json([]);
  const regex = new RegExp(q, 'i');
  const items = await PriceItem.find({
    $or: [
      { description: regex },
      { code: regex },
      { ref: regex },
      { category: regex },
      { subCategory: regex },
      { keywords: regex },
      { phrases: regex },
    ]
  })
    .sort({ description: 1 })
    .limit(20)
    .lean();
  res.json(items);
});

// Create a new price item
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    data.searchText = [
      data.description,
      data.category,
      data.subCategory,
      ...(data.keywords || []),
      ...(data.phrases || [])
    ]
      .filter(Boolean)
      .join(' ');
    data.fullContext = buildFullContext(data);
    const doc = await PriceItem.create(data);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an existing price item
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await PriceItem.findById(id);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const data = { ...existing.toObject(), ...req.body };
    const searchText = [
      data.description,
      data.category,
      data.subCategory,
      ...(data.keywords || []),
      ...(data.phrases || [])
    ]
      .filter(Boolean)
      .join(' ');
    const fullContext = buildFullContext(data);
    const doc = await PriceItem.findByIdAndUpdate(
      id,
      { ...req.body, searchText, fullContext },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a price item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await PriceItem.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// List distinct categories
router.get('/categories/list', async (_req, res) => {
  try {
    const cats = await PriceItem.distinct('category', { category: { $ne: null } });
    res.json(cats.filter(Boolean).sort());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
