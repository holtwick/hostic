#!/usr/bin/env node

// From https://stackoverflow.com/a/56111105/140927
const vm = require("vm")

// This establishes a mapping between sourcePaths and the actual source.
const sourcePathToSource = Object.create(null)

require("source-map-support").install({
  environment: "node",
  // Pass to source-map-support a custom function for retreiving sources
  // from source paths. This runs after source-map-support's default logic,
  // only if that logic fails to find the requested source.
  retrieveFile: (sourcePath) => sourcePathToSource[sourcePath],
})

// const jsPath = path.resolve("myModule2.js")
//
// // Establish the relationship between the path and the source.
// sourcePathToSource[jsPath] = res1.outputText
// // Ditto for the source map file.
// sourcePathToSource[path.resolve("myModule2.js.map")] = res1.sourceMapText
//
// vm.runInThisContext(res1.outputText, {
//   filename: jsPath,
// })

const hostic = require("./cli-main.js")
hostic.main().then().catch(err => {
  process.exit(1)
})
