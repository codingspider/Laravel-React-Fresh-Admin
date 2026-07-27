import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ChakraProvider, ColorModeScript, Flex, Spinner } from '@chakra-ui/react';
import '../../css/app.css';
import router from './router';
import api from '../src/axios';
import { LanguageProvider } from './LanguageProvider';
import useOnlineSync from './hooks/useOnlineSync';
import 'virtual:pwa-register';
import theme from './theme';
import { PermissionProvider, usePermission } from './context/PermissionContext';

function AppContent() {
  useOnlineSync();
  const { loading } = usePermission();

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  return (
    <LanguageProvider api={api}>
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <PermissionProvider>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <AppContent />
      </PermissionProvider>
    </ChakraProvider>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
