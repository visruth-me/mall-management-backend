const Discount = require('../models/discount')
const Tenant = require('../models/tenant')
const Shop = require('../models/shop')
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = require('../app')

const api = supertest(app)

let token
let shopID
let tenantID

describe('when testing discount routes', () => {
  beforeEach(async () => {
    await Discount.deleteMany({})
    await Tenant.deleteMany({})
    await Shop.deleteMany({})

    const shop = new Shop({
      name: 'ShopOne',
      category: 'Food',
      tenantID: new mongoose.Types.ObjectId(),
      description: 'Test shop',
      location: '1 Mall Street',
      email: 'shopone@example.com',
      phone: '1234567890'
    })
    const savedShop = await shop.save()
    shopID = savedShop._id

    const tenant = new Tenant({
      username: 'tenantuser',
      name: 'Tenant User',
      email: 'tenant@example.com',
      phone: '1234567890',
      passwordHash: 'hashedpassword',
      shopID: shopID,
      rent: 1000
    })
    const savedTenant = await tenant.save()
    tenantID = savedTenant._id

    token = jwt.sign({ id: tenantID }, process.env.SECRET)
  })

  test('POST /api/discounts creates a discount', async () => {
    const newDiscount = {
      title: 'Test Discount',
      description: '50% off',
      percentage: 50,
      validFrom: new Date(),
      validTill: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      isActive: true
    }

    const res = await api
      .post('/api/discounts')
      .set('Authorization', `Bearer ${token}`)
      .send(newDiscount)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(res.body.message, 'Discount submitted')
  })

  test('GET /api/discounts returns approved and active discounts', async () => {
    // Insert an approved discount manually for test
    const discount = new Discount({
      shopID: shopID,
      title: 'Approved Discount',
      description: 'Approved description',
      percentage: 20,
      validFrom: new Date(),
      validTill: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      isApproved: true
    })
    await discount.save()

    const res = await api
      .get('/api/discounts')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.ok(res.body.some(d => d.title === 'Approved Discount'))
  })

  test('GET /api/discounts/mine returns discounts for tenant\'s shop', async () => {
    const discount = new Discount({
      shopID: shopID,
      title: 'My Discount',
      description: 'Description',
      percentage: 10,
      validFrom: new Date(),
      validTill: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      isApproved: false
    })
    await discount.save()

    const res = await api
      .get('/api/discounts/mine')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.ok(res.body.some(d => d.title === 'My Discount'))
  })

  test('PUT /api/discounts/:id updates approval status', async () => {
    const discount = new Discount({
      shopID: shopID,
      title: 'Approve Test',
      description: 'Desc',
      percentage: 30,
      validFrom: new Date(),
      validTill: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      isApproved: false
    })
    const savedDiscount = await discount.save()

    const res = await api
      .put(`/api/discounts/${savedDiscount._id}`)
      .send({ status: true })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(res.body.isApproved, true)
  })

  test('DELETE /api/discounts/:id deletes a discount', async () => {
    const discount = new Discount({
      shopID: shopID,
      title: 'Delete Test',
      description: 'Desc',
      percentage: 15,
      validFrom: new Date(),
      validTill: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      isApproved: false
    })
    const savedDiscount = await discount.save()

    await api
      .delete(`/api/discounts/${savedDiscount._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })
})

after(async () => {
  await mongoose.connection.close()
})
