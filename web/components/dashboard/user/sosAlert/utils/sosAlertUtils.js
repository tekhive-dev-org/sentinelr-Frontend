import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

const ACTIVE_STATUSES = new Set(['active', 'unresolved']);

export function asText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return '';
}

export function titleCase(value) {
  return asText(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function formatRelativeTime(dateValue) {
  if (!dateValue) return 'Just now';

  const eventTime = new Date(dateValue).getTime();
  if (Number.isNaN(eventTime)) return 'Recently';

  const diffMs = Date.now() - eventTime;
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export function formatElapsedTime(startValue, endValue) {
  if (!startValue) return 'Awaiting sync';

  const startTime = new Date(startValue).getTime();
  const endTime = endValue ? new Date(endValue).getTime() : Date.now();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return 'Awaiting sync';
  }

  const diffSeconds = Math.max(0, Math.round((endTime - startTime) / 1000));
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export function formatTriggerLabel(type) {
  const normalized = asText(type, 'alert').toLowerCase();

  if (normalized === 'sos') return 'Manual SOS';
  if (normalized === 'intruder') return 'Intruder alert';
  if (normalized === 'geofence') return 'Geofence breach';
  if (normalized === 'impact') return 'Impact detected';
  if (normalized === 'screen_time') return 'Screen time breach';

  return titleCase(normalized);
}

export function formatStatus(status) {
  if (status === 'dismissed') return 'Dismissed';
  if (status === 'unresolved') return 'Unresolved';
  return titleCase(status || 'active');
}

export function formatPriority(priority) {
  if (priority === 'critical') return 'Critical';
  if (priority === 'high') return 'High priority';
  if (priority === 'medium') return 'Medium priority';
  if (priority === 'low') return 'Low priority';
  return titleCase(priority || 'high');
}

export function buildIncidentCode(alert) {
  const rawId = String(alert?.id ?? alert?.alertId ?? alert?.deviceId ?? alert?.userId ?? '0')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  return `INC-${rawId.slice(-6).padStart(6, '0')}`;
}

export function dedupeAlerts(alertGroups) {
  const alertMap = new Map();

  alertGroups.flat().forEach((alert) => {
    if (!alert) return;

    const key = String(alert.id ?? alert.alertId ?? `${alert.userId}-${alert.createdAt}-${alert.type}`);
    if (!alertMap.has(key)) {
      alertMap.set(key, alert);
    }
  });

  return Array.from(alertMap.values());
}

export function normalizeMembers(familyData) {
  const rawMembers = familyData?.family?.members || familyData?.members || [];

  return rawMembers.map((entry) => {
    const user = entry?.user || entry || {};
    const userId = user.id || entry?.userId || entry?.memberUserId || entry?.id;

    return {
      userId: userId == null ? null : String(userId),
      name: asText(
        user.fullName,
        user.userName,
        user.name,
        entry?.fullName,
        entry?.userName,
        entry?.name,
        'Tracked member',
      ),
      email: asText(user.email, entry?.email, 'No email on file'),
      phone: asText(user.phone, entry?.phone, 'Emergency contact unavailable'),
      relationship: asText(entry?.relationship, user.role, 'Family member'),
    };
  });
}

export function normalizeDevices(devicesData) {
  const rawDevices = devicesData?.devices || [];

  return rawDevices.map((device) => {
    const userId =
      device?.assignedUser?.id ||
      device?.assignedUserId ||
      device?.userId ||
      device?.memberUserId ||
      null;

    return {
      id: String(device?.id ?? device?.deviceId ?? ''),
      userId: userId == null ? null : String(userId),
      name: asText(device?.deviceName, device?.name, `Device ${device?.id ?? device?.deviceId ?? 'pending sync'}`),
      type: titleCase(asText(device?.deviceType, device?.type, device?.platform, 'Mobile device')),
      status: titleCase(asText(device?.status, device?.pairStatus, 'Syncing')),
      batteryLevel: device?.batteryLevel ?? device?.battery_level ?? null,
      speed: device?.speed ?? null,
      speedUnit: asText(device?.speedUnit, 'km/h'),
      movementType: asText(device?.movementType, 'Location monitoring'),
      heading: device?.heading ?? null,
    };
  });
}

export function normalizeLocations(locationsData) {
  const rawLocations = locationsData?.locations || [];

  return rawLocations.map((location) => ({
    deviceId: location?.deviceId == null ? null : String(location.deviceId),
    userId: location?.userId == null ? null : String(location.userId),
    userName: asText(location?.userName, 'Tracked member'),
    latitude: toNumber(location?.latitude),
    longitude: toNumber(location?.longitude),
    accuracy: location?.accuracy ?? null,
    address: asText(location?.address),
    timestamp: location?.timestamp || location?.createdAt || null,
  }));
}

export function createContextMaps(members, devices, locations) {
  const memberByUserId = new Map();
  const deviceById = new Map();
  const devicesByUserId = new Map();
  const locationByDeviceId = new Map();
  const locationByUserId = new Map();

  members.forEach((member) => {
    if (member.userId) {
      memberByUserId.set(member.userId, member);
    }
  });

  devices.forEach((device) => {
    if (device.id) {
      deviceById.set(device.id, device);
    }

    if (device.userId) {
      const existingDevices = devicesByUserId.get(device.userId) || [];
      existingDevices.push(device);
      devicesByUserId.set(device.userId, existingDevices);
    }
  });

  locations.forEach((location) => {
    if (location.deviceId && !locationByDeviceId.has(location.deviceId)) {
      locationByDeviceId.set(location.deviceId, location);
    }

    if (location.userId && !locationByUserId.has(location.userId)) {
      locationByUserId.set(location.userId, location);
    }
  });

  return {
    memberByUserId,
    deviceById,
    devicesByUserId,
    locationByDeviceId,
    locationByUserId,
  };
}

export function normalizeAlert(alert, context) {
  const userId = alert?.userId == null ? null : String(alert.userId);
  const alertDeviceId = alert?.deviceId == null ? null : String(alert.deviceId);
  const member = userId ? context.memberByUserId.get(userId) : null;
  const fallbackDevice = userId ? (context.devicesByUserId.get(userId) || [])[0] : null;
  const device = (alertDeviceId && context.deviceById.get(alertDeviceId)) || fallbackDevice || null;
  const liveLocation =
    (device?.id && context.locationByDeviceId.get(device.id)) ||
    (alertDeviceId && context.locationByDeviceId.get(alertDeviceId)) ||
    (userId && context.locationByUserId.get(userId)) ||
    null;

  const latitude = toNumber(alert?.location?.latitude ?? liveLocation?.latitude);
  const longitude = toNumber(alert?.location?.longitude ?? liveLocation?.longitude);
  const coordinateLabel =
    latitude != null && longitude != null
      ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : 'Coordinates syncing from device';

  const normalizedStatus = asText(alert?.status, 'active').toLowerCase() === 'cancelled'
    ? 'dismissed'
    : asText(alert?.status, 'active').toLowerCase();

  const createdAt = alert?.createdAt || alert?.timestamp || liveLocation?.timestamp || new Date().toISOString();
  const resolvedAt = alert?.resolvedAt || alert?.updatedAt || null;
  const batteryLevel = alert?.deviceInfo?.batteryLevel ?? device?.batteryLevel ?? null;
  const speed = alert?.deviceInfo?.speed ?? device?.speed ?? null;
  const speedUnit = asText(alert?.deviceInfo?.speedUnit, device?.speedUnit, 'km/h');
  const heading = alert?.deviceInfo?.heading ?? device?.heading ?? null;
  const incidentTitle = asText(
    alert?.title,
    alert?.type === 'sos' ? 'SOS emergency alert' : `${titleCase(alert?.type)} alert`,
    'Emergency alert',
  );
  const userName = asText(alert?.userName, member?.name, liveLocation?.userName, 'Tracked member');

  return {
    id: String(alert?.id ?? alert?.alertId ?? buildIncidentCode(alert)),
    incidentCode: buildIncidentCode(alert),
    type: asText(alert?.type, 'sos').toLowerCase(),
    title: incidentTitle,
    description: asText(
      alert?.description,
      alert?.message,
      `${incidentTitle} raised from ${userName}'s protected device.`,
    ),
    status: normalizedStatus,
    statusLabel: formatStatus(normalizedStatus),
    priority: asText(alert?.priority, alert?.type === 'sos' ? 'critical' : 'high').toLowerCase(),
    priorityLabel: formatPriority(asText(alert?.priority, alert?.type === 'sos' ? 'critical' : 'high').toLowerCase()),
    triggerLabel: formatTriggerLabel(alert?.type),
    userId,
    userName,
    email: asText(alert?.email, member?.email, 'No email on file'),
    phone: asText(alert?.phone, member?.phone, 'Emergency contact unavailable'),
    relationship: asText(member?.relationship, 'Family member'),
    deviceId: device?.id || alertDeviceId || 'pending-sync',
    deviceName: asText(device?.name, alert?.deviceName, 'Protected mobile device'),
    deviceType: asText(device?.type, 'Mobile device'),
    deviceStatus: asText(device?.status, liveLocation ? 'Online' : 'Syncing'),
    createdAt,
    resolvedAt,
    lastUpdatedAt: liveLocation?.timestamp || resolvedAt || createdAt,
    responseClock: formatElapsedTime(createdAt, normalizedStatus === 'resolved' ? resolvedAt : null),
    relativeTime: formatRelativeTime(createdAt),
    resolution: asText(
      alert?.resolution,
      normalizedStatus === 'resolved'
        ? 'Resolved by operator'
        : normalizedStatus === 'dismissed'
        ? 'Dismissed by operator'
        : 'Awaiting response action',
    ),
    isActive: ACTIVE_STATUSES.has(normalizedStatus),
    batteryLevel,
    batteryLabel:
      typeof batteryLevel === 'number' ? `${Math.round(batteryLevel)}%` : 'Battery telemetry syncing',
    speed,
    speedLabel:
      typeof speed === 'number'
        ? `${speed.toFixed(speed >= 10 ? 0 : 1)} ${speedUnit}`
        : 'Speed telemetry syncing',
    movementType: asText(
      alert?.deviceInfo?.movementType,
      typeof speed === 'number' && speed > 0 ? 'In motion' : '',
      device?.movementType,
      'Location monitoring',
    ),
    headingLabel: typeof heading === 'number' ? `${Math.round(heading)}°` : 'Heading syncing',
    location: {
      latitude,
      longitude,
      accuracy: alert?.location?.accuracy ?? liveLocation?.accuracy ?? null,
      address: asText(alert?.location?.address, liveLocation?.address, coordinateLabel, 'Location pending'),
    },
    locationLabel: asText(alert?.location?.address, liveLocation?.address, coordinateLabel, 'Location pending'),
    coordinatesLabel: coordinateLabel,
    mapQuery:
      latitude != null && longitude != null
        ? `${latitude},${longitude}`
        : asText(alert?.location?.address, liveLocation?.address, userName),
  };
}

export function buildDashboardStats(alerts) {
  const now = Date.now();
  const alertsInLast24Hours = alerts.filter((alert) => {
    const createdAt = new Date(alert.createdAt).getTime();
    return !Number.isNaN(createdAt) && now - createdAt <= 24 * 60 * 60 * 1000;
  }).length;

  const resolvedToday = alerts.filter((alert) => {
    if (alert.status !== 'resolved' || !alert.resolvedAt) return false;

    const resolvedDate = new Date(alert.resolvedAt);
    const today = new Date();

    return resolvedDate.toDateString() === today.toDateString();
  }).length;

  const averageResolutionMinutes = (() => {
    const resolvedDurations = alerts
      .filter((alert) => alert.status === 'resolved' && alert.createdAt && alert.resolvedAt)
      .map((alert) => {
        const createdAt = new Date(alert.createdAt).getTime();
        const resolvedAt = new Date(alert.resolvedAt).getTime();
        return Number.isNaN(createdAt) || Number.isNaN(resolvedAt)
          ? null
          : Math.max(0, Math.round((resolvedAt - createdAt) / 60000));
      })
      .filter((value) => value != null);

    if (!resolvedDurations.length) return 'Live';

    const average = Math.round(
      resolvedDurations.reduce((sum, value) => sum + value, 0) / resolvedDurations.length,
    );

    return `${average} min`;
  })();

  return [
    {
      label: 'Active incidents',
      value: alerts.filter((alert) => alert.isActive).length,
      meta: 'Requires operator action',
      icon: WarningAmberOutlinedIcon,
    },
    {
      label: 'Past 24 hours',
      value: alertsInLast24Hours,
      meta: 'Incident volume across the family',
      icon: QueryStatsOutlinedIcon,
    },
    {
      label: 'Resolved today',
      value: resolvedToday,
      meta: 'Closed from the response console',
      icon: CheckCircleOutlineIcon,
    },
    {
      label: 'Avg. response',
      value: averageResolutionMinutes,
      meta: 'Mean closure time for resolved incidents',
      icon: ShieldOutlinedIcon,
    },
  ];
}

export function buildIncidentBrief(alert) {
  if (!alert) return '';

  return [
    `Identity ${alert.title}`,
    `Incident: ${alert.incidentCode}`,
    `Member: ${alert.userName}`,
    `Contact: ${alert.phone}`,
    `Triggered: ${new Date(alert.createdAt).toLocaleString()}`,
    `Location: ${alert.locationLabel}`,
    `Coordinates: ${alert.coordinatesLabel}`,
    `Device: ${alert.deviceName} (${alert.deviceType})`,
    `Status: ${alert.statusLabel}`,
    `Notes: ${alert.description}`,
  ].join('\n');
}
