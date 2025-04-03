const fs = require("fs")
const path = require("path")

// Check if next.config.mjs exists
const mjsPath = path.join(process.cwd(), "next.config.mjs")
const jsPath = path.join(process.cwd(), "next.config.js")

console.log("Checking Next.js configuration files...")

if (fs.existsSync(mjsPath)) {
  console.log("Found next.config.mjs")
  try {
    const content = fs.readFileSync(mjsPath, "utf8")
    console.log("Content of next.config.mjs:")
    console.log(content)
  } catch (error) {
    console.error("Error reading next.config.mjs:", error)
  }
}

if (fs.existsSync(jsPath)) {
  console.log("Found next.config.js")
  try {
    const content = fs.readFileSync(jsPath, "utf8")
    console.log("Content of next.config.js:")
    console.log(content)
  } catch (error) {
    console.error("Error reading next.config.js:", error)
  }
}

if (!fs.existsSync(mjsPath) && !fs.existsSync(jsPath)) {
  console.log("No Next.js configuration file found!")
}

console.log("Done checking configuration files.")

