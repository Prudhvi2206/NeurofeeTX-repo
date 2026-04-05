import React, { useEffect, useRef, useState, useCallback } from 'react';

function WorkingGoogleMap({ 
  startPoint, 
  endPoint, 
  routeData, 
  alternativeRoutes = [], 
  selectedRouteIndex = 0,
  onSelectRoute // ✅ New prop for interactivity
}) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [alternativePolylines, setAlternativePolylines] = useState([]);
  const [infoWindows, setInfoWindows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Route colors for alternatives
  const routeColors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899'];

  const loadGoogleMaps = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setTimeout(() => {
          if (window.google && window.google.maps) {
            resolve();
          } else {
            reject(new Error('Google Maps failed to load'));
          }
        }, 1000);
      };
      
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  }, []);

  const initializeMap = useCallback(async () => {
    try {
      await loadGoogleMaps();
      
      if (!mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 12.9716, lng: 77.5946 }, // Bangalore default
        zoom: 12,
        mapTypeId: 'roadmap',
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ lightness: 10 }]
          }
        ]
      });

      setMap(mapInstance);
      
      // Initialize DirectionsRenderer for primary route
      const renderer = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: routeColors[0],
          strokeWeight: 8,
          strokeOpacity: 0.9,
          zIndex: 10
        }
      });
      setDirectionsRenderer(renderer);

      setLoading(false);
      
      // Add elements after map is ready
      setTimeout(() => {
        addRouteElements(mapInstance, renderer);
      }, 500);

    } catch (err) {
      console.error('Map initialization failed:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [loadGoogleMaps]);

  const addRouteElements = (mapInstance, renderer) => {
    try {
      const startCoords = routeData?.startCoords || { lat: 12.9716, lng: 77.5946 };
      const endCoords = routeData?.endCoords || { lat: 12.9850, lng: 77.6095 };

      // Start marker
      new window.google.maps.Marker({
        position: startCoords,
        map: mapInstance,
        title: startPoint || 'Start',
        label: { text: 'S', color: 'white', fontWeight: 'bold' },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#22c55e',
          strokeColor: 'white',
          strokeWeight: 3
        }
      });

      // End marker
      new window.google.maps.Marker({
        position: endCoords,
        map: mapInstance,
        title: endPoint || 'End',
        label: { text: 'E', color: 'white', fontWeight: 'bold' },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#ef4444',
          strokeColor: 'white',
          strokeWeight: 3
        }
      });

      // Get real directions
      getRealDirections(mapInstance, startCoords, endCoords, renderer);

      // Draw alternatives
      drawAlternativeRoutes(mapInstance, startCoords, endCoords);

      // Fit bounds
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(startCoords);
      bounds.extend(endCoords);
      mapInstance.fitBounds(bounds, { padding: 80 });

    } catch (err) {
      console.error('Error adding route elements:', err);
    }
  };

  const getRealDirections = (mapInstance, startCoords, endCoords, renderer) => {
    try {
      const directionsService = new window.google.maps.DirectionsService();
      const request = {
        origin: startCoords,
        destination: endCoords,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: 'bestguess'
        }
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK' && result.routes[0]) {
          renderer.setDirections(result);
        }
      });
    } catch (err) {
      console.error('Directions failed:', err);
    }
  };

  const drawAlternativeRoutes = (mapInstance, startCoords, endCoords) => {
    const polylines = [];
    
    alternativeRoutes.forEach((altRoute, index) => {
      if (!altRoute.overviewPath) return;

      const color = routeColors[index + 1];
      const polyline = new window.google.maps.Polyline({
        path: altRoute.overviewPath,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: selectedRouteIndex === (index + 1) ? 0.9 : 0.4,
        strokeWeight: selectedRouteIndex === (index + 1) ? 8 : 4,
        map: mapInstance,
        zIndex: selectedRouteIndex === (index + 1) ? 9 : 5
      });

      polyline.addListener('click', () => {
        if (onSelectRoute) onSelectRoute(index + 1);
      });

      polylines.push(polyline);
    });

    setAlternativePolylines(polylines);
  };

  // ✅ Smoothly update polyline appearance when selection changes
  useEffect(() => {
    if (directionsRenderer) {
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeWeight: selectedRouteIndex === 0 ? 10 : 6,
          strokeOpacity: selectedRouteIndex === 0 ? 1.0 : 0.4,
          zIndex: selectedRouteIndex === 0 ? 100 : 10
        }
      });
    }

    alternativePolylines.forEach((plt, idx) => {
      if (plt) {
        plt.setOptions({
          strokeOpacity: selectedRouteIndex === (idx + 1) ? 0.9 : 0.4,
          strokeWeight: selectedRouteIndex === (idx + 1) ? 10 : 5,
          zIndex: selectedRouteIndex === (idx + 1) ? 100 : 10
        });
      }
    });
  }, [selectedRouteIndex, directionsRenderer, alternativePolylines]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  if (loading) {
    return (
      <div style={{
        height: '500px', width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader" style={{ marginBottom: '16px' }}></div>
          <h3 style={{ color: '#64748b' }}>Initializing Google Maps...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        height: '500px', width: '100%', borderRadius: '12px', border: '1px solid #fecaca',
        display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2'
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: '#991b1b' }}>Map Error</h3>
          <p style={{ color: '#b91c1c' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container" style={{ position: 'relative', height: '520px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      {/* Enhanced Interactive Legend */}
      <div className="map-legend map-legend-mobile glass-panel">
        <div style={{ fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#1e293b' }}>
          <span style={{ fontSize: '18px', marginRight: '8px' }}>🛣️</span> Available Routes
        </div>
        
        {/* Primary Route Item */}
        <div 
          onClick={() => onSelectRoute && onSelectRoute(0)}
          className={`route-item ${selectedRouteIndex === 0 ? 'active' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div className="route-dot" style={{ background: routeColors[0] }}></div>
            <span style={{ fontWeight: '600', color: selectedRouteIndex === 0 ? '#1d4ed8' : '#475569' }}>Primary (Suggested)</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginLeft: '22px' }}>
             {routeData?.distance?.text} • {routeData?.duration?.text}
          </div>
        </div>

        {/* Alternative Route Items */}
        {alternativeRoutes.map((alt, idx) => (
          <div 
            key={idx}
            onClick={() => onSelectRoute && onSelectRoute(idx + 1)}
            className={`route-item ${selectedRouteIndex === idx + 1 ? 'active' : ''}`}
            style={selectedRouteIndex === idx + 1 ? { borderColor: routeColors[idx + 1], background: `rgba(${idx % 2 === 0 ? '245, 158, 11' : '16, 185, 129'}, 0.1)` } : {}}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div className="route-dot" style={{ background: routeColors[idx + 1] }}></div>
              <span style={{ fontWeight: '600', color: selectedRouteIndex === idx + 1 ? routeColors[idx + 1] : '#475569' }}>
                Alternative {idx + 1}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginLeft: '22px' }}>
              {alt.distance?.text} • {alt.duration?.text}
            </div>
          </div>
        ))}
        
        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '12px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
          Click a route to switch view
        </div>
      </div>
    </div>
  );
}

export default WorkingGoogleMap;

