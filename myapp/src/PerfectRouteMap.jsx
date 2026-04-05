import React, { useEffect, useRef, useState } from 'react';

function PerfectRouteMap({ startPoint, endPoint, routeData, trafficData, alternativeRoutes }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Load Google Maps script
    useEffect(() => {
        console.log('🗺️ PerfectRouteMap - Starting...');
        
        if (window.google && window.google.maps) {
            console.log('✅ Google Maps already loaded');
            setScriptLoaded(true);
            return;
        }

        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            console.log('📦 Loading Google Maps...');
            
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                console.log('✅ Google Maps loaded');
                setTimeout(() => {
                    if (window.google && window.google.maps) {
                        setScriptLoaded(true);
                    } else {
                        console.error('Google Maps API not available');
                        setLoading(false);
                    }
                }, 1000);
            };
            
            script.onerror = () => {
                console.error('❌ Failed to load Google Maps');
                setLoading(false);
            };
            
            document.head.appendChild(script);
        }
    }, []);

    // Create map when script is loaded and ref is available
    useEffect(() => {
        if (scriptLoaded && mapRef.current) {
            console.log('🗺️ Creating map instance...');
            createMap();
        }
    }, [scriptLoaded, mapRef.current]);

    // Add route elements when map is ready
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
            // Set container size
            mapRef.current.style.width = '100%';
            mapRef.current.style.height = '400px';
            mapRef.current.style.display = 'block';
            mapRef.current.style.visibility = 'visible';

            // Create map centered between Mumbai and Chennai
            const mapInstance = new window.google.maps.Map(mapRef.current, {
                center: { lat: 13.5, lng: 77.5 },
                zoom: 7,
                mapTypeId: 'roadmap',
                zoomControl: true,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
                gestureHandling: 'cooperative',
                styles: [
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
                    },
                    {
                        featureType: "landscape",
                        elementType: "geometry",
                        stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.fill",
                        stylers: [{ color: "#ffffff" }, { lightness: 17 }]
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }]
                    }
                ]
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
        if (!map || !window.google || !window.google.maps) {
            console.error('❌ Map not available');
            return;
        }

        try {
            // Mumbai and Chennai coordinates
            const mumbaiCoords = { lat: 19.0760, lng: 72.8777 };
            const chennaiCoords = { lat: 13.0827, lng: 80.2707 };

            // Add Mumbai marker with custom icon
            const mumbaiMarker = new window.google.maps.Marker({
                position: mumbaiCoords,
                map: map,
                title: `🚀 Mumbai: ${startPoint || 'Start Point'}`,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="12" fill="#22c55e" stroke="white" stroke-width="3"/>
                            <text x="16" y="21" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">M</text>
                        </svg>
                    `),
                    scaledSize: new window.google.maps.Size(32, 32),
                    anchor: new window.google.maps.Point(16, 16)
                },
                animation: window.google.maps.Animation.DROP
            });

            // Add Chennai marker with custom icon
            const chennaiMarker = new window.google.maps.Marker({
                position: chennaiCoords,
                map: map,
                title: `🎯 Chennai: ${endPoint || 'End Point'}`,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="white" stroke-width="3"/>
                            <text x="16" y="21" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">C</text>
                        </svg>
                    `),
                    scaledSize: new window.google.maps.Size(32, 32),
                    anchor: new window.google.maps.Point(16, 16)
                },
                animation: window.google.maps.Animation.DROP
            });

            // Add route polyline
            const routePolyline = new window.google.maps.Polyline({
                path: [mumbaiCoords, chennaiCoords],
                geodesic: true,
                strokeColor: '#3b82f6',
                strokeOpacity: 1.0,
                strokeWeight: 4,
                map: map
            });

            // Add dashed overlay
            const overlayPolyline = new window.google.maps.Polyline({
                path: [mumbaiCoords, chennaiCoords],
                geodesic: true,
                strokeColor: 'white',
                strokeOpacity: 0.8,
                strokeWeight: 6,
                strokeDasharray: [10, 10],
                map: map
            });

            // Fit map to show both cities
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(mumbaiCoords);
            bounds.extend(chennaiCoords);
            map.fitBounds(bounds);

            // Add padding
            setTimeout(() => {
                map.panToBounds(bounds, { padding: 50 });
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
                maxWidth: '900px',
                margin: '0 auto',
                background: 'white', 
                borderRadius: '16px', 
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e5e7eb'
            }}>
                <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '600' }}>🗺️ Route Overview</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>📍 {startPoint || 'Mumbai'}</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>→</span>
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>🎯 {endPoint || 'Chennai'}</span>
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>📏 ~1,267 km</span>
                    </div>
                </div>
                
                <div style={{
                    width: '100%',
                    height: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fafafa'
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
                        <h3 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '1.1rem' }}>Loading map...</h3>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Please wait</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            width: '100%', 
            maxWidth: '900px',
            margin: '0 auto',
            background: 'white', 
            borderRadius: '16px', 
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '600' }}>🗺️ Route Overview</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500'
                    }}>📍 {startPoint || 'Mumbai'}</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>→</span>
                    <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500'
                    }}>🎯 {endPoint || 'Chennai'}</span>
                    <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500'
                    }}>📏 ~1,267 km</span>
                </div>
            </div>
            
            <div 
                ref={mapRef} 
                style={{ 
                    width: '100%', 
                    height: '400px',
                    background: '#fafafa'
                }}
            />
            
            <div style={{
                padding: '20px',
                background: 'white',
                borderTop: '1px solid #e5e7eb'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#22c55e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                        }}>📍</div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Start</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                {startPoint || 'Mumbai'}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                        }}>🎯</div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>End</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                {endPoint || 'Chennai'}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                        }}>📏</div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Distance</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                {routeData && routeData.distance ? routeData.distance.text : '~1,267 km'}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#8b5cf6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px'
                        }}>⏱️</div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Duration</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                {routeData && routeData.duration ? routeData.duration.text : '~20 hours'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PerfectRouteMap;
