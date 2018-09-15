const Koa = require("koa"),
    {join} = require("path"),
    serve = require("koa-static"),
    views = require("koa-views"),
    cors = require("@koa/cors"),
    koaBody = require("koa-body"),
    session = require("koa-session");

const admin = require("./control/admin.js");

const koa = new Koa;
//引入路由
const router = require("./router/router.js");

koa.keys = ["lightBlue"];
const CONFIG = {
    key : "lightBlue",
    maxAge : 36e5,
    overwrite : true,//是否重写
    httpOnly : true,//浏览器是否可以读取cookie
    singed : true,//是否签名
    rolling : true//是否刷新
};

//解决ajax跨域问题
koa.use(cors());

//cookie
koa.use(session(CONFIG,koa));
//解析post方式发送过来的数据
koa.use(koaBody());

//加载pug文件
koa.use(views(join(__dirname + "/views")),{
    extension : "pug"
});
//加载静态资源
koa.use(serve(join(__dirname + "/public")));
//将路由挂载到koa上
koa.use(router.routes()).use(router.allowedMethods());

//监听3000端口
koa.listen(3000);

admin();