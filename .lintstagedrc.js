module.exports = {
  // Run ESLint on all JavaScript and TypeScript files
  '**/*.{js,jsx,ts,tsx}': ['eslint --fix'],
  
  // Format all supported files with Prettier
  '**/*.{js,jsx,ts,tsx,json,md,mdx,css,scss,html}': ['prettier --write'],
};
