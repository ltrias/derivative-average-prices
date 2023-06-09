const AveragePrice = require('./average_price');

describe('Average Price construction', () =>{
    test('AP should know its asset name', () => {
        expect(new AveragePrice("ABCD").assetName).toBe("ABCD");
    });
    test('AP throw when adding operation of other asset', () => {
        function operation_wrapper(){
            new AveragePrice("XPTO").addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "ABCD", 1000, 15.00)
        }

        expect(operation_wrapper).toThrow()
    });
    
    test('Eventless average price should be 0', () => {
        expect(new AveragePrice("ABCD").avgPrice).toBe(0);
    });
    
    test('Eventless synthetic average price should be 0', () => {
        expect(new AveragePrice("ABCD").optAvgPrice).toBe(0);
    });
    
    test('Eventless average price should not have amount', () => {
        expect(new AveragePrice("ABCD").totalAmount).toBe(0);
    });
    
    test('Eventless average price should not have total value', () => {
        expect(new AveragePrice("ABCD").totalValue).toBe(0);
    });

    test('Eventless average price should not have put received value', () => {
        expect(new AveragePrice("ABCD").callReceivedValue).toBe(0);
    });

    test('Eventless average price should not have call received value', () => {
        expect(new AveragePrice("ABCD").putReceivedValue).toBe(0);
    });
})

describe('No derivative operations', () =>{
    test('Validate single buy', () => {
        var ap = new AveragePrice("ABCD")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "ABCD", 1000, 15.00)
        expect(ap.totalAmount).toBe(1000);
        expect(ap.totalValue).toBe(15000);
        expect(ap.avgPrice).toBe(15.00);
        expect(ap.optAvgPrice).toBe(15.00);
        expect(ap.optTotalValue).toBe(15000);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });
    
    test('Total sell should zero all values', () => {
        var ap = new AveragePrice("ABCD")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "ABCD", 1000, 15.00)
        ap.addOperation(new Date('02 Jan 1970 00:00:00 GMT-3'), "Venda", "ABCD", -1000, 0.00)
        expect(ap.totalAmount).toBe(0);
        expect(ap.totalValue).toBe(0);
        expect(ap.avgPrice).toBe(0);
        expect(ap.optTotalValue).toBe(0);
        expect(ap.optAvgPrice).toBe(0);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });

    test('Many buys should should update average price', () => {
        var ap = new AveragePrice("ABCD")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "ABCD", 100, 10.00)
        ap.addOperation(new Date('02 Jan 1970 00:00:00 GMT-3'), "Compra", "ABCD", 100, 11.00)
        expect(ap.totalAmount).toBe(200);
        expect(ap.totalValue).toBe(2100);
        expect(ap.avgPrice).toBe(10.50);
        expect(ap.optTotalValue).toBe(2100);
        expect(ap.optAvgPrice).toBe(10.50);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });

    test('Partial sell should keep average price and update total value', () => {
        var ap = new AveragePrice("ABCD")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "ABCD", 200, 10.50)
        ap.addOperation(new Date('02 Jan 1970 00:00:00 GMT-3'), "Venda", "ABCD", -50, 12.00)
        expect(ap.totalAmount).toBe(150);
        expect(ap.totalValue).toBe(1575);
        expect(ap.avgPrice).toBe(10.50);
        expect(ap.optTotalValue).toBe(1575);
        expect(ap.optAvgPrice).toBe(10.50);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });

    test('New buys after total sell should recalculate all values', () => {
        var ap = new AveragePrice("ABCD")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "ABCD", 1000, 15.00)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "ABCD", -1000, 0.00)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "ABCD", 200, 10.50)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "ABCD", -50, 12.00)
        expect(ap.totalAmount).toBe(150);
        expect(ap.totalValue).toBe(1575);
        expect(ap.avgPrice).toBe(10.50);
        expect(ap.optAvgPrice).toBe(10.50);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });
})

