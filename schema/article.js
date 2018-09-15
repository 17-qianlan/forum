const {Schema} = require("./config.js");

let ObjectId = Schema.Types.ObjectId;
const ArticleName = new Schema({
    Tips : String,
    title : String,
    content : String,
    author : {
        type : ObjectId,//使用ObjectId进行连表查询,关联到对应的ref里的对应用户,不过这个保存过来的是从cookie里获取的
        ref : "users"//关联users表(集合)
    },
    countNumber : Number
},{
    versionKey: false,
    timestamps : {
        createdAt : "created"
    }
});
//5b93a9ec62c5f811c8f18fd8
//5b93a9ec62c5f811c8f18fd8
module.exports = ArticleName;