import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, ChakraProvider, Flex, Text, Button, IconButton, Badge, VStack,
  HStack, Heading, Image, Spinner, Input, Textarea, useDisclosure,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, DrawerFooter, ScaleFade, Fade, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, useToast, Portal, Divider, SimpleGrid,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { AddIcon, MinusIcon, DeleteIcon, CheckCircleIcon, StarIcon } from '@chakra-ui/icons';
import theme from '../../theme';

const API_BASE = '/api/guest';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(13, 148, 136, 0); }
`;

const statusSteps = ['pending', 'confirmed', 'preparing', 'ready', 'served'];

function GuestHeader({ table, restaurant }) {
  return (
    <Box bg="teal.600" color="white" px={4} py={4} position="sticky" top={0} zIndex={10}>
      <Flex justify="space-between" align="center" maxW="600px" mx="auto">
        <HStack spacing={3}>
          {restaurant?.logo && (
            <Image src={restaurant.logo} boxSize="36px" borderRadius="full" fallback={<Box boxSize="36px" borderRadius="full" bg="teal.500" />} />
          )}
          <Box>
            <Heading size="sm" fontWeight="bold">{restaurant?.name || 'Restaurant'}</Heading>
            <Text fontSize="xs" opacity={0.8}>{table ? `Table ${table}` : ''}</Text>
          </Box>
        </HStack>
        {table && (
          <Badge bg="whiteAlpha.200" color="white" px={3} py={1} borderRadius="full" fontSize="xs">
            {table}
          </Badge>
        )}
      </Flex>
    </Box>
  );
}

function CategoryTabs({ categories, active, onSelect }) {
  const scrollRef = useRef(null);
  return (
    <Box ref={scrollRef} overflowX="auto" whiteSpace="nowrap" px={4} py={3} bg="white" _dark={{ bg: 'gray.800' }} borderBottom="1px solid" borderColor="gray.100" _dark={{ borderColor: 'gray.700' }} position="sticky" top="60px" zIndex={9}>
      <HStack spacing={2} maxW="600px" mx="auto">
        <Button
          size="xs"
          variant={active === null ? 'solid' : 'outline'}
          colorScheme="teal"
          borderRadius="full"
          onClick={() => onSelect(null)}
          flexShrink={0}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            size="xs"
            variant={active === cat.id ? 'solid' : 'outline'}
            colorScheme="teal"
            borderRadius="full"
            onClick={() => onSelect(cat.id)}
            flexShrink={0}
          >
            {cat.name}
          </Button>
        ))}
      </HStack>
    </Box>
  );
}

function ModifierModal({ isOpen, onClose, item, currencySymbol, onAddToCart }) {
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setSelectedModifiers([]);
      setQty(1);
    }
  }, [isOpen]);

  if (!item) return null;

  const hasModifiers = item.modifier_groups && item.modifier_groups.length > 0;
  const modifiersTotal = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
  const itemPrice = item.price + modifiersTotal;
  const total = itemPrice * qty;

  const toggleModifier = (mod, group) => {
    setSelectedModifiers((prev) => {
      const exists = prev.find((m) => m.id === mod.id);
      if (exists) return prev.filter((m) => m.id !== mod.id);

      if (group.max_selections === 1) {
        return [...prev.filter((m) => !group.modifiers.find((gm) => gm.id === m.id)), mod];
      }
      return [...prev, mod];
    });
  };

  const handleAdd = () => {
    onAddToCart({
      ...item,
      quantity: qty,
      modifiers: selectedModifiers,
      unit_price: item.price,
      total,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg="white" _dark={{ bg: 'gray.800' }} borderRadius="xl" maxH="85vh">
        <ModalHeader borderBottom="1px solid" borderColor="gray.100" _dark={{ borderColor: 'gray.700' }}>
          <Heading size="md" color="gray.800" _dark={{ color: 'white' }}>{item.name}</Heading>
          <Text fontSize="sm" color="teal.600" fontWeight="bold">{currencySymbol}{item.price.toFixed(2)}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" p={4}>
          {item.image && (
            <Image src={item.image} w="100%" h="160px" objectFit="cover" borderRadius="lg" mb={4} fallback={<Box h="160px" bg="gray.100" _dark={{ bg: 'gray.700' }} borderRadius="lg" />} />
          )}
          {item.description && (
            <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }} mb={4}>{item.description}</Text>
          )}
          {hasModifiers && item.modifier_groups.map((mg) => (
            <Box key={mg.id} mb={4}>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.200' }}>{mg.name}</Text>
                <HStack spacing={2}>
                  {mg.is_required && <Badge colorScheme="red" fontSize="10px">Required</Badge>}
                  {mg.max_selections > 1 && (
                    <Badge colorScheme="blue" fontSize="10px">Up to {mg.max_selections}</Badge>
                  )}
                </HStack>
              </Flex>
              <VStack spacing={2} align="stretch">
                {mg.modifiers.map((mod) => {
                  const isSelected = selectedModifiers.find((m) => m.id === mod.id);
                  return (
                    <Flex
                      key={mod.id}
                      p={3}
                      bg={isSelected ? 'teal.50' : 'gray.50'}
                      _dark={{ bg: isSelected ? 'teal.900' : 'gray.700' }}
                      borderRadius="lg"
                      cursor="pointer"
                      onClick={() => toggleModifier(mod, mg)}
                      border="2px solid"
                      borderColor={isSelected ? 'teal.400' : 'transparent'}
                      _dark={{ borderColor: isSelected ? 'teal.500' : 'transparent' }}
                      align="center"
                      transition="all 0.15s"
                      _hover={{ borderColor: isSelected ? 'teal.400' : 'gray.300' }}
                    >
                      <Box
                        w="20px"
                        h="20px"
                        borderRadius={mg.max_selections === 1 ? 'full' : 'md'}
                        border="2px solid"
                        borderColor={isSelected ? 'teal.500' : 'gray.300'}
                        _dark={{ borderColor: isSelected ? 'teal.400' : 'gray.500' }}
                        bg={isSelected ? 'teal.500' : 'transparent'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mr={3}
                        flexShrink={0}
                      >
                        {isSelected && <CheckCircleIcon color="white" boxSize={3} />}
                      </Box>
                      <Text fontSize="sm" flex={1} color="gray.700" _dark={{ color: 'gray.200' }}>{mod.name}</Text>
                      {mod.price > 0 && (
                        <Badge colorScheme="teal" fontSize="11px" variant="subtle">+{currencySymbol}{mod.price.toFixed(2)}</Badge>
                      )}
                    </Flex>
                  );
                })}
              </VStack>
            </Box>
          ))}
          {!hasModifiers && (
            <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }} textAlign="center" py={4}>
              No customization options available
            </Text>
          )}
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="gray.100" _dark={{ borderColor: 'gray.700' }} p={4}>
          <Flex w="100%" gap={3} align="center">
            <HStack>
              <IconButton size="sm" icon={<MinusIcon />} onClick={() => setQty(Math.max(1, qty - 1))} isDisabled={qty <= 1} borderRadius="full" colorScheme="gray" variant="outline" />
              <Text fontSize="md" fontWeight="bold" minW="24px" textAlign="center">{qty}</Text>
              <IconButton size="sm" icon={<AddIcon />} onClick={() => setQty(qty + 1)} borderRadius="full" colorScheme="gray" variant="outline" />
            </HStack>
            <Button colorScheme="teal" flex={1} size="lg" borderRadius="xl" onClick={handleAdd} fontWeight="bold">
              Add • {currencySymbol}{total.toFixed(2)}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function MenuItemCard({ item, currencySymbol, onAddToCart, onOpenModifier }) {
  const hasModifiers = item.modifier_groups && item.modifier_groups.length > 0;

  const handleAdd = () => {
    if (hasModifiers) {
      onOpenModifier(item);
    } else {
      onAddToCart({
        ...item,
        quantity: 1,
        modifiers: [],
        unit_price: item.price,
        total: item.price,
      });
    }
  };

  return (
    <Box
      bg="white"
      _dark={{ bg: 'gray.800' }}
      borderRadius="xl"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.100"
      _dark={{ borderColor: 'gray.700' }}
      animation={`${slideUp} 0.4s ease-out`}
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      h="full"
      display="flex"
      flexDirection="column"
    >
      {item.image ? (
        <Image src={item.image} w="100%" h="120px" objectFit="cover" fallback={<Box h="120px" bg="gray.100" _dark={{ bg: 'gray.700' }} />} />
      ) : (
        <Box h="120px" bg="gray.50" _dark={{ bg: 'gray.700' }} display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
          <Text fontSize="3xl">🍽️</Text>
        </Box>
      )}
      <Box p={2} display="flex" flexDirection="column" flex={1}>
        <HStack justify="space-between" align="start" mb={1}>
          <Heading size="xs" fontWeight="600" color="gray.800" _dark={{ color: 'white' }} noOfLines={2} lineHeight="short">
            {item.name}
          </Heading>
          <HStack spacing={0.5} flexShrink={0}>
            {item.is_vegetarian && <Badge bg="green.100" color="green.700" fontSize="8px" borderRadius="full" px={1}>●</Badge>}
            {item.is_vegan && <Badge bg="green.100" color="green.700" fontSize="8px" borderRadius="full" px={1}>V</Badge>}
          </HStack>
        </HStack>
        {item.description && (
          <Text fontSize="10px" color="gray.500" _dark={{ color: 'gray.400' }} noOfLines={2} mb={2} lineHeight="short">
            {item.description}
          </Text>
        )}
        {item.preparation_time > 0 && (
          <Text fontSize="10px" color="gray.400" mb={2}>⏱ {item.preparation_time} min</Text>
        )}
        <Flex justify="space-between" align="center">
          <Text fontSize="md" fontWeight="bold" color="teal.600">
            {currencySymbol}{item.price.toFixed(2)}
          </Text>
          {hasModifiers && (
            <Badge colorScheme="purple" fontSize="9px" variant="subtle" borderRadius="full">
              Customizable
            </Badge>
          )}
        </Flex>
        <Button
          mt="auto"
          w="100%"
          size="xs"
          colorScheme="teal"
          borderRadius="lg"
          onClick={handleAdd}
          fontWeight="bold"
          fontSize="11px"
        >
          {hasModifiers ? 'Customize' : '+ Add'}
        </Button>
      </Box>
    </Box>
  );
}

function CartDrawer({ isOpen, onClose, cart, currencySymbol, onUpdateQty, onRemove, onPlaceOrder, table }) {
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="full">
      <DrawerOverlay />
      <DrawerContent borderTopRadius="2xl">
        <DrawerCloseButton />
        <DrawerHeader bg="teal.600" color="white" borderTopRadius="2xl">
          <HStack>
            <Text fontSize="lg">🛒</Text>
            <Text fontWeight="bold">Your Order</Text>
            <Badge bg="whiteAlpha.300" color="white" borderRadius="full">{cart.length} items</Badge>
          </HStack>
        </DrawerHeader>
        <DrawerBody p={4}>
          {cart.length === 0 ? (
            <Flex direction="column" align="center" justify="center" h="200px">
              <Text fontSize="4xl" mb={4}>🛒</Text>
              <Text color="gray.500" _dark={{ color: 'gray.400' }}>Your cart is empty</Text>
            </Flex>
          ) : (
            <VStack spacing={3} align="stretch" maxW="480px" mx="auto">
              {cart.map((item, idx) => (
                <Box key={idx} p={3} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="lg">
                  <Flex justify="space-between" align="start">
                    <Box flex={1}>
                      <Text fontWeight="semibold" fontSize="sm" color="gray.800" _dark={{ color: 'white' }}>{item.name}</Text>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>
                          {item.modifiers.map((m) => m.name).join(', ')}
                        </Text>
                      )}
                      <Text fontSize="sm" color="teal.600" fontWeight="bold" mt={1}>
                        {currencySymbol}{item.total.toFixed(2)}
                      </Text>
                    </Box>
                    <HStack>
                      <IconButton size="xs" icon={<MinusIcon />} onClick={() => onUpdateQty(idx, item.quantity - 1)} borderRadius="full" variant="outline" />
                      <Text fontSize="sm" fontWeight="bold" minW="20px" textAlign="center">{item.quantity}</Text>
                      <IconButton size="xs" icon={<AddIcon />} onClick={() => onUpdateQty(idx, item.quantity + 1)} borderRadius="full" variant="outline" />
                      <IconButton size="xs" icon={<DeleteIcon />} onClick={() => onRemove(idx)} borderRadius="full" variant="ghost" colorScheme="red" />
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </DrawerBody>
        <DrawerFooter borderTop="1px solid" borderColor="gray.100" _dark={{ borderColor: 'gray.700' }}>
          <Box w="100%" maxW="480px" mx="auto">
            <Flex justify="space-between" mb={2}>
              <Text fontWeight="bold" color="gray.800" _dark={{ color: 'white' }}>Subtotal</Text>
              <Text fontWeight="bold" color="teal.600" fontSize="lg">{currencySymbol}{subtotal.toFixed(2)}</Text>
            </Flex>
            {table && (
              <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }} mb={3}>
                Dine in • Table {table}
              </Text>
            )}
            <Button
              w="100%"
              colorScheme="teal"
              size="lg"
              borderRadius="xl"
              onClick={onPlaceOrder}
              isDisabled={cart.length === 0}
              fontWeight="bold"
              _hover={{ bg: 'teal.700' }}
            >
              Place Order • {currencySymbol}{subtotal.toFixed(2)}
            </Button>
          </Box>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function FloatingCartButton({ count, total, currencySymbol, onClick }) {
  if (count === 0) return null;
  return (
    <Box
      position="fixed"
      bottom={6}
      left="50%"
      transform="translateX(-50%)"
      zIndex={20}
    >
      <Button
        leftIcon={<StarIcon />}
        colorScheme="teal"
        size="lg"
        borderRadius="full"
        shadow="xl"
        onClick={onClick}
        animation={`${pulse} 2s infinite`}
        _hover={{ transform: 'scale(1.05)' }}
        transition="all 0.2s"
      >
        View Cart
        <Badge ml={2} bg="white" color="teal.600" borderRadius="full" px={2}>
          {count} • {currencySymbol}{total.toFixed(2)}
        </Badge>
      </Button>
    </Box>
  );
}

function OrderTracker({ invoice, currencySymbol }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/order/${invoice}`);
        const data = await res.json();
        if (data.status === 'success') {
          setOrder(data.data);
        }
      } catch (e) {}
      setLoading(false);
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [invoice]);

  if (loading) {
    return (
      <Flex justify="center" py={20}>
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  if (!order) {
    return (
      <Flex direction="column" align="center" py={20} px={4}>
        <Text fontSize="4xl" mb={4}>❌</Text>
        <Heading size="md" mb={2}>Order Not Found</Heading>
        <Text color="gray.500" _dark={{ color: 'gray.400' }}>Please check your invoice number.</Text>
      </Flex>
    );
  }

  const currentStep = statusSteps.indexOf(order.status);

  const isServed = order.status === 'served';

  return (
    <Box maxW="480px" mx="auto" p={4}>
      <ScaleFade initialScale={0.9} in={true}>
        <Box textAlign="center" mb={8}>
          <Box
            w="80px"
            h="80px"
            borderRadius="full"
            bg={isServed ? 'green.50' : 'teal.50'}
            _dark={{ bg: isServed ? 'green.900' : 'teal.900' }}
            mx="auto"
            mb={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
            animation={isServed ? 'none' : `${pulse} 2s infinite`}
          >
            <Text fontSize="4xl">{isServed ? '🎉' : '✅'}</Text>
          </Box>
          <Heading size="lg" color={isServed ? 'green.600' : 'teal.600'} mb={1}>
            {isServed ? 'Order Served!' : 'Order Placed!'}
          </Heading>
          <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>Invoice: {order.invoice_number}</Text>
          {order.table && (
            <Badge mt={2} colorScheme="teal" variant="subtle" borderRadius="full" px={3}>Table {order.table}</Badge>
          )}
          {order.order_type && (
            <Badge mt={2} ml={2} colorScheme="purple" variant="subtle" borderRadius="full" px={3} textTransform="capitalize">{order.order_type.replace('_', ' ')}</Badge>
          )}
        </Box>

        <Box mb={8}>
          {statusSteps.map((step, idx) => (
            <HStack key={step} mb={2} opacity={idx <= currentStep ? 1 : 0.4}>
              <Box
                w="32px"
                h="32px"
                borderRadius="full"
                bg={idx <= currentStep ? 'teal.500' : 'gray.200'}
                _dark={{ bg: idx <= currentStep ? 'teal.600' : 'gray.600' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                {idx < currentStep ? (
                  <CheckCircleIcon color="white" />
                ) : idx === currentStep && !isServed ? (
                  <Spinner size="sm" color="white" />
                ) : idx === currentStep && isServed ? (
                  <CheckCircleIcon color="white" />
                ) : (
                  <Text fontSize="xs" color="gray.400">{idx + 1}</Text>
                )}
              </Box>
              <Text fontSize="sm" fontWeight={idx === currentStep ? 'bold' : 'normal'} color="gray.700" _dark={{ color: 'gray.200' }} textTransform="capitalize">
                {step}
              </Text>
            </HStack>
          ))}
        </Box>

        <Divider mb={4} />

        <Heading size="sm" mb={3} color="gray.800" _dark={{ color: 'white' }}>Order Summary</Heading>
        {order.items.map((item, idx) => (
          <Box key={idx} mb={3} p={3} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="lg">
            <Flex justify="space-between" align="start">
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.800" _dark={{ color: 'white' }}>
                  {item.quantity}x {item.name}
                </Text>
                {item.modifiers && item.modifiers.length > 0 && (
                  <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }} mt={0.5}>
                    {item.modifiers.map((m) => `${m.name}${m.price > 0 ? ` (+${currencySymbol}${m.price.toFixed(2)})` : ''}`).join(', ')}
                  </Text>
                )}
                {item.notes && (
                  <Text fontSize="xs" color="gray.400" fontStyle="italic" mt={0.5}>Note: {item.notes}</Text>
                )}
                <Text fontSize="xs" color="gray.400" mt={0.5}>
                  {currencySymbol}{item.unit_price.toFixed(2)} each
                </Text>
              </Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.800" _dark={{ color: 'white' }}>
                {currencySymbol}{item.total.toFixed(2)}
              </Text>
            </Flex>
          </Box>
        ))}

        <Divider my={3} />

        <VStack spacing={1} align="stretch">
          <Flex justify="space-between">
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>Subtotal</Text>
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>{currencySymbol}{order.subtotal.toFixed(2)}</Text>
          </Flex>
          {order.tax_amount > 0 && (
            <Flex justify="space-between">
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>Tax ({order.tax_percent}%)</Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>{currencySymbol}{order.tax_amount.toFixed(2)}</Text>
            </Flex>
          )}
          <Flex justify="space-between" pt={2} borderTop="1px solid" borderColor="gray.200" _dark={{ borderColor: 'gray.600' }}>
            <Text fontWeight="bold" color="gray.800" _dark={{ color: 'white' }}>Total</Text>
            <Text fontWeight="bold" color="teal.600" fontSize="lg">{currencySymbol}{order.total.toFixed(2)}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>Payment</Text>
            <Badge colorScheme={order.payment_status === 'paid' ? 'green' : 'yellow'} fontSize="xs" textTransform="capitalize">
              {order.payment_status}
            </Badge>
          </Flex>
        </VStack>

        {order.notes && (
          <Box mt={4} p={3} bg="yellow.50" _dark={{ bg: 'yellow.900' }} borderRadius="lg">
            <Text fontSize="xs" fontWeight="bold" color="yellow.700" _dark={{ color: 'yellow.300' }} mb={1}>Order Notes</Text>
            <Text fontSize="sm" color="yellow.800" _dark={{ color: 'yellow.200' }}>{order.notes}</Text>
          </Box>
        )}
      </ScaleFade>
    </Box>
  );
}

export default function GuestOrderingApp() {
  const [tableData, setTableData] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [view, setView] = useState('menu');
  const [orderInvoice, setOrderInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modifierItem, setModifierItem] = useState(null);
  const { isOpen: isCartOpen, onOpen: onCartOpen, onClose: onCartClose } = useDisclosure();
  const { isOpen: isModOpen, onOpen: onModOpen, onClose: onModClose } = useDisclosure();
  const toast = useToast();

  const tableToken = new URLSearchParams(window.location.search).get('table');
  const currencySymbol = restaurant?.currency_symbol || '$';

  useEffect(() => {
    if (!tableToken) {
      setError('No table QR code detected. Please scan the QR code on your table.');
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const tableRes = await fetch(`${API_BASE}/table/${tableToken}`);
        const tableJson = await tableRes.json();

        if (tableJson.status !== 'success') {
          setError('Invalid or expired QR code. Please scan again.');
          setLoading(false);
          return;
        }

        setTableData(tableJson.data);
        setRestaurant(tableJson.data.restaurant);

        const menuRes = await fetch(`${API_BASE}/menu?restaurant_id=${tableJson.data.restaurant_id}&branch_id=${tableJson.data.branch_id || ''}`);
        const menuJson = await menuRes.json();

        if (menuJson.status === 'success') {
          setMenu(menuJson.data);
        }
      } catch (e) {
        setError('Failed to load menu. Please try again.');
      }
      setLoading(false);
    };

    init();
  }, [tableToken]);

  const filteredMenu = activeCategory
    ? menu.filter((cat) => cat.id === activeCategory)
    : menu;

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.findIndex(
        (c) => c.id === item.id && JSON.stringify(c.modifiers) === JSON.stringify(item.modifiers)
      );
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing].quantity += item.quantity;
        updated[existing].total = updated[existing].unit_price * updated[existing].quantity;
        if (item.modifiers && item.modifiers.length > 0) {
          const modTotal = item.modifiers.reduce((s, m) => s + m.price, 0);
          updated[existing].total += modTotal * updated[existing].quantity;
        }
        return updated;
      }
      return [...prev, { ...item, total: item.total }];
    });
    toast({
      title: 'Added to cart',
      status: 'success',
      duration: 1500,
      position: 'top',
      isClosable: true,
    });
  }, [toast]);

  const updateCartQty = useCallback((idx, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[idx].quantity = qty;
      const modTotal = (updated[idx].modifiers || []).reduce((s, m) => s + m.price, 0);
      updated[idx].total = (updated[idx].unit_price + modTotal) * qty;
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((idx) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const openModifierModal = (item) => {
    setModifierItem(item);
    onModOpen();
  };

  const placeOrder = async () => {
    if (cart.length === 0 || !tableData) return;

    try {
      const res = await fetch(`${API_BASE}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: tableData.restaurant_id,
          branch_id: tableData.branch_id,
          table_id: tableData.table_id,
          items: cart.map((item) => ({
            menu_item_id: item.id,
            item_name: item.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            modifiers: item.modifiers || [],
          })),
        }),
      });

      const data = await res.json();

      if (data.status === 'success') {
        setOrderInvoice(data.data.invoice_number);
        setCart([]);
        setView('track');
        onCartClose();
      } else {
        toast({ title: 'Error', description: data.message, status: 'error' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to place order. Please try again.', status: 'error' });
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  if (loading) {
    return (
      <ChakraProvider theme={theme}>
        <Flex minH="100vh" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.900' }}>
          <VStack>
            <Spinner size="xl" color="teal.500" />
            <Text mt={4} color="gray.500" _dark={{ color: 'gray.400' }}>Loading menu...</Text>
          </VStack>
        </Flex>
      </ChakraProvider>
    );
  }

  if (error) {
    return (
      <ChakraProvider theme={theme}>
        <Flex minH="100vh" align="center" justify="center" bg="gray.50" _dark={{ bg: 'gray.900' }} p={4}>
          <VStack maxW="400px" textAlign="center">
            <Text fontSize="5xl" mb={4}>📱</Text>
            <Heading size="md" mb={2} color="gray.800" _dark={{ color: 'white' }}>Welcome!</Heading>
            <Text color="gray.500" _dark={{ color: 'gray.400' }}>{error}</Text>
          </VStack>
        </Flex>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
        {view === 'track' ? (
          <>
            <GuestHeader table={tableData?.table_name} restaurant={restaurant} />
            <OrderTracker invoice={orderInvoice} currencySymbol={currencySymbol} />
          </>
        ) : (
          <>
            <GuestHeader table={tableData?.table_name} restaurant={restaurant} />
            <CategoryTabs categories={menu} active={activeCategory} onSelect={setActiveCategory} />

            <Box maxW="600px" mx="auto" p={4} pb={100}>
              {filteredMenu.map((cat) => (
                <Box key={cat.id} mb={6}>
                  <Heading size="sm" fontWeight="bold" color="gray.700" _dark={{ color: 'gray.200' }} mb={3} textTransform="uppercase" letterSpacing="wide">
                    {cat.name}
                  </Heading>
                  <SimpleGrid columns={2} spacing={3}>
                    {cat.items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        currencySymbol={currencySymbol}
                        onAddToCart={addToCart}
                        onOpenModifier={openModifierModal}
                      />
                    ))}
                  </SimpleGrid>
                </Box>
              ))}
              {filteredMenu.length === 0 && (
                <Flex justify="center" py={20}>
                  <Text color="gray.500" _dark={{ color: 'gray.400' }}>No items available</Text>
                </Flex>
              )}
            </Box>

            <FloatingCartButton count={cart.length} total={cartTotal} currencySymbol={currencySymbol} onClick={onCartOpen} />
            <CartDrawer
              isOpen={isCartOpen}
              onClose={onCartClose}
              cart={cart}
              currencySymbol={currencySymbol}
              onUpdateQty={updateCartQty}
              onRemove={removeFromCart}
              onPlaceOrder={placeOrder}
              table={tableData?.table_name}
            />
            <ModifierModal
              isOpen={isModOpen}
              onClose={onModClose}
              item={modifierItem}
              currencySymbol={currencySymbol}
              onAddToCart={addToCart}
            />
          </>
        )}
      </Box>
    </ChakraProvider>
  );
}
