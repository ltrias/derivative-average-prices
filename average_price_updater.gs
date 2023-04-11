const DATA_SHEET_NAME = 'Dados para Preços Médios'

const ASSET_TYPE_COLUMN = 7
const TERM_TYPE_COLUMN = 15
const ASSET_CODE_COLUMN = 6
const DATE_COLUMN = 0;
const OPERATION_TYPE_COLUMN = 10;
const AMOUNT_COLUMN = 8;
const COST_DEDUCTED_PRICE_COLUMN = 12;


const OPTIONS_ASSET_NAME = "Opções"
const ASSET_TYPES = ['Ações', 'ETF', OPTIONS_ASSET_NAME]
const VALID_TERM_TYPE = 'Normal'

const PRESENTATION_SHEET_NAME = 'New Preços Médios'
const PRESENTATION_SHEET_HEADER = ["Ativo", "Preço Médio", "Preço Médio Sintético"]

function updateAveragePrice() {
  console.info("Updating average price...")

  var data = extractData(DATA_SHEET_NAME)
  var avgPrices = calculateAveragePrices(data)
  updateSheet(avgPrices)

  console.warn("REMOVER DEBUG USANDO AGRO3")
  console.info("Done!")
}

function extractData(sheet){
  const rawData = SpreadsheetApp.getActive().getSheetByName(sheet)  

  if( rawData == null ){
    console.error("Could not find sheet: " + sheet)

    return
  }

  var data = filterAssetTypes(rawData)
  var tradedOptionsAssets = filterAssetsWithTradedOptions(data)

  var result = new Map()

  for(const a of tradedOptionsAssets){
    result.set(a, new Array())
  }

  for(const d of data){
    const assetCode = d[ASSET_CODE_COLUMN].substring(0, 4)

    if( tradedOptionsAssets.has(assetCode) )
      result.get(assetCode).push(d)
  }

  return result
}

function calculateAveragePrices(data){
  var result = new Map();

  for(const [a, o] of data){
    result.set(a, calculateAveragePrice(a, o))
  }

  return result
}

function calculateAveragePrice(asset, events){
  var result = new AveragePrice(asset);

  for(e of events){
    result.addOperation(e[DATE_COLUMN], e[OPERATION_TYPE_COLUMN], e[ASSET_CODE_COLUMN], e[AMOUNT_COLUMN], e[COST_DEDUCTED_PRICE_COLUMN])
  }

  return result
}

function updateSheet(avgPrices){
  var presSheet = SpreadsheetApp.getActive().getSheetByName(PRESENTATION_SHEET_NAME)

  presSheet.clear();
  writeHeader(presSheet);
  writeValues(presSheet, avgPrices);
  presSheet.getRange("A2:Z").sort(1)
}

function writeHeader(s){
  var h = s.getRange(1, 1, 1, 100)
  h.setFontWeight("bold")
  h.setHorizontalAlignment("center")

  s.getRange("A1:C1").setValues([PRESENTATION_SHEET_HEADER])

}

function writeValues(s, v){
  s.getRange("B:C").setNumberFormat("R$ ???0.00")
  
  var i = 2
  for(const [a, d] of v){
    s.getRange("A" + i).setValue(a)
    s.getRange("B" + i).setValue(d.avgPrice)
    
    s.getRange("C" + i).setValue(d.optAvgPrice)
    i++
  }
}

function filterAssetsWithTradedOptions(data){
  var result = new Set();
  
  for(const d of data.filter(dd => isOption(dd))){
    result.add(d[ASSET_CODE_COLUMN].substring(0, 4))
  }

  console.warn("REMOVER DEBUG USANDO AGRO3")
  result.add("AGRO")

  return result
}

function filterAssetTypes(rawData){
  return rawData.getRange("A:Z").getValues().filter(i => ASSET_TYPES.includes(i[ASSET_TYPE_COLUMN]) && i[TERM_TYPE_COLUMN] == VALID_TERM_TYPE)
}

function isOption(d){
  return d[ASSET_TYPE_COLUMN] == OPTIONS_ASSET_NAME
}