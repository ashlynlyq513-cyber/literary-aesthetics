import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const isGithubPages = process.env.GITHUB_ACTIONS === 'true';
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'literary-aesthetics';
  return {
    base: isGithubPages ? `/${repoName}/` : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Allow opting out of HMR during heavy local editing sessions.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when HMR is intentionally turned off.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
