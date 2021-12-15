const router = require('express').Router();
var bcryptjs = require('bcryptjs');
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken');

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
        msg: "User is already register ..please try to login and explore.."
      })
    }

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: password,
        address: address
      },
    })

    if (!user) {
      res.status(401).json({
        status: 401,
        msg: "Something Wrong user not created....",
      })
    }

    res.status(200).json({
      status: 200,
      msg: "success",
      user: user
    })

  } catch (err) {
    res.status(500).json({
      status: 500,
      msg: "register not done,explore register..",
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
        msg: "Invalid Email...",
        status: 404,
      })
    }

    let isValidPassword = await bcryptjs.compare(password, isValidUser.password);

    if (!isValidUser) {
      res.send({
        msg: "password don't match...",
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
              email: isValidUser.email,
              name: isValidUser.name,
              address: isValidUser.address
            }
          })
        })
    }

  } catch (err) {

  }
});

router.get('/menu', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

router.get('/cart', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

module.exports = router;
