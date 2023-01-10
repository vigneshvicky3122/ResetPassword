const express = require("express");
const router = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const { authentication, createToken } = require("./auth");
const { hashPassword, hashCompare } = require("./hashPassword");
const { MongoClient, ObjectId } = require("mongodb");
const Client = new MongoClient(process.env.DB_URL);
const { mailer } = require("./nodemailer");
const PORT = process.env.PORT || 8000;
router.use(
  bodyParser.json(),
  cors({
    origin: "*",
    credentials: true,
  })
);

var list = [];
router.get("/dashboard", authentication, async (req, res) => {
  await Client.connect();
  try {
    const Db = Client.db(process.env.DB_NAME);
    let users = await Db.collection(process.env.DB_COLLECTION_ONE)
      .find()
      .toArray();

    if (users) {
      res.json({
        statusCode: 200,
        users,
      });
    } else {
      res.json({
        statusCode: 401,
        message: "couldn't connect",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "internal server error",
    });
  } finally {
    Client.close();
  }
});

router.post("/signup", async (req, res) => {
  await Client.connect();
  try {
    const Db = Client.db(process.env.DB_NAME);
    let email = await Db.collection(process.env.DB_COLLECTION_ONE)
      .find({ email: req.body.email })
      .toArray();
    let username = await Db.collection(process.env.DB_COLLECTION_ONE)
      .find({ username: req.body.username })
      .toArray();
    if ((username.length === 0) & (email.length <= 2)) {
      req.body.password = await hashPassword(req.body.password);
      let user = await Db.collection(process.env.DB_COLLECTION_ONE).insertOne(
        req.body
      );
      if (user) {
        res.json({
          statusCode: 200,
          message: "Signup successful",
        });
      }
    } else {
      res.json({
        statusCode: 401,
        message: "User was already exist please login...",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "internal server error",
    });
  } finally {
    await Client.close();
  }
});
router.post("/login", async (req, res) => {
  await Client.connect();
  try {
    const Db = Client.db(process.env.DB_NAME);
    let users = await Db.collection(process.env.DB_COLLECTION_ONE)
      .find({ email: req.body.email })
      .toArray();
    if (users.length === 1) {
      let hashResult = await hashCompare(req.body.password, users[0].password);
      if (hashResult) {
        let token = await createToken({
          email: users[0].email,
          username: users[0].username,
          name: users[0].name,
        });
        if (token) {
          res.json({
            statusCode: 200,
            message: "Login successful",
            token,
            users,
          });
        }
      } else {
        res.json({
          statusCode: 401,
          message: "Invalid credentials",
        });
      }
    } else {
      res.json({
        statusCode: 404,
        message: "User does not exist, please signup",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "internal server error",
    });
  } finally {
    await Client.close();
  }
});
router.post("/reset-email-verify", async (req, res) => {
  await Client.connect();

  try {
    const Db = Client.db(process.env.DB_NAME);

    let user = await Db.collection(process.env.DB_COLLECTION_ONE)
      .find({ email: req.body.email })
      .toArray();
    if (user.length === 1) {
      let digits = "123456789";
      let OTP = "";
      for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 9)];
      }
      if (OTP) {
        await mailer(req.body.email, OTP);
        list.push({ email: req.body.email, otp: OTP });
        setTimeout(() => {
          list.pop();
        }, "50000");
        res.json({
          statusCode: 200,
          message: "OTP has sent successfully",
        });
      }
    } else {
      res.json({
        statusCode: 401,
        message: "User does not exist, Do register...",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "internal server error",
    });
  } finally {
    await Client.close();
  }
});
router.post("/reset-otp-verify", async (req, res) => {
  try {
    let check = list.find((element) => element.otp === req.body.otp);
    if (check) {
      res.json({
        statusCode: 200,
        message: "Verification successful.",
      });
    } else {
      res.json({
        statusCode: 401,
        message: "OTP expired, Retry...",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "internal server error",
    });
  } finally {
    await Client.close();
  }
});
router.put("/password/reset/:id", async (req, res) => {
  await Client.connect();
  try {
    let data = list.find((element) => element.otp === req.params.id);
    if (data) {
      const Db = Client.db(process.env.DB_NAME);
      let users = await Db.collection(process.env.DB_COLLECTION_ONE)
        .find({ email: data.email })
        .toArray();
      if (users.length === 1) {
        if (req.body.password === req.body.confirmPassword) {
          let hashpassword = await hashPassword(req.body.password);

          if (hashpassword) {
            let users = await Db.collection(
              process.env.DB_COLLECTION_ONE
            ).findOneAndUpdate(
              { email: data.email },
              { $set: { password: hashpassword } }
            );
            if (users) {
              res.json({
                statusCode: 200,
                message: "Password changed successfully",
              });
            }
          }
        } else {
          res.json({
            statusCode: 403,
            message: "Details does not match",
          });
        }
      } else {
        res.json({
          statusCode: 401,
          message: "User does not exist",
        });
      }
    } else {
      res.json({
        statusCode: 404,
        message: "Time expired, Retry...",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "internal server error",
    });
  } finally {
    await Client.close();
  }
});

router.listen(PORT, () => {
  console.log("Server running into port " + PORT);
});
