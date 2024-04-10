const {Category}=require('../models/category');
const express=require('express');
const router=express.Router();




router.get('/',async(req,res)=>{
try {
    const categoryList=await  Category.find();
    if(!categoryList){
        res.status(500).json({success:false})
    }

res.status(200).json(categoryList);

} catch (error) {
    res.send(error)
}

})



router.post('/',async (req,res)=>{
let category=new Category({
name:req.body.name,
icon:req.body.icon,
color:req.body.color

})

category=await category.save();
if(!category)
{
    return res.status(404).send('the category can not be craerted');
}

res.send(category)


})


router.delete('/:id',(req,res)=>{

 Category.findByIdAndDelete(req.params.id).then(category=>{
    if(category){
        return res.status(200).json({success:true,message:'the category is deleted'})
    }else{
        return res.status(500).json({success:false,message:'the category is not found'})
    }  
 }).catch(err=>{
    res.status(404).send(err)
 })
  
})




router.get('/:id',async(req,res)=>{
try {
    const category=await Category.findById(req.params.id);
    if(category){
        res.json({success:true,category:category})
    }else{
        res.json({success:false,message:'category not found'})
    }

} catch (error) {
    res.status(404).send(error)
}
})





router.put('/:id',async (req,res)=>{
    try {
        const category=await Category.findByIdAndUpdate(req.params.id,{
    name:req.body.name,
    color:req.body.color,
    icon:req.body.icon
    
        
    },
    {new:true}
    
    )
    if(!category){
     return   res.status(400).send('can not be updated')
    }
    res.send(category)
    
    } catch (error) {
        res.status(404).send(error)
    }
    })
    
    


module.exports=router;