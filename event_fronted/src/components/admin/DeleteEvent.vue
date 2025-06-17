<template>
  <div class="row row-cols-1 row-cols-md-3 mb-3 text-center">
    <div class="col" v-for="event in events" :key="event.id">
      <div class="card mb-4 rounded-3 shadow-sm">
        <div v-if="event.event_image" class="card-img-top-wrapper">
          <img 
            :src="event.event_image" 
            :alt="event.title"
            class="card-img-top"
            style="height: 300px; object-fit: cover; width: 500px;"
          >
        </div>
        
        <div class="card-header py-3">
          <h4 class="my-0 fw-normal">{{ event.title }}</h4>
          
          <!-- Delete button -->
          <button 
            @click="deleteEvent(event.id)" 
            class="btn btn-sm btn-danger mt-2"
            :disabled="deleting"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
        
        <div class="card-body">
          <div class="mb-3">
            <p class="text-muted" v-if="event.description">{{ event.description }}</p>
            <p class="text-muted" v-else>No description available</p>
          </div>
          
          <ul class="list-unstyled mt-3 mb-4">
            <li><strong>Start:</strong> {{ formatDateTime(event.start_time) }}</li>
            <li><strong>End:</strong> {{ formatDateTime(event.end_time) }}</li>
            <li><strong>Price:</strong> ${{ event.ticket_price }}</li>
          </ul>
          
          <button 
            type="button" 
            class="w-100 btn btn-lg btn-outline-primary" 
            @click="handleBooking(event)"
          >
            Book Now - ${{ event.ticket_price }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Show message if no events -->
    <div v-if="events.length === 0" class="col-12">
      <div class="alert alert-info text-center">
        <h5>No Events Available</h5>
        <p>There are currently no events to display. Please check back later!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import api from '@/api/axios';
import { onMounted, ref } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useRouter } from 'vue-router';

const events = ref([])
const toast = useToast()
const router = useRouter()
const deleting = ref(false)

onMounted(async () => {  
  try {
    const response = await api.get('/events');
    if (response.status) {
      events.value = response.data.data;
    }
  } catch (error) {
    console.log(error);
    toast.error('Failed to load events')
  }
});

const formatDateTime = (date) => {
  if (!date) return 'Not specified'
  const d = new Date(date)
  return d.toLocaleString()
}

const handleBooking = (event) => {
  const loggedInUser = localStorage.getItem('user')

  if (!loggedInUser) {
    toast.error('Please login to book an event')
    router.push('/login')
  } else {    
    router.push({
      path: '/member-event-confirmation',
      query: { eventId: event.id }
    })
  }
}

// Delete event function
const deleteEvent = async (eventId) => {
  if (!confirm('Are you sure you want to delete this event?')) {
    return
  }
  
  deleting.value = true
  
  try {
    const response = await api.delete(`/event/delete/${eventId}`)
    
    if (response.status || response.data.success) {
      toast.success('Event deleted successfully!')
      
      // Remove event from list
      events.value = events.value.filter(event => event.id !== eventId)
    } else {
      toast.error('Failed to delete event')
    }
  } catch (error) {
    console.error('Delete error:', error)
    toast.error('Error deleting event')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.card-img-top-wrapper {
  overflow: hidden;
}

.card-img-top {
  transition: transform 0.3s ease;
}

.card:hover .card-img-top {
  transform: scale(1.05);
}

.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}
</style>