import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import '../../css/app.css';
import router from './router';
import api from '../src/axios';
import { LanguageProvider } from './LanguageProvider';
import useOnlineSync from './hooks/useOnlineSync';
import 'virtual:pwa-register';
import theme from './theme';
import { PermissionProvider } from './context/PermissionContext';


function App() {
  useOnlineSync();

  return (
    <ChakraProvider theme={theme}>
      <PermissionProvider>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <LanguageProvider api={api}>
          <RouterProvider router={router} />
        </LanguageProvider>
      </PermissionProvider>
    </ChakraProvider>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
