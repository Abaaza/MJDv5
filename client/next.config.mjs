const nextConfig = {
  output: 'standalone',          // <- keep this for SSR
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};
export default nextConfig;
