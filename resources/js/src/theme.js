import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    config: {
        initialColorMode: 'light',
        useSystemColorMode: false,
    },
    fonts: {
        heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
        body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    },
    colors: {
        brand: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
            950: '#042f2e',
        },
        gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
            950: '#030712',
        },
    },
    radii: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
    },
    shadows: {
        xs: '0 1px 2px rgba(0,0,0,0.05)',
        sm: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        softDark: '0 2px 15px -3px rgba(0, 0, 0, 0.2), 0 10px 20px -2px rgba(0, 0, 0, 0.15)',
        card: '0 0 0 1px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)',
        cardDark: '0 0 0 1px rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.2)',
        outline: '0 0 0 3px rgba(13, 148, 136, 0.1)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: '500',
                borderRadius: 'lg',
                _focus: { boxShadow: 'outline' },
            },
            variants: {
                primary: {
                    bg: 'brand.600',
                    color: 'white',
                    _hover: { bg: 'brand.700', _disabled: { bg: 'brand.600' } },
                    _active: { bg: 'brand.800' },
                },
                secondary: {
                    bg: 'gray.100',
                    color: 'gray.700',
                    _hover: { bg: 'gray.200' },
                    _dark: { bg: 'gray.700', color: 'gray.200', _hover: { bg: 'gray.600' } },
                },
                danger: {
                    bg: 'red.50',
                    color: 'red.600',
                    _hover: { bg: 'red.100' },
                    _dark: { bg: 'red.900', color: 'red.200', _hover: { bg: 'red.800' } },
                },
                success: {
                    bg: 'green.50',
                    color: 'green.600',
                    _hover: { bg: 'green.100' },
                    _dark: { bg: 'green.900', color: 'green.200', _hover: { bg: 'green.800' } },
                },
                ghost: {
                    _hover: { bg: 'gray.100', _dark: { bg: 'gray.700' } },
                },
                outline: {
                    border: '1px solid',
                    borderColor: 'gray.200',
                    _hover: { bg: 'gray.50', _dark: { bg: 'gray.700' } },
                    _dark: { borderColor: 'gray.600' },
                },
            },
            sizes: {
                sm: { h: '32px', px: '12px', fontSize: 'sm' },
                md: { h: '36px', px: '16px', fontSize: 'sm' },
                lg: { h: '40px', px: '20px', fontSize: 'md' },
            },
        },
        Input: {
            baseStyle: {
                field: {
                    borderRadius: 'lg',
                    _focus: { boxShadow: 'outline' },
                },
            },
            variants: {
                filled: {
                    field: {
                        bg: 'gray.100',
                        _hover: { bg: 'gray.200' },
                        _focus: { bg: 'white', borderColor: 'brand.500' },
                        _dark: { bg: 'gray.700', _hover: { bg: 'gray.600' }, _focus: { bg: 'gray.600' } },
                    },
                },
                outline: {
                    field: {
                        _focus: { borderColor: 'brand.500', boxShadow: 'outline' },
                    },
                },
            },
            defaultProps: {
                variant: 'outline',
                size: 'md',
            },
        },
        Select: {
            baseStyle: {
                field: {
                    borderRadius: 'lg',
                },
            },
            defaultProps: {
                variant: 'outline',
                size: 'md',
            },
        },
        Card: {
            baseStyle: {
                bg: 'white',
                borderRadius: 'xl',
                boxShadow: 'card',
                border: '1px solid',
                borderColor: 'gray.200',
                _dark: { bg: 'gray.800', borderColor: 'gray.700' },
            },
        },
        Badge: {
            baseStyle: {
                borderRadius: 'full',
                fontWeight: '600',
                fontSize: 'xs',
                px: 2.5,
                py: 0.5,
            },
        },
        Table: {
            variants: {
                simple: {
                    th: {
                        borderColor: 'gray.200',
                        color: 'gray.500',
                        fontSize: 'xs',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        _dark: { borderColor: 'gray.700', color: 'gray.400' },
                    },
                    td: {
                        borderColor: 'gray.100',
                        _dark: { borderColor: 'gray.700' },
                    },
                },
            },
        },
        Menu: {
            baseStyle: {
                list: {
                    bg: 'white',
                    border: '1px solid',
                    borderColor: 'gray.200',
                    boxShadow: 'lg',
                    borderRadius: 'xl',
                    p: 1,
                    _dark: { bg: 'gray.800', borderColor: 'gray.700' },
                },
                item: {
                    borderRadius: 'md',
                    fontSize: 'sm',
                    _hover: { bg: 'gray.100', _dark: { bg: 'gray.700' } },
                },
            },
        },
        Tooltip: {
            baseStyle: {
                bg: 'gray.800',
                color: 'white',
                fontSize: 'xs',
                borderRadius: 'md',
                px: 3,
                py: 1.5,
            },
        },
    },
    styles: {
        global: (props) => ({
            body: {
                bg: props.colorMode === 'light' ? 'gray.50' : 'gray.900',
                color: props.colorMode === 'light' ? 'gray.800' : 'gray.100',
            },
            '*': {
                scrollbarWidth: 'thin',
                scrollbarColor: props.colorMode === 'light' ? '#d1d5db transparent' : '#4b5563 transparent',
            },
        }),
    },
});

export default theme;
