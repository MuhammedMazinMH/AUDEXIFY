/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // The ONNX model binaries under models/ are loaded at runtime via
  // fs.existsSync / InferenceSession.create with a dynamically-resolved
  // path (see lib/ml/nlp.ts and lib/ml/vision.ts), not a static import.
  // Next.js's output file tracing only follows static import/require
  // graphs, so without this the model files would be silently dropped
  // from the deployed serverless function bundle. These entries force
  // both model directories to ship with every route that can reach the
  // ML modules.
  outputFileTracingIncludes: {
    '/api/audit': ['./models/nlp/**'],
    '/api/screenshot': ['./models/vision/**'],
  },
}

export default nextConfig
