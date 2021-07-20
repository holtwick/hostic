import sizeOf from "image-size"
import { warn } from "../../utils/error.js"

export function optimizeImage({ element, src, data }) {
  // Adjust the width and height for best experience
  if (!(element.getAttribute("width") || element.getAttribute("height"))) {
    if (data) {
      let size = sizeOf(data)
      if (src.indexOf("@2x.") > 0) {
        size.width /= 2
        size.height /= 2
      }
      element.setAttribute("width", size.width.toString())
      element.setAttribute("height", size.height.toString())
    } else {
      warn("No data found for", src)
    }
  }

  let parent = element.parent("p")
  if (parent) {
    if (!parent.textContent.trim()) {
      // parent.className = 'img-wrapper'
      parent.classList.add("img-wrapper")
    }
  }
}
