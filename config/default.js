module.exports = {
    port: 3030,
    session: {
      secret: 'myblog',
      key: 'myblog',
      maxAge: 2592000000
    },
    mongodb: 'mongodb://admin:passwd@localhost:27017/myblog?authSource=admin'
}
