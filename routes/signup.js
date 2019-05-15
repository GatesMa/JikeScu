const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

// GET /signup 注册页
router.get('/', checkNotLogin, function(req, res, next) {
    
    var array = ['计算机学院', '材料科学与工程学院', '电气信息学院', '电子信息学院', '法学院','高分子科学与工程学院',
                '公共管理学院', '华西公共卫生学院', '华西口腔医学院', '华西临床医学院', '华西药学院', '化学学院',
                '化学工程学院', '建筑与环境学院', '经济学院', '匹兹堡学院', '历史文化学院　（旅游学院）', '轻纺与食品学院',
                '软件学院', '商学院', '生命科学学院', '数学学院', '水利水电学院', '外国语学院', '文学与新闻学院', '物理科学与技术学院',
                '艺术学院', '制造科学与工程学院']

    res.render('signup', {
        academy: array
    })
})

// POST /signup 用户注册
router.post('/', checkNotLogin, function(req, res, next) {
    const name = req.fields.name
    const acade = req.fields.acade
    const bio = req.fields.bio
    const avatar = req.files.avatar.path.split(path.sep).pop()
    let password = req.fields.password
    const repassword = req.fields.repassword
    const stuId = req.fields.stuId
    //校验参数
    try {
        if(!(name.length >= 1 && name.length <= 10)) {
            throw new Error('名字限制在1-10个字符')
        }
        if(!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error('个人简介限制在1-30个字符')
        }
        if(!req.files.avatar.name) {
            throw new Error('缺少头像')
        }
        if(password.length < 6) {
            throw new Error('密码至少 6 个字符')
        }
        if(password !== repassword) {
            throw new Error('两次输入的密码不一致')
        }
        if(stuId.length != 13) {
            throw new Error('输入正确的学号')
        }
    } catch (e) {
        // 注册失败，异步删除上传的头像
        fs.unlink(req.files.avatar.path, function(err) {
            
        })
        req.flash('error', e.message)
        return res.redirect('/signup')
    }

    //明文密码加密
    password = sha1(password)

    //待写入数据库的用户信息
    let user = {
        name: name,
        password: password,
        acade: acade,
        bio: bio,
        avatar: avatar,
        OfficialAccount: false,
        stuId: stuId
    }

    //用户信息写入数据库
    UserModel.create(user)
        .then(function(result) {
            //此user是插入 mongodb 后的值， 包含_id
            user = result.ops[0]
            //删除密码这种铭感信息，将用户信息存入session
            delete user.password
            req.session.user = user
            //写入 flash
            req.flash('success', '注册成功')
            //跳转到首页
            res.redirect('/posts')
        })
        .catch(function(e) {
            //注册失败，异步删除上传的头像
            fs.unlink(req.files.avatar.path)
            //用户名被占用则跳回注册页，而不是错误页
            if(e.message.match('duplicate key')) {
                req.flash('error', '用户名已被占用')
                return res.redirect('/signup')
            }
            next(e)
        })
})

module.exports = router