describe('Put Operations', () => {
    test('Valid assset codes', () => {
        var ap = new AveragePrice("ABCD")

        expect(ap.isPut('')).toBeFalsy()
        expect(ap.isPut('ABCD')).toBeFalsy()
        expect(ap.isPut('ABCD4')).toBeFalsy()
        expect(ap.isPut('ABCDA123')).toBeFalsy()
        expect(ap.isPut('ABCDL123')).toBeFalsy()
        expect(ap.isPut('ABCDM123')).toBeTruthy()
        expect(ap.isPut('ABCDR123')).toBeTruthy()
        expect(ap.isPut('ABCDX123')).toBeTruthy()
        expect(ap.isPut('ABCDZ123')).toBeFalsy()
    });

    test('Single buy with put exercise both average prices should be changed and equal ', () => {
        var ap = new AveragePrice("EZTC")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCX160", -1000, 0.7168)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTCX160E", 1000, 15.8055)
        expect(ap.totalAmount).toBe(1000)
        expect(ap.totalValue).toBeCloseTo(15088.6, 0)
        expect(ap.avgPrice).toBeCloseTo(15.0886, 3)
        expect(ap.optTotalValue).toBeCloseTo(15088.6, 0);
        expect(ap.optAvgPrice).toBeCloseTo(15.0886, 3) 
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(716.8);
    });

    test('Put sell should change put received value ', () => {
        var ap = new AveragePrice("EZTC")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCX160", -1000, 1)

        expect(ap.putReceivedValue).toBe(1000);
    });

    test('Aditional buy through put exercise should update both average prices', () => {
        var ap = new AveragePrice("EZTC")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTC", 1000, 15.00)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCX160", -1000, 0.05)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTCX160E", 1000, 14.00)
        expect(ap.totalAmount).toBe(2000);
        expect(ap.totalValue).toBe(29000);
        expect(ap.avgPrice).toBe(14.50);
        expect(ap.optTotalValue).toBe(28950);
        expect(ap.optAvgPrice).toBe(14.475);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(50);
    });

    test('Non exercised put should change only synth average prices', () => {
        var ap = new AveragePrice("EZTC")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTC", 1000, 15.00)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCX160", -1000, 0.03)
        expect(ap.totalAmount).toBe(1000);
        expect(ap.avgPrice).toBe(15.00);
        expect(ap.totalValue).toBe(15000);
        expect(ap.optAvgPrice).toBe(14.97);
        expect(ap.optTotalValue).toBe(14970);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(30);
    });

    test('Put buyback on same value should not change average prices ', () => {
        var ap = new AveragePrice("EZTC")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTC", 1000, 15.00)
        ap.addOperation(new Date('01 Jan 1971 00:00:00 GMT-3'), "Venda", "EZTCX160", -1000, 0.03)
        ap.addOperation(new Date('02 Jan 1971 00:00:00 GMT-3'), "Compra", "EZTCX160", 1000, 0.03)
        expect(ap.totalAmount).toBe(1000);
        expect(ap.totalValue).toBe(15000);
        expect(ap.avgPrice).toBe(15.00);
        expect(ap.optTotalValue).toBe(15000);
        expect(ap.optAvgPrice).toBe(15.00);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });


    test('Put buyback on same value without underlying asset should not change average prices', () => {
        var ap = new AveragePrice("EZTC")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCX160", -1000, 0.03)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTCX160", 1000, 0.03)
        expect(ap.totalAmount).toBe(0);
        expect(ap.totalValue).toBe(0);
        expect(ap.avgPrice).toBe(0);
        expect(ap.optTotalValue).toBeCloseTo(0, 0);
        expect(ap.optAvgPrice).toBe(0);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });

    test('Put buyback on different values should change synth average price', () => {
        var ap = new AveragePrice("EZTC")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTC", 1000, 15.00)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCX160", -1000, 0.03)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTCX160", 1000, 0.02)
        expect(ap.totalAmount).toBe(1000);
        expect(ap.totalValue).toBe(15000);
        expect(ap.avgPrice).toBe(15.00);
        expect(ap.optTotalValue).toBe(14990);
        expect(ap.optAvgPrice).toBe(14.99);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(10);
    });

    
    test('Put buyback on different values without underlying asset should change synth average price', () => {
        var ap = new AveragePrice("EZTC")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCX160", -1000, 0.03)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTCX160", 1000, 0.02)
        expect(ap.totalAmount).toBe(0);
        expect(ap.totalValue).toBe(0);
        expect(ap.avgPrice).toBeCloseTo(0, 0);
        expect(ap.optTotalValue).toBeCloseTo(0, 0);
        expect(ap.optAvgPrice).toBeCloseTo(0, 0);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(10);
    });

    test.todo('Implement plain put buy')

})


