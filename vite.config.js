import path from 'path';

export default {
  resolve: {
    alias: {
      '@ckeditor/ckeditor5-ui': path.resolve(__dirname, 'node_modules/@ckeditor/ckeditor5-ui'),
      '@ckeditor/ckeditor5-core': path.resolve(__dirname, 'node_modules/@ckeditor/ckeditor5-core'),
      '@ckeditor/ckeditor5-utils': path.resolve(__dirname, 'node_modules/@ckeditor/ckeditor5-utils'),
      '@ckeditor/ckeditor5-theme-lark': path.resolve(__dirname, 'node_modules/@ckeditor/ckeditor5-theme-lark'),
    },
  },
  optimizeDeps: {
    exclude: ['@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter'],
  },
};
