import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  id: Number,
  description: String,
  quantity: Number,
  unit: String,
  unitPrice: Number,
  total: Number,
});

const quotationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  client: { type: String, required: true },
  project: { type: String, required: true },
  value: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  date: { type: Date, required: true },
  items: [itemSchema],
}, { timestamps: true });

export default mongoose.model('Quotation', quotationSchema);
