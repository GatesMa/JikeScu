const express = require('express')
const router = express.Router()

const fs = require('fs')
const path = require('path')

const checkLogin = require('../middlewares/check').checkLogin
const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')
const UserModel = require('../models/users')
const FollowModel = require('../models/follow')
const LikedModel = require('../models/likes')

// GET /posts 所有用户
//   eg: GET /posts?author=xxx
router.get('/', function (req, res, next) {
	isPerson = {}  //是否是个人用户
	author = req.query.author  //个人用户ID
	authorInfo = {}   //个人用户
	perPostCont = 0 	//个人用户文章数目
	perFollowCont = 0 //个人用户粉丝数
	perFansCont = 0  //关注了多少人
	
	if(author) {
		UserModel.getUserById(author)
			.then(function(res) {
				authorInfo = res
			})
		PostModel.getPostContById(author)
			.then(function(res) {
				perPostCont = res
			})
		FollowModel.getFansContById(author)
			.then(function(res) {
				perFollowCont = res
				console.log('-----------')
				console.log(perFollowCont)
				console.log('-----------')
			})
		FollowModel.getFollowedCountByFanId(author)
			.then(function(res) {
				perFansCont = res
				console.log('-----------')
				console.log(perFansCont)
				console.log('-----------')
			})
		isPerson = true
	} else {
		author = null
		isPerson = false
	}
	user = req.session.user
	if(user == null) {
		user = {}
		user._id = 0
	}
	userId = user._id
	UserModel.getOfficialAccount()
		.then(function(accounts){
		FollowModel.getAllFollowed(user._id)
			.then(function(follows){
			var arrayObj = new Array();
			for(var i = 0;i < follows.length;i++) {
				UserModel.getUserById(follows[i].follow)
				.then(function(res) {
					arrayObj.push(res)
				})
				.catch(next)
			}
			PostModel.getPosts(author)
			.then(function(posts){
				res.render('posts', {
					posts: posts,
					officialAcounts: accounts,
					followers: arrayObj,
					isPerson: isPerson,
					authorInfo: authorInfo,
					perPostCont: perPostCont,
					perFollowCont: perFollowCont,
					perFansCont: perFansCont,
					userId: userId
				})
			})
			.catch(next)
		})
		.catch(next)
	})
	.catch(next)
})

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
	const author = req.session.user._id
	const title = req.fields.title
	const content = req.fields.content
	avatar = req.files.avatar.path.split(path.sep).pop()
	profile = req.fields.profile

		if(profile.length > 200) {
		profile = profile.slice(0, 200) + '...'
		}

	// 校验参数
	try {
		if (!title.length) {
		throw new Error('请填写标题')
		}
		if (!content.length) {
		throw new Error('请填写内容')
		}
		if (!profile.length) {
		throw new Error('请填写概要')
		}
		if (!req.files.avatar.name) {
		avatar =  ""
		}
	} catch (e) {
		req.flash('error', e.message)
		return res.redirect('back')
	}

	let post = {
		author: author,
		title: title,
		content: content,
		avatar: avatar,
		profile: profile,
	}

	PostModel.create(post)
		.then(function (result) {
		// 此 post 是插入 mongodb 后的值，包含 _id
		post = result.ops[0]
		req.flash('success', '发表成功')
		// 发表成功后跳转到该文章页
		res.redirect(`/posts/${post._id}`)
		})
		.catch(next)
	})

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
res.render('create')
})

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function (req, res, next) {
console.log("-----------------")
const postId = req.params.postId
post = {}
comments = {}
isFollow = false


PostModel.getPostById(postId)
	.then(function (pos) {
	if (!pos) {
		throw new Error('该文章不存在')
	}
	post = pos

	if(user == null) {
		user = {}
		user._id = 0
	}
	userId = user._id

	FollowModel.getIsFollowed(userId, post.author._id)
		.then(function(result) {
		if(result) {
			isFollow = true
		} else {
			isFollow = false
		}
		
		console.log(isFollow)
		FollowModel.getFollowedCountByFanId(userId)
			.then(function(num){
			LikedModel.getIsLikedById(post._id, userId)
				.then(function(result2) {
				if(result2) {
					isLiked = true
				} else {
					isLiked = false
				}
				LikedModel.getLikedCount(post._id)
					.then(function(likedCount){
					PostModel.incPv(post._id)
						.then(function(){
						CommentModel.getComments(postId)
							.then(function(comment){
							comments = comment
							res.render('post', {
								post: post,
								comments: comments,
								isFollow: isFollow,
								followedCount: num,
								isLiked: isLiked,
								likedCount: likedCount
							})
							})
							.catch(next)
						})
						.catch(next)
					})
					.catch(next)
				})
				.catch(next)
			})
			.catch(next)
		})
		.catch(next)
	})
	.catch(next)
})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
	const postId = req.params.postId
	const author = req.session.user._id

	PostModel.getRawPostById(postId)
		.then(function (post) {
		if (!post) {
			throw new Error('该文章不存在')
		}
		if (author.toString() !== post.author._id.toString()) {
			throw new Error('权限不足')
		}
		res.render('edit', {
			post: post
		})
		})
		.catch(next)
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  postId = req.params.postId
  author = req.session.user._id
  title = req.fields.title
  content = req.fields.content
  profile = req.fields.profile
  if(profile.length > 200) {
    profile = profile.slice(0, 200) + '...'
  }
    // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
    if (!profile.length) {
      throw new Error('请填写概要')
    } else {
      
    }
    
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }
  
  PostModel.getRawPostById(postId)
    .then(function (post) {
    if (!post) {
      throw new Error('文章不存在')
    }
    if (post.author._id.toString() !== author.toString()) {
      throw new Error('没有权限')
    }
    
    PostModel.updatePostById(postId, { title: title, content: content, profile: profile })
      .then(function () {
        req.flash('success', '编辑文章成功')
        // 编辑成功后跳转到上一页
        res.redirect(`/posts/${postId}`)
      })
      .catch(next)
    })
})

router.get('/:authorId/follow', checkLogin, function(req, res, next) {
  const authorId = req.params.authorId
  const author = req.session.user._id

  FollowModel.followById(author, authorId)
    .then(function (result) {
      // 发表成功后跳转到该文章页
      res.redirect('back')
    })
    .catch(next)

})

router.get('/:authorId/dropfollow', checkLogin, function(req, res, next){
  const authorId = req.params.authorId
  const author = req.session.user._id

  FollowModel.dropfollowById(author, authorId)
    .then(function(result) {
      res.redirect('back')
    })
    .catch(next)
})

//文章点赞
router.get('/:postId/liked', checkLogin, function(req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  LikedModel.addLikedById(postId, author)
    .then(function(result) {
      res.redirect('back')
    })
    .catch(next)
})


// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }
      PostModel.delPostById(postId)
        .then(function () {
          req.flash('success', '删除文章成功')
          // 删除成功后跳转到主页
          res.redirect('/posts')
        })
        .catch(next)
    })
})


module.exports = router
