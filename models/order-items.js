const mongoose=require('mongoose');



const orderItemSchema=mongoose.Schema({
quantity:{
    type:Number,
    required:true
},
product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Product'
}




})

exports.OrderItem=new mongoose.model('OrderItem',orderItemSchema);