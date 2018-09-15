const {Schema} = require("./config.js");

let ObjectId = Schema.Types.ObjectId;
const comment = new Schema({
    content : String,
    from : {
        type : ObjectId,//使用ObjectId进行连表查询,关联到对应的ref里的对应用户,不过这个保存过来的是从cookie里获取的
        ref : "users"//关联users表(集合)
    },
    article : {
        type : ObjectId,
        ref : "articles"
    },
    avatar : String,
    username : String
},{
    versionKey: false,
    timestamps : {
        createdAt : "created"//时间(发表时间)
    }
});
//5b93a9ec62c5f811c8f18fd8
//5b93a9ec62c5f811c8f18fd8
module.exports = comment;