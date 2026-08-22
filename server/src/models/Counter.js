const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    },
    seq: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

/**
 * Atomically increments and returns the next sequence number for a given key.
 * Guarantees zero race conditions during concurrent creations.
 * @param {string} key - e.g. "<companyId>:<year>"
 * @returns {Promise<number>} - Next sequence number
 */
counterSchema.statics.nextSequence = async function (key) {
  const record = await this.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return record.seq;
};

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
