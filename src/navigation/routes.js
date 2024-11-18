// navigation/routes.js
export const ROUTES = {
    AUTH: {
      LOGIN: 'Login',
      REGISTER: 'Register',
      CONFIRMATION: 'Confirmation',
    },
    CUSTOMER: {
      HOME: 'Home',
      HISTORY: 'History',
      SETTINGS: 'Settings',
      SERVICES: {
        MOTOR_TAXI: 'Motor Taxi',
        PAKYAW: 'Pakyaw',
        DELIVERY: 'Delivery',
      },
      BOOKING: {
        WAITING: 'WaitingForRider',
        TRACKING: 'Tracking Rider',
        IN_TRANSIT: 'In Transit',
        REVIEW: 'To Review',
        FEEDBACK: 'CustomerFeedback',
      },
      MAP: {
        LOCATION: 'Location',
        PICKER: 'MapPicker',
      },
    },
    RIDER: {
      HOME: 'Home',
      VERIFICATION: 'Get Verified',
      HISTORY: 'Booking History',
      SETTINGS: 'Settings',
      BOOKING: {
        NEARBY: 'Nearby Customer',
        DETAILS: 'BookingDetails',
        TRACKING: {
          CUSTOMER: 'Tracking Customer',
          DESTINATION: 'Tracking Destination',
        },
        COMPLETE: 'Finish',
        FEEDBACK: 'Rider Feedback',
      },
      MAP: {
        CURRENT: 'Current Location',
        BOOKED: 'Booked Location',
      },
    },
  };