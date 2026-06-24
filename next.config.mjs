/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint roda separadamente; não bloqueia o build do MVP.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
