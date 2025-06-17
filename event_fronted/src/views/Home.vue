<template>
  <div class="row row-cols-1 row-cols-md-3 mb-3 text-center">
    <div class="col" v-for="event in events" :key="event.id">
      <div class="card mb-4 rounded-3 shadow-sm" :class="{ 'event-booked': isEventBooked(event) }">
        <div v-if="event.event_image" class="card-img-top-wrapper">
          <img 
            :src="event.event_image" 
            :alt="event.title"
            class="card-img-top"
            style="height: 300px; object-fit: cover; width: 500px;"
          >
          <!-- Booked overlay -->
          <div v-if="isEventBooked(event)" class="booked-overlay">
            <span class="booked-text">BOOKED</span>
          </div>
        </div>
        
        <div class="card-header py-3">
          <h4 class="my-0 fw-normal">{{ event.title }}</h4>
          <div v-if="isEventBooked(event)" class="badge bg-warning text-dark mt-2">
            Event Booked
          </div>
          <div v-else-if="isEventExpired(event)" class="badge bg-secondary mt-2">
            Event Ended
          </div>
          <div v-else class="badge bg-success mt-2">
            Available
          </div>
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
          
          <!-- Different button states based on event status -->
          <button 
            v-if="isEventBooked(event)"
            type="button" 
            class="w-100 btn btn-lg btn-warning" 
            disabled
          >
            Already Booked
          </button>
          
          <button 
            v-else-if="isEventExpired(event)"
            type="button" 
            class="w-100 btn btn-lg btn-secondary" 
            disabled
          >
            Event Ended
          </button>
          
          <button 
            v-else
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
const userBookings = ref([])
const toast = useToast()
const router = useRouter() 

onMounted(async () => {  
  try {
    // Fetch events
    const response = await api.get('/events');
    if (response.status) {
      events.value = response.data.data;
    }

    // Fetch user bookings if logged in
    const loggedInUser = localStorage.getItem('user')
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser)
      const bookingsResponse = await api.get(`/member-event-bookings/${user.id}`);
      if (bookingsResponse.status) {
        userBookings.value = bookingsResponse.data.data;
      }
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

// Check if event is booked by current user and still ongoing
const isEventBooked = (event) => {
  const now = new Date()
  const eventEndTime = new Date(event.end_time)
  
  // Check if user has booked this event
  const hasBooking = userBookings.value.some(booking => 
    booking.event_id === event.id && 
    (booking.status === 'pending' || booking.status === 'confirmed')
  )
  
  // Event is considered booked if user has booking and event hasn't ended yet
  return hasBooking && eventEndTime > now
}

// Check if event has expired/ended
const isEventExpired = (event) => {
  const now = new Date()
  const eventEndTime = new Date(event.end_time)
  return eventEndTime <= now
}

const handleBooking = (event) => {
  const loggedInUser = localStorage.getItem('user')

  if (!loggedInUser) {
    toast.error('Please login to book an event')
    router.push('/login')
  } else {
    // Check if event is still available
    if (isEventBooked(event)) {
      toast.error('You have already booked this event')
      return
    }
    
    if (isEventExpired(event)) {
      toast.error('This event has already ended')
      return
    }
    
    router.push({
      path: '/member-event-confirmation',
      query: { eventId: event.id }
    })
  }
}
</script>

<style scoped>
.card-img-top-wrapper {
  overflow: hidden;
  position: relative;
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

.event-booked {
  opacity: 0.8;
  border: 2px solid #ffc107;
}

.booked-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 193, 7, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.booked-text {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  transform: rotate(-15deg);
}

.badge {
  font-size: 0.8rem;
}
</style>