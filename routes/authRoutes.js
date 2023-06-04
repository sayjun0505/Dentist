let mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');


let userSchema = require('../models/users');

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null,  './public/uploads/userimages');
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
let upload = multer({ storage, fileFilter });

router.route('/signup').post(upload.single('photo'), (req, res) => {
    userSchema.findOne({ email: req.body.email })
        .then((user) => {
            if (user) {
                res.status(200).send({
                    message: "User aleady exists",
                    user,
                })
            } else {
                // upload.single('photo');

                bcrypt
                .hash(req.body.password, 10)
                .then((hashPassword)=>{
                    const newuser = new userSchema({
                        username: req.body.username,
                        email: req.body.email,
                        password: hashPassword,
                        photo: req.file.filename,
                        role:req.body.role
                    });
                    newuser.save()
                    .then((result) => {
                        res.status(201).send({
                            message: "User Created Successfully",
                            result,
                        });
                    })
                    .catch((error) => {
                        res.status(500).send({
                            message: "Error creating user",
                            error,
                        });
                    });
                });

            }
        });
});

router.route('/signin').post((req, res) => {
    // console.log(typeof(req.body.password))

    userSchema.findOne({ email: req.body.email })
        .then((user) => {

            bcrypt.compare(req.body.password, user.password)
                .then((passwordCheck => {

                    if (!passwordCheck) {
                        return res.status(400).send({
                            message: "password does not match",
                            error,
                        });
                    }
                    const payload = {
                        userId: user._id,
                        userEmail: user.email,

                    };
                    const secretKey = 'my_secret_key';
                    const accessToken = jwt.sign(
                        payload, 
                        secretKey, 
                        { expiresIn: '15m' 
                    });
                    res.status(200).send({
                        message: "Login Successful",
                        email: user.email,
                        role:user.role,
                        accessToken,
                    });
                }));

        })
        .catch((e) => {
            res.status(404).send({
                message: "Email not found",
                e,
            })
        })
});

router.route('/getall').get((req, res) => {
    userSchema.find({})
        .then((data) => {
            res.status(200).send({
                message: "All users",
                data,
            })
        })
        .catch((error) => {
            res.status(500).send({
                message: "Error finding users",
                error,
            });
        });
});


module.exports = router;   