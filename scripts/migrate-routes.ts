import fs from 'fs'
import path from 'path'

const APP_DIR = path.join(process.cwd(), 'app')

// Route migration mapping
const routeMigrations = {
  // Superachiever routes
  '(superachiever)/(personal)/personal': 'super/personal',
  '(superachiever)/(business)/business': 'super/business',
  '(superachiever)/(supermind)/supermind': 'super/mind',
  
  // Superachievers routes
  '(superachievers)/(supergenius)/supergenius': 'super/genius',
  '(superachievers)/(superhuman)/superhuman': 'super/physical',
  '(superachievers)/(superpuzzle)/superpuzzle': 'super/puzzle',
  '(superachievers)/(supersociety)/supersociety': 'super/society',
  
  // Focus routes stay the same but ensure consistent structure
  '(focus)/individual': 'focus/individual',
  '(focus)/collective': 'focus/collective',
  '(focus)/ecosystem': 'focus/ecosystem'
}

async function migrateRoutes() {
  // Create new directories
  for (const newRoute of Object.values(routeMigrations)) {
    const newPath = path.join(APP_DIR, newRoute)
    if (!fs.existsSync(newPath)) {
      fs.mkdirSync(newPath, { recursive: true })
      console.log(`Created directory: ${newPath}`)
    }
  }

  // Move files from old to new locations
  for (const [oldRoute, newRoute] of Object.entries(routeMigrations)) {
    const oldPath = path.join(APP_DIR, oldRoute)
    const newPath = path.join(APP_DIR, newRoute)

    if (fs.existsSync(oldPath)) {
      // Copy all files from old directory
      const files = fs.readdirSync(oldPath)
      for (const file of files) {
        const oldFilePath = path.join(oldPath, file)
        const newFilePath = path.join(newPath, file)
        
        if (fs.statSync(oldFilePath).isFile()) {
          fs.copyFileSync(oldFilePath, newFilePath)
          console.log(`Copied: ${oldFilePath} -> ${newFilePath}`)
        }
      }

      // Create temporary redirect page in old location
      const redirectContent = `"use client"
      
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/${newRoute}")
  }, [router])
  
  return <div>Redirecting...</div>
}
`
      fs.writeFileSync(path.join(oldPath, 'page.tsx'), redirectContent)
      console.log(`Created redirect at: ${oldPath}/page.tsx`)
    }
  }

  console.log('\nRoute migration completed!')
  console.log('Next steps:')
  console.log('1. Test all new routes')
  console.log('2. Update navigation components')
  console.log('3. Remove old directories after confirming everything works')
}

// Run the migration
migrateRoutes().catch(console.error)
