const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = require('../app')

const Feedback = require('../models/feedback')
const Shop = require('../models/shop')

const api = supertest(app)

process.env.SECRET = process.env.SECRET || 'testsecret'

describe('Feedback API tests', () => {
  let shopName
  let token
  let userId

  beforeEach(async () => {
    await Feedback.deleteMany({})
    await Shop.deleteMany({})

    const shop = new Shop({
      name: 'TestShop',
      category: 'Food',
      tenantID: new mongoose.Types.ObjectId(),
      description: 'A test shop',
      location: '123 Test St',
      email: 'testshop@example.com',
      phone: '1234567890'
    })

    const savedShop = await shop.save()
    shopName = savedShop.name

    // mock user ID and generate token
    userId = new mongoose.Types.ObjectId().toString()
    token = jwt.sign({ id: userId }, process.env.SECRET)
  })

  test('GET /api/feedbacks returns empty array initially', async () => {
    const res = await api
      .get('/api/feedbacks')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(Array.isArray(res.body))
    assert.strictEqual(res.body.length, 0)
  })

  test('POST /api/feedbacks creates feedback successfully', async () => {
    const newFeedback = {
      shopName,
      rating: 4,
      description: 'Great service'
    }

    const res = await api
      .post('/api/feedbacks')
      .set('Authorization', `Bearer ${token}`)
      .send(newFeedback)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(res.body.message, 'Feedback submitted')
    assert.strictEqual(res.body.feedback.rating, 4)
    assert.strictEqual(res.body.feedback.description, 'Great service')
    assert.strictEqual(res.body.feedback.customerID, userId)
  })

  test('POST /api/feedbacks fails with missing rating', async () => {
    const newFeedback = {
      shopName,
      description: 'Missing rating'
    }

    await api
      .post('/api/feedbacks')
      .set('Authorization', `Bearer ${token}`)
      .send(newFeedback)
      .expect(400)
  })

  test('GET /api/feedbacks/shop/:shopID returns feedbacks for that shop', async () => {
    const shop = await Shop.findOne({ name: shopName })

    const feedback = new Feedback({
      shopID: shop._id,
      rating: 5,
      description: 'Excellent!',
      customerID: userId
    })
    await feedback.save()

    const res = await api
      .get(`/api/feedbacks/shop/${shop._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(Array.isArray(res.body))
    assert(res.body.length > 0)
    assert.strictEqual(res.body[0].description, 'Excellent!')
  })

  after(async () => {
    await mongoose.connection.close()
  })
})
