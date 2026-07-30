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
            50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
            400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
            800: '#115e59', 900: '#134e4a', 950: '#042f2e',
        },
        gray: {
            50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db',
            400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151',
            800: '#1f2937', 900: '#111827', 950: '#030712',
        },
    },
    semanticTokens: {
        colors: {
            // ── Page & Surface Backgrounds ──
            'bg.page': { default: 'gray.50', _dark: 'gray.900' },
            'bg.card': { default: 'white', _dark: 'gray.800' },
            'bg.subtle': { default: 'gray.50', _dark: 'gray.700' },
            'bg.input': { default: 'gray.100', _dark: 'gray.700' },
            'bg.hover': { default: 'gray.50', _dark: 'gray.700' },
            'bg.active': { default: 'gray.100', _dark: 'gray.600' },
            'bg.overlay': { default: 'blackAlpha.600', _dark: 'blackAlpha.700' },

            // ── Text Colours ──
            'text.primary': { default: 'gray.800', _dark: 'white' },
            'text.secondary': { default: 'gray.500', _dark: 'gray.400' },
            'text.muted': { default: 'gray.400', _dark: 'gray.500' },
            'text.inverse': { default: 'white', _dark: 'gray.800' },
            'text.label': { default: 'gray.700', _dark: 'gray.300' },
            'text.heading': { default: 'gray.800', _dark: 'white' },

            // ── Border Colours ──
            'border.default': { default: 'gray.200', _dark: 'gray.700' },
            'border.subtle': { default: 'gray.100', _dark: 'gray.700' },
            'border.input': { default: 'gray.200', _dark: 'gray.600' },
            'border.strong': { default: 'gray.300', _dark: 'gray.600' },
            'border.nav': { default: 'white', _dark: 'gray.900' },

            // ── Status Colours ──
            'status.success': { default: 'green.500', _dark: 'green.400' },
            'status.warning': { default: 'yellow.500', _dark: 'yellow.400' },
            'status.error': { default: 'red.500', _dark: 'red.400' },
            'status.info': { default: 'blue.500', _dark: 'blue.400' },

            'status.successBg': { default: 'green.50', _dark: 'green.900' },
            'status.warningBg': { default: 'yellow.50', _dark: 'yellow.900' },
            'status.errorBg': { default: 'red.50', _dark: 'red.900' },
            'status.infoBg': { default: 'blue.50', _dark: 'blue.900' },

            'status.successText': { default: 'green.600', _dark: 'green.200' },
            'status.warningText': { default: 'yellow.600', _dark: 'yellow.200' },
            'status.errorText': { default: 'red.600', _dark: 'red.200' },
            'status.infoText': { default: 'blue.600', _dark: 'blue.200' },

            // ── Brand ──
            'brand.solid': { default: 'brand.600', _dark: 'brand.500' },
            'brand.solidHover': { default: 'brand.700', _dark: 'brand.400' },
            'brand.subtle': { default: 'brand.50', _dark: 'brand.900' },
            'brand.subtleText': { default: 'brand.600', _dark: 'brand.200' },
            'brand.active': { default: 'brand.50', _dark: 'brand.900' },

            // ── Shadows (semantic) ──
            'shadow.card': { default: 'card', _dark: 'cardDark' },
            'shadow.modal': { default: 'lg', _dark: '2xl' },

            // ── POS Button Colours ──
            'btn.hold': { default: 'orange.50', _dark: 'orange.900' },
            'btn.holdColor': { default: 'orange.600', _dark: 'orange.200' },
            'btn.holdHover': { default: 'orange.100', _dark: 'orange.800' },
            'btn.recall': { default: 'blue.50', _dark: 'blue.900' },
            'btn.recallColor': { default: 'blue.600', _dark: 'blue.200' },
            'btn.recallHover': { default: 'blue.100', _dark: 'blue.800' },
            'btn.clear': { default: 'red.50', _dark: 'red.900' },
            'btn.clearColor': { default: 'red.600', _dark: 'red.200' },
            'btn.clearHover': { default: 'red.100', _dark: 'red.800' },

            // ── POS Action Button Colours ──
            'action.hold': { default: 'orange.500', _dark: 'orange.400' },
            'action.holdHover': { default: 'orange.600', _dark: 'orange.300' },
            'action.reset': { default: 'red.500', _dark: 'red.400' },
            'action.resetHover': { default: 'red.600', _dark: 'red.300' },
            'action.pay': { default: 'green.500', _dark: 'green.400' },
            'action.payHover': { default: 'green.600', _dark: 'green.300' },

            // ── POS TopBar Button Colours ──
            'topbar.orderType': { default: 'blue.500', _dark: 'blue.400' },
            'topbar.orderTypeHover': { default: 'blue.600', _dark: 'blue.300' },
            'topbar.discount': { default: 'teal.500', _dark: 'teal.400' },
            'topbar.discountHover': { default: 'teal.600', _dark: 'teal.300' },
            'topbar.coupon': { default: 'purple.500', _dark: 'purple.400' },
            'topbar.couponHover': { default: 'purple.600', _dark: 'purple.300' },
            'topbar.calc': { default: 'green.500', _dark: 'green.400' },
            'topbar.calcHover': { default: 'green.600', _dark: 'green.300' },
            'topbar.fullscreen': { default: 'gray.500', _dark: 'gray.400' },
            'topbar.fullscreenHover': { default: 'gray.600', _dark: 'gray.300' },
            'topbar.print': { default: 'orange.500', _dark: 'orange.400' },
            'topbar.printHover': { default: 'orange.600', _dark: 'orange.300' },

            // ── POS Category Chips ──
            'chip.bg': { default: 'brand.50', _dark: 'brand.900' },
            'chip.activeBg': { default: 'brand.500', _dark: 'brand.400' },
            'chip.color': { default: 'brand.600', _dark: 'brand.200' },
            'chip.activeColor': { default: 'white', _dark: 'gray.900' },

            // ── POS Product Grid ──
            'product.bg': { default: 'white', _dark: 'gray.750' },
            'product.border': { default: 'gray.200', _dark: 'gray.600' },

            // ── POS Recall Icon ──
            'recall.iconBg': { default: 'orange.50', _dark: 'orange.900' },
            'recall.iconColor': { default: 'orange.500', _dark: 'orange.300' },

            // ── POS Discount Text ──
            'discount.text': { default: 'red.500', _dark: 'red.300' },

            // ── Nav ──
            'nav.bg': { default: 'rgba(255,255,255,0.95)', _dark: 'rgba(26,32,44,0.95)' },
            'nav.searchBg': { default: 'gray.50', _dark: 'gray.800' },
        },
    },
    radii: {
        sm: '6px', md: '8px', lg: '12px', xl: '16px', '2xl': '20px', full: '9999px',
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
            defaultProps: { variant: 'outline', size: 'md' },
        },
        Select: {
            baseStyle: { field: { borderRadius: 'lg' } },
            defaultProps: { variant: 'outline', size: 'md' },
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
