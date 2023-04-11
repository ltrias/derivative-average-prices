class AveragePrice {

  constructor(assetName){
    if( !assetName ){
      throw "Invalid asset name"
    }

    this.assetName = assetName
    this.totalAmount = 0;
    this.totalValue = 0
    this.avgPrice = 0
    this.optAvgPrice = 0
    this.operationLog = new Map()
  }

  /*
  Casos de opções:
    - negociação ( venda e compra mesma opção)
    - opções com mais de uma operação( calcular PM da opção?)
    - negociações parciais, venda < que o total de ativos possuído


    - venda coberta de call com exercício -> gera venda, PM zera 
    - venda coberta de call sem exercício -> muda PM sintético. Planilha não traz valor abatido. Marcado com E no final, nao aparece ativo
    - venda coberta de put com exercício -> gera compra, abate valor prêmio da opção do PM do ativo. Planilha não traz valor abatido. Marcado com E no final, nao aparece ativo
    - venda coberta de put sem exercício -> muda PM sintético
    - compra coberta de call com exercício -> nao tratar
    - compra coberta de call sem exercício -> nao tratar
    - compra coberta de put com exercício -> nao tratar
    - compra coberta de put sem exercício -> nao tratar
  */
  addOperation(date, operationType, assetCode, amount, unitPrice){
    if( (amount <= 0 && operationType == "Compra") || (amount >= 0 && operationType == "Venda") ){
      throw "Operação e/ou quantidade inválida"
    }

    this.operationLog.set(assetCode, {arguments})

    if(assetCode.startsWith("EZTC")) {
      console.log(arguments)
    }
    switch(operationType){
      case 'Compra':
        if( this.firstBuy() ){
          this.totalAmount = amount
          this.optAvgPrice += unitPrice
          this.avgPrice = this.optAvgPrice 
          this.totalValue = this.avgPrice * this.totalAmount
        }
        else{
          this.totalAmount += amount
          this.totalValue += unitPrice * this.totalAmount
          
          this.avgPrice = this.totalValue / this.totalAmount
          this.optAvgPrice = this.avgPrice
        }
        break;
      case 'Venda':
        if( this.isCall(assetCode) ){
          // this.optAvgPrice -= unitPrice
          // throw "PArei aqui"
          console.log("Venda de call: " + assetCode)
        } else if( this.isPut(assetCode) ){
          // console.log("Venda de Put: " + assetCode)
          // this.totalAmount += amount
          // this.totalValue += unitPrice * amount
          
          // this.avgPrice = this.totalValue / this.totalAmount
          this.optAvgPrice -= unitPrice
        }
        else{
          this.totalAmount += amount
          this.totalValue = this.totalValue / this.totalAmount

          if ( this.totalAmount == 0 ){
            this.totalValue = 0
            this.avgPrice = 0
            this.optAvgPrice = 0
          }else{
            this.totalValue = this.avgPrice * this.totalAmount
          }
        }
        break;
      default:
        throw "Unknown Operation: " + type
    }
  }


  isCall(assetCode){
    return assetCode.charCodeAt(4) && assetCode.charCodeAt(4) >= 65 && assetCode.charCodeAt(4) <= 76
  }

  isPut(assetCode){
    return assetCode.charCodeAt(4) && assetCode.charCodeAt(4) >= 77 && assetCode.charCodeAt(4) < 90
  }

  hasBeenExercised(assetCode){
    return assetCode.endsWith('E')
  }

  firstBuy(){
    return this.totalAmount == 0
  }
}

module.exports = AveragePrice