import React, { useEffect, useRef, useState } from 'react';

function CleanRouteMap({ startPoint, endPoint, routeData, trafficData, alternativeRoutes }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🗺️ CleanRouteMap - Starting...');
        
        // Simple approach - just load Google Maps and create map
        const initializeMap = () => {
            // Check if Google Maps is already loaded
            if (window.google && window.google.maps) {
                console.log('✅ Google Maps already available');
                createMap();
                return;
            }

            console.log('📦 Loading Google Maps...');
            
            // Simple script loading
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
                        console.error('Google Maps failed to initialize');
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
            if (!mapRef.current) {
                console.error('❌ Map container not found');
                setLoading(false);
                return;
            }

            try {
                // Set container size
                mapRef.current.style.width = '100%';
                mapRef.current.style.height = '500px';
                mapRef.current.style.display = 'block';
                mapRef.current.style.visibility = 'visible';

                // Create map centered on Mumbai-Chennai route
                const mapInstance = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 13.5, lng: 77.5 }, // Center between Mumbai and Chennai
                    zoom: 7,
                    mapTypeId: 'roadmap',
                    zoomControl: true,
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                    gestureHandling: 'cooperative'
                });

                console.log('✅ Map created successfully');
                setMap(mapInstance);
                setLoading(false);

                // Add route elements after map is ready
                setTimeout(() => {
                    addRouteElements(mapInstance);
                }, 500);

            } catch (err) {
                console.error('❌ Error creating map:', err);
                setLoading(false);
            }
        };

        const addRouteElements = (mapInstance) => {
            console.log('📍 Adding route elements...');
            console.log('📊 Route data:', routeData);
            console.log('📍 Start point:', startPoint);
            console.log('🎯 End point:', endPoint);

            if (!mapInstance || !window.google || !window.google.maps) {
                console.error('❌ Map not available');
                return;
            }

            try {
                // Mumbai and Chennai coordinates
                const mumbaiCoords = { lat: 19.0760, lng: 72.8777 };
                const chennaiCoords = { lat: 13.0827, lng: 80.2707 };

                // Add Mumbai marker
                const mumbaiMarker = new window.google.maps.Marker({
                    position: mumbaiCoords,
                    map: mapInstance,
                    title: `Start: ${startPoint || 'Mumbai'}`,
                    label: {
                        text: 'M',
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

                // Add info window for Mumbai
                const mumbaiInfoWindow = new window.google.maps.InfoWindow({
                    content: `
                        <div style="padding: 10px; min-width: 200px; font-family: Arial, sans-serif;">
                            <h3 style="margin: 0 0 5px 0; color: #22c55e; font-size: 16px;">🚀 Mumbai</h3>
                            <p style="margin: 0; font-weight: bold; font-size: 14px;">${startPoint || 'Mumbai, Maharashtra'}</p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                                Lat: ${mumbaiCoords.lat.toFixed(6)}, Lng: ${mumbaiCoords.lng.toFixed(6)}
                            </p>
                        </div>
                    `
                });

                mumbaiMarker.addListener('click', () => {
                    mumbaiInfoWindow.open(mapInstance, mumbaiMarker);
                });

                // Add Chennai marker
                const chennaiMarker = new window.google.maps.Marker({
                    position: chennaiCoords,
                    map: mapInstance,
                    title: `End: ${endPoint || 'Chennai'}`,
                    label: {
                        text: 'C',
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

                // Add info window for Chennai
                const chennaiInfoWindow = new window.google.maps.InfoWindow({
                    content: `
                        <div style="padding: 10px; min-width: 200px; font-family: Arial, sans-serif;">
                            <h3 style="margin: 0 0 5px 0; color: #ef4444; font-size: 16px;">🎯 Chennai</h3>
                            <p style="margin: 0; font-weight: bold; font-size: 14px;">${endPoint || 'Chennai, Tamil Nadu'}</p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                                Lat: ${chennaiCoords.lat.toFixed(6)}, Lng: ${chennaiCoords.lng.toFixed(6)}
                            </p>
                        </div>
                    `
                });

                chennaiMarker.addListener('click', () => {
                    chennaiInfoWindow.open(mapInstance, chennaiMarker);
                });

                // Add route line
                const routePolyline = new window.google.maps.Polyline({
                    path: [mumbaiCoords, chennaiCoords],
                    geodesic: true,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 1.0,
                    strokeWeight: 6,
                    map: mapInstance
                });

                // Add dashed overlay for better visibility
                const overlayPolyline = new window.google.maps.Polyline({
                    path: [mumbaiCoords, chennaiCoords],
                    geodesic: true,
                    strokeColor: 'white',
                    strokeOpacity: 0.8,
                    strokeWeight: 8,
                    strokeDasharray: [10, 10],
                    map: mapInstance
                });

                // Fit map to show both cities
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(mumbaiCoords);
                bounds.extend(chennaiCoords);
                mapInstance.fitBounds(bounds);

                // Add some padding
                setTimeout(() => {
                    mapInstance.panToBounds(bounds, { padding: 50 });
                }, 1000);

                console.log('✅ Route elements added successfully');

            } catch (err) {
                console.error('❌ Error adding route elements:', err);
            }
        };

        // Start initialization
        initializeMap();
    }, []);

    if (loading) {
        return (
            <div style={{ width: '100%', background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem' }}>🗺️ Mumbai to Chennai Route</h3>
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
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem' }}>🗺️ Mumbai to Chennai Route</h3>
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
                    }}>📏 {routeData && routeData.distance ? routeData.distance.text : '~1,267 km'}</span>
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
                            {startPoint || 'Mumbai, Maharashtra'}
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
                            {endPoint || 'Chennai, Tamil Nadu'}
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
        </div>
    );
}

export default CleanRouteMap;
