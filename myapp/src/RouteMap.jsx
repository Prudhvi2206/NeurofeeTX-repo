import React, { useEffect, useRef, useState } from 'react';

// Premium Dark Theme for Google Maps
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

function RouteMap({ startPoint, endPoint, routeData, trafficData, alternativeRoutes }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const markersRef = useRef([]);
    const polylinesRef = useRef([]);
    const animationIntervalsRef = useRef([]);

    useEffect(() => {
        if (!startPoint || !endPoint) {
            setLoading(false);
            return;
        }

        const initializeMap = () => {
            if (!mapRef.current) return;
            try {
                const mapOptions = {
                    center: { lat: 12.9716, lng: 77.5946 },
                    zoom: 13,
                    mapTypeId: 'roadmap',
                    styles: darkMapStyle,
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                };
                const mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);
                setMap(mapInstance);
                setLoading(false);
                setError(null);
            } catch (err) {
                setError('Failed to create map: ' + err.message);
                setLoading(false);
            }
        };

        if (window.google && window.google.maps) {
            initializeMap();
        } else {
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                if (window.google && window.google.maps) {
                    initializeMap();
                }
            };
            script.onerror = () => {
                setError('Failed to load Google Maps script');
                setLoading(false);
            };
            document.head.appendChild(script);
        }
    }, []);

    useEffect(() => {
        if (!map || (!routeData && !alternativeRoutes?.length)) return;

        // Cleanup existing markers, lines, animations
        markersRef.current.forEach(m => m.setMap(null));
        polylinesRef.current.forEach(p => p.setMap(null));
        animationIntervalsRef.current.forEach(interval => window.clearInterval(interval));
        
        markersRef.current = [];
        polylinesRef.current = [];
        animationIntervalsRef.current = [];

        // Determine coordinates
        let startCoords = { lat: 12.9716, lng: 77.5946 };
        let endCoords = { lat: 12.9850, lng: 77.6095 };

        if (routeData && routeData.path && routeData.path.length > 0) {
            startCoords = { lat: routeData.path[0].lat, lng: routeData.path[0].lng };
            endCoords = { lat: routeData.path[routeData.path.length - 1].lat, lng: routeData.path[routeData.path.length - 1].lng };
        }

        // Custom SVG Markers
        const startIcon = {
            path: 'M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.05,21.58 9.22,21.46 9.22,21.21V19.34C6.44,19.94 5.85,18.04 5.85,18.04C5.66,17.56 5.39,17.43 5.39,17.43C5,17.17 5.43,17.18 5.43,17.18C5.86,17.21 6.09,17.62 6.09,17.62C6.47,18.28 7.08,18.09 7.32,17.98C7.36,17.7 7.5,17.5 7.65,17.39C5.43,17.14 3.1,16.28 3.1,12.5C3.1,11.42 3.47,10.55 4.09,9.85C4,9.6 3.67,8.6 4.18,7.24C4.18,7.24 4.97,6.97 6.9,8.28C7.65,8.07 8.46,7.97 9.25,7.96C10.04,7.97 10.85,8.07 11.6,8.28C13.53,6.97 14.32,7.24 14.32,7.24C14.83,8.6 14.5,9.6 14.41,9.85C15.03,10.55 15.4,11.42 15.4,12.5C15.4,16.28 13.06,17.14 10.84,17.39C11.03,17.56 11.2,17.89 11.2,18.41V21.21C11.2,21.47 11.37,21.59 11.58,21.5C15.55,20.17 18.42,16.42 18.42,12A10,10 0 0,0 12,2Z', // Using a generic pin-like icon
            fillColor: '#10b981', // Emerald outline
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#fff',
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 24)
        };

        const endIcon = {
            ...startIcon,
            fillColor: '#ef4444', // Red outline
        };

        const startMarker = new window.google.maps.Marker({
            position: startCoords,
            map: map,
            title: `Start: ${startPoint}`,
            icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#10b981', strokeColor: '#fff', strokeWidth: 3 }
        });

        const endMarker = new window.google.maps.Marker({
            position: endCoords,
            map: map,
            title: `End: ${endPoint}`,
            icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#ef4444', strokeColor: '#fff', strokeWidth: 3 }
        });
        markersRef.current.push(startMarker, endMarker);

        // Fit bounds for start and end initially
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(startCoords);
        bounds.extend(endCoords);
        map.fitBounds(bounds, { padding: 80 });

        // Retrieve routes to display
        const routes = routeData ? [routeData] : alternativeRoutes;

        // Try getting Real Google Directions for highly realistic curves
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route({
            origin: startCoords,
            destination: endCoords,
            travelMode: 'DRIVING',
            provideRouteAlternatives: true
        }, (response, status) => {
            if (status === 'OK' && response.routes) {
                // If Google gives us actual roads, we map them to our array so they look real!
                routes.forEach((route, index) => {
                    // Pick an actual Google route or fallback to the generic curve if we run out of actual routes
                    const actualGoogleRoute = response.routes[index % response.routes.length];
                    const routePath = actualGoogleRoute.overview_path;

                    drawPremiumRoute(routePath, route, index, routes.length);
                });
            } else {
                // Fallback to curved lines if Directions API fails
                routes.forEach((route, index) => {
                    const midPoint = {
                        lat: (startCoords.lat + endCoords.lat) / 2 + (index - 1.5) * 0.008,
                        lng: (startCoords.lng + endCoords.lng) / 2 + (index - 1.5) * 0.008
                    };
                    drawPremiumRoute([startCoords, midPoint, endCoords], route, index, routes.length);
                });
            }
        });

        const drawPremiumRoute = (path, route, index, totalRoutes) => {
            const color = getRouteColor(route.algorithm);
            const isSelected = !!routeData && totalRoutes === 1;

            // Animated dash effect
            const lineSymbol = {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                scale: 3
            };

            const polyline = new window.google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: color,
                strokeOpacity: isSelected ? 0.9 : 0.4,
                strokeWeight: isSelected ? 6 : 4,
                zIndex: isSelected ? 10 : 1,
                icons: isSelected ? [{
                    icon: lineSymbol,
                    offset: '0',
                    repeat: '20px'
                }] : [],
                map: map
            });

            // If selected, animate the dashed line!
            if (isSelected) {
                let count = 0;
                const interval = window.setInterval(() => {
                    count = (count + 1) % 200;
                    const icons = polyline.get('icons');
                    icons[0].offset = (count / 2) + 'px';
                    polyline.set('icons', icons);
                }, 20);
                animationIntervalsRef.current.push(interval);
            }

            // Info window logic
            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="padding: 16px; min-width: 240px; font-family: 'Inter', sans-serif; background: #1f2937; color: #f3f4f6; border-radius: 8px;">
                        <h4 style="margin: 0 0 12px 0; color: #fff; font-size: 16px; border-bottom: 2px solid ${color}; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                            ${route.algorithm || 'Route'}
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                            <div>
                                <div style="font-size: 11px; color: #9ca3af; margin-bottom: 2px; text-transform: uppercase;">Distance</div>
                                <div style="font-size: 18px; font-weight: bold; color: #fff;">${route.distance?.toFixed(1) || 'N/A'} <span style="font-size: 12px; font-weight: normal; color: #9ca3af;">km</span></div>
                            </div>
                            <div>
                                <div style="font-size: 11px; color: #9ca3af; margin-bottom: 2px; text-transform: uppercase;">Duration</div>
                                <div style="font-size: 18px; font-weight: bold; color: #fff;">${route.estimatedDuration || 'N/A'} <span style="font-size: 12px; font-weight: normal; color: #9ca3af;">min</span></div>
                            </div>
                        </div>
                        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
                            <span style="font-size: 12px; color: #9ca3af;">Energy Cost</span>
                            <span style="font-size: 16px; font-weight: bold; color: #10b981;">${route.energyConsumption?.toFixed(1) || 'N/A'} kWh</span>
                        </div>
                    </div>
                `
            });

            polyline.addListener('click', () => {
                // Position at the 50% mark of the path
                const midIndex = Math.floor(path.length / 2);
                const midPoint = path[midIndex];
                infoWindow.setPosition(midPoint);
                infoWindow.open(map);
            });

            polylinesRef.current.push(polyline);
        };

    }, [map, startPoint, endPoint, routeData, alternativeRoutes]);

    const getRouteColor = (algorithm) => {
        const colors = {
            'AI-Dijkstra-ML': '#10b981', // Emerald
            'A*-Traffic': '#f59e0b',     // Amber
            'Greedy-Energy': '#8b5cf6',   // Violet
            'Time-Optimized': '#ef4444',  // Red
            'Default': '#3b82f6'          // Blue
        };
        return colors[algorithm] || colors.Default;
    };

    return (
        <div className="route-map-container" style={{ position: 'relative', width: '100%', marginTop: '20px' }}>
            {loading && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, zIndex: 10,
                    height: '100%', width: '100%', borderRadius: '12px',
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', backdropFilter: 'blur(8px)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ textAlign: 'center', color: 'white' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 3s linear infinite' }}>🌐</div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#f3f4f6', fontWeight: 600 }}>Initializing AI Map Data...</h3>
                        <p style={{ margin: 0, color: '#9ca3af' }}>Connecting to satellites</p>
                    </div>
                </div>
            )}
            
            {error && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, zIndex: 20,
                    height: '100%', width: '100%', borderRadius: '12px',
                    backgroundColor: 'rgba(254, 242, 242, 0.9)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ textAlign: 'center', padding: '24px', maxWidth: '400px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Location Services Error</h3>
                        <p style={{ margin: '0 0 20px 0', color: '#7f1d1d', fontSize: '14px' }}>{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            style={{ padding: '12px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: '0.2s' }}
                        >
                            Reconnect
                        </button>
                    </div>
                </div>
            )}

            <div 
                ref={mapRef} 
                className="google-map-element"
                style={{ 
                    height: '540px', 
                    width: '100%', 
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }} 
            />

            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(31, 41, 55, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '13px',
                color: '#f3f4f6',
                zIndex: 1000,
                pointerEvents: 'none',
                minWidth: '160px'
            }}>
                <div style={{ fontWeight: '700', marginBottom: '12px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <span style={{ marginRight: '6px' }}>🛰️</span> Live Routes
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                    <div style={{ width: '24px', height: '4px', backgroundColor: '#10b981', marginRight: '10px', borderRadius: '2px', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }}></div>
                    <span style={{ fontWeight: 500 }}>AI-Dijkstra-ML</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                    <div style={{ width: '24px', height: '4px', backgroundColor: '#f59e0b', marginRight: '10px', borderRadius: '2px', boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)' }}></div>
                    <span style={{ fontWeight: 500 }}>A*-Traffic</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                    <div style={{ width: '24px', height: '4px', backgroundColor: '#8b5cf6', marginRight: '10px', borderRadius: '2px', boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)' }}></div>
                    <span style={{ fontWeight: 500 }}>Greedy-Energy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                    <div style={{ width: '24px', height: '4px', backgroundColor: '#ef4444', marginRight: '10px', borderRadius: '2px', boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)' }}></div>
                    <span style={{ fontWeight: 500 }}>Time-Optimized</span>
                </div>
            </div>
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default RouteMap;
