import { compose } from './compose.js'

describe('Experiments', () => {
 
  function a(ctx, next) {
    ctx.out += 'a>'
    next()
    ctx.out += '<a'
  }

  function b(ctx, next) {
    ctx.out += 'b>'
    next()
    ctx.out += '<b'
  }

  function c(ctx, next) {
    ctx.out += 'c>'
    next()
    ctx.out += '<c'
  }

  it('should mimic middleware', () => {
    let ctx = {
      out: '',
    }

    // This is the mental model

    a(ctx,
      _ => b(ctx,
        _ => c(ctx,
          _ => true),
      ),
    )

    // console.log(ctx)
    expect(ctx).toEqual({ out: 'a>b>c><c<b<a' })
  })

  it('should mimic middleware 2', () => {

    let ctx = {
      out: '',
    }

    // compose([a, b, c])(ctx)
    compose([compose([a, b]), c])(ctx)

    // console.log(ctx)
    expect(ctx).toEqual({ out: 'a>b>c><c<b<a' })
  })

  it('should mimic middleware 3', () => {

    let ctx = {
      out: '',
    }

    function a(ctx, next) {
      ctx.out += 'a>'
      next()
      ctx.out += '<a'
    }

    function b(ctx, next) {
      ctx.out += 'b>'
      ctx.out += '<b'
    }

    function c(ctx, next) {
      ctx.out += 'c>'
      ctx.out += '<c'
    }

    compose([a, b, c])(ctx)
    // compose([c, b, a])(ctx)

    // console.log(ctx)
    expect(ctx).toEqual({ out: 'a>b><b<a' })
  })

})
