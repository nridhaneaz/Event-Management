<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">Login</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="memberLogin">
              <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="email"
                  :disabled="loading"
                >
                <div v-if="errors.email" class="text-danger">{{ errors.email[0] }}</div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="password"
                  :disabled="loading"
                >
                <div v-if="errors.password" class="text-danger">{{ errors.password[0] }}</div>
              </div>
              
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="remember" v-model="rememberMe">
                <label class="form-check-label" for="remember">Remember me</label>
              </div>
              
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
              </div>
            </form>
            
            <!-- Forgot Password Link -->
            <div class="text-center mt-3">
              <router-link to="/send-otp" class="text-decoration-none">
                Forgot your password?
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import api from '@/api/axios';
import { useToast } from 'vue-toast-notification';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref(''); 
const rememberMe = ref(false);
const loading = ref(false);
const toast = useToast();
const errors = ref({});
const router = useRouter();

const memberLogin = async () => {
  try {
    loading.value = true;
    errors.value = {};
    
    const response = await api.post('/login', {
      email: email.value,
      password: password.value
    });
    
    if (response.data.status) {
      const userData = response.data.data;
      
      localStorage.setItem('apiToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Login was successful', {
        position: 'top-right',
        duration: 2000
      });
      
      setTimeout(() => {
        if (userData.role === 'user') {
          router.push('/member-dashboard').then(() => {
            return window.location.reload();
          });
        } else if (userData.role === 'admin') {
          router.push('/admin/dashboard').then(() => {
            return window.location.reload();
          });
        }
      }, 2000);
    }
  } catch (error) {
    loading.value = false;
    
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
    
    toast.error(error.response?.data?.message || 'Login failed', {
      position: 'top-right'
    });
  }
};
</script>