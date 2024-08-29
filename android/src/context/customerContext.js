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

  return (
    <CustomerContext.Provider value={{ customerCoords, setCustomerCoords }}>
      {children}
    </CustomerContext.Provider>
  );
};
