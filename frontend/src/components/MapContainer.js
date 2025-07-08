import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Polygon,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// Custom icons
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to change map view (location) imperatively
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

// Click handler for adding new markers or polygons on map click
function ClickHandler({
  markerSelectionPossible,
  polygonSelectionPossible,
  newMarkers,
  onNewMarkersChanged,
  newPolygons,
  onNewPolygonsChanged,
  currentPolygonIndex,
}) {
  useMapEvents({
    click(e) {
      // Marker mode
      if (markerSelectionPossible && newMarkers) {
        const emptyIndex = newMarkers.findIndex(
          ([lon, lat]) => lon == null || lat == null
        );
        if (emptyIndex === -1) return;

        const updatedMarkers = [...newMarkers];
        updatedMarkers[emptyIndex] = [e.latlng.lng, e.latlng.lat];
        onNewMarkersChanged(updatedMarkers);
        return;
      }

      // Polygon mode
      if (polygonSelectionPossible && newPolygons && onNewPolygonsChanged) {
        if (
          currentPolygonIndex == null ||
          currentPolygonIndex < 0 ||
          currentPolygonIndex >= newPolygons.length
        ) {
          return;
        }

        const updatedPolygons = [...newPolygons];
        let currentPolygon = [...updatedPolygons[currentPolygonIndex]];

        // Remove closure if already closed
        if (currentPolygon.length > 1) {
          const [firstLon, firstLat] = currentPolygon[0];
          const [lastLon, lastLat] = currentPolygon[currentPolygon.length - 1];

          const isClosed = firstLon === lastLon && firstLat === lastLat;

          if (isClosed) {
            currentPolygon = currentPolygon.slice(0, -1);
          }
        }

        // Add new point
        currentPolygon.push([e.latlng.lng, e.latlng.lat]);

        // Re-close polygon
        if (currentPolygon.length > 1) {
          currentPolygon.push(currentPolygon[0]); // Explicitly close polygon
        }

        updatedPolygons[currentPolygonIndex] = currentPolygon;
        onNewPolygonsChanged(updatedPolygons);
      }
    },
  });

  return null;
}

// Main component wrapped in forwardRef to expose goToAddress()
export const MapContainer = forwardRef(
  (
    {
      markerEndpoint,
      polygonEndpoint,
      markerSelectionPossible,
      polygonSelectionPossible,
      newMarkers,
      newPolygons,
      onNewMarkersChanged,
      onNewPolygonsChanged,
      onSelectedMarkerChange,
      onSelectedPolygonChange,
      currentPolygonIndex, // Pass this from parent
    },
    ref
  ) => {
    const [apiMarkers, setApiMarkers] = useState([]);
    const [position, setPosition] = useState([51.505, -0.09]); // initial center

    useEffect(() => {
      if (!markerEndpoint) return;
      // TODO: Fetch from markerEndpoint and setApiMarkers
    }, [markerEndpoint]);

    // When newMarkers update with valid position, update center position
    useEffect(() => {
      if (
        newMarkers &&
        newMarkers.length > 0 &&
        newMarkers[0][0] != null &&
        newMarkers[0][1] != null
      ) {
        setPosition([newMarkers[0][1], newMarkers[0][0]]);
      }
    }, [newMarkers]);

    // Expose goToAddress method to parent via ref
    useImperativeHandle(ref, () => ({
      goToAddress: async (address) => {
        if (!address) return;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              address
            )}`
          );
          const data = await res.json();
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const newPos = [parseFloat(lat), parseFloat(lon)];
            setPosition(newPos);

            // Optionally update newMarkers with searched position
            if (newMarkers && newMarkers.length > 0) {
              const updatedMarkers = [...newMarkers];
              updatedMarkers[0] = [parseFloat(lon), parseFloat(lat)];
              if (onNewMarkersChanged) onNewMarkersChanged(updatedMarkers);
            }
          } else {
            alert("Address not found");
          }
        } catch (e) {
          alert("Error searching address");
        }
      },
    }));

    return (
      <LeafletMap
        center={position}
        zoom={13}
        style={{ height: "85%", width: "100%" }}
      >
        <ChangeView center={position} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <ClickHandler
          markerSelectionPossible={markerSelectionPossible}
          polygonSelectionPossible={polygonSelectionPossible}
          newMarkers={newMarkers}
          onNewMarkersChanged={onNewMarkersChanged}
          newPolygons={newPolygons}
          onNewPolygonsChanged={onNewPolygonsChanged}
          currentPolygonIndex={currentPolygonIndex} // Pass this from parent
        />

        {/* API Markers (blue) */}
        {apiMarkers.map(([lon, lat], i) => (
          <Marker key={`api-marker-${i}`} position={[lat, lon]} icon={blueIcon} />
        ))}

        {/* New Markers (red) */}
        {newMarkers &&
          newMarkers.map(([lon, lat], i) => {
            if (lon == null || lat == null) return null;
            return (
              <Marker key={`new-marker-${i}`} position={[lat, lon]} icon={redIcon} />
            );
          })}

        {/* New Polygons (red outline) */}
        {newPolygons &&
          newPolygons.map((polygon, i) => {
            if (!polygon || polygon.length === 0) return null;

            let positions = polygon.map(([lon, lat]) => [lat, lon]);

            // Ensure polygon is explicitly closed
            const firstPoint = positions[0];
            const lastPoint = positions[positions.length - 1];
            const isClosed =
              firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1];

            if (!isClosed) {
              positions = [...positions, firstPoint];
            }

            return (
              <Polygon
                key={`new-polygon-${i}`}
                positions={positions}
                pathOptions={{ color: "red" }}
              />
            );
          })}
      </LeafletMap>
    );
  }
);