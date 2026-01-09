import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

const HexGrid = () => (
    <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.15 }}>
        <defs>
            <pattern id="hexGrid" width="60" height="52" patternUnits="userSpaceOnUse">
                <path d="M30 0 L60 17 L60 51 L30 68 L0 51 L0 17 Z" fill="none" stroke="#cbd5e1" strokeWidth="1" transform="scale(0.5)"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
    </svg>
);

const DroneBee = ({ delay = 0 }) => (
    <motion.div
        animate={{
            offsetDistance: ["0%", "100%"],
            opacity: [0, 1, 1, 0]
        }}
        transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: delay
        }}
        style={{
            offsetPath: 'path("M0 50 Q 200 0 400 50 T 800 50")', // Wavy path
            position: 'absolute',
            width: '10px',
            height: '10px',
            background: '#F6C102', // Bee Gold
            borderRadius: '50%',
            boxShadow: '0 0 10px #F6C102',
        }}
    />
);

const AdminBackground = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        overflow: 'hidden',
        background: '#f8fafc', // Slate 50 - Light Professional Background
      }}
    >
        {/* Base Gradient - Tech Glow */}
        <motion.div
            animate={{
                background: [
                    'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                    'linear-gradient(180deg, #f1f5f9 0%, #f8fafc 100%)',
                ]
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
        />

        {/* Hexagonal Grid Overlay */}
        <HexGrid />

        {/* Circuit/Path Animations (Digital Bees) */}
        {/* We use SVG for better path animation compatibility if offset-path is tricky across browsers, but framer motion handles it well usually. 
            Simpler approach: Moving abstract shapes along lines.
        */}
        
        {/* Horizontal scan line */}
        <motion.div 
            animate={{ top: ['0%', '100%']}}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
                position: 'absolute',
                left: 0,
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(246, 193, 2, 0.5), transparent)',
                opacity: 0.5
            }}
        />

        {/* "Drone" particles moving randomly */}
        {[...Array(8)].map((_, i) => (
             <motion.div
                key={i}
                animate={{
                    x: [Math.random() * 100, Math.random() * -100, Math.random() * 100],
                    y: [Math.random() * 100, Math.random() * -100, Math.random() * 100],
                    opacity: [0.2, 0.8, 0.2]
                }}
                transition={{
                    duration: 15 + Math.random() * 10,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    position: 'absolute',
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: '6px',
                    height: '6px',
                    background: i % 2 === 0 ? '#0ea5e9' : '#eab308', // Sky Blue 500 or Yellow 500 (darker for visibility on light bg)
                    borderRadius: '50%',
                    boxShadow: `0 0 8px ${i % 2 === 0 ? '#0ea5e9' : '#eab308'}`,
                }}
             />
        ))}
        
        {/* Large faint glowing Hexagon in center */}
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                // Translate is handled by centered positioning logic usually, but here we center it manually with margin or transform
                marginLeft: '-300px',
                marginTop: '-300px',
                width: '600px',
                height: '600px',
                border: '1px solid rgba(234, 179, 8, 0.1)', // Subtle yellow border
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
        />

    </Box>
  );
};

export default AdminBackground;
