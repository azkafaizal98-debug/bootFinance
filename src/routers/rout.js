const express = require('express')
const { message } = require('telegraf/filters')
const router = express.Router()
const transaction = require('../models/models')

router.post('/transactions', async (req, res) => {
    try {
        const { userId, description, total, createdAt } = req.body

        const newTransaction = await transaction.create({
            userId,
            description,
            total,
            createdAt
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
        const { userId} = req.params

        const now = new Date()
        const {month, year} = req.query



        const monthNum =  
            month !== undefined && month !== ""
            ?Number(month) - 1
            : now.getMonth()
        const yearNum = 
            year !== undefined && year !== ""
            ?Number(year)
            : now.getFullYear()
            
        const startDate = new Date(yearNum,monthNum, 1)
        const endDate = new Date(yearNum,monthNum + 1, 1)

        const total = await transaction.aggregate([
            { $match: { userId: userId,
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ])

        res.json({
            total: total.length > 0 ? total[0].total : 0
        })

    } catch (err) {
        res.status(500).json({ message: 'Gagal ambil summary' })
    }
})

router.get(`/transactions/`, async (req, res) => {
    try {
        const {userId ,month, year} = req.query
        const filter = {userId}

        

        if (month && year) {
            const startDate = new Date(year,month - 1, 1)
            const endDate = new Date(year, month, 1)

            filter.createdAt = {
                $gte: startDate,
                $lt: endDate
            }
        }

    const find = await transaction.find(filter).sort({createdAt: - 1 }).select('description total createdAt -_id')
        
        res.json(find)

    } catch (err) {
        res.status(500).json({ message: 'gagal data tidak di temukan' })
    }

})
module.exports = router