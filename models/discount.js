const mongoose = require('mongoose')

const discountSchema = new mongoose.Schema({
  shopID:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  title:{
    type:String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTill: {
    type:Date,
    required: true
  },
  isActive:{
    type: Boolean,
    default: true
  },
  isApproved:{
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  createdAt:{
    type:Date,
    default: Date.now
  }
})

discountSchema.set('toJSON',{
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Discount = mongoose.model('Discount',discountSchema)

module.exports = Discount