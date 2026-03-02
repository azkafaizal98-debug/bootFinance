const express = require('express')
const transactionsRoutes = require('./routers/rout')

const app = express()

app.use(express.json())
app.use('/api', transactionsRoutes)

module.exports = app;