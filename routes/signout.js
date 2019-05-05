const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin

// GET /signout 登出
router.get('/', checkLogin, function(req, res, next) {
    //清空 session 李用户信息
    req.session.user = null
    req.flash('sucess', '登出成功')
    //登出成功后跳转到主页
    res.redirect('/posts')
})
module.exports = router