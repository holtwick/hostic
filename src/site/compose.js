// Cannot make it any better, therefore taken from https://github.com/koajs/compose

const log = require("debug")("hostic:compose")

export function compose(middleware) {
  if (!Array.isArray(middleware)) {
    log("Not an array", middleware)
    throw new TypeError("Middleware stack must be an array!")
  }

  for (const fn of middleware) {
    if (typeof fn !== "function") {
      log("Not a function", fn, "in", middleware)
      throw new TypeError("Middleware must be composed of functions!")
    }
  }

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error("next() called multiple times"))
      }
      index = i
      let fn = middleware[i]
      if (i === middleware.length) {
        fn = next
      }
      if (!fn) {
        return Promise.resolve()
      }
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
