import React from 'react';
import { Box } from '@mui/material';

const FPTLogo = ({ 
  size = 36, 
  className = '', 
  animate = false,
  style = {},
  ...props 
}) => {
  return (
    <Box 
      className={`logo-container ${animate ? 'logo-float' : ''} ${className}`}
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        ...style
      }}
      {...props}
    >
      <img
        src="/fpt_logo.png"
        alt="FPT University Logo"
        className="fpt-logo"
        style={{ 
          height: size, 
          width: 'auto', 
          objectFit: 'contain'
        }}
      />
    </Box>
  );
};

export default FPTLogo; 