const {db} = require("../schema/config.js"),
    userName = require("../schema/user.js"),
    encrypt = require("../until/encrypt.js");

const User = db.model("users",userName);

module.exports = () => {
    User.find({username:"admin"}).then(data => {
        if (data.length === 0 ){
            new User({
                username : "admin",
                password : encrypt("55991"),
                role : 1219
            }).save().then(data => {
                console.log("管理员创建成功");
            }).catch(err => {
                console.log(err);
            })
        }else{
            console.log("管理员已存在");
        }
    })
};