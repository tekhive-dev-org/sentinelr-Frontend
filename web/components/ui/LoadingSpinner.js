import { CircularProgress, Box } from '@mui/material';

export default function LoadingSpinner({ fullScreen = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: fullScreen ? '100vh' : '100%',
        width: '100%',
        minHeight: fullScreen ? 'auto' : '200px', // Ensure visibility in containers
      }}
    >
      <CircularProgress 
        size={40}
        thickness={4}
        sx={{
            color: '#0f3c5f', // Brand color
            animationDuration: '550ms', // Faster spin for a premium feel
            [`& .MuiCircularProgress-circle`]: {
                strokeLinecap: 'round',
            },
        }}
      />
    </Box>
  );
}
