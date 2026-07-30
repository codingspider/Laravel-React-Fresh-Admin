import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box, Flex, Text, VStack, Center, Spinner, useToast, useDisclosure,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Button, HStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { WarningIcon } from '@chakra-ui/icons';
import axios from 'axios';
import {
  LIST_MENU_CATEGORY, LIST_MENU_ITEM, LIST_TABLE,
  STORE_POS_SALE, POS_PROCESS_PAYMENT, POS_PROCESS_MULTIPLE_PAYMENTS,
  POS_CANCEL_SALE, POS_HELD_ORDERS, POS_RECALL_ORDER,
  LIST_CUSTOMER, POS_SETTINGS, POS_VALIDATE_COUPON, POS_MERGE_BILLS,
} from '../../routes/apiRoutes';
import useThemeColors from '../../hooks/useThemeColors';
import TopBar from './partials/TopBar';
import CategoryChips from './partials/CategoryChips';
import ProductGrid from './partials/ProductGrid';
import CartPanel from './partials/CartPanel';
import PaymentModal from './partials/PaymentModal';
import RecallModal from './partials/RecallModal';

export default function POSScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const cancelRef = useRef();
  const colors = useThemeColors();

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('dine_in');
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentSale, setCurrentSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState('fixed');
  const [discountValue, setDiscountValue] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [shipping, setShipping] = useState('0');
  const [taxRate, setTaxRate] = useState(0);
  const [taxName, setTaxName] = useState('');
  const [notes, setNotes] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [heldOrders, setHeldOrders] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [posSettings, setPosSettings] = useState(null);

  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const { isOpen: isRecallOpen, onOpen: onRecallOpen, onClose: onRecallClose } = useDisclosure();
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [splitPayments, setSplitPayments] = useState([{ method: 'cash', amount: '', reference: '' }]);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, itemRes, tableRes, custRes, settingsRes] = await Promise.all([
        axios.get(`${LIST_MENU_CATEGORY}?per_page=100`),
        axios.get(`${LIST_MENU_ITEM}?per_page=200`),
        axios.get(`${LIST_TABLE}?per_page=100`).catch(() => ({ data: { data: [] } })),
        axios.get(`${LIST_CUSTOMER}?per_page=500`).catch(() => ({ data: { data: [] } })),
        axios.get(POS_SETTINGS).catch(() => ({ data: { data: null } })),
      ]);
      setCategories(catRes.data.data || []);
      setMenuItems(itemRes.data.data || []);
      setFilteredItems(itemRes.data.data || []);
      setTables(tableRes.data.data || []);
      setCustomers(custRes.data.data || []);
      const settings = settingsRes.data.data;
      setPosSettings(settings);
      if (settings) {
        if (settings.default_tax_rate) setTaxRate(parseFloat(settings.default_tax_rate));
        if (settings.default_tax_name) setTaxName(settings.default_tax_name);
      }
    } catch {
      toast({ title: t('Failed to load POS data'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHeldOrders = useCallback(async () => {
    try {
      const res = await axios.get(POS_HELD_ORDERS);
      setHeldOrders(res.data.data || []);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchHeldOrders(); }, [fetchData, fetchHeldOrders]);

  useEffect(() => {
    let items = menuItems;
    if (selectedCategory) {
      items = items.filter(i => i.menu_category_id === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.sku?.toLowerCase().includes(q) ||
        i.barcode?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q)
      );
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
    setSelectedCustomer(null);
    setOrderType('dine_in');
    setDiscountType('fixed');
    setDiscountValue('');
    setCouponCode('');
    setShipping('0');
    setNotes('');
    setKitchenNotes('');
    setMobileCartOpen(false);
    setIsSplitPayment(false);
    setSplitPayments([{ method: 'cash', amount: '', reference: '' }]);
    setTaxRate(posSettings?.default_tax_rate ? parseFloat(posSettings.default_tax_rate) : 0);
    setTaxName(posSettings?.default_tax_name || '');
  }, [posSettings]);

  const clearCartOnly = useCallback(() => {
    setCart([]);
    setDiscountValue('');
    setCouponCode('');
    setShipping('0');
    setNotes('');
    setKitchenNotes('');
  }, []);

  const validateCoupon = useCallback(async () => {
    if (!couponCode) return;
    try {
      const res = await axios.post(POS_VALIDATE_COUPON, {
        code: couponCode,
        order_amount: cartSubtotal,
        restaurant_id: null,
        branch_id: null,
        customer_id: selectedCustomer?.id || null,
      });
      const result = res.data.data;
      if (result.valid) {
        if (result.type === 'fixed') {
          setDiscountType('fixed');
        } else {
          setDiscountType('percent');
        }
        setDiscountValue(result.value.toString());
        toast({ title: result.message, status: 'success', duration: 2000, isClosable: true });
      } else {
        toast({ title: result.message || t('Invalid coupon'), status: 'error', duration: 3000, isClosable: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('Invalid coupon');
      toast({ title: msg, status: 'error', duration: 3000, isClosable: true });
    }
  }, [couponCode, cartSubtotal, selectedCustomer, toast, t]);

  const mergeBills = useCallback(async (saleIds) => {
    try {
      const res = await axios.post(POS_MERGE_BILLS, { sale_ids: saleIds });
      const sale = res.data.data;
      const mergedCart = (sale.items || []).map(item => ({
        menu_item_id: item.menu_item_id,
        item_name: item.item_name || item.menu_item?.name || 'Item',
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        discount_amount: parseFloat(item.discount_amount || 0),
        tax_amount: parseFloat(item.tax_amount || 0),
        total: parseFloat(item.total),
      }));
      setCart(mergedCart);
      setCurrentSale(sale);
      setSelectedTable(sale.table_id || null);
      setSelectedCustomer(sale.customer || null);
      setOrderType(sale.order_type || 'dine_in');
      fetchHeldOrders();
      toast({ title: t('Orders merged successfully'), status: 'success', duration: 2000, isClosable: true });
      return sale;
    } catch {
      toast({ title: t('Failed to merge orders'), status: 'error', duration: 3000, isClosable: true });
      throw new Error('Merge failed');
    }
  }, [fetchHeldOrders, toast, t]);

  const submitOrder = useCallback(async () => {
    if (cart.length === 0) {
      toast({ title: t('Cart is empty'), status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        order_type: orderType,
        table_id: selectedTable,
        customer_id: selectedCustomer?.id || null,
        items: cart,
        discount_type: discountType,
        discount_value: parseFloat(discountValue) || 0,
        coupon_code: couponCode || null,
        shipping: shippingAmount,
        tax_rate: taxRate,
        tax_name: taxName,
        notes: notes || null,
        kitchen_notes: kitchenNotes || null,
      };
      const res = await axios.post(STORE_POS_SALE, payload);
      setCurrentSale(res.data.data);
      setPaymentAmount(res.data.data.total?.toString() || cartTotal.toFixed(2));
      onPaymentOpen();
      fetchHeldOrders();
      toast({ title: t('Order created'), status: 'success', duration: 2000, isClosable: true });
    } catch {
      toast({ title: t('Failed to create order'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  }, [cart, orderType, selectedTable, selectedCustomer, discountType, discountValue, couponCode, shippingAmount, taxRate, taxName, notes, kitchenNotes, cartTotal, toast, t, onPaymentOpen, fetchHeldOrders]);

  const processPayment = useCallback(async () => {
    if (!currentSale) return;
    setSubmitting(true);
    try {
      if (isSplitPayment) {
        const validPayments = splitPayments.filter(p => parseFloat(p.amount) > 0);
        if (validPayments.length === 0) {
          toast({ title: t('Add at least one payment'), status: 'warning', duration: 2000, isClosable: true });
          setSubmitting(false);
          return;
        }
        await axios.post(POS_PROCESS_MULTIPLE_PAYMENTS(currentSale.id), {
          payments: validPayments.map(p => ({
            payment_method: p.method,
            amount: parseFloat(p.amount),
            reference_number: p.reference || null,
          })),
        });
      } else {
        await axios.post(POS_PROCESS_PAYMENT(currentSale.id), {
          payment_method: paymentMethod,
          amount: parseFloat(paymentAmount) || currentSale.total,
        });
      }
      toast({ title: t('Payment processed successfully'), status: 'success', duration: 2000, isClosable: true });
      resetCart();
      onPaymentClose();
      fetchHeldOrders();
    } catch {
      toast({ title: t('Payment failed'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  }, [currentSale, paymentMethod, paymentAmount, isSplitPayment, splitPayments, toast, t, resetCart, onPaymentClose, fetchHeldOrders]);

  const holdOrder = useCallback(async () => {
    if (cart.length === 0) {
      toast({ title: t('Cart is empty'), status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(STORE_POS_SALE, {
        order_type: orderType,
        table_id: selectedTable,
        customer_id: selectedCustomer?.id || null,
        items: cart,
        discount_type: discountType,
        discount_value: parseFloat(discountValue) || 0,
        coupon_code: couponCode || null,
        shipping: shippingAmount,
        notes: notes || null,
        kitchen_notes: kitchenNotes || null,
      });
      await axios.post(POS_HOLD_ORDER(res.data.data.id));
      resetCart();
      fetchHeldOrders();
      toast({ title: t('Order held'), status: 'info', duration: 2000, isClosable: true });
    } catch {
      toast({ title: t('Failed to hold order'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  }, [cart, orderType, selectedTable, selectedCustomer, discountType, discountValue, couponCode, shippingAmount, notes, kitchenNotes, toast, t, resetCart, fetchHeldOrders]);

  const recallOrder = useCallback(async (held) => {
    try {
      const res = await axios.post(POS_RECALL_ORDER(held.id));
      const sale = res.data.data;
      const recalledCart = (sale.items || []).map(item => ({
        menu_item_id: item.menu_item_id,
        item_name: item.item_name || item.menu_item?.name || 'Item',
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        discount_amount: parseFloat(item.discount_amount || 0),
        tax_amount: parseFloat(item.tax_amount || 0),
        total: parseFloat(item.total),
      }));
      setCart(recalledCart);
      setCurrentSale(sale);
      setSelectedTable(sale.table_id || null);
      setSelectedCustomer(sale.customer || null);
      setOrderType(sale.order_type || 'dine_in');
      setHeldOrders(prev => prev.filter(h => h.id !== held.id));
      onRecallClose();
      fetchHeldOrders();
    } catch {
      toast({ title: t('Failed to recall order'), status: 'error', duration: 3000, isClosable: true });
    }
  }, [onRecallClose, fetchHeldOrders, toast, t]);

  const cancelSale = useCallback(async () => {
    if (!currentSale) {
      resetCart();
      onCancelClose();
      return;
    }
    try {
      await axios.post(POS_CANCEL_SALE(currentSale.id));
      resetCart();
      fetchHeldOrders();
      toast({ title: t('Order cancelled'), status: 'info', duration: 2000, isClosable: true });
    } catch {
      toast({ title: t('Failed to cancel order'), status: 'error', duration: 3000, isClosable: true });
    }
    onCancelClose();
  }, [currentSale, toast, t, resetCart, onCancelClose, fetchHeldOrders]);

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
    discountType, setDiscountType, discountValue, setDiscountValue,
    couponCode, setCouponCode, shipping, setShipping,
    notes, setNotes, kitchenNotes, setKitchenNotes,
    enableDiscount: posSettings?.enable_discount ?? true,
    enableCoupon: posSettings?.enable_coupon ?? true,
    enableShipping: posSettings?.enable_shipping ?? true,
    enableNotes: posSettings?.enable_notes ?? true,
    enableKitchenNotes: posSettings?.enable_kitchen_notes ?? true,
    enableTableManagement: posSettings?.enable_table_management ?? true,
    validateCoupon,
  }), [cart, cartItemCount, cartSubtotal, discountAmount, taxRate, taxName, taxAmount,
    shippingAmount, cartTotal, orderType, selectedTable, tables, heldOrders, holdOrder,
    onRecallOpen, removeFromCart, updateCartQty, clearCartOnly, submitting, submitOrder,
    onPaymentOpen, discountType, discountValue, couponCode, shipping, notes, kitchenNotes,
    posSettings]);

  if (loading) {
    return (
      <Center h="calc(100vh - 60px)" bg={colors.bgPage}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="3px" />
          <Text color={colors.textSecondary}>{t('Loading POS...')}</Text>
        </VStack>
      </Center>
    );
  }

  const saleTotal = currentSale?.total || cartTotal;

  return (
    <Flex h="calc(100vh - 60px)" overflow="hidden" bg={colors.bgPage}>
      <Box flex="1" minW={0} display="flex" flexDirection="column">
        <TopBar
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          orderType={orderType}
          setOrderType={setOrderType}
          cart={cart}
          cartItemCount={cartItemCount}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          setMobileCartOpen={setMobileCartOpen}
          orderTypes={posSettings?.active_order_types || []}
          enableCustomer={posSettings?.enable_customer ?? true}
        />

        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <ProductGrid
          filteredItems={filteredItems}
          addToCart={addToCart}
        />
      </Box>

      <CartPanel
        cartPanelProps={cartPanelProps}
        mobileCartOpen={mobileCartOpen}
        setMobileCartOpen={setMobileCartOpen}
        cartItemCount={cartItemCount}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={onPaymentClose}
        isSplitPayment={isSplitPayment}
        setIsSplitPayment={setIsSplitPayment}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        splitPayments={splitPayments}
        setSplitPayments={setSplitPayments}
        saleTotal={saleTotal}
        currentSale={currentSale}
        processPayment={processPayment}
        submitting={submitting}
        onCancelOpen={onCancelOpen}
        paymentMethods={posSettings?.active_payment_methods || []}
      />

      <RecallModal
        isOpen={isRecallOpen}
        onClose={onRecallClose}
        heldOrders={heldOrders}
        recallOrder={recallOrder}
        mergeBills={mergeBills}
      />

      <AlertDialog isOpen={isCancelOpen} leastDestructiveRef={cancelRef} onClose={onCancelClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent bg={colors.bgCard}>
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
