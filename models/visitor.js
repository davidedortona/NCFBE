const mongoose = require('mongoose');


const visitSchema = mongoose.Schema({
    counter:{
        type:Number,
        required:true,
        default : 0
    }
});

exports.Visitor = mongoose.model('visits', visitSchema);

