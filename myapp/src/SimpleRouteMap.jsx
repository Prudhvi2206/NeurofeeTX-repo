import React, { useEffect, useRef, useState } from 'react';
import './RouteMap.css';

function SimpleRouteMap({ startPoint, endPoint, routeData, trafficData, alternativeRoutes }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('🗺️ Simple RouteMap - Starting...');
        
        // Always initialize the map - don't wait for route data
        initializeMap();
    }, []);

    useEffect(() => {
        if (map && startPoint && endPoint) {
            console.log('🔄 Map ready, adding route elements...');
            addRouteElements();
        }
    }, [map, startPoint, endPoint, routeData]);

    const initializeMap = () => {
        console.log('📦 Loading Google Maps...');
        
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
            console.log('✅ Google Maps loaded');
            setTimeout(() => {
                if (window.google && window.google.maps) {
                    console.log('🎯 Google Maps ready');
                    createMap();
                } else {
                    setError('❌ Google Maps failed to load');
                    setLoading(false);
                }
            }, 1000);
        };
        
        script.onerror = () => {
            console.error('❌ Failed to load Google Maps');
            setError('❌ Failed to load Google Maps');
            setLoading(false);
        };
        
        document.head.appendChild(script);
    };

    const createMap = () => {
        console.log('🗺️ Creating map...');
        
        if (!mapRef.current) {
            console.error('❌ Map container not found');
            return;
        }

        try {
            // Set container size
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

            console.log('✅ Map created');
            
            // Add traffic layer
            const trafficLayer = new window.google.maps.TrafficLayer();
            trafficLayer.setMap(mapInstance);

            setMap(mapInstance);
            setLoading(false);
            setError(null);

            // Add route elements after map is ready
            setTimeout(() => {
                addRouteElements();
            }, 500);

        } catch (err) {
            console.error('❌ Error creating map:', err);
            setError('❌ Failed to create map');
            setLoading(false);
        }
    };

    const addRouteElements = () => {
        console.log('📍 Adding route elements...');
        
        if (!map || !window.google || !window.google.maps) {
            console.error('❌ Map not available');
            return;
        }

        try {
            // Get coordinates
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

            console.log('📍 Coordinates:', { startCoords, endCoords });

            // Clear existing markers
            // Add start marker
            const startMarker = new window.google.maps.Marker({
                position: startCoords,
                map: map,
                title: `Start: ${startPoint || 'Start Point'}`,
                label: 'S',
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#22c55e',
                    strokeColor: 'white',
                    strokeWidth: 3
                },
                animation: window.google.maps.Animation.DROP
            });

            // Add end marker
            const endMarker = new window.google.maps.Marker({
                position: endCoords,
                map: map,
                title: `End: ${endPoint || 'End Point'}`,
                label: 'E',
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#ef4444',
                    strokeColor: 'white',
                    strokeWidth: 3
                },
                animation: window.google.maps.Animation.DROP
            });

            // Add route line
            const routePath = [startCoords, endCoords];
            
            const routePolyline = new window.google.maps.Polyline({
                path: routePath,
                geodesic: true,
                strokeColor: '#3b82f6',
                strokeOpacity: 1.0,
                strokeWeight: 6,
                map: map
            });

            // Fit map to show route
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(startCoords);
            bounds.extend(endCoords);
            map.fitBounds(bounds);

            console.log('✅ Route elements added');

        } catch (err) {
            console.error('❌ Error adding route elements:', err);
        }
    };

    if (loading) {
        return (
            <div className="simple-route-map">
                <div style={{
                    width: '100%',
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f3f4f6',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #e5e7eb',
                            borderTop: '4px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 20px'
                        }}></div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>🗺️ Loading Google Maps...</h3>
                        <p style={{ margin: 0, color: '#6b7280' }}>Initializing route visualization</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="simple-route-map">
                <div style={{
                    width: '100%',
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fef2f2',
                    border: '2px solid #fecaca',
                    borderRadius: '12px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#991b1b' }}>❌ Map Error</h3>
                        <p style={{ margin: '0 0 20px 0', color: '#7f1d1d' }}>{error}</p>
                        <button onClick={() => window.location.reload()} style={{
                            padding: '10px 20px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>
                            🔄 Reload
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="simple-route-map">
            <div style={{
                width: '100%',
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem' }}>🗺️ Route Visualization</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>📍 {startPoint || 'Start Point'}</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>→</span>
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>🎯 {endPoint || 'End Point'}</span>
                        {routeData && routeData.distance && (
                            <span style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>📏 {routeData.distance.text || 'N/A'}</span>
                        )}
                    </div>
                </div>
                
                <div 
                    ref={mapRef} 
                    style={{ 
                        width: '100%', 
                        height: '500px',
                        background: '#f9fafb'
                    }}
                />
                
                {routeData && (
                    <div style={{
                        padding: '20px',
                        background: '#f9fafb',
                        borderTop: '1px solid #e5e7eb',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '15px',
                            background: 'white',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <span style={{ fontSize: '24px' }}>📍</span>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Start Location</div>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                                    {startPoint || 'Start Point'}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '15px',
                            background: 'white',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <span style={{ fontSize: '24px' }}>🎯</span>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Destination</div>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                                    {endPoint || 'End Point'}
                                </div>
                            </div>
                        </div>
                        
                        {routeData.distance && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '15px',
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <span style={{ fontSize: '24px' }}>📏</span>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Distance</div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                                        {routeData.distance.text || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {routeData.duration && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '15px',
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <span style={{ fontSize: '24px' }}>⏱️</span>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Duration</div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                                        {routeData.duration.text || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SimpleRouteMap;
