import React from 'react';
import { useRoutes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { CookiesProvider } from "react-cookie";
import RTL from './layouts/full-layout/customizer/RTL';
import ThemeSettings from './layouts/full-layout/customizer/ThemeSettings';
import Router from './routes/Router';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './App.css';

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.UserReducer);
  const routing = useRoutes(Router(isAuthenticated));
  const theme = ThemeSettings();
  const customizer = useSelector((state) => state.CustomizerReducer);
  return (
    <ThemeProvider theme={theme}>
      <CookiesProvider>
        <RTL direction={customizer.activeDir}>
          <CssBaseline />
          {routing}
        </RTL>
      </CookiesProvider>
    </ThemeProvider>
  );
};

export default App;
