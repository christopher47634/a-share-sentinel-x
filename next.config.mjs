import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // fileURLToPath：Windows 上 URL.pathname 是 /C:/...，路径含空格或中文时还会被百分号编码
  outputFileTracingRoot: fileURLToPath(new URL('.', import.meta.url)),
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/submission',
        // 308 会被浏览器长期缓存，以后想把首页换回来就收不回了
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
