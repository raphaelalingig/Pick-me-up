import React, { createContext, useState } from "react";

export const RiderContext = createContext();

export const RiderProvider = ({ children }) => {
  const [riderCoords, setRiderCoords] = useState({
    accuracy: null,
    longitude: null,
    latitude: null,
    altitude: null,
    altitudeAccuracy: null,
    timestamp: null,
  });

  return (
    <RiderContext.Provider value={{ riderCoords, setRiderCoords }}>
      {children}
    </RiderContext.Provider>
  );
};
