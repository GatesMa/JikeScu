const ItemImage = require('../lib/mongo').ItemImage


module.exports = { 
    //创建一篇文章
    create: function create(img) {
        return ItemImage.create(img).exec()
    },
    getImages: function getImages(itemId) {
        const query = {itemId: itemId}
        
        return ItemImage
            .find(query)
            .exec()
    },
    
}