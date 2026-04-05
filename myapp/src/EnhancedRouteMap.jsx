import React, { useEffect, useRef, useState, useCallback } from 'react';
import './RouteMap.css';

function EnhancedRouteMap({ startPoint, endPoint, routeData, trafficData, alternativeRoutes }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [markers, setMarkers] = useState([]);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [trafficLayer, setTrafficLayer] = useState(null);

    // Initialize Google Maps with enhanced features
    useEffect(() => {
        console.log('🗺️ Enhanced Google Maps Initialization...');
        
        if (!startPoint || !endPoint || (!routeData && !alternativeRoutes?.length)) {
            console.log('⚠️ Map not ready - missing route data');
            setLoading(false);
            return;
        }
        
        loadGoogleMaps();
    }, [startPoint, endPoint, routeData, alternativeRoutes]);

    // Load Google Maps API with all required libraries
    const loadGoogleMaps = useCallback(() => {
        // Check if already loaded
        if (window.google && window.google.maps && window.google.maps.DirectionsService) {
            console.log('✅ Google Maps already loaded');
            initializeMap();
            return;
        }

        console.log('📦 Loading Google Maps API...');
        
        // Remove existing script if any
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            existingScript.remove();
        }

        // Create script with all required libraries
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places,geometry,drawing';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            console.log('✅ Google Maps script loaded');
            setTimeout(() => {
                if (window.google && window.google.maps) {
                    console.log('🎯 Google Maps API ready');
                    setMapLoaded(true);
                    initializeMap();
                } else {
                    setError('❌ Google Maps API failed to initialize');
                    setLoading(false);
                }
            }, 1000);
        };
        
        script.onerror = () => {
            console.error('❌ Failed to load Google Maps script');
            setError('❌ Failed to load Google Maps. Check internet connection.');
            setLoading(false);
        };
        
        document.head.appendChild(script);
    }, []);

    // Initialize map with enhanced features
    const initializeMap = useCallback(() => {
        if (!mapRef.current || !window.google || !window.google.maps) {
            console.error('❌ Map container or Google Maps not available');
            return;
        }

        try {
            console.log('🗺️ Creating enhanced map instance...');
            
            // Ensure container has proper dimensions
            if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
                mapRef.current.style.width = '100%';
                mapRef.current.style.height = '500px';
                mapRef.current.style.display = 'block';
                mapRef.current.style.visibility = 'visible';
            }

            // Enhanced map options
            const mapOptions = {
                center: { lat: 12.9716, lng: 77.5946 }, // Bangalore center
                zoom: 13,
                mapTypeId: 'roadmap',
                zoomControl: true,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
                gestureHandling: 'cooperative',
                scaleControl: true,
                rotateControl: true,
                panControl: true,
                draggable: true,
                scrollwheel: true,
                disableDoubleClickZoom: false,
                styles: [
                    {
                        featureType: 'road',
                        elementType: 'geometry',
                        stylers: [{ color: '#38414e' }]
                    },
                    {
                        featureType: 'poi',
                        elementType: 'labels.text.fill',
                        stylers: [{ color: '#757575' }]
                    },
                    {
                        featureType: 'water',
                        elementType: 'geometry',
                        stylers: [{ color: '#17263c' }]
                    }
                ]
            };

            const mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);
            console.log('✅ Enhanced map created successfully');
            
            // Initialize services
            const directionsRenderer = new window.google.maps.DirectionsRenderer({
                draggable: true,
                panel: null,
                suppressMarkers: false,
                suppressPolylines: false,
                preserveViewport: false
            });
            
            directionsRenderer.setMap(mapInstance);
            setDirectionsRenderer(directionsRenderer);

            // Add traffic layer
            const trafficLayer = new window.google.maps.TrafficLayer();
            trafficLayer.setMap(mapInstance);
            setTrafficLayer(trafficLayer);

            // Trigger resize to ensure proper rendering
            window.google.maps.event.trigger(mapInstance, 'resize');
            
            setMap(mapInstance);
            setLoading(false);
            setError(null);

            // Add route elements
            setTimeout(() => {
                addRouteElements(mapInstance, directionsRenderer);
            }, 500);

        } catch (err) {
            console.error('❌ Error creating enhanced map:', err);
            setError('❌ Failed to create map: ' + err.message);
            setLoading(false);
        }
    }, []);

    // Add route elements with real data
    const addRouteElements = useCallback((mapInstance, directionsRenderer) => {
        console.log('📍 Adding route elements with real data...');
        
        try {
            // Get real coordinates from route data
            let startCoords, endCoords, routePath = null;
            
            if (routeData) {
                // Check if we have Google Maps route data
                if (routeData.googleRouteData && routeData.googleRouteData.startLocation) {
                    console.log('🎯 Using Google Maps route data');
                    startCoords = routeData.googleRouteData.startLocation;
                    endCoords = routeData.googleRouteData.endLocation;
                    routePath = routeData.googleRouteData.overviewPath;
                } 
                // Check if we have path data
                else if (routeData.path && routeData.path.length > 0) {
                    console.log('🛣️ Using route path data');
                    startCoords = { lat: routeData.path[0].lat, lng: routeData.path[0].lng };
                    endCoords = { lat: routeData.path[routeData.path.length - 1].lat, lng: routeData.path[routeData.path.length - 1].lng };
                    routePath = routeData.path.map(point => ({ lat: point.lat, lng: point.lng }));
                }
                // Check if we have coordinates directly
                else if (routeData.startCoords && routeData.endCoords) {
                    console.log('📍 Using direct coordinates');
                    startCoords = routeData.startCoords;
                    endCoords = routeData.endCoords;
                }
            }
            
            // Fallback to Bangalore coordinates
            if (!startCoords || !endCoords) {
                console.log('⚠️ Using default Bangalore coordinates');
                startCoords = { lat: 12.9716, lng: 77.5946 };
                endCoords = { lat: 12.9850, lng: 77.6095 };
            }

            console.log('🎯 Final coordinates:', { startCoords, endCoords });

            // Clear existing markers
            markers.forEach(marker => marker.setMap(null));
            const newMarkers = [];

            // Add enhanced start marker
            const startMarker = new window.google.maps.Marker({
                position: startCoords,
                map: mapInstance,
                title: `🚀 Start: ${startPoint}`,
                label: {
                    text: 'S',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px'
                },
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 15,
                    fillColor: '#22c55e',
                    strokeColor: 'white',
                    strokeWidth: 3
                },
                animation: window.google.maps.Animation.DROP
            });

            // Add info window for start marker
            const startInfoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px;">
                        <h3 style="margin: 0 0 5px 0; color: #22c55e;">🚀 Start Point</h3>
                        <p style="margin: 0;"><strong>${startPoint}</strong></p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                            ${startCoords.lat.toFixed(6)}, ${startCoords.lng.toFixed(6)}
                        </p>
                    </div>
                `
            });

            startMarker.addListener('click', () => {
                startInfoWindow.open(mapInstance, startMarker);
            });

            newMarkers.push(startMarker);

            // Add enhanced end marker
            const endMarker = new window.google.maps.Marker({
                position: endCoords,
                map: mapInstance,
                title: `🎯 End: ${endPoint}`,
                label: {
                    text: 'E',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px'
                },
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 15,
                    fillColor: '#ef4444',
                    strokeColor: 'white',
                    strokeWidth: 3
                },
                animation: window.google.maps.Animation.DROP
            });

            // Add info window for end marker
            const endInfoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px;">
                        <h3 style="margin: 0 0 5px 0; color: #ef4444;">🎯 Destination</h3>
                        <p style="margin: 0;"><strong>${endPoint}</strong></p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                            ${endCoords.lat.toFixed(6)}, ${endCoords.lng.toFixed(6)}
                        </p>
                    </div>
                `
            });

            endMarker.addListener('click', () => {
                endInfoWindow.open(mapInstance, endMarker);
            });

            newMarkers.push(endMarker);

            // Add route polyline if we have path data
            if (routePath && routePath.length > 1) {
                console.log('🛣️ Drawing route polyline...');
                
                const routePolyline = new window.google.maps.Polyline({
                    path: routePath,
                    geodesic: true,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 1.0,
                    strokeWeight: 6,
                    map: mapInstance
                });

                // Add dashed overlay for better visibility
                const overlayPolyline = new window.google.maps.Polyline({
                    path: routePath,
                    geodesic: true,
                    strokeColor: 'white',
                    strokeOpacity: 0.8,
                    strokeWeight: 8,
                    strokeDasharray: [10, 10],
                    map: mapInstance
                });

                newMarkers.push(routePolyline);
                newMarkers.push(overlayPolyline);

                // Fit map to show entire route
                const bounds = new window.google.maps.LatLngBounds();
                routePath.forEach(point => bounds.extend(point));
                mapInstance.fitBounds(bounds);
                
                // Add some padding
                setTimeout(() => {
                    mapInstance.panToBounds(bounds, { padding: 50 });
                }, 1000);

            } else {
                // If no route path, just center between start and end
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(startCoords);
                bounds.extend(endCoords);
                mapInstance.fitBounds(bounds);
            }

            // Add alternative routes if available
            if (alternativeRoutes && alternativeRoutes.length > 0) {
                console.log('🔄 Adding alternative routes...');
                alternativeRoutes.forEach((altRoute, index) => {
                    if (altRoute.overviewPath && altRoute.overviewPath.length > 1) {
                        const altPolyline = new window.google.maps.Polyline({
                            path: altRoute.overviewPath,
                            geodesic: true,
                            strokeColor: '#f59e0b',
                            strokeOpacity: 0.6,
                            strokeWeight: 4,
                            strokeDasharray: [5, 5],
                            map: mapInstance
                        });

                        newMarkers.push(altPolyline);
                    }
                });
            }

            // Add traffic layer toggle button
            const trafficControlDiv = document.createElement('div');
            trafficControlDiv.style.backgroundColor = 'white';
            trafficControlDiv.style.border = '2px solid #ccc';
            trafficControlDiv.style.borderRadius = '4px';
            trafficControlDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
            trafficControlDiv.style.cursor = 'pointer';
            trafficControlDiv.style.textAlign = 'center';
            trafficControlDiv.style.fontSize = '14px';
            trafficControlDiv.style.padding = '8px';
            trafficControlDiv.innerHTML = '🚦 Traffic';
            
            trafficControlDiv.addEventListener('click', () => {
                if (trafficLayer.getMap()) {
                    trafficLayer.setMap(null);
                    trafficControlDiv.innerHTML = '🚦 Traffic (Off)';
                } else {
                    trafficLayer.setMap(mapInstance);
                    trafficControlDiv.innerHTML = '🚦 Traffic (On)';
                }
            });

            mapInstance.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(trafficControlDiv);

            setMarkers(newMarkers);
            console.log('✅ Route elements added successfully');

        } catch (err) {
            console.error('❌ Error adding route elements:', err);
            setError('❌ Failed to add route elements: ' + err.message);
        }
    }, [startPoint, endPoint, routeData, alternativeRoutes, markers, trafficLayer]);

    // Update map when route data changes
    useEffect(() => {
        if (map && directionsRenderer && routeData) {
            console.log('🔄 Updating map with new route data...');
            addRouteElements(map, directionsRenderer);
        }
    }, [routeData, map, directionsRenderer, addRouteElements]);

    // Cleanup function
    useEffect(() => {
        return () => {
            markers.forEach(marker => {
                if (marker.setMap) {
                    marker.setMap(null);
                }
            });
        };
    }, [markers]);

    if (loading) {
        return (
            <div className="enhanced-route-map-container">
                <div className="map-loading">
                    <div className="loading-spinner"></div>
                    <h3>🗺️ Loading Google Maps...</h3>
                    <p>Initializing real route visualization</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="enhanced-route-map-container">
                <div className="map-error">
                    <h3>❌ Map Error</h3>
                    <p>{error}</p>
                    <button onClick={loadGoogleMaps} className="retry-btn">
                        🔄 Retry Loading Maps
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="enhanced-route-map-container">
            <div className="map-header">
                <h3>🗺️ Real Route Visualization</h3>
                <div className="map-info">
                    <span className="map-badge">📍 {startPoint}</span>
                    <span className="map-arrow">→</span>
                    <span className="map-badge">🎯 {endPoint}</span>
                    {routeData && (
                        <span className="map-badge">
                            📏 {routeData.distance ? routeData.distance.text : 'N/A'}
                        </span>
                    )}
                </div>
            </div>
            
            <div 
                ref={mapRef} 
                className="enhanced-google-map"
                style={{ 
                    width: '100%', 
                    height: '500px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #e5e7eb'
                }}
            />
            
            {routeData && (
                <div className="route-summary">
                    <div className="summary-item">
                        <span className="summary-icon">📏</span>
                        <div className="summary-details">
                            <div className="summary-label">Distance</div>
                            <div className="summary-value">
                                {routeData.distance ? routeData.distance.text : 'N/A'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="summary-item">
                        <span className="summary-icon">⏱️</span>
                        <div className="summary-details">
                            <div className="summary-label">Duration</div>
                            <div className="summary-value">
                                {routeData.duration ? routeData.duration.text : 'N/A'}
                            </div>
                        </div>
                    </div>
                    
                    {routeData.durationInTraffic && (
                        <div className="summary-item">
                            <span className="summary-icon">🚦</span>
                            <div className="summary-details">
                                <div className="summary-label">With Traffic</div>
                                <div className="summary-value">
                                    {routeData.durationInTraffic.text}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {routeData.fuelCost && (
                        <div className="summary-item">
                            <span className="summary-icon">💰</span>
                            <div className="summary-details">
                                <div className="summary-label">Fuel Cost</div>
                                <div className="summary-value">
                                    ₹{routeData.fuelCost.toFixed(0)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default EnhancedRouteMap;
