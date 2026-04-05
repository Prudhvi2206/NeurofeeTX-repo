import React, { useEffect, useRef, useState } from 'react';
import './RouteMap.css';

function WorkingRouteMap({ startPoint, endPoint, routeData, trafficData, alternativeRoutes }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        console.log('🗺️ Working RouteMap - Starting initialization...');
        console.log('📊 Props received:', { startPoint, endPoint, routeData, alternativeRoutes });
        
        // Always try to initialize the map - don't require route data initially
        initializeGoogleMaps();
    }, []);

    useEffect(() => {
        if (map && startPoint && endPoint) {
            console.log('🔄 Map ready, adding route elements...');
            addRouteElements();
        }
    }, [map, startPoint, endPoint, routeData, alternativeRoutes]);

    const initializeGoogleMaps = () => {
        console.log('📦 Loading Google Maps API...');
        
        // Check if already loaded
        if (window.google && window.google.maps) {
            console.log('✅ Google Maps already loaded');
            createMap();
            return;
        }

        // Create script
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            console.log('✅ Google Maps script loaded');
            setTimeout(() => {
                if (window.google && window.google.maps) {
                    console.log('🎯 Google Maps API ready');
                    createMap();
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
    };

    const createMap = () => {
        console.log('🗺️ Creating map instance...');
        
        if (!mapRef.current) {
            console.error('❌ Map container not found');
            setError('❌ Map container not found');
            setLoading(false);
            return;
        }

        try {
            // Set container dimensions
            mapRef.current.style.width = '100%';
            mapRef.current.style.height = '500px';
            mapRef.current.style.display = 'block';
            mapRef.current.style.visibility = 'visible';

            // Create map
            const mapInstance = new window.google.maps.Map(mapRef.current, {
                center: { lat: 12.9716, lng: 77.5946 }, // Bangalore
                zoom: 13,
                mapTypeId: 'roadmap',
                zoomControl: true,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
                gestureHandling: 'cooperative',
                scaleControl: true
            });

            console.log('✅ Map created successfully');
            
            // Add traffic layer
            const trafficLayer = new window.google.maps.TrafficLayer();
            trafficLayer.setMap(mapInstance);

            setMap(mapInstance);
            setLoading(false);
            setError(null);

            // Add route elements after a short delay
            setTimeout(() => {
                if (startPoint && endPoint) {
                    addRouteElements();
                }
            }, 500);

        } catch (err) {
            console.error('❌ Error creating map:', err);
            setError('❌ Failed to create map: ' + err.message);
            setLoading(false);
        }
    };

    const addRouteElements = () => {
        console.log('📍 Adding route elements...');
        
        if (!map || !window.google || !window.google.maps) {
            console.error('❌ Map or Google Maps not available');
            return;
        }

        try {
            // Clear existing markers
            markers.forEach(marker => marker.setMap(null));
            const newMarkers = [];

            // Get coordinates - use real data if available, otherwise use Bangalore coordinates
            let startCoords, endCoords;
            
            if (routeData && routeData.startCoords && routeData.endCoords) {
                console.log('🎯 Using route data coordinates');
                startCoords = routeData.startCoords;
                endCoords = routeData.endCoords;
            } else if (routeData && routeData.path && routeData.path.length > 0) {
                console.log('🛣️ Using path coordinates');
                startCoords = { lat: routeData.path[0].lat, lng: routeData.path[0].lng };
                endCoords = { lat: routeData.path[routeData.path.length - 1].lat, lng: routeData.path[routeData.path.length - 1].lng };
            } else {
                console.log('⚠️ Using default Bangalore coordinates');
                startCoords = { lat: 12.9716, lng: 77.5946 };
                endCoords = { lat: 12.9850, lng: 77.6095 };
            }

            console.log('📍 Final coordinates:', { startCoords, endCoords });

            // Add start marker
            const startMarker = new window.google.maps.Marker({
                position: startCoords,
                map: map,
                title: `Start: ${startPoint || 'Start Point'}`,
                label: {
                    text: 'S',
                    color: 'white',
                    fontWeight: 'bold'
                },
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#22c55e',
                    strokeColor: 'white',
                    strokeWidth: 3
                },
                animation: window.google.maps.Animation.DROP
            });

            // Add info window for start marker
            const startInfoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px; min-width: 200px;">
                        <h3 style="margin: 0 0 5px 0; color: #22c55e;">🚀 Start Point</h3>
                        <p style="margin: 0; font-weight: bold;">${startPoint || 'Start Location'}</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                            Lat: ${startCoords.lat.toFixed(6)}, Lng: ${startCoords.lng.toFixed(6)}
                        </p>
                    </div>
                `
            });

            startMarker.addListener('click', () => {
                startInfoWindow.open(map, startMarker);
            });

            newMarkers.push(startMarker);

            // Add end marker
            const endMarker = new window.google.maps.Marker({
                position: endCoords,
                map: map,
                title: `End: ${endPoint || 'End Point'}`,
                label: {
                    text: 'E',
                    color: 'white',
                    fontWeight: 'bold'
                },
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#ef4444',
                    strokeColor: 'white',
                    strokeWidth: 3
                },
                animation: window.google.maps.Animation.DROP
            });

            // Add info window for end marker
            const endInfoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px; min-width: 200px;">
                        <h3 style="margin: 0 0 5px 0; color: #ef4444;">🎯 Destination</h3>
                        <p style="margin: 0; font-weight: bold;">${endPoint || 'End Location'}</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                            Lat: ${endCoords.lat.toFixed(6)}, Lng: ${endCoords.lng.toFixed(6)}
                        </p>
                    </div>
                `
            });

            endMarker.addListener('click', () => {
                endInfoWindow.open(map, endMarker);
            });

            newMarkers.push(endMarker);

            // Add route polyline if we have path data
            let routePath = null;
            
            if (routeData && routeData.googleRouteData && routeData.googleRouteData.overviewPath) {
                console.log('🛣️ Using Google Maps route path');
                routePath = routeData.googleRouteData.overviewPath;
            } else if (routeData && routeData.path && routeData.path.length > 0) {
                console.log('🛣️ Using route data path');
                routePath = routeData.path.map(point => ({ lat: point.lat, lng: point.lng }));
            } else {
                console.log('🛣️ Creating direct path');
                routePath = [startCoords, endCoords];
            }

            if (routePath && routePath.length > 1) {
                console.log('🛣️ Drawing route polyline...');
                
                const routePolyline = new window.google.maps.Polyline({
                    path: routePath,
                    geodesic: true,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 1.0,
                    strokeWeight: 6,
                    map: map
                });

                newMarkers.push(routePolyline);

                // Fit map to show entire route
                const bounds = new window.google.maps.LatLngBounds();
                routePath.forEach(point => bounds.extend(point));
                map.fitBounds(bounds);
                
                // Add some padding
                setTimeout(() => {
                    map.panToBounds(bounds, { padding: 50 });
                }, 1000);
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
                            map: map
                        });

                        newMarkers.push(altPolyline);
                    }
                });
            }

            setMarkers(newMarkers);
            console.log('✅ Route elements added successfully');

        } catch (err) {
            console.error('❌ Error adding route elements:', err);
            setError('❌ Failed to add route elements: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="working-route-map-container">
                <div className="map-loading">
                    <div className="loading-spinner"></div>
                    <h3>🗺️ Loading Google Maps...</h3>
                    <p>Initializing route visualization</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="working-route-map-container">
                <div className="map-error">
                    <h3>❌ Map Error</h3>
                    <p>{error}</p>
                    <button onClick={initializeGoogleMaps} className="retry-btn">
                        🔄 Retry Loading Maps
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="working-route-map-container">
            <div className="map-header">
                <h3>🗺️ Route Visualization</h3>
                <div className="map-info">
                    <span className="map-badge">📍 {startPoint || 'Start Point'}</span>
                    <span className="map-arrow">→</span>
                    <span className="map-badge">🎯 {endPoint || 'End Point'}</span>
                    {routeData && routeData.distance && (
                        <span className="map-badge">
                            📏 {routeData.distance.text || 'N/A'}
                        </span>
                    )}
                </div>
            </div>
            
            <div 
                ref={mapRef} 
                className="working-google-map"
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
                        <span className="summary-icon">📍</span>
                        <div className="summary-details">
                            <div className="summary-label">Start Location</div>
                            <div className="summary-value">
                                {startPoint || 'Start Point'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="summary-item">
                        <span className="summary-icon">🎯</span>
                        <div className="summary-details">
                            <div className="summary-label">Destination</div>
                            <div className="summary-value">
                                {endPoint || 'End Point'}
                            </div>
                        </div>
                    </div>
                    
                    {routeData.distance && (
                        <div className="summary-item">
                            <span className="summary-icon">📏</span>
                            <div className="summary-details">
                                <div className="summary-label">Distance</div>
                                <div className="summary-value">
                                    {routeData.distance.text || 'N/A'}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {routeData.duration && (
                        <div className="summary-item">
                            <span className="summary-icon">⏱️</span>
                            <div className="summary-details">
                                <div className="summary-label">Duration</div>
                                <div className="summary-value">
                                    {routeData.duration.text || 'N/A'}
                                </div>
                            </div>
                        </div>
                    )}
                    
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

export default WorkingRouteMap;
