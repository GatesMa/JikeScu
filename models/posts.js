const Post = require('../lib/mongo').Post
const User = require('../lib/mongo').User
const marked = require('marked')
const CommentModel = require('./comments')


//讲post的content从markdown转换成html
Post.plugin('contentToHtml', {
    afterFind: function(posts) {
        return posts.map(function(post) {
            post.content = marked(post.content)
            return post
        })
    },
    afterFindOne: function(post) {
        if(post) {
            post.content = marked(post.content)
        }
        return post
    }
})

// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
    afterFind: function (posts) {
      return Promise.all(posts.map(function (post) {
        return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
          post.commentsCount = commentsCount
          return post
        })
      }))
    },
    afterFindOne: function (post) {
      if (post) {
        return CommentModel.getCommentsCount(post._id).then(function (count) {
          post.commentsCount = count
          return post
        })
      }
      return post
    }
})

module.exports = {
    //创建一篇文章
    create: function create(post) {
        return Post.create(post).exec()
    },
    //通过文章id获取一篇文章
    getPostById: function getPostById(postId) {
        return Post
            .findOne({_id: postId})
            .populate({path: 'author', model: 'User'})
            .addCreatedAt()
            .addCommentsCount()
            .contentToHtml()
            .exec()
    }, 
    //按创建时间降序获取所有用户文章或者某个用户的所有文章
    getPosts: function getPosts(author) {
        const query = {}
        if(author) {
            query.author = author
        }
        return Post
            .find(query)
            .populate({path: 'author', model: 'User'})
            .sort({_id: -1})
            .addCreatedAt()
            .addCommentsCount()
            .contentToHtml()
            .exec()
    },
    
    //通过文章 id 给 pv 加 1
    incPv: function incPv(postId) {
        return Post
            .update({_id: postId}, {$inc: {pv : 1}})
            .exec()
    },

    //通过文章id获取一篇原生文章（编辑文章）
    getRawPostById: function getRawPostById(postId) {
        return Post
            .findOne({_id: postId})
            .populate({path: 'author', model: 'User'})
            .exec()
    },

    //通过文章id更新一篇文章
    updatePostById: function updatePostById(postId, data) {
        return Post.update({_id: postId}, {$set: data}).exec()
    },

    // 通过文章 id 删除一篇文章
    delPostById: function delPostById (postId) {
        return Post.deleteOne({ _id: postId }).exec()
    },
    //通过用户Id获取文章数目
    getPostContById: function(authorId) {
        return Post.count({author: authorId}).exec() 
    }
}

