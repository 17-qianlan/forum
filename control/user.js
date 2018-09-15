const {db} = require("../schema/config.js"),
    userName = require("../schema/user.js"),
    articleName = require("../schema/article.js"),
    comment = require("../schema/comment.js"),
    encrypt = require("../until/encrypt.js");

//连接数据库
const User = db.model("users",userName);
const Article = db.model("articles",articleName);
const Comment = db.model("comments",comment);

//初始界面
exports.init = async ctx=> {
    await ctx.render("singin.pug",{
        title : "初始界面",
        session : ctx.session.isNew,
        articleBoo : true,
        avatar : ctx.session.avatar,
        listBoo : false
    });
};

//请求的注册界面
exports.reg = async ctx=> {
    await ctx.render("singin.pug",{
        reg : true,
        title : "这是一个注册页面",
        session : ctx.session.isNew
    });
};

//请求的登录界面
exports.singin = async ctx=>{
    await ctx.render("singin.pug",{
        singin : true,
        title : "这是一个登录页面",
        session : ctx.session.isNew
    });
};

//处理注册界面
exports.handleReg = async ctx => {
    let user = ctx.request.body,
        username = user.username,
        password = encrypt(user.password);
    await new Promise((resolve,reject) => {
        //查看是否用户已存在
        User.find({username},(err,data)=>{
            if(err) return reject(err);//查询出错,可能还没有数据
            if(data.length !==0 ) return resolve("");//用户名已经存在
            //准备好要发送给数据库的数据
            const _user = new User({
                username,
                password
            });
            //写入数据库
            _user.save((err,data) =>{
                if(err){
                    reject(err)
                }else{
                    resolve(data);
                }
            });
        })
    }).then(async data => {
        if(data){
            await ctx.render("singin.pug",{
                b : true,
                boo: false,
                content : "注册成功",
                session : ctx.session.isNew
            })
        }else{
            //用户是否已存在
            await ctx.render("singin.pug",{
                b : true,
                boo: false,
                content : "用户名已存在"
            })
        }
    }).catch(async err => {
        await ctx.render("singin.pug",{
            b : true,
            boo: false,
            content : "注册失败,请重试"
        })
    });
};

//处理登录界面
exports.handleSingin = async ctx => {
    let user = ctx.request.body;
    let username = user.username,
        password = encrypt(user.password);
    await new Promise((resolve,reject) => {
        User.find({username},(err,data) => {
            if ( err ) return reject(err);
            if (data.length === 0 ) return reject("用户名不存在");
            if( data[0].password === password ) return resolve(data);
            resolve("");
        })
    }).then( async data => {
        if (!data) {
            return ctx.render("singin.pug",{
                reg : false,
                singin : false,
                b : true,
                content : "密码不正确"
            })
        }

        //把username存到cookie
        ctx.cookies.set("username",username,{
            domain : "localhost",//挂载当前主机名
            path : "/",//路径
            maxAge : 36e5,//当前的过期时间
            httpOnly : true,//是否让当前浏览器可读取
            overwrite : false//是否重写
            //signed : true//是否签名 默认签名
        });
        //把UID存起来
        ctx.cookies.set("uid",data[0]._id,{
            domain : "localhost",//挂载当前主机名
            path : "/",//路径
            maxAge : 36e5,//当前的过期时间
            httpOnly : true,//是否让当前浏览器可读取 false为可读
            overwrite : false//是否重写
            //signed : true//是否签名
        });

        //设置session
        ctx.session = {
            username,
            uid : data[0]._id,
            avatar : data[0].avatar
        };
        await ctx.render("singin.pug",{
            reg : false,
            singin : false,
            b : true,
            content : "登录成功",
            session : ctx.session.isNew,
            avatar : data[0].avatar
    });
    }).catch(async err => {
        await ctx.render("singin.pug",{
            reg : false,
            singin : false,
            b : true,
            content : "用户名或密码错误,请重试"
        });
        console.log(err);
    });
};

