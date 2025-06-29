const feedbackRouter = require('express').Router()
const Feedback = require('../models/feedback')
const Shop = require('../models/shop')
const helper = require('./getToken')

feedbackRouter.get('/',async(request,response) => {
  const feedbacks = await Feedback.find({})
  response.json(feedbacks)
})

feedbackRouter.post('/',async(request,response) => {
  let userId = 'anonymous'

  try {
    userId = helper.getUserIdFromToken(request)
  } catch (err) {
    // If token is missing or invalid, keep user as anonymous
    if (err.message !== 'Token missing or malformed') {
      return response.status(401).json({ error: err.message })
    }
  }

  try{
    const{ shopName, rating, description } =request.body
    if(!shopName || !rating) return response.status(400).json({ message :'shopname and rating are required' })

    const shop = await Shop.findOne({ name: shopName })
    if(!shop){
      return response.status(404).json({ message: 'Shop not found' })
    }

    const feedback = new Feedback({
      customerID: userId,
      shopID: shop._id,
      rating,
      description
    })

    await feedback.save()

    response.status(201).json({ message: 'Feedback submitted', feedback })
  } catch{
    response.status(500).json({ error: 'Failed to submit feedback' })
  }

})

feedbackRouter.get('/shop/:shopID',async (request,response) => {
  try {
    const { shopID } = request.params
    const feedbacks = await Feedback.find({ shopID })
    if (feedbacks.length === 0) {
      return response.status(404).json({ message: 'No feedbacks found for this shop' })
    }
    response.json(feedbacks)
  } catch {
    response.status(500).json({ error: 'Failed to fetch feedbacks' })
  }
})


module.exports=feedbackRouter