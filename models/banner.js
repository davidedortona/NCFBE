const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    richDescription: {
        type: String,
        
    },
    tags: {
        type: String,
        
    },
    image: {
        type: String,
        default: ''
    },
    isHomeBanner:{
        type: String,
        default:"false"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

bannerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

bannerSchema.set('toJSON', {
    virtuals: true,
});


exports.Banner = mongoose.model('Banner', bannerSchema);
