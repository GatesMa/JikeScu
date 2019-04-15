const User = require('../lib/mongo').User

module.exports = {
    // 注册一个用户
    create: function create(user) {
        return User.create(user).exec()
    },

    //获取官方账号
    getOfficialAccount:function getOfficialAccount() {
        const query = {}
        query.OfficialAccount = true

        return User
            .find(query)
            .sort({_id: -1})
            .addCreatedAt()
            .exec()
    },


    // 通过用户名获取用户信息
    getUserByName: function getUserByName (name) {
        return User
        .findOne( { name: name } )
        .addCreatedAt()
        .exec()
    },
    //通过id获取用户信息
    getUserById: function getUserById(id) {
        return User
            .findOne({_id: id})
            .exec()
    }
}