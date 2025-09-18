import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Loading...', fullScreen = true }) => {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-gray-50 flex items-center justify-center z-50' 
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Animated AI Brain Icon */}
        <motion.div
          className="relative w-16 h-16 mx-auto mb-6"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20"></div>
          <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-40"></div>
          <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          
          {/* Pulsing dots */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              delay: 0 
            }}
          />
          <motion.div
            className="absolute top-1/3 left-1/3 w-1 h-1 bg-white rounded-full"
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              delay: 0.3 
            }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white rounded-full"
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              delay: 0.6 
            }}
          />
        </motion.div>

        {/* Loading Text */}
        <motion.h2 
          className="text-xl font-semibold text-gray-700 mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.h2>

        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{
                y: [-10, 0, -10],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;