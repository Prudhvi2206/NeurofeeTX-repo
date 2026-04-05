import React, { useEffect, useRef, useState } from 'react';

function FinalRouteMap({ startPoint, endPoint, routeData, trafficData, alternativeRoutes }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        console.log('🗺️ FinalRouteMap - Starting...');
        
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
            console.log('✅ Google Maps already loaded');
            setScriptLoaded(true);
            setLoading(false);
            return;
        }

        // Load Google Maps only once
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            console.log('📦 Loading Google Maps...');
            
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places&callback=initMap';
            script.async = true;
            script.defer = true;
            
            window.initMap = () => {
                console.log('✅ Google Maps initialized');
                setScriptLoaded(true);
                setLoading(false);
            };
            
            script.onerror = () => {
                console.error('❌ Failed to load Google Maps');
                setLoading(false);
            };
            
            document.head.appendChild(script);
        }
    }, []);

    useEffect(() => {
        if (scriptLoaded && mapRef.current && !map) {
            console.log('🗺️ Creating map instance...');
            createMap();
        }
    }, [scriptLoaded]);

    useEffect(() => {
        if (map && startPoint && endPoint) {
            console.log('🔄 Adding route elements...');
            addRouteElements();
        }
    }, [map, startPoint, endPoint, routeData]);

    const createMap = () => {
        if (!mapRef.current || !window.google || !window.google.maps) {
            return;
        }

        try {
            // Set container size
            mapRef.current.style.width = '100%';
            mapRef.current.style.height = '500px';
            mapRef.current.style.display = 'block';
            mapRef.current.style.visibility = 'visible';

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
            setMap(mapInstance);

        } catch (err) {
            console.error('❌ Error creating map:', err);
        }
    };

    const addRouteElements = () => {
        if (!map || !window.google || !window.google.maps) {
            return;
        }

        try {
            // Get coordinates for Mumbai and Chennai
            let startCoords = { lat: 19.0760, lng: 72.8777 }; // Mumbai
            let endCoords = { lat: 13.0827, lng: 80.2707 }; // Chennai

            // Try to get coordinates from route data
            if (routeData && routeData.startCoords && routeData.endCoords) {
                startCoords = routeData.startCoords;
                endCoords = routeData.endCoords;
            } else if (routeData && routeData.googleRouteData && routeData.googleRouteData.startLocation) {
                startCoords = routeData.googleRouteData.startLocation;
                endCoords = routeData.googleRouteData.endLocation;
            }

            console.log('📍 Using coordinates:', { startCoords, endCoords });

            // Add start marker
            const startMarker = new window.google.maps.Marker({
                position: startCoords,
                map: map,
                title: `Start: ${startPoint || 'Mumbai'}`,
                label: {
                    text: 'M',
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

            // Add end marker
            const endMarker = new window.google.maps.Marker({
                position: endCoords,
                map: map,
                title: `End: ${endPoint || 'Chennai'}`,
                label: {
                    text: 'C',
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

            // Add route polyline
            let routePath = [startCoords, endCoords];
            
            // Try to get path from route data
            if (routeData && routeData.googleRouteData && routeData.googleRouteData.overviewPath) {
                routePath = routeData.googleRouteData.overviewPath;
            } else if (routeData && routeData.path && routeData.path.length > 0) {
                routePath = routeData.path.map(point => ({ lat: point.lat, lng: point.lng }));
            }

            const routePolyline = new window.google.maps.Polyline({
                path: routePath,
                geodesic: true,
                strokeColor: '#3b82f6',
                strokeOpacity: 1.0,
                strokeWeight: 6,
                map: map
            });

            // Add dashed overlay
            const overlayPolyline = new window.google.maps.Polyline({
                path: routePath,
                geodesic: true,
                strokeColor: 'white',
                strokeOpacity: 0.8,
                strokeWeight: 8,
                strokeDasharray: [10, 10],
                map: map
            });

            // Fit map to show route
            const bounds = new window.google.maps.LatLngBounds();
            routePath.forEach(point => bounds.extend(point));
            map.fitBounds(bounds);

            // Add some padding
            setTimeout(() => {
                map.panToBounds(bounds, { padding: 50 });
            }, 1000);

            console.log('✅ Route elements added successfully');

        } catch (err) {
            console.error('❌ Error adding route elements:', err);
        }
    };

    if (loading || !scriptLoaded) {
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
                        }}>📍 {startPoint || 'Mumbai'}</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>→</span>
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px'
                        }}>🎯 {endPoint || 'Chennai'}</span>
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px'
                        }}>📏 ~1,267 km</span>
                    </div>
                </div>
                
                <div style={{
                    width: '100%',
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f3f4f6'
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
                        <p style={{ margin: 0, color: '#6b7280' }}>Optimizing route from Mumbai to Chennai</p>
                    </div>
                </div>
            </div>
        );
    }

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
                    }}>📍 {startPoint || 'Mumbai'}</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>→</span>
                    <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px'
                    }}>🎯 {endPoint || 'Chennai'}</span>
                    {routeData && routeData.distance && (
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px'
                        }}>📏 {routeData.distance.text || '~1,267 km'}</span>
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
                                {startPoint || 'Mumbai'}
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
                                {endPoint || 'Chennai'}
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
                        <span style={{ fontSize: '24px' }}>📏</span>
                        <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Distance</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                                {routeData && routeData.distance ? routeData.distance.text : '~1,267 km'}
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
                        <span style={{ fontSize: '24px' }}>⏱️</span>
                        <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Estimated Time</div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                                {routeData && routeData.duration ? routeData.duration.text : '~20 hours'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FinalRouteMap;
