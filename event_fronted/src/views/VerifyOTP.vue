<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">Verify OTP</h3>
          </div>
          <div class="card-body">
            <div class="alert alert-info" role="alert">
              <small>We've sent a 4-digit OTP to: <strong>{{ email }}</strong></small>
            </div>
            
            <form @submit.prevent="verifyOTP">
              <div class="mb-3">
                <label for="otp" class="form-label">Enter OTP</label>
                <input 
                  type="text" 
                  class="form-control text-center" 
                  id="otp" 
                  v-model="otp"
                  placeholder="Enter 4-digit OTP"
                  maxlength="4"
                  :disabled="loading"
                  style="font-size: 1.5rem; letter-spacing: 0.5rem;"
                >
                <div v-if="errors.otp" class="text-danger mt-1">{{ errors.otp[0] }}</div>
              </div>
              
              <div class="d-grid gap-2">
                <button 
                  type="submit" 
                  class="btn btn-success"
                  :disabled="loading || otp.length !== 4"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Verifying...' : 'Verify OTP' }}
                </button>
              </div>
            </form>
            
            <div class="text-center mt-3">
              <button 
                @click="resendOTP" 
                class="btn btn-link text-decoration-none"
                :disabled="resendLoading || countdown > 0"
              >
                <span v-if="resendLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ countdown > 0 ? `Resend OTP (${countdown}s)` : 'Resend OTP' }}
              </button>
            </div>
            
            <div class="text-center mt-2">
              <router-link to="/send-otp" class="text-decoration-none">
                Change Email
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/api/axios';
import { useToast } from 'vue-toast-notification';
import { useRouter, useRoute } from 'vue-router';

const otp = ref('');
const email = ref('');
const errors = ref({});
const loading = ref(false);
const resendLoading = ref(false);
const countdown = ref(0);
const toast = useToast();
const router = useRouter();
const route = useRoute();

let countdownInterval = null;

onMounted(() => {
  email.value = route.query.email || '';
  
  if (!email.value) {
    toast.error('Email not found. Please start from Send OTP page.');
    router.push('/send-otp');
  }
  
  startCountdown();
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});

const startCountdown = () => {
  countdown.value = 60;
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
};

const verifyOTP = async () => {
  try {
    loading.value = true;
    errors.value = {};
    
    const response = await api.post('/verify-otp', {
      email: email.value,
      otp: otp.value
    });
    
    if (response.data.status) {
      toast.success('OTP verified successfully', {
        position: 'top-right',
        duration: 3000
      });
      
      router.push({
        path: '/reset-password',
        query: { email: email.value }
      });
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
    
    toast.error(error.response?.data?.message || 'Invalid OTP', {
      position: 'top-right',
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
};

const resendOTP = async () => {
  try {
    resendLoading.value = true;
    
    const response = await api.post('/send-otp', {
      email: email.value
    });
    
    if (response.data.status) {
      toast.success('OTP resent successfully', {
        position: 'top-right',
        duration: 3000
      });
      
      otp.value = '';
      startCountdown();
    }
  } catch (error) {
    toast.error('Failed to resend OTP', {
      position: 'top-right',
      duration: 3000
    });
  } finally {
    resendLoading.value = false;
  }
};
</script>