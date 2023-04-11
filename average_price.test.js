const AveragePrice = require('./average_price');

describe('Average Price construction', () =>{
    test('AP should know its asset name', () => {
        expect(new AveragePrice("ABCD").assetName).toBe("ABCD");
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
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "ABCD", 1000, 15.00)
        expect(ap.avgPrice).toBe(15.00);
        expect(ap.optAvgPrice).toBe(15.00);
        expect(ap.totalAmount).toBe(1000);
        expect(ap.totalValue).toBe(15000);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });
    
    test('Total sell should zero all values', () => {
        var ap = new AveragePrice("ABCD")
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "ABCD", 1000, 15.00)
        ap.addOperation(Date.parse('02 Jan 1970 00:00:00 GMT'), "Venda", "ABCD", -1000, 0.00)
        expect(ap.totalAmount).toBe(0);
        expect(ap.totalValue).toBe(0);
        expect(ap.avgPrice).toBe(0);
        expect(ap.optAvgPrice).toBe(0);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });

    test('Many buys should should update average price', () => {
        var ap = new AveragePrice("ABCD")
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "ABCD", 100, 10.00)
        ap.addOperation(Date.parse('02 Jan 1970 00:00:00 GMT'), "Compra", "ABCD", 100, 11.00)
        expect(ap.totalAmount).toBe(200);
        expect(ap.totalValue).toBe(2100);
        expect(ap.avgPrice).toBe(10.50);
        expect(ap.optAvgPrice).toBe(10.50);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });

    test('Partial sell should keep average price and update total value', () => {
        var ap = new AveragePrice("ABCD")
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "ABCD", 200, 10.50)
        ap.addOperation(Date.parse('02 Jan 1970 00:00:00 GMT'), "Venda", "ABCD", -50, 12.00)
        expect(ap.totalAmount).toBe(150);
        expect(ap.totalValue).toBe(1575);
        expect(ap.avgPrice).toBe(10.50);
        expect(ap.optAvgPrice).toBe(10.50);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(0);
    });

    test('New buys after total sell should recalculate all values', () => {
        var ap = new AveragePrice("ABCD")
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "ABCD", 1000, 15.00)
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Venda", "ABCD", -1000, 0.00)
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "ABCD", 200, 10.50)
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Venda", "ABCD", -50, 12.00)
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
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Venda", "EZTCX160", -1000, 0.7168)
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "EZTCX160E", 1000, 15.8055)
        expect(ap.avgPrice).toBeCloseTo(15.0886, 3)
        expect(ap.optAvgPrice).toBeCloseTo(15.0886, 3) 
        expect(ap.totalAmount).toBe(1000)
        expect(ap.totalValue).toBeCloseTo(15088.6, 0)
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(716.8);
    });

    test('Aditional buy through put exercise should update both average prices', () => {
        var ap = new AveragePrice("EZTC")
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "EZTC", 1000, 15.00)
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Venda", "EZTCX160", -1000, 0.05)
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "EZTCX160E", 1000, 14.00)
        expect(ap.avgPrice).toBe(14.475);
        expect(ap.optAvgPrice).toBe(14.475);
        expect(ap.totalAmount).toBe(2000);
        expect(ap.totalValue).toBe(15000 + 13950);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(50);
    });

    test('Non exercised put should change only synth average prices', () => {
        var ap = new AveragePrice("EZTC")
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "EZTC", 1000, 15.00)
        ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Venda", "EZTCX160", -1000, 0.03)
        expect(ap.avgPrice).toBe(14.97);
        expect(ap.optAvgPrice).toBe(14.97);
        expect(ap.totalAmount).toBe(1000);
        expect(ap.totalValue).toBe(14970);
        expect(ap.callReceivedValue).toBe(0);
        expect(ap.putReceivedValue).toBe(30);
    });
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

    test.skip('', () => {
        var ap = new AveragePrice("ABCD")
        // ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "ABCD", 1000, 15.00)
        // expect(ap.avgPrice).toBe(15.00);
        // expect(ap.optAvgPrice).toBe(15.00);
        // expect(ap.totalAmount).toBe(1000);
        // expect(ap.totalValue).toBe(15000);
        // expect(ap.callReceivedValue).toBe(0);
        // expect(ap.putReceivedValue).toBe(0);
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
            new AveragePrice("ABCD").addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "ABCD", -1000, 15.00)
        }

        function sell_wrapper(){
            new AveragePrice("ABCD").addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Venda", "ABCD", 1000, 15.00)
        }

        expect(buy_wrapper).toThrow()
        expect(sell_wrapper).toThrow()
    })

    test.skip('', () => {
        var ap = new AveragePrice("ABCD")
        // ap.addOperation(Date.parse('01 Jan 1970 00:00:00 GMT'), "Compra", "ABCD", 1000, 15.00)
        // expect(ap.avgPrice).toBe(15.00);
        // expect(ap.optAvgPrice).toBe(15.00);
        // expect(ap.totalAmount).toBe(1000);
        // expect(ap.totalValue).toBe(15000);
    });
})



test('', () => {
    expect(new AveragePrice("ABCD").avgPrice).toBe(0);
})