describe('Call Operations', () =>{
    test('Valid assset codes', () => {
        var ap = new AveragePrice("ABCD")

        expect(ap.isCall('')).toBeFalsy()
        expect(ap.isCall('ABCD')).toBeFalsy()
        expect(ap.isCall('ABCD4')).toBeFalsy()
        expect(ap.isCall('ABCDA123')).toBeTruthy()
        expect(ap.isCall('ABCDH123')).toBeTruthy()
        expect(ap.isCall('ABCDL123')).toBeTruthy()
        expect(ap.isCall('ABCDM123')).toBeFalsy()
        expect(ap.isCall('ABCDX123')).toBeFalsy()
    });

    test('Call sell should change call received value ', () => {
        var ap = new AveragePrice("EZTC")
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCA160", -1000, 1)

        expect(ap.callReceivedValue).toBe(1000);
    });

    test('Single call sell should change only synth average price', () => {
        var ap = new AveragePrice("EZTC")

        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTC3", 1000, 1.50)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCA160", -1000, 0.02)
        expect(ap.totalAmount).toBe(1000);
        expect(ap.totalValue).toBe(1500);
        expect(ap.avgPrice).toBe(1.50);
        expect(ap.optTotalValue).toBe(1480);
        expect(ap.optAvgPrice).toBeCloseTo(1.48, 3);
        expect(ap.callReceivedValue).toBe(20);
        expect(ap.putReceivedValue).toBe(0);
    });

    test('Multiple call sells ', () => {
        var ap = new AveragePrice("TRPL")

        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "TRPL4", 300, 2.00)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "TRPLK245", -300, 0.02)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "TRPLL245", -300, 0.03)
        expect(ap.totalAmount).toBe(300);
        expect(ap.totalValue).toBe(600);
        expect(ap.avgPrice).toBe(2.00);
        expect(ap.optTotalValue).toBe(585);
        expect(ap.optAvgPrice).toBeCloseTo(1.95);
        expect(ap.callReceivedValue).toBe(15);
        expect(ap.putReceivedValue).toBe(0);
    });

    test('Exercised call should zero values', () => {
        var ap = new AveragePrice("TRPL")

        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "TRPL4", 300, 2.00)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "TRPLL245", -300, 0.02)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "TRPLL245E", -300, 1.50)
        expect(ap.totalAmount).toBe(0);
        expect(ap.totalValue).toBe(0);
        expect(ap.avgPrice).toBe(0);
        expect(ap.optTotalValue).toBe(0);
        expect(ap.optAvgPrice).toBeCloseTo(0);
        expect(ap.callReceivedValue).toBe(6);
        expect(ap.putReceivedValue).toBe(0);
    });

    test.skip('Partial sell', () => {
        throw "To bem implemented..."
    });

    test('Call buyback on same value should not change average prices ', () => {
        var ap = new AveragePrice("EZTC")

        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTC3", 1000, 1.50)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCA160", -1000, 0.02)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTCA160", 1000, 0.02)
        expect(ap.totalAmount).toBe(1000);
        expect(ap.totalValue).toBe(1500);
        expect(ap.avgPrice).toBe(1.50);
        expect(ap.optTotalValue).toBe(1500);
        expect(ap.optAvgPrice).toBe(1.50);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });


    test('Call buyback on same value without underlying asset should not change average prices', () => {
        var ap = new AveragePrice("EZTC")

        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCA160", -1000, 0.02)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTCA160", 1000, 0.02)
        expect(ap.totalAmount).toBe(0);
        expect(ap.totalValue).toBe(0);
        expect(ap.avgPrice).toBe(0);
        expect(ap.optTotalValue).toBe(0);
        expect(ap.optAvgPrice).toBe(0);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });

    test('Call buyback on different values should change synth average price', () => {
        var ap = new AveragePrice("EZTC")

        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTC3", 1000, 1.50)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCA160", -1000, 0.02)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTCA160", 1000, 0.05)
        expect(ap.totalAmount).toBe(1000);
        expect(ap.totalValue).toBe(1500);
        expect(ap.avgPrice).toBe(1.50);
        expect(ap.optTotalValue).toBe(1530);
        expect(ap.optAvgPrice).toBe(1.53);
        expect(ap.callReceivedValue).toBe(-30);
        expect(ap.putReceivedValue).toBe(0);
    });

    
    test('Put buyback on different values  without underlying asset should change synth average price', () => {
        var ap = new AveragePrice("EZTC")

        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "EZTCA160", -1000, 0.02)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "EZTCA160", 1000, 0.05)
        expect(ap.totalAmount).toBe(0);
        expect(ap.totalValue).toBe(0);
        expect(ap.avgPrice).toBe(0);
        expect(ap.optTotalValue).toBe(0);
        expect(ap.optAvgPrice).toBeCloseTo(0.03, 3);
        expect(ap.callReceivedValue).toBe(-30);
        expect(ap.putReceivedValue).toBe(0);
    });
})



