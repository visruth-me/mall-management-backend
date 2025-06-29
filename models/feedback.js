const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  customerID: {
    type: mongoose.Schema.Types.Mixed,
    default: 'anonymous'
  },
  shopID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  rating:{
    type:Number,
    min: 1,
    max: 5,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

feedbackSchema.set('toJSON',{
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Feedback = mongoose.model('Feedback',feedbackSchema)

module.exports = Feedback