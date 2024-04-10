const express=require('express');
const router=express.Router();
const {Product}=require('../models/product');
const { Category } = require('../models/category');
const mongoose=require('mongoose');
const multer=require('multer');


const FILE_TYPE_MAP={
    //image yaha pr hamary front end me jo form ha usmy jp input ha type=file wala uska name=image ha
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
const isValid=FILE_TYPE_MAP[file.mimetype];
let uploadError=new Error('Invalid image type')
if(isValid){
uploadError=null
}

        //ye call back function 'sb' first parameter iska error define krta ha .Default null hota ha
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {

      const filename=file.originalname.split(' ').join('-');
      const extension=FILE_TYPE_MAP[file.mimetype];
      cb(null, `${filename}-${Date.now()}.${extension}`);
    }
  })
  
  const uploadOptions = multer({ storage: storage })




router.post('/', uploadOptions.single('image'),async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) {
            return res.status(400).send('Invalid category');
        }
const file=req.file;
if(!file){return res.status(400).send('No image uploaded')};

 const filename=req.file.filename;
//  http://localhost:3000/public/uploads/
const basePath=`${req.protocol}://${req.get('host')}/public/uploads/`
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            //simple filename hamen img7136.jpeg is trh return kryga but hamen poora chiaey is trh
            // http://localhost:3000/public/uploads/img7136.jpeg
            image: `${basePath}${filename}`,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReview: req.body.numReview,
            isFeatured: req.body.isFeatured,
        });

        const savedProduct = await product.save();
        if (!savedProduct) {
            return res.status(500).send('The product cannot be created');
        }

        res.send(savedProduct);
    } catch (error) {
        console.error(error);
        res.status(400).send('Internal server error');
    }
});




// // get only name and image of products we use .select with the fields we want in it 
// router.get('/',async(req,res)=>{
// try {
    
//     const productList=await Product.find().select("name image ");
//      if(productList){
//         res.status(201).send(productList)
//      }else{
//         return res.status(400).json({message:'no products to show'})
//      }



// } catch (error) {
//     res.status(404).send(error)
// }
// })













// getting products according to category or if we want all products without specifying categories
//http://localhost:5000/api/v1/product => for all products regardless of categories
//http://localhost:5000/api/v1/product?categories=65bcba4f2f02a8d047215ed5  =>getiing products for specific category
router.get('/',async(req,res)=>{
    try {
        let filter={};

if(req.query.categories){
    filter={category: req.query.categories.split(',')}
}


        const productList=await Product.find(filter).populate('category');
         if(productList){
            res.status(201).send(productList)
         }else{
            return res.status(400).json({message:'no products to show'})
         }
    
    
    
    } catch (error) {
        res.status(404).send(error)
    }
    })














// get a full product detail with category also for this we will use .populate 
router.get('/:id',async(req,res)=>{
    try {
        
        const product=await Product.findById(req.params.id).populate('category');
         if(product){
            res.status(201).send(product)
         }else{
            return res.status(400).json({message:'not found'})
         }
    } catch (error) {
        res.status(404).send(error)
    }
    })
    
    
    





router.put('/:id',async (req,res)=>{
try {
// for checking that id we are putting i svalid object id or not
if(!mongoose.isValidObjectId(req.params.id)){
return res.status(400).json({success:false,message:"invalid product id"})
}

    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(400).send('Invalid category');
    }



    const product=await Product.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReview: req.body.numReview,
        isFeatured: req.body.isFeatured,
        
            
        },
        {new:true}
        
        )
        if(!product){
         return   res.status(400).send('product can not be updated')
        }
        res.send(product)
        





} catch (error) {
    res.status(400).send(error);
}






})



//count the products
router.get('/get/count',async(req,res)=>{
try {
    
const productCount=await Product.countDocuments()
if(!productCount){
    res.status(500).json({success:false})
}
res.send({
    productCount:productCount
})


} catch (error) {
    res.status(404).send(error)
}

})



//getting the featured products
router.get('/get/featured/:count', async (req, res) => {
    try {
        const count = req.params.count ? parseInt(req.params.count) : 0;
        const featuredProducts = await Product.find({ isFeatured: true }).limit(count);
        
        if (!featuredProducts || featuredProducts.length === 0) {
            return res.status(404).json({ success: false, message: 'No featured products found.' });
        }
        
        res.json({
            success: true,
            count: featuredProducts.length,
            products: featuredProducts
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});



//uploading multiple images for a product
router.put('/upload/image-gallery/:id',uploadOptions.array('images',4),async (req,res)=>{

    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id')
    }
    const files=req.files;
    const imagesPath=[];
    const basePath=`${req.protocol}://${req.get('host')}/public/uploads/`
    

    if(files){
        files.map(file=>{
            imagesPath.push(`${basePath}${file.filename}`)
        })
    }


    
            const product=await Product.findByIdAndUpdate(req.params.id,{
                images:imagesPath
            },{new:true})


            if(!product){
      return res.status(500).send('images can not be uploaded')
            }
res.send(product);

})



module.exports=router;