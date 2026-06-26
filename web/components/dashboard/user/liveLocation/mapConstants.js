export const DEFAULT_ZOOM = 15;
export const DEFAULT_CENTER = { lat: 20, lng: 0 };

export const MAP_TYPES = [
  { id: "roadmap", label: "Map" },
  { id: "hybrid", label: "Satellite" },
];

export const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

export const SILVER_MAP_STYLE = [
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }]
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }, { lightness: 16 }]
  },
  {
    featureType: "all",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [{ color: "#f3f4f6" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e5e7eb" }, { weight: 1.2 }]
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f9fafb" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#f3f4f6" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e5e7eb" }, { weight: 0.2 }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#f3f4f6" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#ede7ff" }]
  }
];

export const MAP_OPTIONS = {
  disableDefaultUI: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: false,
  scrollwheel: true,
  gestureHandling: "greedy",
  clickableIcons: false,
  styles: SILVER_MAP_STYLE,
};

export const timeAgo = (date) => {
  if (!date) return "";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
