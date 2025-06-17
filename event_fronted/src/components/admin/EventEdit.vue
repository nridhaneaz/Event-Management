<template>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">Event update</div>
                    <div class="card-body">

                        <form v-if="event" @submit.prevent="updateEvent">
                            <div class="mb-3">
                                <label for="title" class="form-label">Title</label>
                                <input v-model="event.title" type="text" class="form-control" id="title" required>
                            </div>
                            <div class="mb-3">
                                <label for="start_time" class="form-label">Start Time</label>
                                <input v-model="formattedStartTime" type="datetime-local" class="form-control" id="start_time" required>
                            </div>
                            <div class="mb-3">
                                <label for="end_time" class="form-label">End Time</label>
                                <input v-model="formattedEndTime" type="datetime-local" class="form-control" id="end_time" required>
                            </div>
                            <div class="mb-3">
                                <label for="ticket_price" class="form-label">Ticket Price</label>
                                <input v-model="event.ticket_price" type="number" min="0" step="0.01" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="description" class="form-label">Description</label>
                                <textarea v-model="event.description" class="form-control" id="description" rows="3"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary" :disabled="isUpdating">
                                {{ isUpdating ? 'Updating...' : 'Update Event' }}
                            </button>
                            <button type="button" class="btn btn-secondary ms-2" @click="cancelUpdate">Cancel</button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import { useRouter, useRoute } from 'vue-router';
import api from '@/api/axios';
import { useToast } from 'vue-toast-notification';
import { onMounted, ref, computed } from 'vue';
import router from '@/routes';

const loggeduser = ref(null)
const event = ref(null)
const isUpdating = ref(false)

const route = useRoute()
const toast = useToast()

// Computed properties for datetime formatting
const formattedStartTime = computed({
    get() {
        if (!event.value?.start_time) return ''
        return formatDateForInput(event.value.start_time)
    },
    set(value) {
        if (event.value) {
            event.value.start_time = formatDateForAPI(value)
        }
    }
})

const formattedEndTime = computed({
    get() {
        if (!event.value?.end_time) return ''
        return formatDateForInput(event.value.end_time)
    },
    set(value) {
        if (event.value) {
            event.value.end_time = formatDateForAPI(value)
        }
    }
})

// Format date for HTML datetime-local input
const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    // Format as YYYY-MM-DDTHH:MM
    return date.toISOString().slice(0, 16)
}

// Format date for API (MySQL format)
const formatDateForAPI = (datetimeLocal) => {
    if (!datetimeLocal) return ''
    const date = new Date(datetimeLocal)
    // Format as YYYY-MM-DD HH:MM:SS
    return date.toISOString().slice(0, 19).replace('T', ' ')
}

onMounted(() => {
    const user = localStorage.getItem('user')
    loggeduser.value = JSON.parse(user)

    const eventId = route.params.eventId

    if (eventId) {
        api.get(`/event/${eventId}`).then((response) => {
            event.value = response.data.data
            console.log('Event loaded:', event.value)
        }).catch((error) => {
            console.error('Error loading event:', error)
            toast.error('Failed to load event data')
        })
    }
})

const updateEvent = async () => {
    if (isUpdating.value) return
    
    try {
        isUpdating.value = true
        const eventId = route.params.eventId
        
        // Prepare data for update
        const updateData = {
            id: eventId,
            title: event.value.title,
            start_time: event.value.start_time,
            end_time: event.value.end_time,
            ticket_price: event.value.ticket_price,
            description: event.value.description || ''
        }
        
        console.log('Updating event with data:', updateData)
        
        const response = await api.put(`/event/update/${eventId}`, updateData)
        
        if (response.data.status) {
            toast.success(response.data.message || 'Event updated successfully')
            
            // Wait a bit then redirect
            setTimeout(() => {
                router.push('/admin/events')
            }, 1500)
        } else {
            toast.error(response.data.message || 'Failed to update event')
        }
        
    } catch (error) {
        console.error('Update error:', error)
        
        if (error.response?.data?.errors) {
            // Show validation errors
            const errors = error.response.data.errors
            Object.keys(errors).forEach(key => {
                errors[key].forEach(message => {
                    toast.error(`${key}: ${message}`)
                })
            })
        } else {
            toast.error(error.response?.data?.message || 'Failed to update event')
        }
    } finally {
        isUpdating.value = false
    }
}

const cancelUpdate = () => {
    router.push('/admin/events')
}

</script>