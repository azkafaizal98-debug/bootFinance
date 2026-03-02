const express = require('express')
const { message } = require('telegraf/filters')
const router = express.Router()
const transaction = require('../models/models')

router.post('/transactions', async (req, res) => {
    try {
        const { userId, description, total } = req.body

        const newTransaction = await transaction.create({
            userId,
            description,
            total
        })

        console.log(newTransaction)

        res.json(newTransaction)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'gagal simpan ke DB' })
    }
})


router.get('/summary/:userId', async (req, res) => {
    try {
        const { userId } = req.params

        const total = await transaction.aggregate([
            { $match: { userId: userId } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ])

        res.json({
            total: total[0]?.total || 0
        })

    } catch (err) {
        res.status(500).json({ message: 'Gagal ambil summary' })
    }
})

router.get(`/transactions/:userId`, async (req, res) => {
    try {
        const { userId } = req.params

        const find = await transaction.find({ userId: userId }).select('description total -_id')
        
        res.json(find)

    } catch (err) {
        res.status(500).json({ message: 'gagal data tidak di temukan' })
    }

})
module.exports = router