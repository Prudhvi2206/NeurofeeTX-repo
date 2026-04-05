import React, { useEffect, useRef, useState } from 'react';

function WorkingMap({ startPoint, endPoint, routeData, trafficData, alternativeRoutes }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🗺️ WorkingMap - Starting...');
        loadGoogleMaps();
    }, []);

    useEffect(() => {
        if (map && startPoint && endPoint) {
            addMarkers();
        }
    }, [map, startPoint, endPoint, routeData]);

    const loadGoogleMaps = () => {
        // Check if already loaded
        if (window.google && window.google.maps) {
            console.log('✅ Google Maps already loaded');
            createMap();
            return;
        }

        console.log('📦 Loading Google Maps...');
        
        // Create script
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            console.log('✅ Google Maps loaded');
            setTimeout(() => {
                if (window.google && window.google.maps) {
                    createMap();
                } else {
                    console.error('Google Maps failed');
                    setLoading(false);
                }
            }, 1000);
        };
        
        script.onerror = () => {
            console.error('❌ Failed to load Google Maps');
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
            const mapInstance = new window.google.maps.Map(mapRef.current, {
                center: { lat: 12.9716, lng: 77.5946 },
                zoom: 13,
                mapTypeId: 'roadmap'
            });

            console.log('✅ Map created');
            setMap(mapInstance);
            setLoading(false);

            // Add markers after map is ready
            setTimeout(() => {
                addMarkers();
            }, 500);

        } catch (err) {
            console.error('❌ Error creating map:', err);
            setLoading(false);
        }
    };

    const addMarkers = () => {
        console.log('📍 Adding markers...');
        
        if (!map || !window.google || !window.google.maps) {
            return;
        }

        try {
            // Default coordinates if no route data
            let startCoords = { lat: 12.9716, lng: 77.5946 };
            let endCoords = { lat: 12.9850, lng: 77.6095 };

            // Try to get coordinates from route data
            if (routeData && routeData.startCoords && routeData.endCoords) {
                startCoords = routeData.startCoords;
                endCoords = routeData.endCoords;
            }

            console.log('📍 Using coordinates:', { startCoords, endCoords });

            // Clear existing markers
            // Add start marker
            new window.google.maps.Marker({
                position: startCoords,
                map: map,
                title: `Start: ${startPoint || 'Start Point'}`,
                label: 'S',
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#22c55e',
                    strokeColor: 'white',
                    strokeWidth: 2
                }
            });

            // Add end marker
            new window.google.maps.Marker({
                position: endCoords,
                map: map,
                title: `End: ${endPoint || 'End Point'}`,
                label: 'E',
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#ef4444',
                    strokeColor: 'white',
                    strokeWidth: 2
                }
            });

            // Add route line
            new window.google.maps.Polyline({
                path: [startCoords, endCoords],
                geodesic: true,
                strokeColor: '#3b82f6',
                strokeOpacity: 1.0,
                strokeWeight: 4,
                map: map
            });

            // Fit map to show both markers
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(startCoords);
            bounds.extend(endCoords);
            map.fitBounds(bounds);

            console.log('✅ Markers and route added');

        } catch (err) {
            console.error('❌ Error adding markers:', err);
        }
    };

    return (
        <div style={{ width: '100%', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <h3 style={{ margin: '0 0 15px 0' }}>🗺️ Route Visualization</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px'
                    }}>📍 {startPoint || 'Start Point'}</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>→</span>
                    <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px'
                    }}>🎯 {endPoint || 'End Point'}</span>
                    {routeData && routeData.distance && (
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px'
                        }}>📏 {routeData.distance.text || 'N/A'}</span>
                    )}
                </div>
            </div>
            
            <div 
                ref={mapRef} 
                style={{ 
                    width: '100%', 
                    height: '500px',
                    background: loading ? '#f3f4f6' : 'transparent'
                }}
            />
            
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
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
                    <p style={{ margin: 0, color: '#6b7280' }}>Please wait</p>
                </div>
            )}
            
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
                </div>
            )}
        </div>
    );
}

export default WorkingMap;
