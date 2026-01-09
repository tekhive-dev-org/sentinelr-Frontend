
export const InsightsService = {
  getUsageAnalytics: async (period = 'this_week') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock Data based on period
    if (period === 'last_week') {
        return [
            { day: 'Mon', usage: 4, s1: 4, s2: 0, s3: 0 },
            { day: 'Tue', usage: 5, s1: 3, s2: 1, s3: 1 },
            { day: 'Wed', usage: 3, s1: 2, s2: 1, s3: 0 },
            { day: 'Thur', usage: 7, s1: 5, s2: 2, s3: 0 },
            { day: 'Fri', usage: 6, s1: 4, s2: 1, s3: 1 },
            { day: 'Sat', usage: 8, s1: 6, s2: 1, s3: 1 },
            { day: 'Sun', usage: 5, s1: 3, s2: 1, s3: 1 },
        ];
    }
    
    if (period === 'today') {
        // Hourly data for today
        return [
            { day: '00:00', usage: 0, s1: 0, s2: 0, s3: 0 },
            { day: '04:00', usage: 0, s1: 0, s2: 0, s3: 0 },
            { day: '08:00', usage: 1.5, s1: 1, s2: 0.5, s3: 0 },
            { day: '12:00', usage: 3, s1: 2, s2: 0.5, s3: 0.5 },
            { day: '16:00', usage: 5, s1: 3, s2: 1, s3: 1 },
            { day: '20:00', usage: 4, s1: 2, s2: 1, s3: 1 },
            { day: '23:59', usage: 2, s1: 1, s2: 1, s3: 0 },
        ];
    }

    if (period === 'yesterday') {
         // Hourly data for yesterday
         return [
            { day: '00:00', usage: 1, s1: 1, s2: 0, s3: 0 },
            { day: '04:00', usage: 0, s1: 0, s2: 0, s3: 0 },
            { day: '08:00', usage: 2, s1: 1, s2: 1, s3: 0 },
            { day: '12:00', usage: 4, s1: 2, s2: 1, s3: 1 },
            { day: '16:00', usage: 4, s1: 2, s2: 1, s3: 1 },
            { day: '20:00', usage: 6, s1: 4, s2: 1, s3: 1 },
            { day: '23:59', usage: 1, s1: 0.5, s2: 0.5, s3: 0 },
        ];
    }

    // Default: this_week
    return [
      { day: 'Mon', usage: 0, s1: 3, s2: 3, s3: 4 },
      { day: 'Tue', usage: 3, s1: 2, s2: 3, s3: 3 },
      { day: 'Wed', usage: 6, s1: 4, s2: 4, s3: 2 },
      { day: 'Thur', usage: 0.5, s1: 4.5, s2: 1.5, s3: 3 },
      { day: 'Fri', usage: 5.5, s1: 3, s2: 3, s3: 4 },
      { day: 'Sat', usage: 0, s1: 4, s2: 3, s3: 3 },
      { day: 'Sun', usage: 10, s1: 6.5, s2: 2, s3: 2 },
    ];
  },

  getMostUsedApps: async (period = 'week') => {
     // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock Data
    return [
        { id: 1, name: 'Videos Viewed', subval: '365', time: '3h 45m', icon: '/assets/icons/youtube.png' },
        { id: 2, name: 'Videos Viewed', subval: '265', time: '2h 15m', icon: '/assets/icons/tiktok.png' },
        { id: 3, name: 'Videos Viewed', subval: '365', time: '3h 45m', icon: '/assets/icons/facebook.png' },
        { id: 4, name: 'Videos Viewed', subval: '265', time: '2h 15m', icon: '/assets/icons/whatsapp.png' },
    ];
  }
};
