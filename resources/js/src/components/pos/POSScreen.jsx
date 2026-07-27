import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, Text, Button, VStack, HStack, Grid, GridItem, Input, IconButton,
  Badge, Divider, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Select, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Tabs, TabList, TabPanels, Tab, TabPanel, Card, CardBody, CardHeader,
  Table, Thead, Tbody, Tr, Th, Td, Tooltip, Spinner, Center, Alert, AlertIcon,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent,
  AlertDialogOverlay, useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  AddIcon, MinusIcon, DeleteIcon, SearchIcon,
  TimeIcon, CheckIcon, CloseIcon, RepeatIcon, WarningIcon, HamburgerIcon,
} from '@chakra-ui/icons';
import axios from 'axios';
import {
  LIST_MENU_CATEGORY, LIST_MENU_ITEM, LIST_TABLE, LIST_BRANCH,
  STORE_POS_SALE, POS_PROCESS_PAYMENT, POS_HOLD_ORDER, POS_RECALL_ORDER,
  POS_CANCEL_SALE, POS_START_SESSION, POS_CLOSE_SESSION, POS_OPEN_SESSION,
  POS_ADD_ITEM, POS_REMOVE_ITEM, GET_POS_SALE,
} from '../../routes/apiRoutes';
import { ShoppingBagIcon } from 'lucide-react';

const ORDER_TYPES = [
  { value: 'dine_in', label: 'Dine In' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'delivery', label: 'Delivery' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'online', label: 'Online' },
  { value: 'credit', label: 'Credit' },
  { value: 'loyalty', label: 'Loyalty' },
];

