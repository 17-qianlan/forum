const {Schema} = require("./config.js");

const userSchema = new Schema({
    username : String,
    password : String,
    role : {
        type : String,
        default : 1
    },
    avatar : {
        type : String,
        default : `/images/${Math.floor(Math.random()*(5-1))}.jpg`
    }
},{
    versionKey: false
});

module.exports = userSchema;