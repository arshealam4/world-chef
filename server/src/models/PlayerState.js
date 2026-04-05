import mongoose from 'mongoose';
const { Schema } = mongoose;

const PlayerStateSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  coins:      { type: Number, default: 500 },
  gems:       { type: Number, default: 10 },
  xp:         { type: Number, default: 0 },
  level:      { type: Number, default: 1 },
  popularity: { type: Number, default: 0 },

  restaurantName: { type: String, default: 'My Restaurant' },
  expansionLevel: { type: Number, default: 1 },

  chefs: [{
    chefId:   String,
    slots:    Number,
    maxSlots: Number,
    position: { x: Number, y: Number }
  }],

  tables: [{
    tableId:     String,
    position:    { x: Number, y: Number },
    size:        { type: String, enum: ['2x2', '4x4'], default: '2x2' },
    state:       { type: String, enum: ['empty','occupied','served','waiting_pay'], default: 'empty' },
    customerId:  String,
    orderedDish: String,
    isVIP:       { type: Boolean, default: false },
    seatedAt:    Date
  }],

  ingredientStorage:    { type: Map, of: Number, default: {} },
  ingredientStorageCap: { type: Number, default: 50 },

  dishStorage:    { type: Map, of: Number, default: {} },
  dishStorageCap: { type: Number, default: 30 },

  decorations: [{ decorId: String, position: { x: Number, y: Number } }],

  tutorialComplete: { type: Boolean, default: false },
  boatUnlocked:     { type: Boolean, default: false },
  vineyardUnlocked: { type: Boolean, default: false },
  academyUnlocked:  { type: Boolean, default: false },

  customerQueue: [{
    customerId:  String,
    orderedDish: String,
    isVIP:       Boolean,
    arrivedAt:   Date
  }],

  lastCustomerSpawnAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('PlayerState', PlayerStateSchema);