export default function POSScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');
  const sidebarBg = useColorModeValue('gray.50', 'gray.700');
  const cartBg = useColorModeValue('blue.50', 'gray.600');

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
  const [session, setSession] = useState(null);

  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const { isOpen: isHoldOpen, onOpen: onHoldOpen, onClose: onHoldClose } = useDisclosure();
  const { isOpen: isRecallOpen, onOpen: onRecallOpen, onClose: onRecallClose } = useDisclosure();
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [heldOrders, setHeldOrders] = useState([]);
  const cancelRef = React.useRef();

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
      toast({ title: t('Failed to load data'), status: 'error', duration: 3000 });
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
      items = items.filter(i => i.name?.toLowerCase().includes(q));
    }
    setFilteredItems(items);
  }, [selectedCategory, searchQuery, menuItems]);

  const addToCart = (item) => {
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
  };

  const updateCartQty = (menuItemId, delta) => {
    setCart(prev => prev.map(c => {
      if (c.menu_item_id !== menuItemId) return c;
      const newQty = Math.max(1, c.quantity + delta);
      return { ...c, quantity: newQty, total: newQty * c.unit_price };
    }));
  };

  const removeFromCart = (menuItemId) => {
    setCart(prev => prev.filter(c => c.menu_item_id !== menuItemId));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.total, 0);
  const cartItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast({ title: t('Cart is empty'), status: 'warning', duration: 2000 });
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(STORE_POS_SALE, {
        order_type: orderType,
        table_id: selectedTable,
        items: cart,
        notes: '',
      });
      setCurrentSale(res.data.data);
      setPaymentAmount(res.data.data.total?.toString() || '');
      onPaymentOpen();
      toast({ title: t('Order created'), status: 'success', duration: 2000 });
    } catch {
      toast({ title: t('Failed to create order'), status: 'error', duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  const processPayment = async () => {
    if (!currentSale) return;
    setSubmitting(true);
    try {
      const res = await axios.post(POS_PROCESS_PAYMENT(currentSale.id), {
        payment_method: paymentMethod,
        amount: parseFloat(paymentAmount) || currentSale.total,
      });
      setCurrentSale(res.data.data);
      toast({ title: t('Payment processed'), status: 'success', duration: 2000 });
      resetCart();
      onPaymentClose();
    } catch {
      toast({ title: t('Payment failed'), status: 'error', duration: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  const holdOrder = async () => {
    if (!currentSale) {
      if (cart.length === 0) {
        toast({ title: t('Cart is empty'), status: 'warning', duration: 2000 });
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
        toast({ title: t('Order held'), status: 'info', duration: 2000 });
      } catch {
        toast({ title: t('Failed to hold order'), status: 'error', duration: 3000 });
      }
      return;
    }
    try {
      await axios.post(POS_HOLD_ORDER(currentSale.id));
      setHeldOrders(prev => [...prev, { ...currentSale, cart }]);
      resetCart();
      toast({ title: t('Order held'), status: 'info', duration: 2000 });
    } catch {
      toast({ title: t('Failed to hold order'), status: 'error', duration: 3000 });
    }
  };

  const recallOrder = (held) => {
    setCart(held.cart || []);
    setCurrentSale(held);
    setHeldOrders(prev => prev.filter(h => h.id !== held.id));
    onHoldClose();
  };

  const cancelSale = async () => {
    if (!currentSale) {
      resetCart();
      onCancelClose();
      return;
    }
    try {
      await axios.post(POS_CANCEL_SALE(currentSale.id));
      resetCart();
      toast({ title: t('Order cancelled'), status: 'info', duration: 2000 });
    } catch {
      toast({ title: t('Failed to cancel'), status: 'error', duration: 3000 });
    }
  };

  const resetCart = () => {
    setCart([]);
    setCurrentSale(null);
    setSelectedTable(null);
    setOrderType('dine_in');
  };

  if (loading) {
    return <Center h="100vh"><Spinner size="xl" /></Center>;
  }

  return (
    <Flex h="calc(100vh - 60px)" overflow="hidden">
      {/* Left: Menu */}
      <Box flex="3" p={4} overflowY="auto" bg={bg}>
        <HStack mb={4} spacing={4}>
          <Input
            placeholder={t('Search menu...')}
            leftElement={<SearchIcon ml={2} />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            size="lg"
          />
          <Select
            value={orderType}
            onChange={e => setOrderType(e.target.value)}
            size="lg"
            w="200px"
          >
            {ORDER_TYPES.map(ot => (
              <option key={ot.value} value={ot.value}>{t(ot.label)}</option>
            ))}
          </Select>
        </HStack>

        <HStack spacing={2} mb={4} overflowX="auto" pb={2}>
          <Button
            size="sm"
            variant={selectedCategory === null ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => setSelectedCategory(null)}
          >
            {t('All')}
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </HStack>

        <Grid templateColumns="repeat(auto-fill, minmax(160px, 1fr))" gap={3}>
          {filteredItems.map(item => (
            <GridItem key={item.id}>
              <Card
                cursor="pointer"
                onClick={() => addToCart(item)}
                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                size="sm"
              >
                <CardBody p={3} textAlign="center">
                  <Text fontWeight="bold" fontSize="sm" mb={1} noOfLines={2}>{item.name}</Text>
                  <Text color="blue.500" fontWeight="semibold" fontSize="md">
                    ${parseFloat(item.price || 0).toFixed(2)}
                  </Text>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
        {filteredItems.length === 0 && (
          <Center py={10}>
            <Text color="gray.500">{t('No menu items found')}</Text>
          </Center>
        )}
      </Box>

      {/* Right: Cart */}
      <Box w="380px" bg={cartBg} p={4} display="flex" flexDirection="column" borderLeft="1px" borderColor="gray.200">
        <HStack mb={3} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            <ShoppingBagIcon mr={2} />{t('Order')} ({cartItemCount})
          </Text>
          <HStack spacing={1}>
            <Tooltip label={t('Hold')}><IconButton size="sm" icon={<TimeIcon />} onClick={holdOrder} /></Tooltip>
            {heldOrders.length > 0 && (
              <Tooltip label={`${t('Recall')} (${heldOrders.length})`}>
                <IconButton size="sm" icon={<RepeatIcon />} onClick={onRecallOpen} colorScheme="orange" />
              </Tooltip>
            )}
            <Tooltip label={t('Cancel')}><IconButton size="sm" icon={<CloseIcon />} onClick={onCancelOpen} colorScheme="red" /></Tooltip>
          </HStack>
        </HStack>

        {orderType === 'dine_in' && (
          <Select
            mb={3}
            placeholder={t('Select table...')}
            value={selectedTable || ''}
            onChange={e => setSelectedTable(e.target.value ? parseInt(e.target.value) : null)}
            size="sm"
          >
            {tables.filter(t => t.status === 'available').map(table => (
              <option key={table.id} value={table.id}>{table.name}</option>
            ))}
          </Select>
        )}

        <Box flex="1" overflowY="auto" mb={3}>
          {cart.length === 0 ? (
            <Center h="100%">
              <Text color="gray.400">{t('Cart is empty')}</Text>
            </Center>
          ) : (
            <VStack spacing={2} align="stretch">
              {cart.map(item => (
                <Box key={item.menu_item_id} bg="white" p={2} borderRadius="md" shadow="sm">
                  <HStack justify="space-between">
                    <Box flex="1">
                      <Text fontSize="sm" fontWeight="bold" noOfLines={1}>{item.item_name}</Text>
                      <Text fontSize="xs" color="gray.500">${item.unit_price.toFixed(2)} {t("each")} </Text>
                    </Box>
                    <HStack spacing={1}>
                      <IconButton size="xs" icon={<MinusIcon />} onClick={() => updateCartQty(item.menu_item_id, -1)} />
                      <Text fontSize="sm" fontWeight="bold" minW="20px" textAlign="center">{item.quantity}</Text>
                      <IconButton size="xs" icon={<AddIcon />} onClick={() => updateCartQty(item.menu_item_id, 1)} />
                      <IconButton size="xs" icon={<DeleteIcon />} colorScheme="red" onClick={() => removeFromCart(item.menu_item_id)} />
                    </HStack>
                  </HStack>
                  <Text textAlign="right" fontSize="sm" fontWeight="bold" color="blue.600">
                    ${item.total.toFixed(2)}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        <Divider mb={3} />

        <VStack spacing={2} align="stretch">
          <HStack justify="space-between">
            <Text fontWeight="bold">{t('Total')}</Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.600">${cartTotal.toFixed(2)}</Text>
          </HStack>
          <Button
            colorScheme="green"
            size="lg"
            onClick={submitOrder}
            isLoading={submitting}
            isDisabled={cart.length === 0}
          >
            {t('Place Order')}
          </Button>
        </VStack>
      </Box>

      {/* Payment Modal */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('Process Payment')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text mb={1} fontWeight="bold">{t('Total Amount')}</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">${currentSale?.total?.toFixed(2) || '0.00'}</Text>
              </Box>
              <Box>
                <Text mb={1}>{t('Payment Method')}</Text>
                <Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  {PAYMENT_METHODS.map(pm => (
                    <option key={pm.value} value={pm.value}>{t(pm.label)}</option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text mb={1}>{t('Amount')}</Text>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  fontSize="xl"
                  fontWeight="bold"
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPaymentClose}>{t('Cancel')}</Button>
            <Button colorScheme="green" onClick={processPayment} isLoading={submitting}>
              {t('Confirm Payment')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Recall Modal */}
      <Modal isOpen={isRecallOpen} onClose={onRecallClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('Held Orders')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {heldOrders.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>{t('No held orders')}</Text>
            ) : (
              <VStack spacing={2} align="stretch">
                {heldOrders.map(held => (
                  <Box key={held.id} p={3} border="1px" borderColor="gray.200" borderRadius="md" cursor="pointer"
                    _hover={{ bg: 'gray.50' }} onClick={() => recallOrder(held)}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">#{held.invoice_number || '{t("new_order")}'}</Text>
                      <Badge colorScheme="orange">{held.items?.length || held.cart?.length || 0} {t('items')}</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">${(held.total || held.cart?.reduce((s, c) => s + c.total, 0) || 0).toFixed(2)}</Text>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Cancel Confirmation */}
      <AlertDialog isOpen={isCancelOpen} leastDestructiveRef={cancelRef} onClose={onCancelClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>{t('Cancel Order?')}</AlertDialogHeader>
            <AlertDialogBody>{t('Are you sure you want to cancel this order?')}</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCancelClose}>{t('Keep')}</Button>
              <Button colorScheme="red" onClick={cancelSale} ml={3}>{t('Cancel Order')}</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
}
