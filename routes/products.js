const {Product} = require('../models/product');                
const {Category} = require('../models/category');                
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

router.get(`/`,async(req,res)=>
{   
    let filter={}
    if(req.query.categories){
        filter={category:req.query.categories.split(',')}
    }
    const productList= await Product.find(filter)

    if(!productList){
       return res.status(500).json({message:"Cant find product"})
    }
    res.status(200).send(productList)
})

router.get(`/:id`,async(req,res)=>
{ 
    if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).send('Invalid Id')
}
    const product= await Product.findById(req.params.id).populate('category')

    if(!product){
       return res.status(500).json({message:"Cant find product"})
    }
    res.status(200).send(product)
})

router.post('/',async(req,res)=>
{
    
    const category = await Category.findById(req.body.category);
  
    if(!category) return res.status(400).send('Invalid Category')

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save();

    if(!product) 
    return res.status(500).send('The product cannot be created')

    res.send(product);
})
router.put(`/:id`,async(req,res)=>

{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Id')
    }
    const category = await Category.findById(req.body.category);
  
    if(!category) return res.status(400).send('Invalid Category')

    const product = await Product.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    },{ new: true});
  
  
    if(!product)
    return res.status(400).send('the category cannot be created!')

    res.send(product);
})

router.delete(`/:id`,async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Id')
    }
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product) {
            return res.status(200).json({success: true, message: 'the product is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "product not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })

})

router.get(`/get/count`,async(req,res)=>{
    let count;
  const productCount= await Product.countDocuments({count: count})

  if(!productCount){
    return res.status(404).json({success: true, message: 'the product not found'})
  }
 res.send({count:productCount})

})
router.get(`/get/feature/:count`,async(req,res)=>{
    const limit=req.params.count? req.params.count:0;
  const featuredproduct= await Product.find({isFeatured:true}).limit(+limit)

  if(!featuredproduct){
    return res.status(404).json({success: true, message: 'the product not found'})
  }
 res.send(featuredproduct)

})

module.exports =router;