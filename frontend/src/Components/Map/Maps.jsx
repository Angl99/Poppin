import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

const MapStyles = styled.div`
  width: 40vw;
  height: 100vh;
`;
const StoreListContainer = styled.div`
  width: 30vw;
  height: 100vh;
  background-color: #fff;
  padding: 1rem;
  overflow-y: auto;
`;

const StoreListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #ddd;
`;

const StoreName = styled.p`
  margin-left: 1rem;
  font-weight: bold;
`;

export default function Maps() {
  const mapBoxApiKey = process.env.REACT_APP_MAPBOX_API_KEY;
  const [map, setMap] = useState(null);
  const mapContainer = useRef(null);
  // Set Manhattan NYC as default location (longitude, latitude)
  const [currentLocation, setCurrentLocation] = useState([
    -73.985171, 40.758895,
  ]);
  const [stores, setStores] = useState([]);

  const successLocation = (position) => {
    const { latitude, longitude } = position.coords;

    setCurrentLocation([latitude,longitude]);

    // Create a new center object based on position
    const newCenter = [longitude, latitude]; // Mapbox uses [longitude, latitude]

    // Update the map center using setMap
    if (map) {
      map.setCenter(newCenter);
    }
  };

  const errorLocation = () => {
    // Consider providing a user-friendly message or fallback action here
    console.error("Location could not be found...");
  };

  // Function to fetch nearby stores using Mapbox Geocoding API
  const fetchNearbyStores = async () => {
    const searchTerm = "stores";
    const url = new URL(`https://api.mapbox.com/geocoding/v5/${searchTerm}.json?`);
    url.searchParams.append("proximity", currentLocation);
    url.searchParams.append("limit", 5);
    url.searchParams.append("access_token", mapBoxApiKey);
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      setStores(data.features);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  useEffect(() => {
    if (mapContainer.current && !map) {
      mapboxgl.accessToken = mapBoxApiKey;

      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: currentLocation,
        zoom: 13,
        showPlaceLabels: true,
        showPointOfInterestLabels: true,
      });
      setMap(newMap);

      // Adds the navigation control after creating the map
      const nav = new mapboxgl.NavigationControl();
      newMap.addControl(nav); // Add control to the map

      const directions = new MapboxDirections({
        accessToken: mapBoxApiKey,
      });
      newMap.addControl(directions, "top-left");

      // Add geocoder control
      const geocoder = new MapboxGeocoder({
        accessToken: mapBoxApiKey,
        mapboxgl: mapboxgl,
        container: mapContainer.current,
      });

      geocoder.on("result", (e) => {
        const newCenter = e.result.geometry.coordinates;
        setCurrentLocation(newCenter.reverse()); // Update state with new coordinates
        fetchNearbyStores(); // Fetch stores near the new location
      });

      navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
        enableHighAccuracy: true,
      });
    }

    fetchNearbyStores();

    // Clean up the map instance on component unmount
    return () => {
      if (map) {
        try {
          map.remove();
        } catch (error) {
          console.error("Error removing map:", error);
        }
      }
    };
  }, [mapBoxApiKey, map]);

  return <MapStyles ref={mapContainer} />;
}
