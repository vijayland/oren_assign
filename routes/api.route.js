const router = require('express').Router();
var bcryptjs = require('bcryptjs');
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth.js')
const { sendMail } = require('../service/mails.js')

const prisma = new PrismaClient();

router.post('/user/register', async (req, res, next) => {
  try {
    var { name, email, password, address } = await req.body;
    const salt = await bcryptjs.genSalt(8);
    password = await bcryptjs.hash(password, salt);

    const isExistingUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    })

    if (isExistingUser) {
      res.status(401).json({
        message: "User is already register ..please try to login and explore.."
      })
    }

    const user = await prisma.user.create({
      data: {
        "name": name,
        "email": email,
        "password": password,
        "address": address
      },
    })

    if (!user) {
      res.status(401).json({
        status: 401,
        message: "Something Wrong user not created....",
      })
    }

    res.status(200).json({
      status: 200,
      message: "success",
      user: user
    })

  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "register not done,explore register..",
      error: err
    })
  }
});

router.post('/user/login', async (req, res, next) => {
  try {
    let { email, password } = req.body;

    const isValidUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    })

    if (!isValidUser) {
      return res.status(401).json({
        message: "Invalid Email...",
        status: 404,
      })
    }

    let isValidPassword = await bcryptjs.compare(password, isValidUser.password);

    if (!isValidUser) {
      res.send({
        message: "password don't match...",
        'status_code': 404,
      });
    }

    if (isValidPassword) {
      let payload = {
        user: {
          id: isValidUser.id,
          email: email
        }
      }

      jwt.sign(
        payload,
        process.env.JWTSECRET,
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            status: 200,
            tokenId: token,
            user: {
              "email": isValidUser.email,
              "name": isValidUser.name,
              "address": isValidUser.address
            }
          })
        })
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "Not login"
    })
  }
});

router.get('/verify-token', auth, async (req, res, next)=>{
  try {
      
    // const { id, email } = auth.user;
    let {id,email} = await req.user;

    if(email){
        const userData = await prisma.user.findFirst({
            where: {
                email: email,
                id: id
            }
        })
 
        if (userData) {
            res.status(200).json({
                status: 200,
                msg: "authorized user",
                data: {
                  name: userData.name,
                  email: userData.email,
                }
            })
        }

        if (!userData) {
          res.status(401).json({
              status: 401,
              msg: "User not found",
             
          })
      }
    }
    
} catch (err) {
    res.status(403).json({ err: "Error occured." });
}
})

router.get('/menu', auth, async (req, res, next) => {
  try {
    const { id, email } = await req.user;
    const menu = await prisma.product.findMany({});
    if (menu) {
      res.status(200).json({
        message: 'Ok api is working 🚀',
        data: menu
      })
    }

    if (!menu) {
      res.status(401).json({
        message: 'Data not found',
      })
    }
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "something went wrong"
    })
  }
});

router.get('/cart', auth, async (req, res, next) => {
  try {
    const { id, email } = await req.user;
    const cart = await prisma.cart.findMany({
      select: {
        product: true,
        quantity: true
      },

      where: {
        userId: id
      }
    })

    if (cart) {
      res.status(200).json({
        data: cart,
        message: 'Ok api is working 🚀'
      });
    }

    if (!cart) {
      res.status(401).json({
        data: cart,
        message: 'data not found..'
      });
    }

  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "something went wrong"
    })
  }
});

router.post('/cart', auth, async (req, res, next) => {
  try {
    const { id, email } = await req.user;
    const { productId, quantity } = await req.body;
    const cart = await prisma.cart.create({
      data: {
        userId: id,
        productId: productId,
        quantity: quantity
      }
    })

    if (cart) {
      res.status(200).json({
        status: 200,
        data: cart,
        message: 'Added cart sucessfull'
      })
    }

    if (!cart) {
      res.status(401).json({
        status: 401,
        message: 'cart not added'
      })
    }
  } catch (err) {

  }
});

router.post('/order', auth, async (req, res, next) => {
  try {
    const { id, email } = await req.user;
    const { productId } = await req.body;
    console.log(productId)
    const product = await prisma.product.findFirst({
     where:{
        id: productId
     }
    })
    
    const send = await sendMail({ name: product.materialName, description: product.description });

    if(send){
      res.status(200).json({
        message: send
      })
    }
  } catch (err) {

  }
});


module.exports = router;
