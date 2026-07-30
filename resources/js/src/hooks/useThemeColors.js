import { useTheme, useColorMode } from '@chakra-ui/react';

/**
 * Reads semantic tokens from theme.js — single source of truth.
 *
 * Usage:
 *   const c = useThemeColors();
 *   <Box bg={c.bgCard} color={c.textPrimary} />
 */
const useThemeColors = () => {
    const { semanticTokens } = useTheme();
    const { colorMode } = useColorMode();
    const tokens = semanticTokens?.colors || {};

    const resolve = (key) => {
        const def = tokens[key];
        if (!def) return undefined;
        if (colorMode === 'dark') return def._dark ?? def.default;
        return def.default;
    };

    return {
        // ── Page & Surface Backgrounds ──
        bgPage:      resolve('bg.page'),
        bgCard:      resolve('bg.card'),
        bgSubtle:    resolve('bg.subtle'),
        bgInput:     resolve('bg.input'),
        bgHover:     resolve('bg.hover'),
        bgActive:    resolve('bg.active'),

        // ── Text ──
        textPrimary:   resolve('text.primary'),
        textSecondary: resolve('text.secondary'),
        textMuted:     resolve('text.muted'),
        textInverse:   resolve('text.inverse'),
        textLabel:     resolve('text.label'),
        textHeading:   resolve('text.heading'),

        // ── Borders ──
        borderDefault: resolve('border.default'),
        borderSubtle:  resolve('border.subtle'),
        borderInput:   resolve('border.input'),
        borderStrong:  resolve('border.strong'),
        borderNav:     resolve('border.nav'),

        // ── Status ──
        statusSuccess:   resolve('status.success'),
        statusWarning:   resolve('status.warning'),
        statusError:     resolve('status.error'),
        statusInfo:      resolve('status.info'),
        statusSuccessBg: resolve('status.successBg'),
        statusWarningBg: resolve('status.warningBg'),
        statusErrorBg:   resolve('status.errorBg'),
        statusInfoBg:    resolve('status.infoBg'),
        statusSuccessText: resolve('status.successText'),
        statusWarningText: resolve('status.warningText'),
        statusErrorText:   resolve('status.errorText'),
        statusInfoText:    resolve('status.infoText'),

        // ── Brand ──
        brandSolid:      resolve('brand.solid'),
        brandSolidHover: resolve('brand.solidHover'),
        brandSubtle:     resolve('brand.subtle'),
        brandSubtleText: resolve('brand.subtleText'),
        brandActive:     resolve('brand.active'),

        // ── Shadows ──
        shadowCard:  resolve('shadow.card'),
        shadowModal: resolve('shadow.modal'),

        // ── POS Buttons ──
        btnHold:       resolve('btn.hold'),
        btnHoldColor:  resolve('btn.holdColor'),
        btnHoldHover:  resolve('btn.holdHover'),
        btnRecall:     resolve('btn.recall'),
        btnRecallColor:resolve('btn.recallColor'),
        btnRecallHover:resolve('btn.recallHover'),
        btnClear:      resolve('btn.clear'),
        btnClearColor: resolve('btn.clearColor'),
        btnClearHover: resolve('btn.clearHover'),

        // ── POS Actions ──
        actionHold:       resolve('action.hold'),
        actionHoldHover:  resolve('action.holdHover'),
        actionReset:      resolve('action.reset'),
        actionResetHover: resolve('action.resetHover'),
        actionPay:        resolve('action.pay'),
        actionPayHover:   resolve('action.payHover'),

        // ── POS TopBar ──
        topbarOrderType:       resolve('topbar.orderType'),
        topbarOrderTypeHover:  resolve('topbar.orderTypeHover'),
        topbarDiscount:        resolve('topbar.discount'),
        topbarDiscountHover:   resolve('topbar.discountHover'),
        topbarCoupon:          resolve('topbar.coupon'),
        topbarCouponHover:     resolve('topbar.couponHover'),
        topbarCalc:            resolve('topbar.calc'),
        topbarCalcHover:       resolve('topbar.calcHover'),
        topbarFullscreen:      resolve('topbar.fullscreen'),
        topbarFullscreenHover: resolve('topbar.fullscreenHover'),
        topbarPrint:           resolve('topbar.print'),
        topbarPrintHover:      resolve('topbar.printHover'),

        // ── POS Chips ──
        chipBg:          resolve('chip.bg'),
        chipActiveBg:    resolve('chip.activeBg'),
        chipColor:       resolve('chip.color'),
        chipActiveColor: resolve('chip.activeColor'),

        // ── POS Products ──
        productBg:     resolve('product.bg'),
        productBorder: resolve('product.border'),

        // ── POS Recall ──
        recallIconBg:    resolve('recall.iconBg'),
        recallIconColor: resolve('recall.iconColor'),

        // ── POS Discount ──
        discountText: resolve('discount.text'),

        // ── Nav ──
        navBg:       resolve('nav.bg'),
        navSearchBg: resolve('nav.searchBg'),
    };
};

export default useThemeColors;
