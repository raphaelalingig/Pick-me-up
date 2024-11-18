import React, { useMemo } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Card, Text, Button } from 'react-native-paper';
import SuperCluster from 'supercluster';

const { width, height } = Dimensions.get('window');

const MapWithClustering = ({ 
  riders, 
  region, 
  customerLocation,
  onRegionChange,
  onRiderSelect,
  customerMarker,
  riderMarker 
}) => {
  // Create points for supercluster
  const points = useMemo(() => 
    riders.map(rider => ({
      type: 'Feature',
      properties: { 
        cluster: false, 
        riderId: rider.rider_id,
        riderData: rider 
      },
      geometry: {
        type: 'Point',
        coordinates: [
          parseFloat(rider.rider_longitude),
          parseFloat(rider.rider_latitude)
        ]
      }
    })), [riders]);

  // Initialize supercluster
  const index = useMemo(() => {
    const cluster = new SuperCluster({
      radius: 40,
      maxZoom: 16,
      minZoom: 1
    });
    cluster.load(points);
    return cluster;
  }, [points]);

  // Get clusters based on current region
  const getClusters = () => {
    const bounds = getBoundingBox(region);
    return index.getClusters(bounds, Math.floor(region.longitudeDelta * 10));
  };

  // Render individual rider marker
  const renderRiderMarker = (feature) => {
    const rider = feature.properties.riderData;
    return (
      <Marker
        key={rider.rider_id}
        coordinate={{
          latitude: parseFloat(rider.rider_latitude),
          longitude: parseFloat(rider.rider_longitude)
        }}
        onPress={() => onRiderSelect(rider)}
      >
        <Image source={riderMarker} style={styles.markerIcon} />
        <Callout>
          <Card style={styles.calloutCard}>
            <Card.Content>
              <Text style={styles.riderName}>
                {rider.user.first_name} {rider.user.last_name}
              </Text>
              <Text>Rating: 4.4 ⭐</Text>
              <Button 
                mode="contained" 
                onPress={() => onRiderSelect(rider)}
                style={styles.selectButton}
              >
                Select Rider
              </Button>
            </Card.Content>
          </Card>
        </Callout>
      </Marker>
    );
  };

  // Render cluster marker
  const renderClusterMarker = (cluster) => {
    const coordinate = {
      latitude: cluster.geometry.coordinates[1],
      longitude: cluster.geometry.coordinates[0]
    };

    return (
      <Marker
        key={`cluster-${cluster.id}`}
        coordinate={coordinate}
      >
        <View style={styles.clusterMarker}>
          <Text style={styles.clusterText}>
            {cluster.properties.point_count}
          </Text>
        </View>
        <Callout>
          <Text>
            {cluster.properties.point_count} riders in this area
          </Text>
        </Callout>
      </Marker>
    );
  };

  return (
    <MapView
      style={styles.map}
      region={region}
      onRegionChangeComplete={onRegionChange}
      provider="google"
    >
      {/* Customer Marker */}
      {customerLocation && (
        <Marker
          coordinate={customerLocation}
          title="Your Location"
        >
          <Image source={customerMarker} style={styles.markerIcon} />
        </Marker>
      )}

      {/* Clustered Rider Markers */}
      {getClusters().map(feature => {
        if (feature.properties.cluster) {
          return renderClusterMarker(feature);
        }
        return renderRiderMarker(feature);
      })}
    </MapView>
  );
};

// Helper function to get bounding box from region
const getBoundingBox = (region) => {
  const latDelta = region.latitudeDelta;
  const lngDelta = region.longitudeDelta;
  
  return [
    region.longitude - lngDelta, // westLng
    region.latitude - latDelta,  // southLat
    region.longitude + lngDelta, // eastLng
    region.latitude + latDelta   // northLat
  ];
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: height * 0.8,
  },
  markerIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  clusterMarker: {
    backgroundColor: 'rgba(0, 123, 255, 0.8)',
    borderRadius: 20,
    padding: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  clusterText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  calloutCard: {
    width: 200,
    borderRadius: 10,
  },
  riderName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  selectButton: {
    marginTop: 10,
  }
});

export default MapWithClustering;