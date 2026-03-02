const mongoose = require('mongoose')

const transactionScema = new mongoose.Schema({
    userId : String,
    total : Number,
    description : String,
    category : String,
    createdAt : {
        type : Date,
        default : Date.now
    }
})

module.exports = mongoose.model('transaction', transactionScema)