const mongoose = require("mongoose");

const db = mongoose.createConnection("mongodb://localhost:27017/blog",{useNewUrlParser : true});

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

db.on("error",()=>{
    console.log("链接数据库失败");
});

db.on("open",()=>{
    console.log("reg连接成功");
});

module.exports = {
  db,
  Schema
};