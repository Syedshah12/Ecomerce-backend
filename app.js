const express = require('express');
require('./db/connect.js')
const app=express();
const PORT=process.env.PORT || 5000;
require('dotenv').config()
const userRoutes=require('./routes/user.js');
const categoryRoutes=require('./routes/categories.js');
const productRoutes=require('./routes/products.js');
const orderRoutes=require('./routes/order.js');
const authJwt=require('./middlewares/auth')



const morgan=require('morgan');
const cors=require('cors');
const errorHandler = require('./middlewares/error-handler');




//middlewares
app.use(cors());
app.options('*',cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(authJwt());
app.use('/public/uploads',express.static(__dirname+'/public/uploads'))
app.use(errorHandler);




//Routes
app.use('/api/v1/users',userRoutes);
app.use('/api/v1/category',categoryRoutes);
app.use('/api/v1/product',productRoutes);
app.use('/api/v1/order',orderRoutes);




//Server running on PORT 5000
// http://localhost:5000
app.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`);
})