//处理cookie,查看状态
exports.keepLog = async (ctx,next) => {
    if ( ctx.session.isNew ) {
        if ( ctx.cookies.get("username") ) {
            ctx.session = {
                username : ctx.session.get("username"),
                uid : ctx.session.get("uid"),
                avatar : ctx.session.avatar
            }
        }
    }
    await next();
};

//退出登录
exports.logout = async ctx => {
    ctx.session = null;
    ctx.cookies.set("username",null,{
        maxAge : 0
    });
    ctx.cookies.set("uid",null,{
        maxAge : 0
    });
    ctx.redirect("/");
};

//处理article
exports.article = async ctx => {
    await ctx.render("singin.pug",{
        articleBoo : true,
        b : false,
        session : ctx.session.isNew,
        avatar : ctx.session.avatar
    })
};

//处理文章发表路由
exports.sub = async ctx => {
    if( ctx.session.isNew ){
        return await ctx.render("singin.pug",{
            publish : true,
            msg : "请先登录",
            session : ctx.session.isNew
        });
    }
    let data = ctx.request.body;
    data.author = ctx.session.uid;
    data.countNumber = 0;//用于文章计数,要在schema里添加,否则存不到数据库里
    await new Promise((resolve,reject) => {
       new Article(data).save((err,data) => {
            if (err) return reject(err);
            resolve(data);
        })
    }).then(data => {
        return ctx.render("singin.pug",{
            publish : true,
            msg : "发表成功",
            avatar : ctx.session.avatar
        })
    }).catch(err => {
        ctx.render("singin.pug",{
            publish : true,
            msg : "发表失败"
        });
    })
};

//获取文章列表
exports.getList = async (ctx,next) => {
    // ctx.params 获取动态路由的传值
    let page = ctx.params.id || 1;
    const maxAge = await Article.estimatedDocumentCount((err,data) => err?console.log(err):data);
    page--;
    //find 查找 sort 排序    skip  跳过    limit限定条数         populate   用于mongose连表查询
    //这里的查找是惰性的,不写回调不会执行  需要exec()/then()才可以调用
    const artList = await Article.find().sort("-created").skip(3*page).limit(3).populate({
        path : "author",
        select : "username _id avatar"
        //此处用于连表查询
    }).then(data => data).catch(err => console.log(err));

    await ctx.render("singin.pug",{
        session : ctx.session.isNew,
        listBoo : true,
        artList ,
        avatar : ctx.session.avatar,
        maxAge
    })
};

//文章详情
exports.details = async (ctx,next) => {
    let _id = ctx.params.id;
    let details = await Article
        .findById(_id).populate("author","username _id avatar")
        .then(data => data)
        .catch( err => console.log(err));
    //文章评论查询
    let _comment = await Comment
        .find({article : _id})
        .sort("-created")
        .populate("articles","username avatar")
        .then(data => data)
        .catch( err => console.log(err));
    await ctx.render("singin.pug",{
        details,
        session : ctx.session.isNew,
        listBoo : false,
        avatar : ctx.session.avatar,
        detail : true,
        _comment
    });
};

//文章评论路由
exports.save = async (ctx,next) => {
    if( ctx.session.isNew ){
        return await ctx.render("singin.pug",{
            session : ctx.session.isNew,
            publish : true,
            title : "请先登录"
        })
    }
    let data = ctx.request.body;
    let ccc = data.id;
    data.from = ctx.session.uid;
    data.article = ccc;
    data.avatar = ctx.session.avatar;
    data.username = ctx.session.username;
    const _comment = new Comment(data);
    await _comment.save().then( data => {
        Article.update({_id: data.article},{$inc:{//用于文章计数,更新数据库里的数据更新,这里是MongoDB的原子操作
                countNumber : 1
                }},err => console.log(err));

        return ctx.redirect(`/article/${ccc}`);//这里跳转到文章详情路由,需要id值,是从页面哪儿传过来的
    } ).catch( err => console.log(err));
};

//404路由
exports.err = async ctx => {
    await ctx.render("404.pug");
};