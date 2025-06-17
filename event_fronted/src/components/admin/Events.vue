<template>
  <div class="container mt-5">
      <div class="row justify-content-center">
          <div class="col-md-12">
              <!-- Create Event Form -->
              <div class="card mb-4">
                  <div class="card-header d-flex justify-content-between align-items-center">
                      <span>Create New Event</span>
                      <button 
                          class="btn btn-primary btn-sm" 
                          @click="showCreateForm = !showCreateForm"
                      >
                          {{ showCreateForm ? 'Hide Form' : 'Add Event' }}
                      </button>
                  </div>
                  <div class="card-body" v-if="showCreateForm">
                      <form @submit.prevent="createEvent">
                          <div class="row">
                              <div class="col-md-6">
                                  <div class="mb-3">
                                      <label for="title" class="form-label">Event Title *</label>
                                      <input 
                                          type="text" 
                                          class="form-control" 
                                          id="title"
                                          v-model="eventForm.title"
                                          required
                                      >
                                  </div>
                              </div>
                              <div class="col-md-6">
                                  <div class="mb-3">
                                      <label for="ticket_price" class="form-label">Ticket Price *</label>
                                      <input 
                                          type="number" 
                                          class="form-control" 
                                          id="ticket_price"
                                          v-model="eventForm.ticket_price"
                                          min="0"
                                          step="0.01"
                                          required
                                      >
                                  </div>
                              </div>
                          </div>
                          
                          <div class="row">
                              <div class="col-md-6">
                                  <div class="mb-3">
                                      <label for="start_time" class="form-label">Start Date & Time *</label>
                                      <input 
                                          type="datetime-local" 
                                          class="form-control" 
                                          id="start_time"
                                          v-model="eventForm.start_time"
                                          required
                                      >
                                  </div>
                              </div>
                              <div class="col-md-6">
                                  <div class="mb-3">
                                      <label for="end_time" class="form-label">End Date & Time *</label>
                                      <input 
                                          type="datetime-local" 
                                          class="form-control" 
                                          id="end_time"
                                          v-model="eventForm.end_time"
                                          required
                                      >
                                  </div>
                              </div>
                          </div>

                          <div class="mb-3">
                              <label for="description" class="form-label">Description</label>
                              <textarea 
                                  class="form-control" 
                                  id="description"
                                  rows="3"
                                  v-model="eventForm.description"
                              ></textarea>
                          </div>

                          <div class="mb-3">
                              <label for="event_image" class="form-label">Event Image</label>
                              <input 
                                  type="file" 
                                  class="form-control" 
                                  id="event_image"
                                  @change="handleImageUpload"
                                  accept="image/jpeg,image/png,image/jpg,image/gif,image/svg"
                              >
                              <small class="text-muted">Max size: 2MB. Formats: JPEG, PNG, JPG, GIF, SVG</small>
                          </div>

                          <div class="d-flex gap-2">
                              <button type="submit" class="btn btn-success" :disabled="isSubmitting">
                                  {{ isSubmitting ? 'Creating...' : 'Create Event' }}
                              </button>
                              <button type="button" class="btn btn-secondary" @click="resetForm">
                                  Reset
                              </button>
                          </div>
                      </form>
                  </div>
              </div>

              <!-- Events List -->
              <div class="card">
                  <div class="card-header">
                      <span>All Events</span>
                      <button class="btn btn-outline-primary btn-sm ms-2" @click="fetchEvents">
                          Refresh
                      </button>
                  </div>
                  <div class="card-body">
                      <div v-if="loading" class="text-center">
                          <div class="spinner-border" role="status">
                              <span class="visually-hidden">Loading...</span>
                          </div>
                      </div>

                      <table class="table table-striped" v-else-if="events && events.length > 0">
                          <thead>
                              <tr>
                                  <th scope="col">#</th>
                                  <th scope="col">Image</th>
                                  <th scope="col">Title</th>
                                  <th scope="col">Start Date</th>
                                  <th scope="col">End Date</th>
                                  <th scope="col">Ticket Price</th>
                                  <th scope="col">Action</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="(event, index) in events" :key="event.id">
                                  <th scope="row">{{ index + 1 }}</th>
                                  <td>
                                      <img 
                                          v-if="event.event_image" 
                                          :src="event.event_image" 
                                          alt="Event Image"
                                          class="img-thumbnail"
                                          style="width: 50px; height: 50px; object-fit: cover;"
                                      >
                                      <span v-else class="text-muted">No Image</span>
                                  </td>
                                  <td>{{ event.title }}</td>
                                  <td>{{ formatDateTime(event.start_time) }}</td>
                                  <td>{{ formatDateTime(event.end_time) }}</td>
                                  <td>${{ event.ticket_price }}</td>
                                  <td>
                                      <router-link 
                                          :to="`/admin/event/edit/${event.id}`"
                                          class="btn btn-outline-primary btn-sm"
                                      >
                                          Edit
                                      </router-link>
                                  </td>
                              </tr>
                          </tbody>
                      </table>

                      <div v-else class="text-center text-muted">
                          <p>No events found. Create your first event!</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
