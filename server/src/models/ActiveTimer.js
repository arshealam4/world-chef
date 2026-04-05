import mongoose from 'mongoose';
const { Schema } = mongoose;

const ActiveTimerSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timerId:      { type: String, required: true, unique: true },
  type:         { type: String, enum: ['cooking', 'market_restock'], required: true },
  chefId:       String,
  slotIndex:    Number,
  dishId:       String,
  ingredientId: String,
  quantity:     Number,
  startedAt:    { type: Date, default: Date.now },
  finishesAt:   { type: Date, required: true },
  completed:    { type: Boolean, default: false }
}, { timestamps: true });

ActiveTimerSchema.index({ userId: 1, completed: 1 });

export default mongoose.model('ActiveTimer', ActiveTimerSchema);
