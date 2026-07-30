// resources/js/theme.js
import { extendTheme } from '@chakra-ui/react'; // ✅ must be from @chakra-ui/react

const theme = extendTheme({
  colors: {
    brand: {
      100: '#f7fafc',
      500: '#38B2AC',
      900: '#1C4E4F',
    },
  },
});

export default theme;
