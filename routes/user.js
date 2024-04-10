const express=require('express');
const router=express.Router();
const {User}=require('../models/user')
const {Product}=require('../models/product');
const { Category } = require('../models/category');
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken');
require('dotenv').config()




router.get('/',async (req,res)=>{
try {
    const user=await User.find().select('-passwordHash')
if(!user){
    return res.status(400).send('user does not exist')
}
res.send(user);


} catch (error) {
    
}

})



// //get users with name phone and email only
// router.get('/',async (req,res)=>{
// try {
//     const user=await User.find().select('name phone email ')
// if(!user){
//     return res.status(400).send('user does not exist')
// }
// res.send(user);


// } catch (error) {
    
// }

// })



router.get('/:id',async (req,res)=>{
    try {
        const user=await User.findById(req.params.id).select('-passwordHash')
    if(!user){
        return res.status(400).send('user does not exist')
    }
    res.send(user);
    
    
    } catch (error) {
        
    }
    
    })
    

router.post('/register',async(req,res)=>{
try {
    
    const user= new User({
    name:req.body.name,
    email:req.body.email,
    passwordHash:bcrypt.hashSync(req.body.password,10),
    phone:req.body.phone,
    street:req.body.street,
    isAdmin:req.body.isAdmin,
    apartment:req.body.apartment,
    zip:req.body.zip,
    city:req.body.city,
    country:req.body.country,

    })

    const savedUser = await user.save();
    if (!savedUser) {
        return res.status(500).send('user can not be craeted');
    }

    res.send(savedUser);



} catch (error) {
    res.status(400).send(error)
}





})









router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send('User not found');
        }


if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
const token=jwt.sign({
    userId:user.id,
    isAdmin:user.isAdmin
},process.env.SECRET,{expiresIn:'1d'}

)

res.status(200).send({user:user.email,token:token})
}else{
    
return res.send('password not matched')
}


        // Additional login logic will be added here
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});






module.exports=router;