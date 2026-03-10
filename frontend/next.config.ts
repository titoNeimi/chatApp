import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images:{
    remotePatterns: [
      new URL('https://static.vecteezy.com/system/resources/previews/042/971/890/non_2x/night-sky-galaxy-cloud-with-nebula-starry-in-dark-blue-background-universe-filled-with-star-light-in-purple-pink-beautiful-nature-star-field-with-milky-way-horizon-banner-colorful-cosmos-stardust-vector.jpg')
    ]
  }
};

export default nextConfig;
