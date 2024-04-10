const { expressjwt: jwt } = require("express-jwt");
require('dotenv').config();

function authJwt() {
//.unless men ham wo path dalty ha jo ham bina authorization ke use kr skkty ha
  return  jwt({
        secret: process.env.SECRET,
        algorithms: ['HS256'],
        isRevoked:isRevoked
        //unless is used to specify the paths which dont require authorization
      }).unless({
        path:[
          //for adding public folders for the use of evrybody so that pictures can be displayed on frontend
          { url: /^\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
          //for use of this urls apis other than admin
            { url: /^\/api\/v1\/product(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /^\/api\/v1\/category(.*)/, methods: ['GET', 'OPTIONS'] },

            '/api/v1/users/login',
          
            '/api/v1/users/register',
        ]
      })
}


//if it is admin he can do delete update put like operations also
// async function isRevoked(req, payload) {
//     if (payload.payload.isAdmin == false) {
//       console.log('Not Admin');
//       return true;
//     }else{
//         console.log('Admin');
//         return false;
//     }
   
//   }



async function isRevoked(req, payload) {
  // Check if the request is for updating or deleting products or Adding Product
  const isUpdatingOrDeletingProduct = req.originalUrl.includes('/product') && (req.method === 'PUT' || req.method === 'DELETE');


  if (req.originalUrl.includes('/product') && req.originalUrl.includes('/product') && (req.method === 'PUT' || req.method === 'DELETE' || req.method === 'POST')  && payload.payload.isAdmin === false) {
   
      console.log('Not a admin');
      return true; // Token revoked
  } else {
      console.log('Is admin');
      return false; // Token allowed
  }
}






module.exports = authJwt;
