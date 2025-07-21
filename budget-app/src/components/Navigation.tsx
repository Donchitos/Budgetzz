import React from 'react';
import useMediaQuery from '../hooks/useMediaQuery';
import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';
import './Navigation.css';

const Navigation: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return isDesktop ? <DesktopNavigation /> : <MobileNavigation />;
};

export default Navigation;