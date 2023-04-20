class AveragePrice {

  constructor(assetName){
    if( !assetName ){
      throw "Invalid asset name"
    }

    this.assetName = assetName
    this.totalAmount = 0;

    this.totalValue = 0
    this.avgPrice = 0
    
    this.optTotalValue = 0
    this.optAvgPrice = 0
    
    this.callReceivedValue = 0
    this.putReceivedValue = 0

    this.operationLog = new Map() //may be unnecessary
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
    if( (amount <= 0 && operationType == "Compra") || (amount >= 0 && operationType == "Venda") || assetCode.substring(0, 4) != this.assetName ){
      throw "Operação, quantidade ou ativo inválidos: " + JSON.stringify(arguments)
    }

    this.logOperation(date);

    switch(operationType){
      case 'Compra':
        if( this.isPut(assetCode) && !this.hasBeenExercised(assetCode) ){
          this.putReceivedValue -= amount * unitPrice
          this.optAvgPrice += unitPrice 
          this.optTotalValue = this.totalAmount * this.optAvgPrice
        }else{
          if( this.firstBuy() ){
            this.totalAmount = amount
            this.optAvgPrice += unitPrice
            this.avgPrice = this.optAvgPrice 
            this.totalValue = this.avgPrice * this.totalAmount
            this.optTotalValue = this.totalValue
          }
          else{
            var lastAmount = this.totalAmount
            this.totalAmount += amount
            this.totalValue += unitPrice * amount
            this.optTotalValue += unitPrice * amount
            
            this.avgPrice = this.totalValue / this.totalAmount
            this.optAvgPrice = this.optTotalValue / this.totalAmount
            this.optTotalValue = this.optAvgPrice * this.totalAmount
          }
        }
        break;
      case 'Venda':
        if( this.isCall(assetCode) ){
          if( this.hasBeenExercised(assetCode)){
            this.totalAmount += amount;
            this.totalValue = 0
            this.avgPrice = 0
            this.optTotalValue = 0
            this.optAvgPrice = 0
          }else{
            this.callReceivedValue += Math.abs(amount) * unitPrice
            this.optAvgPrice -= unitPrice
            this.optTotalValue = this.totalAmount * this.optAvgPrice
          }
        } else if( this.isPut(assetCode) ){
          this.putReceivedValue += Math.abs(amount) * unitPrice
          this.optAvgPrice -= unitPrice
          this.totalValue = this.totalAmount * this.avgPrice
          this.optTotalValue = this.totalAmount * this.optAvgPrice
        }
        else{
          this.totalAmount += amount
          this.totalValue = this.totalValue / this.totalAmount

          if ( this.totalAmount == 0 ){
            this.totalValue = 0
            this.avgPrice = 0
            this.optAvgPrice = 0
            this.optTotalValue = 0
          }else{
            this.totalValue = this.avgPrice * this.totalAmount
            this.optTotalValue = this.optAvgPrice * this.totalAmount
          }
        }
        break;
      default:
        throw "Unknown Operation: " + type
    }
  }


  logOperation(date) {
    var k = date.getMonth() + "-" + date.getFullYear();
    var v = this.operationLog.get(k);
    if (!v) {
      v = new Array();
    }
    v.push(arguments);
    this.operationLog.set(k, v);
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