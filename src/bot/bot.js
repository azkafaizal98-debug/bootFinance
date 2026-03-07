require('dotenv').config()
const { Telegraf } = require('telegraf')
const axios = require('axios')
const { text } = require('express')
const { Mongoose } = require('mongoose')
const { keyboard } = require('telegraf/markup')

const bot = new Telegraf(process.env.BOT_TOKEN)

const API_URL = 'http://localhost:5000/api'

console.log("token", process.env.BOT_TOKEN)

if (!process.env.BOT_TOKEN) {
    throw new Error("BOT_TOKEN tidak ditemukan di .env")
}

bot.start(async (ctx) => {
    const name = ctx.from.first_name
    await ctx.reply(`
🚀 --Selamat datang ${name}!--

Kamu sekarang menggunakan *Finance Tracker Bot*.

Bot ini membantu kamu:
• mencatat pengeluaran
• mencatat pemasukan
• melihat laporan keuangan
• mengontrol keuangan harian

━━━━━━━━━━━━━━━

📌 *Perintah yang tersedia*

 add - tambah transaksi  
/list - lihat semua transaksi  
/laporan - ringkasan keuangan  
/help - panduan penggunaan  

━━━━━━━━━━━━━━━

💡 Tips: Catat transaksi setiap hari agar laporan lebih akurat.
`,    {
            parse_mode: "Markdown",
            reply_markup: {
                keyboard: [
                    ["➕ Tambah Transaksi"],
                    ["📋 List Transaksi", "📊 Laporan"],
                    ["❓ Help"]
                ],
                resize_keyboard: true
            }
}
)
}
)
// Bot Help
const help = async (ctx) => {
    await ctx.reply(`
📊 *Finance Bot - Panduan Penggunaan*

Berikut fitur yang tersedia:

💰 *add <jumlah> <deskripsi>*
Menambahkan transaksi baru.

Contoh:
\`makan siang 12000\`

📋 */list* OR */ls*
Menampilkan seluruh transaksi bulan ini.

Contoh:
\`/list\`

📅 */list <bulan> <tahun>* OR */ls* <bulan> <tahun>
Menampilkan transaksi pada bulan tertentu.

Contoh:
\`/list 5 2026\`

📈 */laporan*
Menampilkan ringkasan laporan keuangan.

🆘 */help*
Menampilkan panduan ini.
`)
}

bot.command('help', help)
bot.command('h', help)

//Bot Laporan
const laporan = async (ctx) => {
    try {
        const monthName = ["Januari", "Februari", "Maret", "April",
            "Mei", "Juni", "Juli", "Agustus",
            "September", "Oktober", "November", "Desember"]
        const text = ctx.message.text.split(' ')
        const now = new Date()
        const month = text[1]
            ? text[1]
            : now.getMonth() + 1
        const displayMonth = monthName[month - 1]
        const year = text[2]
            ? text[2]
            : now.getFullYear()

        console.log(month, year)

        const res = await axios.get(`${API_URL}/summary/${ctx.from.id}`, {
            params: {
                month,
                year
            }
        })

        ctx.reply(`📊 Laporan Keuangan\n━━━━━━━━━━━━━━━━━━━━\n🗓 Priode: ${displayMonth} / ${year}\n\n💸 Pengeluaran bulan ini: Rp ${res.data.total.toLocaleString('id-ID')}`)
    } catch (err) {
        ctx.reply('gagal mengambil laporan')
        console.error(err.message)
    }
}

bot.command('laporan', laporan)
bot.command('la', laporan)

//Bot List
const list = async (ctx) => {
    try {
        const now = new Date()
        const monthName = ["JANUARI", "FERBRUARI", "MARET", "APRIL",
            "MEI", "JUNI", "JULI", "AGUSTUS",
            "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"]
        const text = ctx.message.text.split(' ')
        const month = text[1] ? Number(text[1]) : now.getMonth() + 1
        const displayMonth = monthName[month - 1]
        const year = text[2] ? Number(text[1]) : now.getFullYear()

        const findAll = await axios.get(`${API_URL}/transactions/ `, {
            params: {
                userId: ctx.from.id,
                month,
                year
            }
        })

        const data = findAll.data

        console.log(data)

        const filters = data.map(item => {
            const deskripsi = item.description
            const tanggal = new Date(item.createdAt)
            const date = new Date()

            const jam = date.getHours().toString().padStart(2, '0')
            const menit = date.getMinutes().toString().padStart(2, '0')

            console.log(item.createdAt)

            const formatingDate = tanggal.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            })

            const ttl = item.total
            const formateTotal = ttl.toLocaleString('id-ID')

            return `🧾 DETAIL TRANSAKSI\n────────────────────\n📆 Tanggal : ${formatingDate}\n\n🕛 Jam : ${jam} : ${menit} WIB\n\n📝 Deskripsi : ${deskripsi}\n\n💰 Nominal : ${formateTotal}\n────────────────────\n`
        }).join('\n')

        ctx.reply(`📋 RIWAYAT TRANSAKSI SELAMA ${displayMonth} / ${year}\n━━━━━━━━━━━━━━━━━━━━\n\n${filters}`)

    } catch (err) {
        console.error(err.message)
        ctx.reply('gagal mengambil semua data')
    }
}

bot.command('list', list)
bot.command('ls', list)

//Bot Add
const add = async (ctx) => {
    try {
        const match = ctx.match
        console.log(match)
        const description = match[1]
        const rawTotal = match[2]
        const cleanTotal = rawTotal.replace(/[.,]/g, "")
        const total = Number(cleanTotal)

        await axios.post(`${API_URL}/transactions/`, {
            userId: ctx.from.id,
            description,
            total
        })
        ctx.reply('transaksi berhasil di catat')
    } catch (err) {
        console.error(err)
        ctx.reply('terjadi kesalahan')
    }
}

bot.hears(/^(.+)\s([\d.,]+)$/, add)

//all Button bto hears

bot.hears("➕ Tambah Transaksi", async (ctx) => {
    await ctx.reply("Silakan kirim format transaksi:\ncontoh:\nmakan 15000")
})

bot.hears("📋 List Transaksi", async (ctx) => {
    await ctx.reply("Menampilkan semua transaksi...")
    await ctx.reply("/ls")
})

bot.hears("📊 Laporan", async (ctx) => {
    await ctx.reply("Ini laporan keuangan kamu")
    await ctx.reply('/la')
})

bot.hears("❓ Help", async (ctx) => {
    await ctx.reply("Panduan penggunaan bot...")
    await ctx.reply("/h")
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

