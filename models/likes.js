const Likes = require('../lib/mongo').Likes


module.exports = { 
    //通过文章和用户Id，判断是否点赞
    getIsLikedById: function(postId, fanId) {
        const query = {postId: postId, fan: fanId}

        return Likes
            .findOne(query)
            .exec()
    },
    //通过postId和fanId新增点赞
    addLikedById:function(postId, fanId) {
        let tem = {
            postId: postId,
            fan: fanId
        }
        return Likes.create(tem).exec()
    },
    //通过postId计算点赞数目
    getLikedCount: function(postId) {
        return Likes.count({postId: postId}).exec()
    }
    
}