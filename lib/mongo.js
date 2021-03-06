const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')

const config = require('config-lite')(__dirname)
const Mongolass = require('mongolass')
const mongolass = new Mongolass()
mongolass.connect(config.mongodb)



exports.User = mongolass.model('User', {
    name: {type: 'string', required: true},
    password: {type: 'string', required: true},
    avatar: {type: 'string', required: true},
    acade: {type: 'string', required: true},
    bio: {type: 'string', required: true},
    stuId: {type: 'string', default: ''},
    OfficialAccount: {type: 'boolean', required:true}
})

exports.User.index({ name: 1 }, { unique: true }).exec()// 根据用户名找到用户，用户名全局唯一

//文章
exports.Post = mongolass.model('Post', {
  	author: {type: Mongolass.Types.ObjectId, required: true},
    title: {type: 'string', required: true},
    content: {type: 'string', required: true},
    profile: {type: 'string', required:true},
    avatar: {type: 'string', required: false},
    pv: {type: 'number', default: 0}
})

exports.Post.index({ author: 1, _id: -1}).exec()// 按创建时间降序查看用户的文章列表



exports.Comment = mongolass.model('Comment', {
	author: {type: Mongolass.Types.ObjectId, required: true},
	content: {type: 'string', required: true},
	postId: {type: Mongolass.Types.ObjectId, required: true}
})

exports.Comment.index({postId: 1, _id: 1}).exec()


//-----------------关注
exports.Follow = mongolass.model('Follow', {
	fan: {type: Mongolass.Types.ObjectId, required: true},//粉丝
  follow: {type: Mongolass.Types.ObjectId, required: true} //被关注的
})

exports.Follow.index({fan: 1, _id: 1}).exec()

// ---------------点赞
exports.Likes = mongolass.model('Likes', {
	postId: {type: Mongolass.Types.ObjectId, required: true},
	fan: {type: Mongolass.Types.ObjectId, required: true}
})
exports.Likes.index({postId: 1, _id: 1}).exec()


//产品表
exports.Item = mongolass.model('Item', {
	author: {type: Mongolass.Types.ObjectId, required: true},
	name: {type: 'string', required:true},//name
	qq: {type: 'string', required: false},//QQ
	subTitle: {type: 'string', required: true}, //小标题
	price: {type: 'number', required: true},//价格
	stock: {type: 'number', required:true}, //库存
	category: {type: 'string', required:true},//分类
	image: {type: 'string', required: false},//图片
	pv: {type: 'number', default: 0}//浏览
})
exports.Item.index({name: 1}).exec()

//图片表
exports.ItemImage = mongolass.model('ItemImage', {
	itemId: {type: Mongolass.Types.ObjectId, required: true},
	image: {type: 'string', required:true}
})
exports.ItemImage.index({itemId: 1, _id: 1}).exec()

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
    afterFind: function (results) {
		results.forEach(function (item) {
			item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm')
		})
		return results
    },
    afterFindOne: function (result) {
		if (result) {
			result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm')
		}
		return result
    }
})