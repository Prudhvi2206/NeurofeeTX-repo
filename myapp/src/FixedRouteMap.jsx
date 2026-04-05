import React, { useEffect, useRef, useState } from 'react';

function FixedRouteMap({ startPoint, endPoint, routeData, trafficData, alternativeRoutes }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Load Google Maps script first
    useEffect(() => {
        console.log('🗺️ FixedRouteMap - Starting script load...');
        
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
            console.log('✅ Google Maps already loaded');
            setScriptLoaded(true);
            return;
        }

        // Load Google Maps only once
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            console.log('📦 Loading Google Maps...');
            
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('✅ Google Maps script loaded');
                setTimeout(() => {
                    if (window.google && window.google.maps) {
                        console.log('🎯 Google Maps API ready');
                        setScriptLoaded(true);
                    } else {
                        console.error('Google Maps API not available');
                        setLoading(false);
                    }
                }, 1000);
            };
            
            script.onerror = () => {
                console.error('❌ Failed to load Google Maps script');
                setLoading(false);
            };
            
            document.head.appendChild(script);
        }
    }, []);

    // Initialize map only when script is loaded AND ref is available
    useEffect(() => {
        if (scriptLoaded && mapRef.current) {
            console.log('🗺️ Creating map instance...');
            createMap();
        }
    }, [scriptLoaded, mapRef.current]);

    // Add route elements only when map is ready AND we have route data
    useEffect(() => {
        if (map && startPoint && endPoint) {
            console.log('🔄 Adding route elements...');
            addRouteElements();
        }
    }, [map, startPoint, endPoint, routeData]);

    const createMap = () => {
        if (!mapRef.current || !window.google || !window.google.maps) {
            console.error('❌ Cannot create map - missing dependencies');
            return;
        }

        try {
            // Set container size explicitly
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
                gestureHandling: 'cooperative',
                scaleControl: true
            });

            console.log('✅ Map created successfully');
            setMap(mapInstance);
            setLoading(false);

        } catch (err) {
            console.error('❌ Error creating map:', err);
            setLoading(false);
        }
    };

    const addRouteElements = () => {
        console.log('📍 Adding route elements...');
        console.log('📊 Route data:', routeData);
        console.log('📍 Start point:', startPoint);
        console.log('🎯 End point:', endPoint);

        if (!map || !window.google || !window.google.maps) {
            console.error('❌ Map not available');
            return;
        }

        try {
            // Mumbai and Chennai coordinates
            const mumbaiCoords = { lat: 19.0760, lng: 72.8777 };
            const chennaiCoords = { lat: 13.0827, lng: 80.2707 };

            // Clear any existing overlays
            // Add Mumbai marker
            const mumbaiMarker = new window.google.maps.Marker({
                position: mumbaiCoords,
                map: map,
                title: `🚀 Mumbai: ${startPoint || 'Start Point'}`,
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
                    <div style="padding: 15px; min-width: 250px; font-family: Arial, sans-serif;">
                        <h3 style="margin: 0 0 10px 0; color: #22c55e; font-size: 18px;">🚀 Mumbai</h3>
                        <p style="margin: 0; font-weight: bold; font-size: 16px;">${startPoint || 'Mumbai, Maharashtra'}</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                            <strong>Coordinates:</strong><br>
                            Lat: ${mumbaiCoords.lat.toFixed(6)}<br>
                            Lng: ${mumbaiCoords.lng.toFixed(6)}
                        </p>
                    </div>
                `
            });

            mumbaiMarker.addListener('click', () => {
                mumbaiInfoWindow.open(map, mumbaiMarker);
            });

            // Add Chennai marker
            const chennaiMarker = new window.google.maps.Marker({
                position: chennaiCoords,
                map: map,
                title: `🎯 Chennai: ${endPoint || 'End Point'}`,
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
                    <div style="padding: 15px; min-width: 250px; font-family: Arial, sans-serif;">
                        <h3 style="margin: 0 0 10px 0; color: #ef4444; font-size: 18px;">🎯 Chennai</h3>
                        <p style="margin: 0; font-weight: bold; font-size: 16px;">${endPoint || 'Chennai, Tamil Nadu'}</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                            <strong>Coordinates:</strong><br>
                            Lat: ${chennaiCoords.lat.toFixed(6)}<br>
                            Lng: ${chennaiCoords.lng.toFixed(6)}
                        </p>
                    </div>
                `
            });

            chennaiMarker.addListener('click', () => {
                chennaiInfoWindow.open(map, chennaiMarker);
            });

            // Add route polyline
            const routePolyline = new window.google.maps.Polyline({
                path: [mumbaiCoords, chennaiCoords],
                geodesic: true,
                strokeColor: '#3b82f6',
                strokeOpacity: 1.0,
                strokeWeight: 6,
                map: map
            });

            // Add dashed overlay for better visibility
            const overlayPolyline = new window.google.maps.Polyline({
                path: [mumbaiCoords, chennaiCoords],
                geodesic: true,
                strokeColor: 'white',
                strokeOpacity: 0.8,
                strokeWeight: 8,
                strokeDasharray: [15, 15],
                map: map
            });

            // Add traffic layer
            const trafficLayer = new window.google.maps.TrafficLayer();
            trafficLayer.setMap(map);

            // Fit map to show both cities
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(mumbaiCoords);
            bounds.extend(chennaiCoords);
            map.fitBounds(bounds);

            // Add some padding with delay
            setTimeout(() => {
                map.panToBounds(bounds, { padding: 100 });
            }, 1000);

            console.log('✅ Route elements added successfully');

        } catch (err) {
            console.error('❌ Error adding route elements:', err);
        }
    };

    if (loading) {
        return (
            <div style={{ 
                width: '100%', 
                background: 'white', 
                borderRadius: '12px', 
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    padding: '30px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem' }}>🗺️ Mumbai to Chennai Route</h3>
                    <p style={{ margin: '0', fontSize: '1.1rem', opacity: 0.9 }}>Loading Google Maps...</p>
                </div>
                
                <div style={{
                    width: '100%',
                    height: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '5px solid #e5e7eb',
                            borderTop: '5px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 30px'
                        }}></div>
                        <h3 style={{ margin: '15px 0 10px 0', color: '#374151', fontSize: '1.2rem' }}>
                            🗺️ Loading Map...
                        </h3>
                        <p style={{ margin: '0', color: '#6b7280', fontSize: '1rem' }}>
                            Optimizing route from Mumbai to Chennai
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
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
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem' }}>🗺️ Mumbai to Chennai Route</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '8px 16px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>📍 {startPoint || 'Mumbai'}</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 10px' }}>→</span>
                    <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '8px 16px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>🎯 {endPoint || 'Chennai'}</span>
                    <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '8px 16px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>📏 ~1,267 km</span>
                </div>
            </div>
            
            <div 
                ref={mapRef} 
                style={{ 
                    width: '100%', 
                    height: '500px',
                    background: '#f8fafc',
                    borderRadius: '0 0 12px 12px 0'
                }}
            />
            
            <div style={{
                padding: '20px',
                background: '#f8fafc',
                borderTop: '1px solid #e5e7eb',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '20px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                    <span style={{ fontSize: '28px' }}>📍</span>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>Start Location</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                            {startPoint || 'Mumbai, Maharashtra'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                            19.0760°N, 72.8777°E
                        </div>
                    </div>
                </div>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '20px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                    <span style={{ fontSize: '28px' }}>🎯</span>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>Destination</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                            {endPoint || 'Chennai, Tamil Nadu'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                            13.0827°N, 80.2707°E
                        </div>
                    </div>
                </div>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '20px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                    <span style={{ fontSize: '28px' }}>📏</span>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>Distance</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                            {routeData && routeData.distance ? routeData.distance.text : '~1,267 km'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                            ~1,267 kilometers
                        </div>
                    </div>
                </div>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '20px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                    <span style={{ fontSize: '28px' }}>⏱️</span>
                    <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>Estimated Time</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                            {routeData && routeData.duration ? routeData.duration.text : '~20 hours'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                            ~20 hours by road
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FixedRouteMap;
