const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type:String
    },
    email:{
        type: String
    },
    password:{
        type: String
    },
    photo:{
        type:String
    },
    role:{
        type:String
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('users', userSchema)