import api from '@/api/axios';
import { onMounted, ref, reactive } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useRouter } from 'vue-router';

const events = ref([])
const toast = useToast()
const router = useRouter()
const loading = ref(false)
const isSubmitting = ref(false)
const showCreateForm = ref(false)

// Form data
const eventForm = reactive({
    title: '',
    start_time: '',
    end_time: '',
    ticket_price: '',
    description: '',
    event_image: null
})

// Fetch events
const fetchEvents = async () => {
    loading.value = true
    try {
        const response = await api.get('/events');
        if (response.status) {
            events.value = response.data.data;
        }
    } catch (error) {
        console.log(error);
        toast.error('Failed to fetch events')
    } finally {
        loading.value = false
    }
}

// Handle image upload
const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        // Validate file size (2MB max)
        if (file.size > 2048 * 1024) {
            toast.error('Image size must be less than 2MB')
            event.target.value = ''
            return
        }
        eventForm.event_image = file
    }
}

// Create event
const createEvent = async () => {
    isSubmitting.value = true
    
    try {
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('title', eventForm.title)
        formData.append('start_time', eventForm.start_time)
        formData.append('end_time', eventForm.end_time)
        formData.append('ticket_price', eventForm.ticket_price)
        formData.append('description', eventForm.description)
        
        if (eventForm.event_image) {
            formData.append('event_image', eventForm.event_image)
        }

        const response = await api.post('/events', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        if (response.data.status) {
            toast.success('Event created successfully!')
            resetForm()
            showCreateForm.value = false
            await fetchEvents() // Refresh the events list
        } else {
            toast.error(response.data.message || 'Failed to create event')
        }
    } catch (error) {
        console.error('Error creating event:', error)
        
        if (error.response && error.response.data && error.response.data.errors) {
            // Handle validation errors
            const errors = error.response.data.errors
            Object.keys(errors).forEach(field => {
                errors[field].forEach(message => {
                    toast.error(`${field}: ${message}`)
                })
            })
        } else {
            toast.error('Failed to create event. Please try again.')
        }
    } finally {
        isSubmitting.value = false
    }
}

// Reset form
const resetForm = () => {
    eventForm.title = ''
    eventForm.start_time = ''
    eventForm.end_time = ''
    eventForm.ticket_price = ''
    eventForm.description = ''
    eventForm.event_image = null
    
    // Reset file input
    const fileInput = document.getElementById('event_image')
    if (fileInput) {
        fileInput.value = ''
    }
}

// Format date time
const formatDateTime = (date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleString()
}

// Initialize
onMounted(() => {
    fetchEvents()
})
</script>

<style scoped>
.img-thumbnail {
    border-radius: 4px;
}

.spinner-border {
    width: 2rem;
    height: 2rem;
}
</style>