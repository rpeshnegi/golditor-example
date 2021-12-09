import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ReactComponent as LogoDark } from '../../../assets/images/logos/golditor-logo-dark.svg';
import { ReactComponent as LogoLight } from '../../../assets/images/logos/golditor-logo-light.svg';

const LogoIcon = () => {
  const customizer = useSelector((state) => state.CustomizerReducer);
  return (
    <Link underline="none" to="/dashboard">
      {customizer.activeMode === 'dark' ? <LogoLight /> : <LogoDark />}
    </Link>
  );
};

export default LogoIcon;
