let mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
let patientSchema = require('../models/patients');

const crypto = require('crypto');
const { route } = require('./authRoutes');
const key = "71e09a7da09cf2b1ec465b1ccb a6e699c76ba7ab5165249c381feed02a8b3c5b";
const keyBuffer = Buffer.from(key.replace(/\s/g, ''), 'hex');
const iv = crypto.randomBytes(16);

//Encrypting text
function encrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// Decrypting text
function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

function returnDecrypted(encrypted) {
    for (var i = 0; i < encrypted.length; i++) {

        encrypted[i].name = decrypt(encrypted[i].name);
        encrypted[i].email = decrypt(encrypted[i].email);
        encrypted[i].phone = decrypt(encrypted[i].phone);
        encrypted[i].subject = decrypt(encrypted[i].subject);
        encrypted[i].message = decrypt(encrypted[i].message);
    }
    return encrypted;

}


const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, './public/uploads/appointment');
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
    }
});

let upload = multer({ storage });

router.route('/create').post(upload.single('uploadFile'), (req, res) => {

    const newAppoint = new patientSchema({
        name: encrypt(req.body.name),
        email: encrypt(req.body.email),
        phone: encrypt(req.body.phone),
        subject: encrypt(req.body.subject),
        message: encrypt(req.body.message),
        file: req.file.filename,
        role: req.body.role
    });
    newAppoint.save()
        .then((data) => {
            data.name = decrypt(data.name);
            data.email = decrypt(data.email);
            data.phone = decrypt(data.phone);
            data.subject = decrypt(data.subject);
            data.message = decrypt(data.message);

            res.json(data);
        })
        .catch((err) => {
            res.json(err);
        });
});

router.route('/getall/:role').get((req, res) => {

    if (req.params.role == "laboratory") {
        patientSchema.find({}).sort({ createdAt: -1 })
            .then(data => {
                console.log("getall success");
                const decData = returnDecrypted(data);
                res.json(decData);
            })
            .catch(err => {
                res.json(err);
            });
    } else {

        patientSchema.find({ role: req.params.role }).sort({ createdAt: -1 })
            .then(data => {
                console.log("getall success");
                const decData = returnDecrypted(data);
                res.json(decData);
            })
            .catch(err => {
                res.json(err);
            });
    }

});

router.route('/findby').get((req, res) => {
    console.log(req.query.role)
    if (req.query.role == 'dentist') {
        if (req.query.name == "") {
            patientSchema.find({ role: req.query.role }).sort({ createdAt: -1 })
                .then(data => {
                    const decData = returnDecrypted(data);
                    console.log(decData);
                    res.json(decData);
                })
                .catch(err => {
                    res.json(err);
                });

        } else {
            console.log(encrypt(req.query.name));

            patientSchema.find({ name: encrypt(req.query.name), role: req.query.role }).sort({ createdAt: -1 })
                .then(data => {
                    const decData = returnDecrypted(data);
                    res.json(decData);
                })
                .catch(err => {
                    res.json(err);
                });
        }
    } else {
        if (req.query.name == "") {
            patientSchema.find({})
                .then(data => {
                    const decData = returnDecrypted(data);
                    res.json(decData);
                })
                .catch(err => {
                    res.json(err);
                });

        } else {

            patientSchema.find({ name: req.query.name })
                .then(data => {
                    const decData = returnDecrypted(data);
                    res.json(decData);
                })
                .catch(err => {
                    res.json(err);
                });
        }
    }

});

router.route('/delete/:id').delete((req, res) => {
    patientSchema.findByIdAndDelete(req.params.id)
        .then((data) => {
            const decData = returnDecrypted(data);
            res.json(decData);
        })
        .catch(err => {
            res.json(err);
        });
});





module.exports = router;   