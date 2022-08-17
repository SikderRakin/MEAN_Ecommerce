const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const mongoose=require('mongoose')

router.get('/', async (req,res)=>{
   const userList= await User.find().select('-passwordHash')
    if(!userList)
    return res.status(400).send('No User Found')

    res.send(userList);
})
router.get('/:id', async (req,res)=>{
   const user= await User.findById(req.params.id).select('-passwordHash')
    if(!user)
    return res.status(400).send('No User Found')

    res.send(user);
})


router.post('/', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash:bcrypt.hashSync(req.body.password,10) ,
        isAdmin:req.body.isAdmin,
        street:req.body.street,
        apartment:req.body.apartment,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country
        
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the category cannot be created!')

    res.send(user);
})


router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        passwordHash:bcrypt.hashSync(req.body.password,10) ,
        isAdmin:req.body.isAdmin,
        street:req.body.street,
        apartment:req.body.apartment,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country
        
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the category cannot be created!')

    res.send(user);
})

router.put('/:id', async (req,res)=>{
 const userExist= await User.findById(req.params.id)
 let newPassword

  if(req.body.password){
    
  newPassword= bcrypt.hashSync(req.body.password,10)

  }else{
    newPassword=userExist.passwordHash
   
  }
    const user= await User.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            isAdmin:req.body.isAdmin,
            street:req.body.street,
            apartment:req.body.apartment,
            zip:req.body.zip,
            city:req.body.city,
            country:req.body.country
            
        },{new:true},)



    if(!user)
    return res.status(400).send('the user cannot be updated!')

    res.send(user);
})
router.post(`/login`,async(req,res)=>{

 const user= await User.findOne({email:req.body.email})
 const secret=process.env.secret
if(!user){
    return res.status(500).send("User Not Found!")
}

if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){

    const token=jwt.sign({
        userId: user.id,
        isAdmin: user.isAdmin
    },
    secret,
    {expiresIn:'1d'})

    res.status(500).send({email:user.email,token:token})
}else
{
    return res.status(500).send("Password  Missmatch!")

}
})

router.get(`/get/count`,async(req,res)=>{
    let count;
  const userCount= await User.countDocuments({count: count})

  if(!userCount){
    return res.status(404).json({success: true, message: 'the users not found'})
  }
 res.send({count:userCount})

})

router.delete(`/:id`,async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Id')
    }
    
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })

})

module.exports =router;