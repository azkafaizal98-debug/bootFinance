const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DBS)
        console.log("connact DB")
    } catch (err) {
        console.error('tidak dapat connact ke DB', (err))
        process.exit(1)
    }
}

module.exports = connectDB