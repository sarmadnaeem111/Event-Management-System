import React from 'react';
import { IconButton, Tooltip, Switch, FormControlLabel } from '@mui/material';
import { Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const DarkModeToggle = ({ type = 'icon' }) => {
  const { theme, toggleTheme } = useTheme();
  
  if (type === 'switch') {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={theme === 'dark'}
            onChange={toggleTheme}
            color="default"
          />
        }
        label={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
      />
    );
  }
  
  return (
    <Tooltip title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <IconButton color="inherit" onClick={toggleTheme}>
        {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default DarkModeToggle; 