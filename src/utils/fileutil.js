// (C)opyright Dirk Holtwick, 2016-09-02 <dirk.holtwick@gmail.com>

const {
  readdirSync,
  statSync,
  unlinkSync,
  rmdirSync,
  mkdirSync,
} = require("fs")
const { join, sep } = require("path")

function walkSync(rootFolder, subFolder = "", ignoreHidden = true) {
  let resultPaths = []
  let paths = readdirSync(join(rootFolder, subFolder))
  if (paths != null && paths.length > 0) {
    for (let file of paths) {
      // if (!ignoreHidden || file[0] !== '.') {
      file = join(subFolder, file)
      let realFile = join(rootFolder, file)
      let stat = statSync(realFile)
      if (stat && stat.isDirectory()) {
        resultPaths = resultPaths.concat(walkSync(rootFolder, file) || [])
      } else {
        resultPaths.push(file)
      }
      // }
    }
  }
  return resultPaths
}

function rmdir(dir) {
  try {
    let list = readdirSync(dir)
    for (let i = 0; i < list.length; i++) {
      let filename = join(dir, list[i])
      let stat = statSync(filename)
      if (filename === "." || filename === "..") {
        // pass these files
      } else if (stat.isDirectory()) {
        // rmdir recursively
        rmdir(filename)
      } else {
        // rm filename
        unlinkSync(filename)
      }
    }
    rmdirSync(dir)
  } catch (ex) {}
}

function mkdir(p, root = "") {
  let dirs = p.split(sep)
  let dir = dirs.shift()
  root = (root || "") + dir + sep
  try {
    mkdirSync(root, 0o755)
  } catch (ex) {
    //dir wasn't made, something went wrong
    if (!statSync(root).isDirectory()) {
      throw new Error(ex)
    }
  }
  return !dirs.length || mkdir(dirs.join(sep), root)
}

module.exports = {
  rmdir,
  mkdir,
  walkSync,
}
