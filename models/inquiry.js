const mongoose = require('mongoose')

const inquirySchema = new mongoose.Schema({
  tenantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  title:{
    type:String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
  },
  status:{
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
})

inquirySchema.set('toJSON',{
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Inquiry = mongoose.model('Inquiry',inquirySchema)

module.exports = Inquiry