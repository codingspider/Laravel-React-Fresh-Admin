import React from 'react';
import {
  Box, Text, HStack, VStack, Button, Center, Flex, Select, Tooltip, IconButton,
  Table, Thead, Tbody, Tr, Th, Td,
  Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { MinusIcon, AddIcon, DeleteIcon, RepeatClockIcon } from '@chakra-ui/icons';
import { ShoppingBag, Pause, RotateCcw } from 'lucide-react';
import CartSummarySections from './CartSummarySections';
import SummarySection from './SummarySection';
import ActionButtons from './ActionButtons';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import useThemeColors from '../../../hooks/useThemeColors';

function CartItems({ cart, cartItemCount, cartSubtotal, discountAmount, taxRate, taxName, taxAmount,
  shippingAmount, cartTotal, orderType, selectedTable, tables, setSelectedTable,
  heldOrders, holdOrder, onRecallOpen, removeFromCart, updateCartQty,
  onClearCart, submitting, submitOrder, onPaymentOpen,
  discountType, setDiscountType, discountValue, setDiscountValue,
  couponCode, setCouponCode, shipping, setShipping,
  notes, setNotes, kitchenNotes, setKitchenNotes,
  enableDiscount, enableCoupon, enableShipping, enableNotes, enableKitchenNotes, enableTableManagement,
  validateCoupon,
  isMobile,
}) {
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormatter();
  const colors = useThemeColors();

  return (
    <Flex
      direction="column"
      h={isMobile ? '100%' : 'calc(100vh - 60px)'}
      bg={colors.bgCard}
      borderLeft={isMobile ? 'none' : '1px solid'}
      borderColor={colors.borderDefault}
      w={isMobile ? '100%' : { base: '340px', lg: '380px', xl: '420px' }}
      minW={isMobile ? '100%' : { base: '300px', lg: '340px' }}
    >
      <Box px={3} py={2} borderBottom="1px solid" borderColor={colors.borderDefault}>
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Box p={1.5} borderRadius="md" bg="brand.500" color="white">
              <ShoppingBag size={18} />
            </Box>
            <VStack spacing={0} align="start">
              <Text fontSize="sm" fontWeight="700" color={colors.textPrimary}>{t('Current Order')}</Text>
              <Text fontSize="xs" color={colors.textSecondary}>{cartItemCount} {t('items')}</Text>
            </VStack>
          </HStack>
          <HStack spacing={1}>
            <Tooltip label={t('Hold Order')} placement="top">
              <IconButton size="sm" icon={<Pause size={16} />} onClick={holdOrder}
                bg={colors.btnHold} color={colors.btnHoldColor} _hover={{ bg: colors.btnHoldHover }}
                isDisabled={cart.length === 0} borderRadius="lg" />
            </Tooltip>
            {heldOrders.length > 0 && (
              <Tooltip label={`${t('Recall')} (${heldOrders.length})`} placement="top">
                <IconButton size="sm" icon={<RepeatClockIcon />} onClick={onRecallOpen}
                  bg={colors.btnRecall} color={colors.btnRecallColor} _hover={{ bg: colors.btnRecallHover }} borderRadius="lg" />
              </Tooltip>
            )}
            <Tooltip label={t('Clear Cart')} placement="top">
              <IconButton size="sm" icon={<RotateCcw size={16} />} onClick={onClearCart}
                bg={colors.btnClear} color={colors.btnClearColor} _hover={{ bg: colors.btnClearHover }}
                isDisabled={cart.length === 0} borderRadius="lg" />
            </Tooltip>
          </HStack>
        </HStack>
      </Box>

      {enableTableManagement && orderType === 'dine_in' && (
        <Box px={3} py={1.5} borderBottom="1px solid" borderColor={colors.borderDefault}>
          <Select size="sm" placeholder={t('Select table...')}
            value={selectedTable || ''}
            onChange={e => setSelectedTable(e.target.value ? parseInt(e.target.value) : null)}
            borderRadius="lg" bg={colors.bgInput}>
            {tables.filter(tb => tb.status === 'available' || tb.id === selectedTable).map(table => (
              <option key={table.id} value={table.id}>{table.name}</option>
            ))}
          </Select>
        </Box>
      )}

      <Box flex="1" overflowY="auto" px={2}>        {cart.length === 0 ? (
          <Center h="100%" flexDirection="column" px={2}>
            <Box p={4} borderRadius="2xl" bg={colors.bgSubtle} mb={2}>
              <ShoppingBag size={32} color={colors.textMuted} strokeWidth={1} />
            </Box>
            <Text color={colors.textSecondary} fontSize="sm" fontWeight="600">{t('No items in cart')}</Text>
            <Text color={colors.textMuted} fontSize="xs" mt={1}>{t('Click products to add them')}</Text>
          </Center>
        ) : (
          <Box>
            <Table size="sm" variant="unstyled">
              <Thead>
                <Tr>
                  <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} px={2} py={1.5} textTransform="uppercase" letterSpacing="wider">
                    {t('Product')}
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} px={1} py={1.5} textTransform="uppercase" letterSpacing="wider" textAlign="center">
                    {t('Qty')}
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} px={1} py={1.5} textTransform="uppercase" letterSpacing="wider" textAlign="right">
                    {t('Price')}
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} px={2} py={1.5} textTransform="uppercase" letterSpacing="wider" textAlign="right">
                    {t('Total')}
                  </Th>
                  <Th w={8} px={0} py={1.5}></Th>
                </Tr>
              </Thead>
              <Tbody>
                {cart.map(item => (
                  <Tr key={item.modifier_key || item.menu_item_id} borderBottom="1px solid" borderColor={colors.borderDefault}>
                    <Td px={2} py={1.5}>
                      <Text fontSize="sm" fontWeight="600" color={colors.textPrimary} noOfLines={1}>{item.item_name}</Text>
                      {item.modifiers_label && (
                        <Text fontSize="xs" color={colors.textMuted} noOfLines={2}>{item.modifiers_label}</Text>
                      )}
                      <Text fontSize="xs" color={colors.textMuted}>{t('each')} {formatAmount(item.unit_price)}</Text>
                    </Td>
                    <Td px={1} py={1.5}>
                      <HStack spacing={0} justify="center">
                        <IconButton size="xs" variant="ghost" icon={<MinusIcon boxSize={3} />}
                          onClick={() => updateCartQty(item.modifier_key || item.menu_item_id, -1)} borderRadius="md" />
                        <Text fontSize="sm" fontWeight="700" minW="24px" textAlign="center" color={colors.textPrimary}>
                          {item.quantity}
                        </Text>
                        <IconButton size="xs" variant="ghost" icon={<AddIcon boxSize={3} />}
                          onClick={() => updateCartQty(item.modifier_key || item.menu_item_id, 1)} borderRadius="md" />
                      </HStack>
                    </Td>
                    <Td px={1} py={1.5} textAlign="right">
                      <Text fontSize="sm" color={colors.textSecondary}>{formatAmount(item.unit_price)}</Text>
                    </Td>
                    <Td px={2} py={1.5} textAlign="right">
                      <Text fontSize="sm" fontWeight="700" color="brand.500">{formatAmount(item.total)}</Text>
                    </Td>
                    <Td px={0} py={1.5}>
                      <IconButton size="xs" variant="ghost" icon={<DeleteIcon boxSize={3} />}
                        colorScheme="red" onClick={() => removeFromCart(item.modifier_key || item.menu_item_id)} borderRadius="md" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <CartSummarySections
        discountType={discountType} setDiscountType={setDiscountType}
        discountValue={discountValue} setDiscountValue={setDiscountValue}
        couponCode={couponCode} setCouponCode={setCouponCode}
        shipping={shipping} setShipping={setShipping}
        taxRate={taxRate} taxName={taxName}
        notes={notes} setNotes={setNotes}
        kitchenNotes={kitchenNotes} setKitchenNotes={setKitchenNotes}
        enableDiscount={enableDiscount} enableCoupon={enableCoupon}
        enableShipping={enableShipping} enableNotes={enableNotes}
        enableKitchenNotes={enableKitchenNotes}
        validateCoupon={validateCoupon}
      />

      <SummarySection
        cartItemCount={cartItemCount} cartSubtotal={cartSubtotal}
        discountAmount={discountAmount} taxRate={taxRate} taxAmount={taxAmount}
        shippingAmount={shippingAmount} cartTotal={cartTotal}
      />

      <ActionButtons
        cartLength={cart.length} holdOrder={holdOrder}
        resetCart={onClearCart} submitOrder={submitOrder} submitting={submitting}
      />
    </Flex>
  );
}

const CartPanelMemo = React.memo(CartItems);

export default function CartPanel({ cartPanelProps, mobileCartOpen, setMobileCartOpen, cartItemCount }) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <>
      <Box display={{ base: 'none', md: 'flex' }}>
        <CartPanelMemo {...cartPanelProps} />
      </Box>

      <Drawer isOpen={mobileCartOpen} placement="right" onClose={() => setMobileCartOpen(false)} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor={colors.borderDefault}>
            <HStack>
              <ShoppingBag size={20} />
              <Text fontWeight="700">{t('Current Order')} ({cartItemCount} {t('items')})</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={0}>
            <CartPanelMemo {...cartPanelProps} isMobile />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
