const tesseract = require('tesseract.js')

async function runOCR(imgUrl) {
    const result = await tesseract.recognize(
        imgUrl, 'eng'
    )
    return result.data.text
}

module.exports = runOCR