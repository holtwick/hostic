// From https://stackoverflow.com/a/56111105/140927
const vm = require("vm")
const {resolve} = require("path")

// This establishes a mapping between sourcePaths and the actual source.
const sourcePathToSource = Object.create(null)

const sourceMapSupport = require("source-map-support")

// var origWrapper = sourceMapSupport.wrapCallSite
// var wrapCallSite = function (frame) {
//   console.log("KILLroy was here")
//   var frame = origWrapper(frame)
//   return frame
// }

sourceMapSupport.install({
  // environment: "node",
  // Pass to source-map-support a custom function for retreiving sources
  // from source paths. This runs after source-map-support's default logic,
  // only if that logic fails to find the requested source.

  hookRequire: true,

  // wrapCallSite,

  handleUncaughtExceptions: false,
  retrieveFile: (sourcePath) => {
    // console.log("retrieveFile", sourcePath, sourcePathToSource[sourcePath]?.length)
    return sourcePathToSource[sourcePath]
  },
  // retrieveSourceMap: (sourcePath) => {
  //   console.log("retrieveSourceMap", sourcePath, sourcePathToSource[sourcePath + ".map"]?.length)
  //   return sourcePathToSource[sourcePath + ".map"]
  // },
})

function evalCode(code, sourceMap, jsPath = resolve(__dirname, "out/index.js")) {
  sourcePathToSource[jsPath] = code
  if (sourceMap) {
    sourcePathToSource[jsPath + ".map"] = sourceMap
  }
  global.require = require
  global.exports = {}
  let result = vm.runInThisContext(code, {
    filename: jsPath,
    displayErrors: true,
  })
  return global.exports
}

module.exports = {
  evalCode,
}