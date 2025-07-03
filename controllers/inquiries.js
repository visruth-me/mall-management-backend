const inquiryRouter = require('express').Router()
const Inquiry = require('../models/inquiry')
const helper = require('./getToken')

inquiryRouter.get('/',async(request,response) => {
  const inquiries = await Inquiry.find({})
  response.json(inquiries)
})

inquiryRouter.get('/approve',async(request,response) => {
  const inquiries = await Inquiry.find({ isApproved: 'Pending' })
  response.json(inquiries)
})

inquiryRouter.post('/',async(request,response,next) => {
  let userId
  try{
    userId = helper.getUserIdFromToken(request)
  } catch {
    return response.status(401).json({ error: 'token invalid' })
  }

  try{
    const{ title, description } =request.body
    if(!title) return response.status(400).json({ message :'title is required' })

    const inquiry = new Inquiry({
      tenantID: userId,
      title,
      description
    })

    await inquiry.save()

    response.status(201).json({ message: 'Inquiry submitted', inquiry })
  } catch(error) {
    next(error)
  }

})

inquiryRouter.put('/:id',async(request,response,next) => {
  const { status } = request.body
  try{
    const inquiry = await Inquiry.findById(request.params.id)
    if(!inquiry){
      return response.status(404).end()
    }
    inquiry.status = status
    const update = await inquiry.save()
    return response.json(update)
  } catch(exception){
    next(exception)
  }
})

inquiryRouter.get('/mine',async(request,response, next) => {
  let userId

  try{
    userId = helper.getUserIdFromToken(request)
  } catch {
    return response.status(401).json({ error: 'token invalid' })
  }
  try{
    const inquiries = await Inquiry.find({ tenantID : userId })
    response.json(inquiries)
  }catch(exception){
    next(exception)
  }

})
module.exports=inquiryRouter