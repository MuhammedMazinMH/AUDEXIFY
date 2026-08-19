/** @type {import('next').NextConfig} */

// This project uses pnpm: node_modules/<pkg> is a SYMLINK into
// node_modules/.pnpm/<pkg>@<version>/node_modules/<pkg>. Vercel's function
// packager rejects bundles containing files reached through symlinked
// directories ("invalid deployment package"), so every node_modules include
// below must point at the real .pnpm store path, never the symlink.
// Version wildcards keep the globs valid across dependency bumps.
const ONNX_REAL = './node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node'

// Only the Linux x64 CPU runtime files onnxruntime-node actually needs in a
// Vercel function. The bin directory also ships a 251 MB CUDA provider and
// binaries for darwin/win32/arm64 — including those would exceed the 250 MB
// serverless bundle limit, so only these three files are included.
const ONNX_RUNTIME_FILES = [
  `${ONNX_REAL}/bin/napi-v6/linux/x64/onnxruntime_binding.node`,
  `${ONNX_REAL}/bin/napi-v6/linux/x64/libonnxruntime.so.1`,
  `${ONNX_REAL}/bin/napi-v6/linux/x64/libonnxruntime_providers_shared.so`,
]

const CHROMIUM_BIN =
  './node_modules/.pnpm/@sparticuz+chromium@*/node_modules/@sparticuz/chromium/bin/**'

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Native-binary packages must not be bundled by the compiler: bundling
  // rewrites __dirname/dynamic requires and silently drops .so/.node files
  // and @sparticuz/chromium's packed browser archive from the deployed
  // function. Keeping them external makes Node resolve them from
  // node_modules at runtime, with file tracing shipping the actual files.
  serverExternalPackages: ['onnxruntime-node', '@sparticuz/chromium', 'puppeteer-core'],
  // The ONNX model binaries under models/ and the native runtime files are
  // loaded via fs / dynamic paths (see lib/ml/nlp.ts and lib/ml/vision.ts),
  // which static tracing cannot follow — force-include them per route.
  outputFileTracingIncludes: {
    '/api/audit': ['./models/nlp/**', CHROMIUM_BIN, ...ONNX_RUNTIME_FILES],
    '/api/screenshot': ['./models/vision/**', ...ONNX_RUNTIME_FILES],
    '/api/health': ['./models/nlp/**', './models/vision/**', ...ONNX_RUNTIME_FILES],
  },
  outputFileTracingExcludes: {
    '*': [
      '**/onnxruntime-node/bin/napi-v6/darwin/**',
      '**/onnxruntime-node/bin/napi-v6/win32/**',
      '**/onnxruntime-node/bin/napi-v6/linux/arm64/**',
      '**/libonnxruntime_providers_cuda.so',
      '**/libonnxruntime_providers_tensorrt.so',
    ],
  },
}

export default nextConfig
