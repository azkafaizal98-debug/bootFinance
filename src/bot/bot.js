require('dotenv').config()
const { Telegraf, Markup } = require('telegraf')
const axios = require('axios')
const { text } = require('express')
const { Mongoose } = require('mongoose')
const { keyboard } = require('telegraf/markup')
const runOCR = require('./services/OCR')
const parse = require('./parce/parsers')

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
`, {
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
`, { parse_mode: "Markdown" })
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
        const year = text[2] ? Number(text[2]) : now.getFullYear()

        const findAll = await axios.get(`${API_URL}/transactions/`, {
            params: {
                userId: ctx.from.id,
                month,
                year
            }
        })

        const data = findAll.data

        console.log(findAll)


        for (const item of data) {

            const deskripsi = item.description
            const category = item.category || "lainnya"
            const tanggal = new Date(item.createdAt)

            const jam = tanggal.getHours().toString().padStart(2, '0')
            const menit = tanggal.getMinutes().toString().padStart(2, '0')

            const formatingDate = tanggal.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })

            const total = Number(item.total || 0).toLocaleString('id-ID')

            const nama = ctx.from.first_name
            const pesan = `💳 *TRANSAKSI TERCATAT*
━━━━━━━━━━━━━━━━━━
👤 *User*    : ${nama}
📅 *Tanggal* : ${formatingDate}  
🕒 *Waktu*   : ${jam}:${menit} WIB  

🏷 *Kategori* : ${category}  
📝 *Deskripsi*: ${deskripsi}  

💰 *Nominal*  : Rp ${total}

━━━━━━━━━━━━━━━━━━`

            await ctx.reply(
                pesan, { parse_mode: "Markdown" }
            )
        }
    } catch (err) {
        console.error(err.message)
        ctx.reply('gagal mengambil semua data')
    }
}

bot.command('list', list)
bot.command('ls', list)

//Bot Add
const pendingInput = {}
const add = async (ctx) => {
    try {


        const match = ctx.match
        console.log(match)
        const description = match[1]
        const rawTotal = match[2]
        const total = Number(rawTotal.replace(/[.,]/g, ""))

        pendingInput[ctx.from.id] = {
            description,
            total
        }

        ctx.reply(`Pilih kategori`,
            Markup.inlineKeyboard([
                Markup.button.callback('Makan', 'cat_makanan'),
                Markup.button.callback('Transport', 'cat_transport'),
                Markup.button.callback('Belanja', 'cat_belanja')
            ])
        )
    } catch (err) {
        console.error(err)
        ctx.reply('terjadi kesalahan')
    }
}

bot.hears(/^(.+)\s([\d.,]+)$/, add)


bot.action(/cat_(.+)/, async (ctx) => {

    const userId = ctx.from.id
    const category = ctx.match[1]

    const data = pendingInput[userId]

    if (!data) return

    const { description, total } = data


    try {

        await axios.post(`${API_URL}/transactions`, {
            userId: ctx.from.id,
            description,
            total,
            category
        })

        console.log(description, total, category)
        delete pendingInput[userId]
        ctx.answerCbQuery()
        ctx.reply('Berhasil di catat')
    } catch (err) {
        console.error(err)
        console.log('eorro post')
    }
})


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

// boot foto
const pendingReceipt = {}
bot.on('photo', async (ctx) => {
    try {
        const photo = ctx.message.photo

        ctx.reply("Tunguu sebentar struk anda sedang di proses....")
        const fileId = photo[photo.length - 1].file_id

        const file = await ctx.telegram.getFile(fileId)
        const imgUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`

        const text = await runOCR(imgUrl)

        const items = parse(text)

        console.log(items)
        pendingReceipt[ctx.from.id] = items

        let message = "Hasil Pembacaan Struk"

        items.forEach((item, i) => {
            message += `
${i + 1}.Name:  ${item.name}\n`
            message += `Qty:  ${item.qty}\n`
            message += `Harga:  Rp.${item.harga.toLocaleString()}\n`
            message += `Total:  RP.${item.total.toLocaleString()}\n`
        })

        const grandTotal = items.reduce((a, b) => a + b.total, 0)
        message += `Total Semua : Rp.${grandTotal.toLocaleString()}`

        ctx.reply(message, {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                [Markup.button.callback('Simpan', 'ocr_save')],
                [
                Markup.button.callback('Edit', 'ocr_edit'),
                Markup.button.callback('Batal', 'ocr_cancel')
            ]])
        })

    } catch (err) {
        console.error(err)
    }
})

bot.action('ocr_save', async (ctx)=> {
    const data = pendingReceipt[ctx.from.id]

    if(!data) return ctx.reply("data tidak di temukan")

    for(const item of data) {
        await axios.post(`${API_URL}/transactions`, {
            userId: ctx.from.id,
            description: item.name,
            total: item.total,
            category:"belanja"
        })
    }

    delete pendingReceipt[ctx.from.id]

    ctx.reply("✅ transaksi berhasil disimpan")
})

bot.action('ocr_cancel', async (ctx) =>{
    delete pendingReceipt[ctx.from.id]

    ctx.reply('❌ transaksi dibatalkan')
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

