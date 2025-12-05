// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-12-02',
  devtools: { enabled: true },
  ssr: true,

  /* ============ APP CONFIG ============ */
  app: {
    head: {
      title: 'Gatepass - WhatsApp Form Builder',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Create WhatsApp forms, collect responses, and manage submissions with Gatepass',
        },
        { name: 'theme-color', content: '#6366f1' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  /* ============ MODULES ============ */
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    'unplugin-icons/nuxt',
  ],

  /* ============ AUTO-IMPORT COMPONENTS ============ */
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
        extensions: ['vue'],
      },
    ],
    global: true,
  },

  /* ============ AUTO-IMPORTS ============ */
  imports: {
    dirs: ['./composables', './utils'],
  },

  /* ============ UNPLUGIN ICONS CONFIG ============ */
  icon: {
    collections: {
      mdi: () => import('@iconify-json/mdi').then(i => i.default),
    },
    autoInstall: true,
    scale: 1,
    defaultClass: 'inline-block',
    aliases: {
      'mdi': 'mdi',
    },
  },

  /* ============ PINIA CONFIG ============ */
  pinia: {
    storesDirs: ['./stores/**'],
  },

  /* ============ SUPABASE MODULE CONFIG ============ */
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    redirect: false,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/auth/verify-email', '/auth/signup'],
    },
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
    clientOptions: {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  },

  /* ============ CSS ============ */
  css: [
    '~/assets/css/main.css',
  ],

  /* ============ PLUGINS ============ */
  plugins: [
    '~/plugins/theme.client.ts',
  ],

  /* ============ TAILWIND CONFIG ============ */
  tailwindcss: {
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: false,
  },

  /* ============ BUILD CONFIG ============ */
  build: {
    transpile: ['@supabase/supabase-js', 'ioredis'],
  },

  /* ============ RUNTIME CONFIG ============ */
  runtimeConfig: {
    /* ============ PRIVATE KEYS (Server-side only) ============ */
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    whatsappApiToken: process.env.WHATSAPP_API_TOKEN,
    whatsappWebhookToken: process.env.WHATSAPP_WEBHOOK_TOKEN,
    whatsappWebhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET,
    redisUrl: process.env.REDIS_URL,

    /* ============ PUBLIC KEYS (Client-side accessible) ============ */
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      environment: process.env.NUXT_PUBLIC_ENVIRONMENT || 'development',
      whatsappPhoneNumberId: process.env.NUXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID,
      whatsappBotPhoneNumber: process.env.NUXT_PUBLIC_WHATSAPP_BOT_PHONE_NUMBER,
    },
  },

  /* ============ VUEUSE CONFIG ============ */
  vueuse: {
    ssrHandlers: true,
  },

  /* ============ EXPERIMENTAL FEATURES ============ */
  experimental: {
    payloadExtraction: false,
    renderJsonPayload: true,
  },

  /* ============ TYPESCRIPT CONFIG ============ */
  typescript: {
    strict: true,
    shim: true,
  },

  /* ============ VITE CONFIG ============ */
  vite: {
    server: {
      hmr: process.env.CODESPACE_NAME
        ? {
            protocol: 'wss',
            host: `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`,
            port: 443,
          }
        : {
            protocol: 'ws',
            host: 'localhost',
            port: 24678,
          },
    },
  },

  /* ============ ROUTER CONFIG ============ */
  router: {
    options: {
      hashMode: false,
    },
  },

  /* ============ DEV SERVER ============ */
  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },

  /* ============ NITRO CONFIG (Server/API) ============ */
  nitro: {
    /* ============ STORAGE FOR REDIS ============ */
    storage: {
      redis: {
        driver: 'redis',
        /* Use async implementation for better performance */
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    },

    /* ============ PRERENDER CONFIG ============ */
    prerender: {
      crawlLinks: false,
      /* Don't prerender API routes */
      ignore: ['/api'],
    },

    /* ============ ROUTES CONFIG ============ */
    routes: {
      /* Make webhook routes public (no auth required) */
      '/api/webhook/**': { cache: false },
    },

    /* ============ SECURITY HEADERS ============ */
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },

  /* ============ FEATURE FLAGS ============ */
  features: {
    inlineStyles: false,
  },
})