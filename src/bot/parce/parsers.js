
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

    const items = []

    for (const line of lines) {
        const upper = line.toUpperCase()

        if (ignore.some(word => upper.includes(word))) continue

        const match = line.match(/(.+?)\s+(\d+)\s+(\d+)\s+([\d.,]+)$/)

        if (match) {
            items.push({
                name: match[1].trim(),
                qty:Number(match[2]),
                harga:Number(match[3]),
                total: Number(match[4].replace(/[.,]/g, ""))
            })
        }
    }

    return items
}

module.exports = parse