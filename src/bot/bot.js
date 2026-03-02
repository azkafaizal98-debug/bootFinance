require('dotenv').config()
const {Telegraf} = require('telegraf')
const axios = require('axios')

const bot = new Telegraf(process.env.BOT_TOKEN)

const API_URL = 'http://localhost:5000/api'

console.log("token", process.env.BOT_TOKEN)

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN tidak ditemukan di .env")
}

bot.start(async (ctx) => {
   await ctx.reply("Bot finance aktif Contoh input: makan 15.000 \n /help untuk liat semua command")
})

bot.help(async (ctx) => {
    await ctx.reply(`
    Perintah :
    makan 15000
    -/laporan
    -/findAll
    `)
})

bot.hears(/^(.+)\s([\d.,]+)$/, async (ctx) => {
    try{
        const match = ctx.match
        console.log(match)
        const description = match[1]
        const rawTotal = match[2]
        const cleanTotal = rawTotal.replace(/[.,]/g, "")
        const total = Number(cleanTotal)

        console.log(rawTotal)
        console.log(cleanTotal)

        await axios.post(`${API_URL}/transactions`, {
            userId : ctx.from.id,
            description,
            total
        })
        ctx.reply('transaksi berhasil di catat')
    } catch(err) {
        console.error(err)
        ctx.reply('terjadi kesalahan')
    }
})

bot.command('laporan', async (ctx) => {
    try{
        const res = await axios.get(`${API_URL}/summary/${ctx.from.id}`)
        ctx.reply(`totoal pengeluaran ${res.data.total}`)
    } catch(err) {
        ctx.reply('gagal mengambil laporan')
    }
})

bot.command('findAll', async (ctx) => {
    try {
        const findAll = await axios.get(`${API_URL}/transactions/${ctx.from.id}`)
        const data = findAll.data

        const filters = data.map(item => `- Deskripsi: ${item.description}\ntotal: ${item.total.toLocaleString('id-ID')}\n`).join('\n')
        console.log(filters)
        ctx.reply(`<---> semua pengeluaran <--->\n\n${filters}`)
    } catch(err) {
        ctx.reply('gagal mengambil semua data')
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

