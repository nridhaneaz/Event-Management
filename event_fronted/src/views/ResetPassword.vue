<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">Reset Password</h3>
          </div>
          <div class="card-body">
            <div class="alert alert-success" role="alert">
              <small>Set new password for: <strong>{{ email }}</strong></small>
            </div>
            
            <form @submit.prevent="resetPassword">
              <div class="mb-3">
                <label for="password" class="form-label">New Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="password"
                  placeholder="Enter new password (min 6 characters)"
                  :disabled="loading"
                >
                <div v-if="errors.password" class="text-danger mt-1">{{ errors.password[0] }}</div>
              </div>
              
              <div class="mb-3">
                <label for="password_confirmation" class="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password_confirmation" 
                  v-model="password_confirmation"
                  placeholder="Confirm your new password"
                  :disabled="loading"
                >
                <div v-if="errors.password_confirmation" class="text-danger mt-1">{{ errors.password_confirmation[0] }}</div>
              </div>
              
              <!-- Password Match Check -->
              <div class="mb-3" v-if="password.length > 0 && password_confirmation.length > 0">
                <small 
                  :class="password === password_confirmation ? 'text-success' : 'text-danger'"
                >
                  {{ password === password_confirmation ? '✓ Passwords match' : '✗ Passwords do not match' }}
                </small>
              </div>
              
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-success"
                  :disabled="loading || !isFormValid"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Resetting...' : 'Reset Password' }}
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
import { ref, computed, onMounted } from 'vue';
import api from '@/api/axios';
import { useToast } from 'vue-toast-notification';
import { useRouter, useRoute } from 'vue-router';

const password = ref('');
const password_confirmation = ref('');
const email = ref('');
const errors = ref({});
const loading = ref(false);
const toast = useToast();
const router = useRouter();
const route = useRoute();

onMounted(() => {
  email.value = route.query.email || '';
  
  if (!email.value) {
    toast.error('Email not found. Please start from Send OTP page.');
    router.push('/send-otp');
  }
});

const isFormValid = computed(() => {
  return password.value.length >= 6 && 
         password_confirmation.value.length >= 6 && 
         password.value === password_confirmation.value;
});

const resetPassword = async () => {
  try {
    loading.value = true;
    errors.value = {};
    
    const response = await api.post('/reset-password', {
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value
    });
    
    if (response.data.status) {
      toast.success('Password reset successful! Please login with your new password.', {
        position: 'top-right',
        duration: 4000
      });
      
      password.value = '';
      password_confirmation.value = '';
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
    
    toast.error(error.response?.data?.message || 'Failed to reset password', {
      position: 'top-right',
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
};
</script>