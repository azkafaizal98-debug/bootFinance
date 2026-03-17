
const parse = (txt) => {
    const lines = txt.split('\n')

    const ignore = [
        'TOTAL',
        'TUNAI',
        'KEMBALI',
        'PPN',
        'VOUCHER',
        'DISKON'
    ]

    let items = []
    let lastItmes = null
    try {

        for (const line of lines) {

            const upper = line.toUpperCase()
            const voucherMatch = line.match(/VOUCHER\s*:\s*\(([\d.,]+)\)/)

            if (voucherMatch && lastItmes) {
                const voucher = Number(voucherMatch[1].replace(/[.,]/g, ""))

                lastItmes.voucher = voucher
                lastItmes.total = lastItmes.total - voucher
            }

            const diskonMatch = line.match(/DISKON\s*:\s*\(([\d.,]+)\)/)

            if(diskonMatch && lastItmes) {
                const diskon = Number(diskonMatch[1].replace(/[.,]/g, ""))

                lastItmes.diskon = diskon
                lastItmes.total = lastItmes.total - diskon
            }

            if (ignore.some(word => upper.includes(word))) continue

            const itemMatch = line.match(/(.+?)\s+(\d+)\s+(\d+)\s+([\d.,]+)$/)

            if (itemMatch) {
                const item = {
                    name: itemMatch[1].trim(),
                    qty: Number(itemMatch[2]),
                    harga: Number(itemMatch[3]),
                    total: Number(itemMatch[4].replace(/[.,]/g, "")),
                    voucher: 0,
                    diskon: 0
                }
                items.push(item)
                lastItmes = item
            }
        }

        return items
    } catch (err) {
        console.error('tidak dapat di jalankan', err)
    }
}

module.exports = parse