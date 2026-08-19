/** @type {import('next').NextConfig} */

// Only the Linux x64 CPU runtime files onnxruntime-node actually needs in a
// Vercel function. The bin directory also ships a 251 MB CUDA provider and
// binaries for darwin/win32/arm64 — including those would exceed the 250 MB
// serverless bundle limit, so they are explicitly excluded below.
const ONNX_RUNTIME_FILES = [
  './node_modules/onnxruntime-node/bin/napi-v6/linux/x64/onnxruntime_binding.node',
  './node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime.so.1',
  './node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime_providers_shared.so',
]

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
    '/api/audit': [
      './models/nlp/**',
      './node_modules/@sparticuz/chromium/bin/**',
      ...ONNX_RUNTIME_FILES,
    ],
    '/api/screenshot': ['./models/vision/**', ...ONNX_RUNTIME_FILES],
    '/api/health': ['./models/nlp/**', './models/vision/**', ...ONNX_RUNTIME_FILES],
  },
  outputFileTracingExcludes: {
    '*': [
      './node_modules/onnxruntime-node/bin/napi-v6/darwin/**',
      './node_modules/onnxruntime-node/bin/napi-v6/win32/**',
      './node_modules/onnxruntime-node/bin/napi-v6/linux/arm64/**',
      '**/libonnxruntime_providers_cuda.so',
      '**/libonnxruntime_providers_tensorrt.so',
    ],
  },
}

export default nextConfig
