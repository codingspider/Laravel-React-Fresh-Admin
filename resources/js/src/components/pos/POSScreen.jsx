import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box, Flex, Text, Button, HStack, VStack, Grid, GridItem, Input, InputGroup, InputRightElement,
  IconButton, Badge, Divider, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Select,
  Card, CardBody, Table, Thead, Tbody, Tr, Th, Td, Tooltip, Spinner, Center,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent,
  AlertDialogOverlay, useColorModeValue, Radio, RadioGroup,
  Menu, MenuButton, MenuList, MenuItem, Image, Tag, TagLabel,
  Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody,
  AspectRatio,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
  AddIcon, MinusIcon, DeleteIcon, SearchIcon, ChevronDownIcon,
  CheckIcon, WarningIcon, RepeatClockIcon, ExternalLinkIcon,
} from '@chakra-ui/icons';
import {
  ShoppingBag, User, Printer, Calculator, Maximize2, Minimize2,
  Tag as TagIcon, Gift, CreditCard, Banknote, Smartphone,
  RotateCcw, Pause, ClipboardList,
  Package, Store, Coffee, Utensils, Bike, Star,
} from 'lucide-react';
import axios from 'axios';
import {
  LIST_MENU_CATEGORY, LIST_MENU_ITEM, LIST_TABLE,
  STORE_POS_SALE, POS_PROCESS_PAYMENT,
  POS_CANCEL_SALE,
} from '../../routes/apiRoutes';
import { useCurrencyFormatter } from '../../useCurrencyFormatter';

const ORDER_TYPES = [
  { value: 'dine_in', label: 'Dine In', icon: Utensils },
  { value: 'takeaway', label: 'Takeaway', icon: Coffee },
  { value: 'delivery', label: 'Delivery', icon: Bike },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'online', label: 'Online', icon: ExternalLinkIcon },
  { value: 'credit', label: 'Credit', icon: ClipboardList },
  { value: 'loyalty', label: 'Loyalty', icon: Star },
];

