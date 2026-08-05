import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './theme';
import '../../css/app.css';
import GuestOrderingApp from './components/guest/GuestOrderingApp';

ReactDOM.createRoot(document.getElementById('guest-app')).render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <GuestOrderingApp />
    </ChakraProvider>
  </>
);
