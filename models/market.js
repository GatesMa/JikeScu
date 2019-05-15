const Item = require('../lib/mongo').Item



module.exports = {
    // 创建一篇文章
    create: function create (item) {
        return Item.create(item).exec()
    },
    // 通过商品 id 获取一篇文章
    getItemById: function getItemById (itemId) {
        return Item
            .findOne({ _id: itemId })
            .populate({ path: 'author', model: 'User' })
            .addCreatedAt()
            .exec()
    },

    // 按创建时间降序获取所有用户商品或者某个特定用户的所有商品
    getItems: function getItems (author) {
        const query = {}
        if (author) {
        query.author = author
        }
        return Item
        .find(query)
        .populate({ path: 'author', model: 'User' })
        .sort({ _id: -1 })
        .addCreatedAt()
        .exec()
    },
    // 通过 id 给 pv 加 1
    incPv: function incPv (itemId) {
        return Item
            .update({ _id: itemId }, { $inc: { pv: 1 } })
            .exec()
    },
    //浏览量排序
    getItemsByPv: function getItemsByPv() {
        return Item
            .find({})
            .populate({ path: 'author', model: 'User' })
            .sort({pv : -1})
            .limit(10)
            .exec()
    },
    // 通过文章 id 删除一篇文章
    delItemById: function delPostById (itemId) {
        return Item.deleteOne({ _id: itemId }).exec()
    },
}