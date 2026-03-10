import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Home from './user/home.jsx'
import CityProperties from './user/cityproperties.jsx'
import Book from './user/booking.jsx'
import Payment from './user/payment.jsx'
import UserProfile from './user/userprofile.jsx'

import PastPropertiese from './host/pastProperties.jsx'
import PropertyBookingDetails from './host/PropertyBookingDetails.jsx'

import Register from './register.jsx'
import BecomeHost from './host/becomehost.jsx'
import Hostdash from './host/hostdashboard.jsx'
import BookingCleanupTimer from './calender/refereshcalender.jsx'
import { createBrowserRouter, Navigate, RouterProvider, useNavigate } from 'react-router-dom'

import { ProtectedRoute } from './routes/protected.jsx'
import { PublicRoute } from './routes/public.jsx'
import { AdminRoute } from './routes/protectedadmin.jsx'

import AdminPage from './admin/admin.jsx'
import PropertyDetail from './admin/propertyDetail.jsx'


import {FilterProvider} from "./customHooks/FilterContext.jsx"

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/auth' />
  },
  {
    path: '/auth',
    element: <PublicRoute> <App /> </PublicRoute>
  },
  {
    path: '/register',
    element: <PublicRoute> <Register /> </PublicRoute>
  },
  {
    path: '/home',
    element: <ProtectedRoute>  <Home /> </ProtectedRoute>
  },
  {
    path: '/user/profile',
    element: <ProtectedRoute> <UserProfile /> </ProtectedRoute>
  },
  {
    path: '/city/:cityName',
    element: <ProtectedRoute> <CityProperties /> </ProtectedRoute>
  },
  {
    path: '/property/book/:propertyId',
    element: <ProtectedRoute><Book /></ProtectedRoute>
  },
  {
    path: '/payment/:bookingId',
    element: <ProtectedRoute><Payment /></ProtectedRoute>
  },
  {
    path: '/become-host',
    element: <ProtectedRoute><BecomeHost /></ProtectedRoute>
  },
  {
    path: '/past/properties',
    element: <ProtectedRoute><Hostdash /></ProtectedRoute>
  },
  
  {
     path: '/host-dashboard',
    element: <ProtectedRoute><PastPropertiese/></ProtectedRoute>
  },
  {
     path: '/host-dashboard/properties/:propertyId/bookings',
    element: <ProtectedRoute><PropertyBookingDetails/></ProtectedRoute>
  }, 
  {
    path: '/admin',
    element: <AdminRoute><AdminPage/></AdminRoute>
  },
  {
    path: '/admin/property/:id',
    element: <AdminRoute> <PropertyDetail/></AdminRoute>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BookingCleanupTimer />
    <FilterProvider><RouterProvider router={router} /></FilterProvider>
  
  </StrictMode>,
)
