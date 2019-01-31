const ccxt = require('ccxt');
const _ = require('lodash')


exports.initExchange = async (exchange) => {
    try {

        return new ccxt[exchange]({
            'commonCurrencies': {
                'USD': 'USD',
                'USDT': 'USD',
            },
        });

    } catch (e) {

        return null
    }
}


exports.orderBook = async (exchange, market) => {
    try {
        let orders = await exchange.fetchOrderBook(market);

        if (orders == undefined) {
            return null
        } else {
            return orders
        }
    } catch (err) {

        console.log(`${exchange.name} Exchange query error`);
        return 0
    }
};


exports.bestPrice = async (totalVolume, pair) => {
    try {
        //let exchanges = ccxt.exchanges
        //console.log(exchanges)
        let quote = pair.slice(0, -3)
        let base = pair.slice(-3)
        pair = quote + '/' + base

        let exchanges = ['kraken', 'binance', 'bittrex']
        let exchangePromise = exchanges.map(x => {
            return this.initExchange(x)
        })
        let resolveExchange = (await Promise.all(exchangePromise)).filter(x => x != null)
        //query exchanges for orderbooks
        let orderbooksPromise = resolveExchange.map(exchange => {
            return this.orderBook(exchange, pair)
        })
        let orderbooks = await Promise.all(orderbooksPromise)
        debugger
        let values = orderbooks.map((exchangeOB, index) => {
            if (exchangeOB != 0) {
                return {
                    ...exchangeOB,
                    name: exchanges[index]
                }
            }
        }).filter(OB => OB != undefined || 0)

        let { askPrice, bidPrice } = await getTotalOrders(values, totalVolume)





        let { arbitrageAsk, arbitrageBid } = await getTotalValue(askPrice, bidPrice, totalVolume)
        debugger

        //sort and return the best prices
        let sortedAsks = _.orderBy(arbitrageAsk, 'cost', 'asc')
        let sortedBids = _.orderBy(arbitrageBid, 'cost', 'desc')
        let buy = {
            side: 'buy',
            ...sortedAsks[0],
            volume: totalVolume,
            market: pair,
            ts: Date.now()
        }
        let sell = {
            side: 'sell',
            ...sortedBids[0],
            volume: totalVolume,
            market: pair,
            ts: Date.now()
        }
        debugger
        return [buy, sell]
    } catch (e) {
        console.log(e)
    }
}

async function getTotalOrders(values, totalVolume) {
    let askPrice = values.map(exchange => {
        let side = exchange.asks
        let t = 0
        let orderArray = []
        for (let order in side) {
            debugger
            orderArray.push({ price: side[order][0], volume: side[order][1] })
            t += side[order][1]
            if (totalVolume <= t) {
                return { askPrices: orderArray, name: exchange.name }
            }
        }
        return { askPrices: orderArray, name: exchange.name }
    })
    debugger
    let bidPrice = values.map(exchange => {
        let side = exchange.bids
        let t = 0
        let orderArray = []
        for (let order in side) {
            orderArray.push({ price: side[order][0], volume: side[order][1] })
            t += side[order][1]
            debugger
            if (totalVolume <= t) {
                return { bidPrices: orderArray, name: exchange.name }
            }
        }
        return { bidPrices: orderArray, name: exchange.name }
    })
    return { askPrice, bidPrice }
}

async function getTotalValue(askPrice, bidPrice, totalVolume) {
    let arbitrageAsk = askPrice.map((exchange) => {
        try {
            debugger
            let lastVal = exchange.askPrices[exchange.askPrices.length - 1]
            if (exchange.askPrices.length > 1) {
                exchange.askPrices.pop()
                let sumFunds = exchange.askPrices.reduce((accum, obj) => accum + (obj.volume * obj.price), 0);
                let ExSumVolume = exchange.askPrices.reduce((accum, obj) => accum + (obj.volume), 0);
                let leftoverVol = totalVolume - ExSumVolume
                let lastFunds = lastVal.price * leftoverVol
                return { cost: (sumFunds + lastFunds), exchange: exchange.name }
            } else {
                return { cost: (exchange.askPrices[exchange.askPrices.length - 1].price * totalVolume), exchange: exchange.name }
            }
        } catch (e) {
            return null
        }
    }).filter(x => x !== null)

    let arbitrageBid = bidPrice.map((exchange) => {
        try {
            let lastVal = exchange.bidPrices[exchange.bidPrices.length - 1]
            if (exchange.bidPrices.length > 1) {
                exchange.bidPrices.pop()
                let sumFunds = exchange.bidPrices.reduce((accum, obj) => accum + (obj.volume * obj.price), 0);
                let ExSumVolume = exchange.bidPrices.reduce((accum, obj) => accum + (obj.volume), 0);
                let leftoverVol = totalVolume - ExSumVolume
                let lastFunds = lastVal.price * leftoverVol
                return { cost: (sumFunds + lastFunds), exchange: exchange.name }
            } else {
                return { cost: (exchange.bidPrices[exchange.bidPrices.length - 1].price * totalVolume), exchange: exchange.name }
            }
        } catch (e) {
            return null
        }
    }).filter(x => x !== null)
    return { arbitrageAsk, arbitrageBid }
}