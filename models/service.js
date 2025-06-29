const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
  name:{
    type:String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  isAvailable:{
    type: Boolean,
    default: true
  }
})

serviceSchema.set('toJSON',{
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Service = mongoose.model('Service',serviceSchema)

module.exports = Service