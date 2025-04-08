const fs = require('fs');
const path = require('path');

// List of files that need the "use client" directive
const filesToFix = [
  'components/Challenges/ChallengesList.tsx',
  'components/Features/FeaturesProvider.tsx',
  'components/Subscription/SubscriptionManager.tsx',
  'components/Superpuzzles/ContributeForm.tsx',
  'components/Superpuzzles/SuperpuzzleDetails.tsx',
  'components/onboarding/OnboardingProvider.tsx'
];

// Root directory of the project
const rootDir = path.resolve(__dirname, '..');

// Add "use client" directive to each file
filesToFix.forEach(filePath => {
  const fullPath = path.join(rootDir, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Only add the directive if it doesn't already exist
      if (!content.includes('"use client"') && !content.includes("'use client'")) {
        content = '"use client";\n\n' + content;
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Added "use client" directive to ${filePath}`);
      } else {
        console.log(`⏭️ ${filePath} already has the directive`);
      }
    } else {
      console.log(`⚠️ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
});

console.log('Done adding "use client" directives to component files.');
