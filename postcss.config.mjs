/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    // Only use cssnano if it's already installed
    ...(process.env.NODE_ENV === 'production' && 
      (() => {
        try {
          require.resolve('cssnano');
          return { 
            cssnano: {
              preset: ['default', {
                discardComments: {
                  removeAll: true,
                },
              }],
            }
          };
        } catch (e) {
          return {};
        }
      })()
    )
  },
};

export default config;
