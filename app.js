const puppeteer = require('puppeteer');
const fs = require('fs')
const path = require('path');
const { argv } = require('process');

const folderPath = path.join(process.cwd(), 'htmlFiles')
const imageFolderPath = path.join(process.cwd(), 'images')

const csvPath = argv[2]

if(!fs.existsSync(folderPath)) fs.mkdirSync(folderPath)
if(!fs.existsSync(imageFolderPath)) fs.mkdirSync(imageFolderPath)

const rows = fs.readFileSync(csvPath).toString().split("\n").map(ln => ln.split(','))

const chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    )

let i = 0
const paths = []

for(const [ url, num ] of rows) {
    const initArray = chunk(new Array(parseInt(num)).fill(url), 5)
    const str = initArray.map(arr => {
        return `<div style="margin-top: 0.3%; width: 100%; align-self: center">${arr.map(_ => `<img style="width: 19%; margin-left: 0.5%" src=${url}/>`).join("\n")}</div>`
    }).join("\n")
    const div = `<body style="margin: 0">
        <div style="width: 100vw; display: flex; flex-direction: column">${str}</div>
    </body>`
    const currPath = path.join(folderPath, `${i+1}.html`)
    fs.writeFileSync(currPath, div)
    paths.push(currPath)
    i++
}

(async function() {

  const browser = await puppeteer.launch();
  const page = await browser.newPage()
  try {
    let i = 0
    for(const currPath of paths) {
        await page.goto(currPath, { waitUntil: 'networkidle0' });
        // await page.waitFor(1000)
        const base64img = await page.screenshot({
          path: path.join(imageFolderPath, `${i+1}.png`),
          fullPage: true,
        });
        // fs.writeFileSync(, base64img, 'base64')
        i++
        console.log(`Screenshoted ${i} rows`)
    }
  } finally {
    await browser.close();
  }

})();