function CartPanel({ isMobile, cart, cartItemCount, cartSubtotal, discountAmount, taxRate, taxName, taxAmount, shippingAmount, cartTotal, orderType, selectedTable, tables, setSelectedTable, heldOrders, holdOrder, onRecallOpen, removeFromCart, updateCartQty, onClearCart, submitting, submitOrder, onPaymentOpen, textPrimary, textSecondary, textMuted, inputBg, discountType, setDiscountType, discountValue, setDiscountValue, couponCode, setCouponCode, shipping, setShipping }) {
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormatter();
  const panelBg = useColorModeValue('white', 'gray.800');
  const panelBorder = useColorModeValue('gray.200', 'gray.700');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const emptyColor = useColorModeValue('gray.400', 'gray.500');

  return (
    <Flex
      direction="column"
      h={isMobile ? '100%' : 'calc(100vh - 60px)'}
      bg={panelBg}
      borderLeft={isMobile ? 'none' : '1px solid'}
      borderColor={panelBorder}
      w={isMobile ? '100%' : { base: '340px', lg: '380px', xl: '420px' }}
      minW={isMobile ? '100%' : { base: '300px', lg: '340px' }}
    >
      {/* Cart Header */}
      <Box px={4} py={3} borderBottom="1px solid" borderColor={panelBorder}>
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Box p={1.5} borderRadius="md" bg="brand.500" color="white">
              <ShoppingBag size={18} />
            </Box>
            <VStack spacing={0} align="start">
              <Text fontSize="sm" fontWeight="700" color={textPrimary}>{t('Current Order')}</Text>
              <Text fontSize="xs" color={textSecondary}>{cartItemCount} {t('items')}</Text>
            </VStack>
          </HStack>
          <HStack spacing={1}>
            <Tooltip label={t('Hold Order')} placement="top">
              <IconButton
                size="sm"
                icon={<Pause size={16} />}
                onClick={holdOrder}
                bg={useColorModeValue('orange.50', 'orange.900')}
                color={useColorModeValue('orange.600', 'orange.200')}
                _hover={{ bg: useColorModeValue('orange.100', 'orange.800') }}
                isDisabled={cart.length === 0}
                borderRadius="lg"
              />
            </Tooltip>
            {heldOrders.length > 0 && (
              <Tooltip label={`${t('Recall')} (${heldOrders.length})`} placement="top">
                <IconButton
                  size="sm"
                  icon={<RepeatClockIcon />}
                  onClick={onRecallOpen}
                  bg={useColorModeValue('blue.50', 'blue.900')}
                  color={useColorModeValue('blue.600', 'blue.200')}
                  _hover={{ bg: useColorModeValue('blue.100', 'blue.800') }}
                  borderRadius="lg"
                />
              </Tooltip>
            )}
            <Tooltip label={t('Clear Cart')} placement="top">
              <IconButton
                size="sm"
                icon={<RotateCcw size={16} />}
                onClick={onClearCart}
                bg={useColorModeValue('red.50', 'red.900')}
                color={useColorModeValue('red.600', 'red.200')}
                _hover={{ bg: useColorModeValue('red.100', 'red.800') }}
                isDisabled={cart.length === 0}
                borderRadius="lg"
              />
            </Tooltip>
          </HStack>
        </HStack>
      </Box>

      {/* Table Selector (Dine In) */}
      {orderType === 'dine_in' && (
        <Box px={4} py={2} borderBottom="1px solid" borderColor={panelBorder}>
          <Select
            size="sm"
            placeholder={t('Select table...')}
            value={selectedTable || ''}
            onChange={e => setSelectedTable(e.target.value ? parseInt(e.target.value) : null)}
            borderRadius="lg"
            bg={inputBg}
          >
            {tables.filter(tb => tb.status === 'available' || tb.id === selectedTable).map(table => (
              <option key={table.id} value={table.id}>{table.name}</option>
            ))}
          </Select>
        </Box>
      )}

      {/* Cart Items Table */}
      <Box flex="1" overflowY="auto" px={2}>
        {cart.length === 0 ? (
          <Center h="100%" flexDirection="column" px={4}>
            <Box p={6} borderRadius="2xl" bg={subtleBg} mb={4}>
              <ShoppingBag size={48} color={emptyColor} strokeWidth={1} />
            </Box>
            <Text color={textSecondary} fontSize="sm" fontWeight="600">{t('No items in cart')}</Text>
            <Text color={textMuted} fontSize="xs" mt={1}>{t('Click products to add them')}</Text>
          </Center>
        ) : (
          <Box>
            <Table size="sm" variant="unstyled">
              <Thead>
                <Tr>
                  <Th fontSize="xs" fontWeight="600" color={textSecondary} px={2} py={2} textTransform="uppercase" letterSpacing="wider">
                    {t('Product')}
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color={textSecondary} px={1} py={2} textTransform="uppercase" letterSpacing="wider" textAlign="center">
                    {t('Qty')}
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color={textSecondary} px={1} py={2} textTransform="uppercase" letterSpacing="wider" textAlign="right">
                    {t('Price')}
                  </Th>
                  <Th fontSize="xs" fontWeight="600" color={textSecondary} px={2} py={2} textTransform="uppercase" letterSpacing="wider" textAlign="right">
                    {t('Total')}
                  </Th>
                  <Th w={8} px={0} py={2}></Th>
                </Tr>
              </Thead>
              <Tbody>
                {cart.map(item => (
                  <Tr key={item.menu_item_id} borderBottom="1px solid" borderColor={panelBorder}>
                    <Td px={2} py={2}>
                      <Text fontSize="sm" fontWeight="600" color={textPrimary} noOfLines={1}>{item.item_name}</Text>
                      <Text fontSize="xs" color={textMuted}>{t('each')} {formatAmount(item.unit_price)}</Text>
                    </Td>
                    <Td px={1} py={2}>
                      <HStack spacing={0} justify="center">
                        <IconButton
                          size="xs"
                          variant="ghost"
                          icon={<MinusIcon boxSize={3} />}
                          onClick={() => updateCartQty(item.menu_item_id, -1)}
                          borderRadius="md"
                        />
                        <Text fontSize="sm" fontWeight="700" minW="24px" textAlign="center" color={textPrimary}>
                          {item.quantity}
                        </Text>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          icon={<AddIcon boxSize={3} />}
                          onClick={() => updateCartQty(item.menu_item_id, 1)}
                          borderRadius="md"
                        />
                      </HStack>
                    </Td>
                    <Td px={1} py={2} textAlign="right">
                      <Text fontSize="sm" color={textSecondary}>{formatAmount(item.unit_price)}</Text>
                    </Td>
                    <Td px={2} py={2} textAlign="right">
                      <Text fontSize="sm" fontWeight="700" color="brand.500">{formatAmount(item.total)}</Text>
                    </Td>
                    <Td px={0} py={2}>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        icon={<DeleteIcon boxSize={3} />}
                        colorScheme="red"
                        onClick={() => removeFromCart(item.menu_item_id)}
                        borderRadius="md"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* Tax, Discount, Coupon, Shipping */}
      <CartSummarySections
        discountType={discountType}
        setDiscountType={setDiscountType}
        discountValue={discountValue}
        setDiscountValue={setDiscountValue}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        shipping={shipping}
        setShipping={setShipping}
        taxRate={taxRate}
        taxName={taxName}
      />

      {/* Summary */}
      <SummarySection
        cartItemCount={cartItemCount}
        cartSubtotal={cartSubtotal}
        discountAmount={discountAmount}
        taxRate={taxRate}
        taxAmount={taxAmount}
        shippingAmount={shippingAmount}
        cartTotal={cartTotal}
      />

      {/* Action Buttons */}
      <ActionButtons
        cartLength={cart.length}
        holdOrder={holdOrder}
        resetCart={onClearCart}
        submitOrder={submitOrder}
        submitting={submitting}
      />
    </Flex>
  );
}

const CartPanelMemo = React.memo(CartPanel);

function CartSummarySections({ discountType, setDiscountType, discountValue, setDiscountValue, couponCode, setCouponCode, shipping, setShipping, taxRate, taxName }) {
  const { t } = useTranslation();
  const textSecondary = useColorModeValue('gray.500', 'gray.400');
  const textPrimary = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const inputBorder = useColorModeValue('gray.200', 'gray.600');
  const panelBorder = useColorModeValue('gray.200', 'gray.700');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box px={4} py={3} borderTop="1px solid" borderColor={panelBorder} bg={subtleBg}>
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="xs" fontWeight="600" color={textSecondary} textTransform="uppercase" letterSpacing="wider">
            {t('Tax')}
          </Text>
          <Text fontSize="sm" fontWeight="600" color={textPrimary}>
            {taxRate > 0 ? `${taxName} (${taxRate}%)` : t('None')}
          </Text>
        </HStack>

        <Box>
          <Text fontSize="xs" fontWeight="600" color={textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1.5}>
            {t('Discount')}
          </Text>
          <HStack spacing={2}>
            <RadioGroup value={discountType} onChange={setDiscountType} size="sm">
              <HStack spacing={3}>
                <Radio value="fixed" colorScheme="brand">{t('Fixed')}</Radio>
                <Radio value="percent" colorScheme="brand">%</Radio>
              </HStack>
            </RadioGroup>
            <Input
              size="sm"
              type="number"
              placeholder="0"
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
              borderRadius="lg"
              bg={inputBg}
              border="1px solid"
              borderColor={inputBorder}
              min={0}
            />
          </HStack>
        </Box>

        <Box>
          <Text fontSize="xs" fontWeight="600" color={textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1.5}>
            {t('Coupon')}
          </Text>
          <HStack spacing={2}>
            <Input
              size="sm"
              placeholder={t('Enter code')}
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              borderRadius="lg"
              bg={inputBg}
              border="1px solid"
              borderColor={inputBorder}
            />
            <IconButton
              size="sm"
              icon={<CheckIcon />}
              colorScheme="green"
              variant="outline"
              borderRadius="lg"
              isDisabled={!couponCode}
            />
          </HStack>
        </Box>

        <Box>
          <Text fontSize="xs" fontWeight="600" color={textSecondary} textTransform="uppercase" letterSpacing="wider" mb={1.5}>
            {t('Shipping')}
          </Text>
          <Input
            size="sm"
            type="number"
            placeholder="0"
            value={shipping}
            onChange={e => setShipping(e.target.value)}
            borderRadius="lg"
            bg={inputBg}
            border="1px solid"
            borderColor={inputBorder}
            min={0}
          />
        </Box>
      </VStack>
    </Box>
  );
}

function SummarySection({ cartItemCount, cartSubtotal, discountAmount, taxRate, taxAmount, shippingAmount, cartTotal }) {
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormatter();
  const panelBorder = useColorModeValue('gray.200', 'gray.700');
  const textPrimary = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box px={4} py={3} borderTop="1px solid" borderColor={panelBorder}>
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="sm" color={textSecondary}>{t('Total Qty')}</Text>
          <Text fontSize="sm" fontWeight="700" color={textPrimary}>{cartItemCount}</Text>
        </HStack>
        <HStack justify="space-between">
          <Text fontSize="sm" color={textSecondary}>{t('Items')}</Text>
          <Text fontSize="sm" fontWeight="600" color={textPrimary}>{formatAmount(cartSubtotal)}</Text>
        </HStack>
        {discountAmount > 0 && (
          <HStack justify="space-between">
            <Text fontSize="sm" color={useColorModeValue('red.500', 'red.300')}>{t('Discount')}</Text>
            <Text fontSize="sm" fontWeight="600" color={useColorModeValue('red.500', 'red.300')}>
              -{formatAmount(discountAmount)}
            </Text>
          </HStack>
        )}
        {taxAmount > 0 && (
          <HStack justify="space-between">
            <Text fontSize="sm" color={textSecondary}>{t('Tax')} ({taxRate}%)</Text>
            <Text fontSize="sm" fontWeight="600" color={textPrimary}>{formatAmount(taxAmount)}</Text>
          </HStack>
        )}
        {shippingAmount > 0 && (
          <HStack justify="space-between">
            <Text fontSize="sm" color={textSecondary}>{t('Shipping')}</Text>
            <Text fontSize="sm" fontWeight="600" color={textPrimary}>{formatAmount(shippingAmount)}</Text>
          </HStack>
        )}
        <Divider borderColor={panelBorder} />
        <HStack justify="space-between" pt={1}>
          <Text fontSize="lg" fontWeight="800" color={textPrimary}>{t('Total')}</Text>
          <Text fontSize="xl" fontWeight="800" color="brand.500">{formatAmount(cartTotal)}</Text>
        </HStack>
      </VStack>
    </Box>
  );
}

function ActionButtons({ cartLength, holdOrder, resetCart, submitOrder, submitting }) {
  const { t } = useTranslation();
  const panelBorder = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box px={4} py={3} borderTop="1px solid" borderColor={panelBorder}>
      <Grid templateColumns="1fr 1fr 1.5fr" gap={2}>
        <Button
          size="lg"
          bg={useColorModeValue('orange.500', 'orange.400')}
          color="white"
          _hover={{ bg: useColorModeValue('orange.600', 'orange.300') }}
          onClick={holdOrder}
          isDisabled={cartLength === 0}
          borderRadius="xl"
          fontWeight="700"
          leftIcon={<Pause size={16} />}
        >
          {t('Hold')}
        </Button>
        <Button
          size="lg"
          bg={useColorModeValue('red.500', 'red.400')}
          color="white"
          _hover={{ bg: useColorModeValue('red.600', 'red.300') }}
          onClick={resetCart}
          isDisabled={cartLength === 0}
          borderRadius="xl"
          fontWeight="700"
          leftIcon={<RotateCcw size={16} />}
        >
          {t('Reset')}
        </Button>
        <Button
          size="lg"
          bg={useColorModeValue('green.500', 'green.400')}
          color="white"
          _hover={{ bg: useColorModeValue('green.600', 'green.300') }}
          onClick={submitOrder}
          isLoading={submitting}
          isDisabled={cartLength === 0}
          borderRadius="xl"
          fontWeight="700"
          leftIcon={<CreditCard size={16} />}
        >
          {t('Pay Now')}
        </Button>
      </Grid>
    </Box>
  );
}

export default function POSScreen() {
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormatter();
  const toast = useToast();
  const cancelRef = useRef();

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const panelBg = useColorModeValue('white', 'gray.800');
  const panelBorder = useColorModeValue('gray.200', 'gray.700');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const textPrimary = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.500', 'gray.400');
  const textMuted = useColorModeValue('gray.400', 'gray.500');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const inputBorder = useColorModeValue('gray.200', 'gray.600');
  const chipBg = useColorModeValue('brand.50', 'brand.900');
  const chipActiveBg = useColorModeValue('brand.500', 'brand.400');
  const chipColor = useColorModeValue('brand.600', 'brand.200');
  const chipActiveColor = useColorModeValue('white', 'gray.900');
  const itemBg = useColorModeValue('white', 'gray.750');
  const itemBorder = useColorModeValue('gray.200', 'gray.600');
  const emptyColor = useColorModeValue('gray.400', 'gray.500');
  const softShadow = useColorModeValue('soft', 'softDark');

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('dine_in');
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentSale, setCurrentSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState('fixed');
  const [discountValue, setDiscountValue] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [shipping, setShipping] = useState('0');
  const [taxRate, setTaxRate] = useState(0);
  const [taxName, setTaxName] = useState('');
  const [heldOrders, setHeldOrders] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const { isOpen: isRecallOpen, onOpen: onRecallOpen, onClose: onRecallClose } = useDisclosure();
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [catRes, itemRes, tableRes] = await Promise.all([
        axios.get(`${LIST_MENU_CATEGORY}?per_page=100`),
        axios.get(`${LIST_MENU_ITEM}?per_page=200`),
        axios.get(`${LIST_TABLE}?per_page=100`),
      ]);
      setCategories(catRes.data.data || []);
      setMenuItems(itemRes.data.data || []);
      setFilteredItems(itemRes.data.data || []);
      setTables(tableRes.data.data || []);
    } catch {
      toast({ title: t('Failed to load POS data'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    let items = menuItems;
    if (selectedCategory) {
      items = items.filter(i => i.category_id === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q));
    }
    setFilteredItems(items);
  }, [selectedCategory, searchQuery, menuItems]);

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const existing = prev.find(c => c.menu_item_id === item.id);
      if (existing) {
        return prev.map(c => c.menu_item_id === item.id
          ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.unit_price }
          : c);
      }
      return [...prev, {
        menu_item_id: item.id,
        item_name: item.name,
        quantity: 1,
        unit_price: parseFloat(item.price) || 0,
        discount_amount: 0,
        tax_amount: 0,
        total: parseFloat(item.price) || 0,
      }];
    });
  }, []);

  const updateCartQty = useCallback((menuItemId, delta) => {
    setCart(prev => prev.map(c => {
      if (c.menu_item_id !== menuItemId) return c;
      const newQty = Math.max(1, c.quantity + delta);
      return { ...c, quantity: newQty, total: newQty * c.unit_price };
    }));
  }, []);

  const removeFromCart = useCallback((menuItemId) => {
    setCart(prev => prev.filter(c => c.menu_item_id !== menuItemId));
  }, []);

  const cartSubtotal = useMemo(() => cart.reduce((sum, c) => sum + c.total, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((sum, c) => sum + c.quantity, 0), [cart]);
  const discountAmount = discountType === 'fixed'
    ? parseFloat(discountValue) || 0
    : cartSubtotal * ((parseFloat(discountValue) || 0) / 100);
  const taxableAmount = cartSubtotal - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const shippingAmount = parseFloat(shipping) || 0;
  const cartTotal = taxableAmount + taxAmount + shippingAmount;

  const resetCart = useCallback(() => {
    setCart([]);
    setCurrentSale(null);
    setSelectedTable(null);
    setOrderType('dine_in');
    setDiscountType('fixed');
    setDiscountValue('');
    setCouponCode('');
    setShipping('0');
    setMobileCartOpen(false);
  }, []);

  const clearCartOnly = useCallback(() => {
    setCart([]);
    setDiscountValue('');
    setCouponCode('');
    setShipping('0');
  }, []);

  const submitOrder = useCallback(async () => {
    if (cart.length === 0) {
      toast({ title: t('Cart is empty'), status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(STORE_POS_SALE, {
        order_type: orderType,
        table_id: selectedTable,
        items: cart,
        discount_type: discountType,
        discount_value: parseFloat(discountValue) || 0,
        coupon_code: couponCode || null,
        shipping: shippingAmount,
        notes: '',
      });
      setCurrentSale(res.data.data);
      setPaymentAmount(res.data.data.total?.toString() || cartTotal.toFixed(2));
      onPaymentOpen();
      toast({ title: t('Order created'), status: 'success', duration: 2000, isClosable: true });
    } catch {
      toast({ title: t('Failed to create order'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  }, [cart, orderType, selectedTable, discountType, discountValue, couponCode, shippingAmount, cartTotal, toast, t, onPaymentOpen]);

  const processPayment = useCallback(async () => {
    if (!currentSale) return;
    setSubmitting(true);
    try {
      const res = await axios.post(POS_PROCESS_PAYMENT(currentSale.id), {
        payment_method: paymentMethod,
        amount: parseFloat(paymentAmount) || currentSale.total,
      });
      setCurrentSale(res.data.data);
      toast({ title: t('Payment processed successfully'), status: 'success', duration: 2000, isClosable: true });
      resetCart();
      onPaymentClose();
    } catch {
      toast({ title: t('Payment failed'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  }, [currentSale, paymentMethod, paymentAmount, toast, t, resetCart, onPaymentClose]);

  const holdOrder = useCallback(async () => {
    if (cart.length === 0) {
      toast({ title: t('Cart is empty'), status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    try {
      const res = await axios.post(STORE_POS_SALE, {
        order_type: orderType,
        table_id: selectedTable,
        items: cart,
      });
      const held = res.data.data;
      setHeldOrders(prev => [...prev, { ...held, cart }]);
      resetCart();
      toast({ title: t('Order held'), status: 'info', duration: 2000, isClosable: true });
    } catch {
      toast({ title: t('Failed to hold order'), status: 'error', duration: 3000, isClosable: true });
    }
  }, [cart, orderType, selectedTable, toast, t, resetCart]);

  const recallOrder = useCallback((held) => {
    setCart(held.cart || []);
    setCurrentSale(held);
    setHeldOrders(prev => prev.filter(h => h.id !== held.id));
    onRecallClose();
  }, [onRecallClose]);

  const cancelSale = useCallback(async () => {
    if (!currentSale) {
      resetCart();
      onCancelClose();
      return;
    }
    try {
      await axios.post(POS_CANCEL_SALE(currentSale.id));
      resetCart();
      toast({ title: t('Order cancelled'), status: 'info', duration: 2000, isClosable: true });
    } catch {
      toast({ title: t('Failed to cancel order'), status: 'error', duration: 3000, isClosable: true });
    }
    onCancelClose();
  }, [currentSale, toast, t, resetCart, onCancelClose]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const cartPanelProps = useMemo(() => ({
    cart, cartItemCount, cartSubtotal, discountAmount, taxRate, taxName, taxAmount,
    shippingAmount, cartTotal, orderType, selectedTable, tables, setSelectedTable,
    heldOrders, holdOrder, onRecallOpen, removeFromCart, updateCartQty,
    onClearCart: clearCartOnly, submitting, submitOrder, onPaymentOpen,
    textPrimary, textSecondary, textMuted, inputBg,
    discountType, setDiscountType, discountValue, setDiscountValue,
    couponCode, setCouponCode, shipping, setShipping,
  }), [cart, cartItemCount, cartSubtotal, discountAmount, taxRate, taxName, taxAmount,
    shippingAmount, cartTotal, orderType, selectedTable, tables, heldOrders, holdOrder,
    onRecallOpen, removeFromCart, updateCartQty, clearCartOnly, submitting, submitOrder,
    onPaymentOpen, textPrimary, textSecondary, textMuted, inputBg,
    discountType, discountValue, couponCode, shipping]);

  if (loading) {
    return (
      <Center h="calc(100vh - 60px)" bg={pageBg}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="3px" />
          <Text color={textSecondary}>{t('Loading POS...')}</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Flex h="calc(100vh - 60px)" overflow="hidden" bg={pageBg}>
      {/* Left: Products Area */}
      <Box flex="1" minW={0} display="flex" flexDirection="column">
        {/* Top Bar */}
        <Box px={4} py={3} bg={panelBg} borderBottom="1px solid" borderColor={panelBorder}>
          <Flex gap={3} align="center" wrap={{ base: 'wrap', md: 'nowrap' }}>
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                variant="outline"
                rightIcon={<ChevronDownIcon />}
                leftIcon={<User size={14} />}
                borderRadius="lg"
                borderColor={inputBorder}
                fontWeight="600"
                minW={{ base: '100%', sm: '160px' }}
                justifyContent="space-between"
              >
                {t('Walk-in Customer')}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => {}}>{t('Walk-in Customer')}</MenuItem>
              </MenuList>
            </Menu>

            <InputGroup size="sm" flex="1" minW={{ base: '100%', md: '200px' }}>
              <Input
                placeholder={t('Scan / Search product by code or name')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                borderRadius="lg"
                bg={inputBg}
                border="1px solid"
                borderColor={inputBorder}
                _focus={{ borderColor: 'brand.400', boxShadow: 'outline' }}
              />
              <InputRightElement>
                <SearchIcon color={textMuted} boxSize={4} />
              </InputRightElement>
            </InputGroup>

            <HStack spacing={1} flexShrink={0}>
              <Tooltip label={t('Order Type')} placement="top">
                <IconButton size="sm" icon={<Store size={16} />} borderRadius="lg"
                  bg={useColorModeValue('blue.500', 'blue.400')} color="white"
                  _hover={{ bg: useColorModeValue('blue.600', 'blue.300') }} onClick={() => {}} />
              </Tooltip>
              <Tooltip label={t('Discount')} placement="top">
                <IconButton size="sm" icon={<TagIcon size={16} />} borderRadius="lg"
                  bg={useColorModeValue('teal.500', 'teal.400')} color="white"
                  _hover={{ bg: useColorModeValue('teal.600', 'teal.300') }} onClick={() => {}} />
              </Tooltip>
              <Tooltip label={t('Coupons')} placement="top">
                <IconButton size="sm" icon={<Gift size={16} />} borderRadius="lg"
                  bg={useColorModeValue('purple.500', 'purple.400')} color="white"
                  _hover={{ bg: useColorModeValue('purple.600', 'purple.300') }} onClick={() => {}} />
              </Tooltip>
              <Tooltip label={t('Calculator')} placement="top">
                <IconButton size="sm" icon={<Calculator size={16} />} borderRadius="lg"
                  bg={useColorModeValue('green.500', 'green.400')} color="white"
                  _hover={{ bg: useColorModeValue('green.600', 'green.300') }} onClick={() => {}} />
              </Tooltip>
              <Tooltip label={isFullscreen ? t('Exit Fullscreen') : t('Fullscreen')} placement="top">
                <IconButton size="sm" icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  borderRadius="lg" bg={useColorModeValue('gray.500', 'gray.400')} color="white"
                  _hover={{ bg: useColorModeValue('gray.600', 'gray.300') }} onClick={toggleFullscreen} />
              </Tooltip>
              <Tooltip label={t('Print')} placement="top">
                <IconButton size="sm" icon={<Printer size={16} />} borderRadius="lg"
                  bg={useColorModeValue('orange.500', 'orange.400')} color="white"
                  _hover={{ bg: useColorModeValue('orange.600', 'orange.300') }} onClick={() => window.print()} />
              </Tooltip>
            </HStack>

            <Box position="relative" display={{ base: 'flex', md: 'none' }}>
              <IconButton
                size="sm"
                icon={<ShoppingBag size={16} />}
                borderRadius="lg"
                bg="brand.500"
                color="white"
                onClick={() => setMobileCartOpen(true)}
                flexShrink={0}
              />
              {cart.length > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  colorScheme="red"
                  borderRadius="full"
                  fontSize="xs"
                  w="18px"
                  h="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Box>
          </Flex>
        </Box>

        {/* Category Chips */}
        <Box px={4} py={2} bg={panelBg} borderBottom="1px solid" borderColor={panelBorder}>
          <Box overflowX="auto" pb={1} sx={{
            '&::-webkit-scrollbar': { height: '4px' },
            '&::-webkit-scrollbar-thumb': { bg: 'gray.300', borderRadius: 'full' },
          }}>
            <HStack spacing={2} minW="max-content">
              <Tag
                size="md" variant="solid" cursor="pointer"
                bg={selectedCategory === null ? chipActiveBg : chipBg}
                color={selectedCategory === null ? chipActiveColor : chipColor}
                borderRadius="full" fontWeight="600" px={4} py={1.5}
                onClick={() => setSelectedCategory(null)}
                _hover={{ transform: 'scale(1.02)' }} transition="all 0.15s"
              >
                <TagLabel>{t('All Categories')}</TagLabel>
              </Tag>
              {categories.map(cat => (
                <Tag
                  key={cat.id} size="md" variant="solid" cursor="pointer"
                  bg={selectedCategory === cat.id ? chipActiveBg : chipBg}
                  color={selectedCategory === cat.id ? chipActiveColor : chipColor}
                  borderRadius="full" fontWeight="600" px={4} py={1.5}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  _hover={{ transform: 'scale(1.02)' }} transition="all 0.15s" whiteSpace="nowrap"
                >
                  <TagLabel>{cat.name}</TagLabel>
                </Tag>
              ))}
            </HStack>
          </Box>
        </Box>

        {/* Products Grid */}
        <Box flex="1" overflowY="auto" px={4} py={4}>
          {filteredItems.length === 0 ? (
            <Center h="100%" flexDirection="column">
              <Box p={8} borderRadius="2xl" bg={subtleBg} mb={4}>
                <Package size={64} color={emptyColor} strokeWidth={1} />
              </Box>
              <Text color={textSecondary} fontSize="lg" fontWeight="600">{t('No products match filters')}</Text>
              <Text color={textMuted} fontSize="sm" mt={1}>{t('Try a different search or category')}</Text>
            </Center>
          ) : (
            <Grid
              templateColumns={{
                base: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
                xl: 'repeat(5, 1fr)',
              }}
              gap={3}
            >
              {filteredItems.map(item => (
                <GridItem key={item.id}>
                  <Card
                    cursor="pointer"
                    onClick={() => addToCart(item)}
                    _hover={{ transform: 'translateY(-2px)', shadow: softShadow, borderColor: 'brand.400' }}
                    transition="all 0.15s"
                    bg={itemBg}
                    border="1px solid"
                    borderColor={itemBorder}
                    borderRadius="xl"
                    overflow="hidden"
                    size="sm"
                  >
                    <AspectRatio ratio={4 / 3}>
                      <Box bg={subtleBg} display="flex" alignItems="center" justifyContent="center">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} objectFit="cover" w="100%" h="100%" />
                        ) : (
                          <Package size={32} color={emptyColor} strokeWidth={1.2} />
                        )}
                      </Box>
                    </AspectRatio>
                    <CardBody p={3}>
                      <Text fontWeight="700" fontSize="sm" color={textPrimary} noOfLines={1} mb={1}>
                        {item.name}
                      </Text>
                      <HStack justify="space-between" align="center">
                        <Text color="brand.500" fontWeight="800" fontSize="md">
                          {formatAmount(parseFloat(item.price || 0))}
                        </Text>
                        {item.sku && (
                          <Text fontSize="xs" color={textMuted}>{item.sku}</Text>
                        )}
                      </HStack>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Right: Cart Panel - Desktop */}
      <Box display={{ base: 'none', md: 'flex' }}>
        <CartPanelMemo {...cartPanelProps} />
      </Box>

      {/* Right: Cart Panel - Mobile Drawer */}
      <Drawer
        isOpen={mobileCartOpen}
        placement="right"
        onClose={() => setMobileCartOpen(false)}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor={panelBorder}>
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

      {/* Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent bg={panelBg}>
          <ModalHeader borderBottom="1px solid" borderColor={panelBorder}>
            <HStack>
              <CreditCard size={20} color="brand.500" />
              <Text>{t('Process Payment')}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={5} align="stretch" pt={2}>
              <Box textAlign="center" p={4} bg={subtleBg} borderRadius="xl">
                <Text fontSize="sm" color={textSecondary} mb={1}>{t('Total Amount')}</Text>
                <Text fontSize="3xl" fontWeight="800" color="brand.500">
                  {formatAmount(currentSale?.total || cartTotal)}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color={textSecondary} mb={2}>{t('Payment Method')}</Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  {PAYMENT_METHODS.map(pm => (
                    <Button
                      key={pm.value}
                      size="sm"
                      variant={paymentMethod === pm.value ? 'solid' : 'outline'}
                      colorScheme={paymentMethod === pm.value ? 'brand' : 'gray'}
                      onClick={() => setPaymentMethod(pm.value)}
                      borderRadius="lg"
                      fontWeight="600"
                      leftIcon={React.cloneElement(pm.icon, { size: 14 })}
                    >
                      {t(pm.label)}
                    </Button>
                  ))}
                </Grid>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color={textSecondary} mb={2}>{t('Amount')}</Text>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  fontSize="xl"
                  fontWeight="700"
                  textAlign="center"
                  borderRadius="xl"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={inputBorder}
                  size="lg"
                />
              </Box>

              <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                {[currentSale?.total || cartTotal, (currentSale?.total || cartTotal) / 2, (currentSale?.total || cartTotal) / 3].map((val, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="outline"
                    borderRadius="lg"
                    onClick={() => setPaymentAmount(val.toFixed(2))}
                  >
                    {i === 0 ? t('Full') : i === 1 ? '1/2' : '1/3'}
                  </Button>
                ))}
              </Grid>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={panelBorder}>
            <Button variant="ghost" mr={3} onClick={onPaymentClose} borderRadius="lg">
              {t('Cancel')}
            </Button>
            <Button
              colorScheme="green"
              onClick={processPayment}
              isLoading={submitting}
              borderRadius="lg"
              fontWeight="700"
              leftIcon={<CheckIcon />}
              size="lg"
            >
              {t('Confirm Payment')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Recall Modal */}
      <Modal isOpen={isRecallOpen} onClose={onRecallClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent bg={panelBg}>
          <ModalHeader borderBottom="1px solid" borderColor={panelBorder}>
            <HStack>
              <RepeatClockIcon color="blue.500" />
              <Text>{t('Held Orders')}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {heldOrders.length === 0 ? (
              <Center py={8}>
                <VStack>
                  <ClipboardList size={40} color={emptyColor} strokeWidth={1} />
                  <Text color={textMuted}>{t('No held orders')}</Text>
                </VStack>
              </Center>
            ) : (
              <VStack spacing={2} align="stretch" pt={2}>
                {heldOrders.map(held => (
                  <Card
                    key={held.id}
                    p={3}
                    cursor="pointer"
                    onClick={() => recallOrder(held)}
                    _hover={{ borderColor: 'brand.400', transform: 'translateY(-1px)' }}
                    transition="all 0.15s"
                    borderRadius="xl"
                  >
                    <HStack justify="space-between">
                      <HStack>
                        <Box p={2} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="lg">
                          <Pause size={14} color={useColorModeValue('orange.500', 'orange.300')} />
                        </Box>
                        <VStack spacing={0} align="start">
                          <Text fontWeight="700" fontSize="sm" color={textPrimary}>
                            #{held.invoice_number || t('New Order')}
                          </Text>
                          <Text fontSize="xs" color={textSecondary}>
                            {held.items?.length || held.cart?.length || 0} {t('items')}
                          </Text>
                        </VStack>
                      </HStack>
                      <VStack spacing={0} align="end">
                        <Text fontSize="md" fontWeight="700" color="brand.500">
                          {formatAmount(held.total || held.cart?.reduce((s, c) => s + c.total, 0) || 0)}
                        </Text>
                        <Text fontSize="xs" color={textMuted}>
                          <RepeatClockIcon mr={1} /> {held.created_at ? new Date(held.created_at).toLocaleTimeString() : ''}
                        </Text>
                      </VStack>
                    </HStack>
                  </Card>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Cancel Confirmation */}
      <AlertDialog isOpen={isCancelOpen} leastDestructiveRef={cancelRef} onClose={onCancelClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent bg={panelBg}>
            <AlertDialogHeader>
              <HStack>
                <WarningIcon color="red.500" />
                <Text>{t('Cancel Order?')}</Text>
              </HStack>
            </AlertDialogHeader>
            <AlertDialogBody>{t('Are you sure you want to cancel this order? All items will be removed.')}</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCancelClose} borderRadius="lg">{t('Keep')}</Button>
              <Button colorScheme="red" onClick={cancelSale} ml={3} borderRadius="lg" fontWeight="700">
                {t('Cancel Order')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
}
