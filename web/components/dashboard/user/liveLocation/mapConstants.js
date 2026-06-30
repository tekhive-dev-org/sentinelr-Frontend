export const DEFAULT_ZOOM = 15;
export const DEFAULT_CENTER = { lat: 20, lng: 0 };

export const MAP_TYPES = [
  { id: "roadmap", label: "Map" },
  { id: "hybrid", label: "Satellite" },
];

export const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

export const MAP_OPTIONS = {
  disableDefaultUI: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: false,
  scrollwheel: true,
  gestureHandling: "greedy",
  clickableIcons: false,
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
