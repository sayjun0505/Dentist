const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const patientSchema = new Schema({
    name:{
        type: Object
    },
    email:{
        type: Object
    },
    phone:{
        type: Object
    },
    subject:{
        type: Object
    },
    message:{
        type: Object
    },
    file:{
        type:String
    },
    role:{
        type:String
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('patient', patientSchema)