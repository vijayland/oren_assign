const router = require('express').Router();
var bcryptjs = require('bcryptjs');
const { PrismaClient } = require('@prisma/client')

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

router.get('/user/login', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

router.get('/menu', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

router.get('/cart', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

module.exports = router;
