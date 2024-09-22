import React, { createContext, useState } from "react";

export const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customerCoords, setCustomerCoords] = useState({
    accuracy: null,
    longitude: null,
    latitude: null,
    altitude: null,
    altitudeAccuracy: null,
    timestamp: null,
  });

  const [totalDistanceRide, setTotalDistanceRide] = useState(null);

  return (
    <CustomerContext.Provider
      value={{
        customerCoords,
        setCustomerCoords,
        totalDistanceRide,
        setTotalDistanceRide,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};
