const express = require('express')
const router = express.Router()

const fs = require('fs')
const path = require('path')
const checkLogin = require('../middlewares/check').checkLogin

const ItemModel = require('../models/market')
const ItemImageModel = require('../models/ItemImage')

// GET /market
router.get('/', function(req, res, next) {
    const author = req.query.author
    user = req.session.user
    
	if(user == null) {
		user = {}
		user._id = 0
    }
    userId = user._id

    ItemModel.getItems(author)
        .then(function (items) {
            ItemModel.getItemsByPv()
                .then(function(itemsPv) {
                    res.render('market', {
                        items: items,
                        userId: userId,
                        itemsPv: itemsPv
                    })
                })
                .catch(next)
        })
        .catch(next)
})

// GET /market/create
router.get('/create', checkLogin, function(req, res, next) {
    var array = ['教材书本', '课外书', '衣服', '电动车', '电子设备', '其他']
    res.render('createItem', {
        array: array
    })
})

// POST /market/create
router.post('/create', checkLogin, function(req, res, next) {
    const author = req.session.user._id
    const title = req.fields.title//商品名称
    const subtitle = req.fields.subtitle//描述
    const price = req.fields.price//价格
    const stock = req.fields.stock//库存
    const qq = req.fields.qq//qq
    const category = req.fields.category//分类
    image = req.files.image.path.split(path.sep).pop()//主页图片
    // 校验参数
    try {
        if (!title.length) {
        throw new Error('请填写标题')
        }
        if (!subtitle.length) {
        throw new Error('请填写内容')
        }
        if (!price.length) {
            throw new Error('请填写内容')
        }
        if (!stock.length) {
            throw new Error('请填写内容')
        }
        if (!qq.length) {
            throw new Error('请填写qq')
        }
        if (!req.files.image.name) {
            image =  ""
        }
    } catch (e) {
        req.flash('error', e.message)
        return res.redirect('back')
    }

    let item = {
        author: author,
        name: title,
        subTitle: subtitle,
        price: Number(price),
        stock: Number(stock),
        category: category,
        image: image,
        qq: qq
    }

    ItemModel.create(item)
        .then(function (result) {
            // 此 post 是插入 mongodb 后的值，包含 _id
            item = result.ops[0]
            req.flash('success', '发表成功')
            // 发表成功后跳转到该文章页
            res.redirect(`/market/${item._id}`)
            
        })
        .catch(next)
    
})

// GET /market/:itemId
router.get('/:itemId', function(req, res, next) {
    const itemId = req.params.itemId
    

    Promise.all([
        ItemModel.getItemById(itemId), // 获取信息
        ItemImageModel.getImages(itemId),//图片
        ItemModel.incPv(itemId)// pv 加 1
    ]).then(function (result) {
        const item = result[0]
        if (!item) {
            throw new Error('该商品不存在')
        }
        const images = result[1]
        res.render('item', {
            item: item,
            images: images
        })
    }).catch(next)

})

// GET /market/:itemId/edit
router.get('/:itemId/edit', checkLogin, function(req, res, next) {
    const itemId = req.params.itemId
	const author = req.session.user._id
    var array = ['教材书本', '课外书', '衣服', '电动车', '电子设备', '其他']
    
        
    
	ItemModel.getItemById(itemId)
		.then(function (item) {
            if (!item) {
                throw new Error('该文章不存在')
            }
            if (author.toString() !== item.author._id.toString()) {
                throw new Error('权限不足')
            }
            res.render('editItem', {
                item: item,
                array: array
            })
		})
		.catch(next)
})

// POST /market/:itemId/edit
router.post('/:itemId/edit', checkLogin, function(req, res, next) {
    
})

// GET /maekrt/:itemId/remove
router.get('/:itemId/remove', checkLogin, function(req, res, next) {
    const itemId = req.params.itemId
    const author = req.session.user._id

    ItemModel.getItemById(itemId)
        .then(function (item) {
            if (!item) {
                throw new Error('商品不存在')
            }
            if (item.author._id.toString() !== author.toString()) {
                throw new Error('没有权限')
            }
            ItemModel.delItemById(itemId)
                .then(function () {
                    req.flash('success', '删除商品成功')
                    // 删除成功后跳转到主页
                    res.redirect('/market')
                    })
                .catch(next)
            })
})


module.exports = router


