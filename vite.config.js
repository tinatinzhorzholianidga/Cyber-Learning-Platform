import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages project path:
// https://<user>.github.io/IO-for-main-page/
//
// Track D key handling (docs/io-voice-plan.md §5.4): the Gemini key for
// local development lives in .env.local as IO_GEMINI_KEY - deliberately
// WITHOUT the VITE_ prefix, so Vite never inlines it by itself. The
// `define` below injects it as a page global during `npm run dev` only;
// `npm run build` always defines it as '' and the postbuild check
// (scripts/check-dist.mjs) scans dist/ for key shapes on top of that.
// Never run `vite --host` (a LAN-exposed dev server) with a key in
// .env.local: dev-server globals are readable by anyone who can load it.
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // '' prefix: read every key, VITE_ or not
  const serve = command === 'serve'
  return {
    base: '/IO-for-main-page/',
    plugins: [react()],
    build: {
      // the microphone worklet must stay a real file: audioWorklet.addModule()
      // is not reliable with an inlined data: URL
      assetsInlineLimit: (file) => (file.endsWith('mic-worklet.js') ? false : undefined),
    },
    define: {
      __IO_DEV_SERVE__: JSON.stringify(serve),
      __IO_DEV_GEMINI_KEY__: JSON.stringify(serve ? env.IO_GEMINI_KEY ?? '' : ''),
    },
  }
})
