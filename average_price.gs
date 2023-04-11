class AveragePrice {

  constructor(assetName){
    if( !assetName ){
      throw "Invalid asset name"
    }

    this.assetName = assetName
    this.totalAmount = -Number.MAX_VALUE;
    this.totalValue = -Number.MAX_VALUE
    this.avgPrice = -Number.MAX_VALUE
    this.optAvgPrice = -Number.MAX_VALUE
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

    if(assetCode.startsWith("EZTC")) {
      console.log(arguments)
    }
    switch(operationType){
      case 'Compra':
        if( this.firstBuy() ){
          this.totalAmount = amount
          this.totalValue = unitPrice * amount
          this.avgPrice = this.totalValue / this.totalAmount
          this.optAvgPrice = this.avgPrice 
        }
        else{
          this.totalAmount += amount
          this.totalValue += unitPrice * amount
          
          this.avgPrice = this.totalValue / this.totalAmount
          this.optAvgPrice = this.avgPrice
        }
        break;
      case 'Venda':   
        if( this.isCall(assetCode) ){
          // this.optAvgPrice -= unitPrice
          // throw "PArei aqui"
          //console.log("Venda de call: " + assetCode)
        } else if( this.isPut(assetCode) ){
          //console.log("Venda de Put: " + assetCode)
        }
        else{
          this.totalAmount += amount
          this.totalValue = this.totalValue / this.totalAmount
          if(assetCode == "BBSE3") console.log("BBSE: " + thistotalAmount)
        }
        break;
      default:
        throw "Unknown Operation: " + type
    }
  }


  isCall(assetCode){
    return assetCode.charCodeAt(4) && assetCode.charCodeAt(4) >= 54 && assetCode.charCodeAt(4) <= 76
  }

  isPut(assetCode){
    return assetCode.charCodeAt(4) && assetCode.charCodeAt(4) >= 77 && assetCode.charCodeAt(4) <= 90
  }

  hasBeenExercised(assetCode){
    return assetCode.endsWith('E')
  }

  firstBuy(){
    return this.totalAmount < 0
  }
}