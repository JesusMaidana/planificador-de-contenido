/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbo: false, // ← esto se elimina
    },
    webpack(config) {
        return config
    },
}

module.exports = nextConfig
