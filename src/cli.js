import commander from 'commander'
import fs from 'fs'
import snakeCase from 'lodash/snakeCase'
import { denormalise, groupEntitiesByLayer, parseString, toSVG } from './'
import PDFDocument from './pdfkit.standalone'
import svg2pdf from 'svg-to-pdfkit'
import { parse } from 'path'

commander
  .version(require('../package.json').version)
  .description('Converts a dxf file to a svg file.')
  .arguments('<dxfFile> <svgFile')
  .option('-v --verbose', 'Verbose output')
  .action((dxfFile, svgFile, options) => {
    const parsed = parseString(fs.readFileSync(dxfFile, 'utf-8'))
    const groups = groupEntitiesByLayer(denormalise(parsed))
    const layers = Object.keys(groups)
    const normalizedLayers = ['print_1', 'print_2', 'print_3']
    const fileName = svgFile.split('.').slice(0, -1).join('.');

    const x = parsed.header.extMax.x;
    const y = parsed.header.extMax.y;
    var i = 0;
    layers.forEach(layer => {
      const normalizedLayer = snakeCase(layer)
      if (!normalizedLayers.includes(normalizedLayer)) {
        return
      }

      const entities = parsed.entities.filter(entity => [layer, 'SHEET'].includes(entity.layer))

      const parsedPerLayer = {
        ...parsed,
        entities: entities.reverse()
      }

      const size = { w: 0, h: 0 }
      const svg = toSVG(parsedPerLayer, normalizedLayer, size)

      // fs.writeFileSync(`${fileName + '-' + layer}.svg`, svg, 'utf-8')

      if(i == 0)
      {
        i = 1;
        continue;
      }
      const pixelPerInch = 72
      // const inchPerFeet = 12
      // const ratio = size.h / size.w
      // const ratio = Math.round(size.h / size.w)

      const doc = new PDFDocument({
        size: [x * pixelPerInch , y * pixelPerInch],
      });
      const stream = fs.createWriteStream(`${fileName + '-' + layer}.pdf`);
      svg2pdf(doc, svg, 0, 0);
      doc.pipe(stream);
      doc.end();
    })

    if (options.verbose) {
   //   console.log('[layer : number of entities]')
      layers.forEach(layer => {
    //    console.log(`${layer} : ${groups[layer].length}`)
      })
    }

    fs.writeFileSync(svgFile || `${fileName}.svg`, toSVG(parsed), 'utf-8')
  })
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  commander.help()
}
