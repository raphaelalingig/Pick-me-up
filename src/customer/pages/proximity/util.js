// Helper function to calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  };
  
  const toRad = (value) => {
    return value * Math.PI / 180;
  };
  
  // Format distance for display
  export const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };
  
  // Sort riders by proximity
  export const sortRidersByDistance = (riders, customerLat, customerLng) => {
    return riders.map(rider => ({
      ...rider,
      distance: calculateDistance(
        customerLat,
        customerLng,
        parseFloat(rider.rider_latitude),
        parseFloat(rider.rider_longitude)
      )
    })).sort((a, b) => a.distance - b.distance);
  };
  
  // Filter riders by maximum distance
  export const filterRidersByDistance = (riders, maxDistance) => {
    return riders.filter(rider => rider.distance <= maxDistance);
  };