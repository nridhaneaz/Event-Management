<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header">Admin Dashboard</div>
          <div class="card-body">
            <div class="row">
              <!-- Sidebar - Always visible -->
              <div class="col-md-2">
                <ul class="nav nav-pills flex-column">
                  <li class="nav-item">
                    <a 
                      @click.prevent="navigateToRoute('/admin/dashboard')"
                      href="#" 
                      class="nav-link"
                      :class="{ active: isActiveRoute('/admin/dashboard') }">
                      Admin Profile
                    </a>
                  </li>
                  <li class="nav-item">
                    <a 
                      @click.prevent="navigateToRoute('/admin/events')"
                      href="#" 
                      class="nav-link"
                      :class="{ active: isActiveRoute('/admin/events') }">
                      Events
                    </a>
                  </li>
                  <li class="nav-item">
                    <a 
                      @click.prevent="navigateToRoute('/admin/bookings')"
                      href="#" 
                      class="nav-link"
                      :class="{ active: isActiveRoute('/admin/bookings') }">
                      Bookings
                    </a>
                  </li>
                </ul>
              </div>
              
              <!-- Content Area -->
              <div class="col-md-10">
                <div class="content-wrapper">
                  <!-- Only show router-view, no conditional rendering -->
                  <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                      <component :is="Component" :key="$route.fullPath" />
                    </transition>
                  </router-view>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

// Function to check if route is active
const isActiveRoute = (path) => {
  return route.path === path
}

// Function to navigate with error handling
const navigateToRoute = async (path) => {
  try {
    // Only navigate if we're not already on the target route
    if (route.path !== path) {
      await router.push(path)
    }
  } catch (error) {
    console.error('Navigation error:', error)
  }
}
</script>

<style scoped>
.nav-link {
  color: #495057;
  margin-bottom: 5px;
  text-decoration: none;
  cursor: pointer;
  display: block;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

.nav-link:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.nav-link.active {
  background-color: #007bff;
  color: white !important;
}

.content-wrapper {
  min-height: 400px;
  position: relative;
}

/* Transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure sidebar stays fixed */
.col-md-2 {
  position: relative;
  min-height: 400px;
}

.nav-pills {
  position: sticky;
  top: 0;
}
</style>