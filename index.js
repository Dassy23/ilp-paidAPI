const Koa = require('koa')
const router = require('koa-router')()
const app = new Koa()
const KoaIlp = require('koa-ilp')
const plugin = require('ilp-plugin')()
const ilp = new KoaIlp({ plugin })
const util = require('./src/util')
const crypto = require('crypto')
const hmac = crypto.createHmac('sha256', 'a secret');
//////
const { bluzelle } = require('bluzelle');
const bz = bluzelle({
  entry: 'ws://bernoulli.bluzelle.com:51010',
  // This UUID identifies your database and may be changed.
  uuid: 'transaction_history',
  // This is the private key used for signing off database operations
  private_pem: 'MHQCAQEEIFNmJHEiGpgITlRwao/CDki4OS7BYeI7nyz+CM8NW3xToAcGBSuBBAAKoUQDQgAEndHOcS6bE1P9xjS/U+SM2a1GbQpPuH9sWNWtNYxZr0JcF+sCS2zsD+xlCcbrRXDZtfeDmgD9tHdWhcZKIy8ejQ=='
});

const main = async () => {
  let info = await util.bestPrice(10000, 'XRPUSD')
  await bz.createDB();
};
main().catch(e => {
  //bz.close();
  e.message == "DATABASE_EXISTS" ? console.log('DB exists') : console.log('DB creation error')
});

console.log('Server running on port 8080')
router.get('/:market/', ilp.paid({ price: 100000 }), async ctx => {
  debugger
  console.log(`Payment of ${ctx.state.payment.price} received`)
  let info = await util.bestPrice(ctx.query.volume, ctx.params.market)
  //information to be save to bluzelle
  let storageInfo = {
    time: Date.now(),
    cost: ctx.state.payment.price,
    response: info
  }

  let infoString = JSON.stringify(storageInfo)
  //use sha 256 hash as the key
  hmac.update(infoString);
  let myKey = (hmac.digest('hex')).toString()
  //insert into db
  await bz.create(myKey, infoString);
  //response to client
  ctx.body = JSON.stringify([info, `Buy ${ctx.query.volume} ${((ctx.params.market).slice(0, -3)).toUpperCase()} from ${info[0].exchange} and sell to ${info[1].exchange} for a profit of ${(info[1].cost - info[0].cost).toFixed(2)}`, myKey], null, 2)

})

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(8080)


