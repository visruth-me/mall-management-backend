const shopsRouter = require('express').Router()
const Shop = require('../models/shop')

shopsRouter.get('/categories', async (request, response) => {
  try{
    const res=await Shop.distinct('category')
    response.json(res)
  } catch{
    response.status(500).json({ error: 'Failed to fetch categories' })
  }
})

shopsRouter.get('/names',async (request,response) => {
  try {
    const category = request.query.category
    if (!category) {
      return response.status(400).json({ error: 'Category query parameter required' })
    }
    const shops = await Shop.find({ category }, 'name')
    const shopNames = shops.map(shop => shop.name)
    response.json(shopNames)
  } catch {
    response.status(500).json({ error: 'Failed to fetch shop names' })
  }
})

shopsRouter.get('/:id',async(request,response) => {
  try{
    const shop = await Shop.findById(request.params.id)
    if(!shop){
      return response.status(404).json({ error: 'Shop not found' })
    }
    response.json(shop)
  } catch{
    response.status(500).json({ error: 'Failed to fetch shop info' })
  }
})

module.exports=shopsRouter