describe('Call and Put Mixed Operations', () =>{
    test('Valid assset codes', () => {
        var ap = new AveragePrice("ABCD")

        expect(ap.hasBeenExercised('')).toBeFalsy()
        expect(ap.hasBeenExercised('ABCD')).toBeFalsy()
        expect(ap.hasBeenExercised('ABCD4')).toBeFalsy()
        expect(ap.hasBeenExercised('ABCDA123')).toBeFalsy()
        expect(ap.hasBeenExercised('ABCDA123E')).toBeTruthy()
        expect(ap.hasBeenExercised('ABCDM123')).toBeFalsy()
        expect(ap.hasBeenExercised('ABCDM123E')).toBeTruthy()
        expect(ap.hasBeenExercised('ABCDX123')).toBeFalsy()
    });

    test('Invalid operation and amounts should throw error', () => {
        function buy_wrapper(){
            new AveragePrice("ABCD").addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "ABCD", -1000, 15.00)
        }

        function sell_wrapper(){
            new AveragePrice("ABCD").addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "ABCD", 1000, 15.00)
        }

        expect(buy_wrapper).toThrow()
        expect(sell_wrapper).toThrow()
    })

    test('Call and put sell on same month with underlying asset without exercise', () => {
        var ap = new AveragePrice("TRPL")

        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Compra", "TRPL4", 300, 2.00)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "TRPLL245", -300, 0.02)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "TRPLX245", -300, 1.50)
        expect(ap.totalAmount).toBe(300);
        expect(ap.totalValue).toBe(600);
        expect(ap.avgPrice).toBe(2.00);
        expect(ap.optTotalValue).toBe(144.00);
        expect(ap.optAvgPrice).toBeCloseTo(0.48);
        expect(ap.callReceivedValue).toBe(6);
        expect(ap.putReceivedValue).toBe(450);
    });

    test('Call and put sell on same month without underlying asset without exercise', () => {
        var ap = new AveragePrice("TRPL")

        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "TRPLL245", -300, 0.02)
        ap.addOperation(new Date('01 Jan 1970 00:00:00 GMT-3'), "Venda", "TRPLX245", -300, 1.50)
        expect(ap.totalAmount).toBe(300);
        expect(ap.totalValue).toBe(600);
        expect(ap.avgPrice).toBe(2.00);
        expect(ap.optTotalValue).toBe(144.00);
        expect(ap.optAvgPrice).toBeCloseTo(0.48);
        expect(ap.callReceivedValue).toBe(6);
        expect(ap.putReceivedValue).toBe(450);
    });

    test.skip('Asset buy with put exercise and call sell without exercise on same month', () => {
        throw "To bem implemented..."
    });

    test.skip('Asset buy with put exercise and call exercise on same month', () => {
        throw "To bem implemented..."
    });
})