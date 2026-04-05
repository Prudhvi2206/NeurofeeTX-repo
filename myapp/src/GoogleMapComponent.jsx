import React, { useEffect, useRef, useState } from 'react';
import './RouteMap.css';

function GoogleMapComponent({ startPoint, endPoint, routeData, trafficData, alternativeRoutes }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Load Google Maps API
    useEffect(() => {
        console.log('🗺️ Starting Google Maps initialization...');
        
        const loadGoogleMaps = () => {
            // Check if already loaded
            if (window.google && window.google.maps) {
                console.log('✅ Google Maps already loaded');
                setScriptLoaded(true);
                initializeMap();
                return;
            }

            console.log('📦 Loading Google Maps API...');
            
            // Remove any existing script
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
            if (existingScript) {
                existingScript.remove();
            }

            // Create new script with proper callback
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places&callback=initGoogleMaps';
            script.async = true;
            script.defer = true;
            
            // Set up callback function
            window.initGoogleMaps = () => {
                console.log('✅ Google Maps callback triggered');
                setScriptLoaded(true);
                initializeMap();
            };
            
            script.onerror = () => {
                console.error('❌ Failed to load Google Maps script');
                setError('❌ Failed to load Google Maps. Check internet connection.');
                setLoading(false);
            };
            
            document.head.appendChild(script);
        };

        loadGoogleMaps();
    }, []);

    // Initialize map once script is loaded
    const initializeMap = () => {
        console.log('🗺️ Initializing map...');
        
        if (!mapRef.current) {
            console.error('❌ Map container not found');
            setError('❌ Map container not found');
            setLoading(false);
            return;
        }

        if (!window.google || !window.google.maps) {
            console.error('❌ Google Maps API not available');
            setError('❌ Google Maps API not loaded');
            setLoading(false);
            return;
        }

        try {
            // Set container dimensions
            mapRef.current.style.width = '100%';
            mapRef.current.style.height = '500px';
            mapRef.current.style.display = 'block';
            mapRef.current.style.visibility = 'visible';

            // Create map with Bangalore center
            const mapInstance = new window.google.maps.Map(mapRef.current, {
                center: { lat: 12.9716, lng: 77.5946 },
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

            // Add route elements after map is ready
            setTimeout(() => {
                addRouteElements(mapInstance);
            }, 500);

        } catch (err) {
            console.error('❌ Error creating map:', err);
            setError('❌ Failed to create map: ' + err.message);
            setLoading(false);
        }
    };

    // Add route elements to map
    const addRouteElements = (mapInstance) => {
        console.log('📍 Adding route elements...');
        console.log('📊 Route data:', routeData);
        console.log('📍 Start point:', startPoint);
        console.log('🎯 End point:', endPoint);

        if (!mapInstance || !window.google || !window.google.maps) {
            console.error('❌ Map or Google Maps not available');
            return;
        }

        try {
            // Get coordinates - use real data if available
            let startCoords, endCoords;
            
            // Try to get coordinates from route data
            if (routeData && routeData.googleRouteData && routeData.googleRouteData.startLocation) {
                console.log('🎯 Using Google Maps route data');
                startCoords = routeData.googleRouteData.startLocation;
                endCoords = routeData.googleRouteData.endLocation;
            } else if (routeData && routeData.startCoords && routeData.endCoords) {
                console.log('📍 Using route coordinates');
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
                map: mapInstance,
                title: `Start: ${startPoint || 'Start Point'}`,
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
                    <div style="padding: 10px; min-width: 200px; font-family: Arial, sans-serif;">
                        <h3 style="margin: 0 0 5px 0; color: #22c55e; font-size: 16px;">🚀 Start Point</h3>
                        <p style="margin: 0; font-weight: bold; font-size: 14px;">${startPoint || 'Start Location'}</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                            Lat: ${startCoords.lat.toFixed(6)}, Lng: ${startCoords.lng.toFixed(6)}
                        </p>
                    </div>
                `
            });

            startMarker.addListener('click', () => {
                startInfoWindow.open(mapInstance, startMarker);
            });

            // Add end marker
            const endMarker = new window.google.maps.Marker({
                position: endCoords,
                map: mapInstance,
                title: `End: ${endPoint || 'End Point'}`,
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
                    <div style="padding: 10px; min-width: 200px; font-family: Arial, sans-serif;">
                        <h3 style="margin: 0 0 5px 0; color: #ef4444; font-size: 16px;">🎯 Destination</h3>
                        <p style="margin: 0; font-weight: bold; font-size: 14px;">${endPoint || 'End Location'}</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                            Lat: ${endCoords.lat.toFixed(6)}, Lng: ${endCoords.lng.toFixed(6)}
                        </p>
                    </div>
                `
            });

            endMarker.addListener('click', () => {
                endInfoWindow.open(mapInstance, endMarker);
            });

            // Add route polyline
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
                
                // Main route polyline
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

                // Fit map to show entire route
                const bounds = new window.google.maps.LatLngBounds();
                routePath.forEach(point => bounds.extend(point));
                mapInstance.fitBounds(bounds);
                
                // Add some padding
                setTimeout(() => {
                    mapInstance.panToBounds(bounds, { padding: 50 });
                }, 1000);

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
                        }
                    });
                }
            }

            console.log('✅ Route elements added successfully');

        } catch (err) {
            console.error('❌ Error adding route elements:', err);
            setError('❌ Failed to add route elements: ' + err.message);
        }
    };

    // Update map when route data changes
    useEffect(() => {
        if (map && scriptLoaded && (startPoint || endPoint)) {
            console.log('🔄 Updating map with new data...');
            addRouteElements(map);
        }
    }, [map, scriptLoaded, startPoint, endPoint, routeData, alternativeRoutes]);

    if (loading) {
        return (
            <div className="route-map-container">
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
            <div className="route-map-container">
                <div className="map-error">
                    <h3>❌ Map Error</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        🔄 Reload Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="route-map-container">
            <div className="map-header">
                <h3>🗺️ Google Maps Route Visualization</h3>
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
                className="google-map"
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
                </div>
            )}
        </div>
    );
}

export default GoogleMapComponent;
