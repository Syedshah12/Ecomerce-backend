const { OrderItem } = require('../models/order-items');
const {Orders}=require('../models/orders')

const express=require('express');
const router=express.Router();



router.get('/',async(req,res)=>{
try {
    //sorting from newest to oldest
    const orderList=await Orders.find().populate('user','name').sort({'dateOrdered':-1});
    if(!orderList){
        res.status(500).json({success:false})
    }
    res.status(200).send(orderList);

} catch (error) {
    res.status(400).send(error)
}

})



router.get('/:id',async(req,res)=>{
try {
    //sorting from newest to oldest
    const order=await Orders.findById(req.params.id).populate('user','name').populate({
        // if we only want product not with category
        // path:'orderItems',
        // populate:'product'
     

        // if we want product with category also
        path:'orderItems',
         populate:{path:'product',populate:'category'}
    });
    if(!order){
        res.status(500).json({success:false})
    }
    res.status(200).send(order);

} catch (error) {
    res.status(400).send(error)
}

})



router.post('/',async (req,res)=>{
    const orderItemIds = await Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }));

const orderItemIdsResolved=await orderItemIds;

const totalPrices=await Promise.all(orderItemIdsResolved.map(async (OrderItemId)=>{
    const orderItem=await OrderItem.findById(OrderItemId).populate('product','price');
    if (orderItem && orderItem.product && orderItem.product.price && orderItem.quantity) {
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    } else {
        return 0; // Handle the case where product or price is not available
    }
}))

const totalPrice=totalPrices.reduce((a,b)=>a+b,0)

  let order=new Orders({
orderItems: orderItemIdsResolved,
shippingAddress1:req.body.shippingAddress1,
shippingAddress2:req.body.shippingAddress2,
city:req.body.city,
zip:req.body.zip,
country:req.body.country,
phone:req.body.phone,
status:req.body.status,
totalPrice:totalPrice,
user:req.body.user

  })
    
    order=await order.save();
    if(!order)
    {
        return res.status(500).send('the order is not created');
    }
    
    res.send(order)
    
    
    })
    




    router.put('/:id',async (req,res)=>{
        try {
            const order=await Orders.findByIdAndUpdate(req.params.id,{
        status:req.body.status
            
        },
        {new:true}
        
        )
        if(!order){
         return   res.status(400).send('can not be updated')
        }
        res.send(order)
        
        } catch (error) {
            res.status(404).send(error)
        }
        })
        




        
// router.delete('/:id',(req,res)=>{

//     Orders.findByIdAndDelete(req.params.id).then(order=>{
//        if(order){
//            return res.status(200).json({success:true,message:'the order is deleted'})
//        }else{
//            return res.status(500).json({success:false,message:'the order is not found'})
//        }  
//     }).catch(err=>{
//        res.status(404).send(err)
//     })
     
//    })




router.delete('/:id',(req,res)=>{
 Orders.findByIdAndDelete(req.params.id).then(async order=>{
    if(order){
        await order.orderItems.map(async orderItem=>{
            await OrderItem.findByIdAndDelete(orderItem)
        })
        return res.status(200).json({success:true,message:'the order is deleted'})
    }else{
                 return res.status(500).json({success:false,message:'the order is not found'})
    }
 }).catch(err=>{
   return  res.status(404).send(err)
 })

   })




   router.get('/get/totalsales',async(req,res)=>{
    try {
        const totalSales=await Orders.aggregate([
            {$group: { _id:null, totalsales: { $sum :'$totalPrice' }}}
        ])
if(!totalSales){
    return res.status(400).send('total sales can not be generated')
}
res.send({totalSales:totalSales.pop().totalsales
})
    } catch (error) {
        res.status(400).send(error)
    }
   })
   



   //count the products
router.get('/get/count',async(req,res)=>{
    try {
        
    const ordersCount=await Orders.countDocuments()
    if(!ordersCount){
        res.status(500).json({success:false})
    }
    res.send({
        ordersCount:ordersCount
    })
    
    
    } catch (error) {
        res.status(404).send(error)
    }
    
    })
    


router.get('/get/userorders/:userId',async(req,res)=>{
const userOrderList=await Orders.find({user:req.params.userId}).populate({
    path:'orderItems',
     populate:{path:'product',populate:'category'}
}).sort({dateOrdered:-1})

if(!userOrderList){
    return res.status(500).json({success:false})
}
res.send(userOrderList)

})



module.exports=router;