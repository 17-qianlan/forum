const Router = require("koa-router"),
    user = require("../control/user.js");

const router = new Router;

//初始化界面
router.get("/", user.keepLog, user.init);

//退出get
router.get("/user/logout", user.logout);

//a标签请求的注册界面
router.get("/user/registered", user.reg);

//a标签请求的登录界面
router.get("/user/singin", user.singin);

//注册路由,处理注册发过来的数据 post方式
router.post("/registered", user.handleReg);

//登录路由,处理登录发过来的数据 post方式
router.post("/singing", user.handleSingin);

//跳转文章路由
router.get("/article", user.article);

//发表文章路由
router.post("/article/sub", user.sub);

//分页路由
router.get("/page/:id", user.getList);

//文章详情页路由
router.get("/article/:id", user.details);

//文章评论保存路由
router.post("/comment",user.keepLog, user.save);

//404路由 一定要注册到最后,否则会覆盖前面的
router.get("*",user.err);
//导出router路由
module.exports = router;