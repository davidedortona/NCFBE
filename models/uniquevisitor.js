const mongoose = require('mongoose');


const uniquevisitSchema = mongoose.Schema({
    counter:{
        type:Number,
        required:true,
        default : 0
    }
});

exports.Visitor = mongoose.model('uniquevisits', uniquevisitSchema);

