const Follow = require('../lib/mongo').Follow

module.exports = {

    //通过粉丝id和关注者id查找数据
    getIsFollowed: function getIsFollowed(fanId, followId) {
        const query = {fan: fanId,follow: followId}

        return Follow
            .findOne(query)
            .exec()
    },
    followById: function followById(fanId, followId) {
        let tem = {
            fan: fanId,
            follow: followId
        }
        return Follow.create(tem).exec()
    },
    dropfollowById: function dropfollowById(fanId, followId) {
        return Follow.deleteOne({ fan:fanId,  follow: followId}).exec()
    },
    getAllFollowed: function getAllFollowed(fanId) {
        const query = {fan: fanId}
        
        return Follow
            .find(query)
            .exec()
    },
    //获取关注了多少人
    getFollowedCountByFanId: function(fanId) {
        return Follow.count({fan: fanId}).exec()
    },
    //通过网红Id获取粉丝数目
    getFansContById: function(authorId) {
        return Follow.count({follow: authorId}).exec()
    }
}