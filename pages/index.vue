<template>
  <div class="min-h-screen bg-base">
    <!-- Navigation -->
    <nav class="bg-card border-b border-base sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-primary">Gatepass</h1>
          <span class="text-xs bg-primary bg-opacity-20 text-primary px-2 py-1 rounded">Beta</span>
        </div>

        <div class="flex items-center gap-4">
          <CommonThemeToggle />
          <NuxtLink to="/auth/login" class="text-primary hover:text-primary-700 font-medium transition-colors">
            Sign In
          </NuxtLink>
          <NuxtLink to="/auth/signup" class="inline-block">
            <CommonButton variant="primary" label="Get Started" />
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="py-20 md:py-32 bg-gradient-to-br from-base via-base to-secondary/5">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="text-center mb-12 animate-fade-in">
          <div class="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <p class="text-sm text-primary font-semibold">✨ Introducing Gatepass</p>
          </div>
          
          <h2 class="text-5xl md:text-6xl font-bold text-base mb-6 leading-tight">
            Create WhatsApp Forms
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">in Minutes</span>
          </h2>
          
          <p class="text-xl text-secondary mb-8 max-w-2xl mx-auto">
            Build beautiful, interactive forms for WhatsApp. Collect responses, analyze data, and grow your business with zero hassle.
          </p>

          <div class="flex gap-4 justify-center flex-wrap">
            <NuxtLink to="/auth/signup" class="inline-block">
              <CommonButton variant="primary" size="lg" label="Start Free" />
            </NuxtLink>
            <CommonButton variant="secondary" size="lg" label="Watch Demo" @click="scrollToDemo" />
          </div>

          <p class="text-sm text-secondary mt-6">✓ No credit card required • ✓ Free forever • ✓ Always secure</p>
        </div>

        <!-- Hero Image/Demo -->
        <div class="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 p-8 border border-border-primary overflow-hidden shadow-2xl animate-slide-up">
          <div class="aspect-video bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
            <div class="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 animate-shimmer"></div>
            
            <!-- Play Button -->
            <div class="relative z-10 transition-all group-hover:scale-110">
              <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all">
                <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>

            <!-- Background Decoration -->
            <div class="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20"></div>
            <div class="absolute bottom-0 left-0 w-40 h-40 bg-secondary/10 rounded-full -ml-20 -mb-20"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 md:py-24 bg-secondary/5 border-y border-base">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16 animate-fade-in">
          <h3 class="text-4xl font-bold mb-4">Powerful Features</h3>
          <p class="text-secondary text-lg">Everything you need to create stunning WhatsApp forms</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 group">
            <div class="mb-4 inline-flex p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h4 class="text-lg font-bold text-base mb-2">Lightning Fast</h4>
            <p class="text-secondary text-sm">
              Create and deploy forms instantly. No waiting, no complicated setup.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 group">
            <div class="mb-4 inline-flex p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
              <svg class="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <h4 class="text-lg font-bold text-base mb-2">WhatsApp Native</h4>
            <p class="text-secondary text-sm">
              Reach customers where they are. Send forms via WhatsApp with interactive buttons.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 group">
            <div class="mb-4 inline-flex p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
              <svg class="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2V17zm4 0h-2V7h2V17zm4 0h-2v-4h2V17z"/>
              </svg>
            </div>
            <h4 class="text-lg font-bold text-base mb-2">Real-time Analytics</h4>
            <p class="text-secondary text-sm">
              Track responses in real-time. Get actionable insights instantly.
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 group">
            <div class="mb-4 inline-flex p-3 bg-success/10 rounded-lg group-hover:bg-success/20 transition-colors">
              <svg class="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <h4 class="text-lg font-bold text-base mb-2">Secure & Private</h4>
            <p class="text-secondary text-sm">
              Enterprise-grade security. Your data is encrypted and protected.
            </p>
          </div>

          <!-- Feature 5 -->
          <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 group">
            <div class="mb-4 inline-flex p-3 bg-info/10 rounded-lg group-hover:bg-info/20 transition-colors">
              <svg class="w-6 h-6 text-info" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 12v7H5v-7m0-2h14V7H5v3m8-6l-1-2H8l-1 2H4v2h16V5h-3z"/>
              </svg>
            </div>
            <h4 class="text-lg font-bold text-base mb-2">Export Anywhere</h4>
            <p class="text-secondary text-sm">
              Export to Excel, CSV, or PDF. Integrate with your favorite tools.
            </p>
          </div>

          <!-- Feature 6 -->
          <div class="p-6 rounded-xl bg-card border border-base hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 group">
            <div class="mb-4 inline-flex p-3 bg-warning/10 rounded-lg group-hover:bg-warning/20 transition-colors">
              <svg class="w-6 h-6 text-warning" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
              </svg>
            </div>
            <h4 class="text-lg font-bold text-base mb-2">Global Reach</h4>
            <p class="text-secondary text-sm">
              Available in 180+ countries. Connect with customers worldwide.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Section -->
    <section id="demo" class="py-20 md:py-32 bg-gradient-to-r from-primary/5 via-base to-secondary/5">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="text-center mb-12 animate-fade-in">
          <h3 class="text-4xl font-bold mb-4">See It In Action</h3>
          <p class="text-secondary text-lg">Watch how easy it is to create forms with Gatepass</p>
        </div>

        <div class="rounded-2xl overflow-hidden shadow-2xl border border-base bg-card p-2 animate-slide-up">
          <div class="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <div class="inline-block mb-4 p-4 bg-primary/10 rounded-full">
                <svg class="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p class="text-secondary font-semibold">Video Demo Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 md:py-32 bg-gradient-to-r from-primary to-blue-600 relative overflow-hidden">
      <!-- Background Decoration -->
      <div class="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full -ml-40 -mb-40"></div>

      <div class="container mx-auto px-4 max-w-2xl text-center relative z-10 animate-fade-in">
        <h3 class="text-4xl font-bold mb-6 text-white">Ready to Get Started?</h3>
        <p class="text-xl text-white/90 mb-8">
          Join thousands of businesses using Gatepass to collect responses and grow.
        </p>

        <NuxtLink to="/auth/signup" class="inline-block">
          <CommonButton variant="primary" size="lg" label="Create Your First Form" fullWidth />
        </NuxtLink>

        <p class="text-sm text-white/80 mt-6">No credit card required. Start free forever.</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-card border-t border-base py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <!-- About -->
          <div>
            <h5 class="font-bold text-base mb-4">Gatepass</h5>
            <ul class="space-y-2 text-sm text-secondary">
              <li>
                <a href="#" class="hover:text-primary transition-colors">About</a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">Careers</a>
              </li>
            </ul>
          </div>

          <!-- Product -->
          <div>
            <h5 class="font-bold text-base mb-4">Product</h5>
            <ul class="space-y-2 text-sm text-secondary">
              <li>
                <a href="#" class="hover:text-primary transition-colors">Features</a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">Pricing</a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">Security</a>
              </li>
            </ul>
          </div>

          <!-- Resources -->
          <div>
            <h5 class="font-bold text-base mb-4">Resources</h5>
            <ul class="space-y-2 text-sm text-secondary">
              <li>
                <a href="#" class="hover:text-primary transition-colors">Docs</a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">API</a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">Support</a>
              </li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h5 class="font-bold text-base mb-4">Legal</h5>
            <ul class="space-y-2 text-sm text-secondary">
              <li>
                <a href="#" class="hover:text-primary transition-colors">Privacy</a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">Terms</a>
              </li>
              <li>
                <a href="#" class="hover:text-primary transition-colors">Contact</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-base pt-8">
          <p class="text-center text-sm text-secondary">
            © 2024 Gatepass. All rights reserved. Made with ❤️ in Nigeria.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import CommonThemeToggle from '~/components/common/ThemeToggle.vue'
import CommonButton from '~/components/common/Button.vue'

const scrollToDemo = () => {
  const element = document.getElementById('demo')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0%, 100% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out 0.2s both;
}

.animate-shimmer {
  animation: shimmer 3s infinite;
}
</style>