import mongoose from 'mongoose';

const priceItemSchema = new mongoose.Schema(
  {
    code: { type: String },
    ref: { type: String },
    description: { type: String, required: true },
    category: { type: String },
    subCategory: { type: String },
    unit: { type: String },
    rate: { type: Number },
    keywords: [String],
    phrases: [String],
    searchText: { type: String },
    fullContext: { type: String },
  },
  { timestamps: true }
);

function buildSearchText(doc) {
  const parts = [
    doc.description,
    doc.category,
    doc.subCategory,
    ...(doc.keywords || []),
    ...(doc.phrases || [])
  ];
  return parts.filter(Boolean).join(' ');
}

function buildFullContext(doc) {
  const parts = [
    `Description: ${doc.description || ''}`,
    `Keywords: ${(doc.keywords || []).join(', ')}`,
    `Phrases: ${(doc.phrases || []).join(', ')}`,
    `Code: ${doc.code || ''}`,
    `Category: ${doc.category || ''}`,
    `SubCategory: ${doc.subCategory || ''}`,
    `Unit: ${doc.unit || ''}`,
    `Rate: ${doc.rate ?? ''}`,
    `Ref: ${doc.ref || ''}`
  ];
  return parts.join(' | ');
}

priceItemSchema.pre('save', function (next) {
  this.searchText = buildSearchText(this);
  this.fullContext = buildFullContext(this);
  next();
});

priceItemSchema.pre('findOneAndUpdate', async function (next) {
  let update = this.getUpdate() || {};
  const doc = await this.model.findOne(this.getQuery()).lean();
  if (doc) {
    const merged = { ...doc, ...update.$set, ...update };
    update.$set = {
      ...(update.$set || {}),
      searchText: buildSearchText(merged),
      fullContext: buildFullContext(merged)
    };
    this.setUpdate(update);
  }
  next();
});

export default mongoose.model('PriceItem', priceItemSchema);
