import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Box } from '@mui/material';

const BeeParams = {
    color: "#F6C102",
    wingColor: "rgba(255, 255, 255, 0.6)",
}

// SVG Bee Component
const Bee = ({ mouseX, mouseY, delay = 0, size = 40 }) => {
    // Spring physics for smooth following
    const springConfig = { damping: 15, stiffness: 50, mass: 1 + (delay * 0.5) }; // Vary mass for different follow speeds
    
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    // Add some random wandering on top of the follow movement
    // We can use a separate animation for the "hover/wiggle" relative to the spring position
    
    return (
        <motion.div
            style={{
                position: 'absolute',
                width: size,
                height: size,
                x, 
                y,
                zIndex: 1,
            }}
        >
             {/* Local wiggle/flutter animation */}
             <motion.div
                animate={{
                    x: [0, 20, 0, -20, 0],
                    y: [0, -20, 0, 20, 0],
                    rotate: [0, 10, 0, -10, 0]
                }}
                transition={{
                    duration: 3 + Math.random(),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay
                }}
             >
                <svg width="100%" height="100%" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Wings - Fluttering */}
                    <motion.ellipse 
                        cx="15" cy="15" rx="12" ry="6" fill={BeeParams.wingColor} 
                        animate={{ rotate: [10, -10] }}
                        transition={{ duration: 0.08, repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.ellipse 
                        cx="35" cy="15" rx="12" ry="6" fill={BeeParams.wingColor}
                        animate={{ rotate: [-10, 10] }}
                        transition={{ duration: 0.08, repeat: Infinity, repeatType: "reverse" }}
                    />
                    
                    {/* Body */}
                    <ellipse cx="25" cy="25" rx="10" ry="14" fill={BeeParams.color} />
                    <path d="M15 22H35" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M15 28H35" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                    
                    {/* Eyes */}
                    <circle cx="22" cy="18" r="1.5" fill="black"/>
                    <circle cx="28" cy="18" r="1.5" fill="black"/>
                </svg>
            </motion.div>
        </motion.div>
    )
}

const UserBackground = () => {
    // Motion values to track mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        // Set initial position to center
        if (typeof window !== 'undefined') {
             mouseX.set(window.innerWidth / 2);
             mouseY.set(window.innerHeight / 2);
        }

        const handleMouseMove = (e) => {
            mouseX.set(e.clientX - 25); // Offset to center bee on cursor
            mouseY.set(e.clientY - 25);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

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
        background: 'linear-gradient(135deg, #FFFBF0 0%, #FFF5E1 100%)', // Warm Honey/Milk
      }}
    >
      {/* Floating Combs (Hexagons) */}
      {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
                x: [0, 10, -10, 0]
            }}
            transition={{
                duration: 5 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
            }}
            style={{
                position: 'absolute',
                top: `${20 + (i * 15)}%`,
                left: `${10 + (i * 20)}%`,
                width: '100px',
                height: '115px', // Approx hex ratio
                opacity: 0.2,
                background: '#F6C102',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                filter: 'blur(10px)',
            }}
          />
      ))}

      {/* Bees Swarm */}
      {/* Generated swarm of bees with mapped random properties */}
      {[...Array(15)].map((_, i) => (
          <Bee 
            key={i}
            mouseX={mouseX} 
            mouseY={mouseY} 
            delay={i * 0.1 + Math.random() * 0.5} // Staggered delays
            size={20 + Math.random() * 30} // Random sizes between 20 and 50
          />
      ))}
       
       {/* Background ambient gradient pulse */}
       <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%',
                height: '60%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
                filter: 'blur(60px)',
            }}
       />

    </Box>
  );
};

export default UserBackground;
