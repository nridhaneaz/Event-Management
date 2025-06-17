import {createRouter, createWebHistory} from 'vue-router'
import Home from '@/views/Home.vue'
import Navbar from '@/views/Navbar.vue'
import Login from '@/views/Login.vue'
import Memberregistration from '@/views/MemberRegistration.vue'
import MemberDashboard from '../views/MemberDashboard.vue'
import MemberEventConfirmation from '../views/MemberEventConfirmation.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminProfile from '../components/admin/AdminProfile.vue'
import Events from '../components/admin/Events.vue'
import EventEdit from '../components/admin/EventEdit.vue'
import MemberBookings from '../views/MemberBookings.vue'
import Bookings from '../components/admin/Bookings.vue'
import BookingUpdate from '../components/admin/BookingUpdate.vue'
import SendOTP from '../views/SendOTP.vue'
import ResetPassword from '../views/ResetPassword.vue'
import VerifyOTP from '../views/VerifyOTP.vue'



const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/registration', component: Memberregistration},
    {path: '/member-dashboard', component: MemberDashboard},
    {path: '/member-event-confirmation', component: MemberEventConfirmation},
    {path: '/member-event-bookings', component: MemberBookings},
    {path: '/send-otp', name: 'SendOTP', component: SendOTP},
    {path: '/verify-otp', name: 'VerifyOTP', component: VerifyOTP},
    {path: '/reset-password', name: 'ResetPassword', component: ResetPassword},
    {path: '/navbar', component: Navbar},
    {path: '/admin', 
        component:AdminDashboard,
        children:[
            
            {path:'dashboard', component: AdminProfile},
            {path:'events', component:Events},
            {path: 'bookings', component: Bookings},
            {path:'event/edit/:eventId', component: EventEdit},
            {path:'booking/update/:bookingId', component: BookingUpdate},
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router