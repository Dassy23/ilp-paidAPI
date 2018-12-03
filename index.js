const Koa = require('koa')
const router = require('koa-router')()
const app = new Koa()
const KoaIlp = require('koa-ilp')
const plugin = require('ilp-plugin')()
const ilp = new KoaIlp({ plugin })
const util = require('./src/util')

console.log('Server running')
router.get('/:market/', ilp.paid({ price: 100000 }), async ctx => {
  console.log(`Payment of ${ctx.state.payment.price} received`)
  let info = await util.bestPrice(ctx.query.volume, ctx.params.market)

  ctx.body = JSON.stringify([info, `Buy ${ctx.query.volume} ${((ctx.params.market).slice(0,-3)).toUpperCase()} from ${info[0].exchange} and sell to ${info[1].exchange} for a profit of ${(info[1].cost - info[0].cost).toFixed(2)}`],null,2)
})

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(8080)


