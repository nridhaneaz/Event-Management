<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">Forgot Password</h3>
          </div>
          <div class="card-body">
            <p class="text-muted text-center mb-4">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
            
            <form @submit.prevent="sendOTP">
              <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="email"
                  placeholder="Enter your email address"
                  :disabled="loading"
                >
                <div v-if="errors.email" class="text-danger mt-1">{{ errors.email[0] }}</div>
              </div>
              
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Sending...' : 'Send OTP' }}
                </button>
              </div>
            </form>
            
            <div class="text-center mt-3">
              <router-link to="/login" class="text-decoration-none">
                Back to Login
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
const errors = ref({});
const loading = ref(false);
const toast = useToast();
const router = useRouter();

const sendOTP = async () => {
  try {
    loading.value = true;
    errors.value = {};
    
    const response = await api.post('/send-otp', {
      email: email.value
    });
    
    if (response.data.status) {
      toast.success('OTP sent successfully to your email', {
        position: 'top-right',
        duration: 3000
      });
      
      // Navigate to verify OTP page with email
      router.push({
        path: '/verify-otp',
        query: { email: email.value }
      });
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
    
    toast.error(error.response?.data?.message || 'Failed to send OTP', {
      position: 'top-right',
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
};
</script>