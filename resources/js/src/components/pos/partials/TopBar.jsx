import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Button, HStack, VStack, Input, InputGroup, InputRightElement,
  IconButton, Badge, Tooltip, Menu, MenuButton, MenuList, MenuItem,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  SimpleGrid, Table, Thead, Tbody, Tr, Th, Td, Alert, AlertIcon, Center, Spinner,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SearchIcon, ChevronDownIcon, CheckIcon } from '@chakra-ui/icons';
import {
  ShoppingBag, User, Printer, Calculator, Maximize2, Minimize2,
  Tag as TagIcon, Gift, Store, Building2, Utensils, Coffee, Bike, Tag as TagLucide,
  Minus, Plus, X, Slash, RefreshCw, ArrowLeft, Percent,
} from 'lucide-react';
import useThemeColors from '../../../hooks/useThemeColors';
import api from '../../../axios';
import { cacheEntity, getCachedEntity, TABLES } from '../../../services/offlineApi';
import { POS_COUPONS } from '../../../routes/apiRoutes';
import InvoiceSearchModal from './InvoiceSearchModal';

export default function TopBar({
  customers, selectedCustomer, setSelectedCustomer, searchQuery, setSearchQuery,
  orderType, setOrderType, cart, cartItemCount, isFullscreen, toggleFullscreen,
  setMobileCartOpen, orderTypes, enableCustomer,
  branches, selectedBranchId, setSelectedBranchId, canSelectBranch, selectedBranch,
  couponCode, setCouponCode,
  onBarcodeScan,
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  // Coupons modal
  const [couponsOpen, setCouponsOpen] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Customer search
  const [customerSearchResults, setCustomerSearchResults] = useState(customers || []);
  const [customerSearch, setCustomerSearch] = useState('');

  // Update search results when customers change
  useEffect(() => {
    if (!customerSearch) {
      setCustomerSearchResults(customers || []);
    }
  }, [customers, customerSearch]);

  const handleCustomerSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setCustomerSearch(searchTerm);
    if (!searchTerm) {
      setCustomerSearchResults(customers || []);
    } else {
      const filtered = (customers || []).filter(c =>
        (c.name?.toLowerCase() || '').includes(searchTerm) ||
        (c.phone?.toLowerCase() || '').includes(searchTerm) ||
        (c.email?.toLowerCase() || '').includes(searchTerm)
      );
      setCustomerSearchResults(filtered);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setCustomerSearchResults(customers || []);
  };

  // Calculator modal
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcOperator, setCalcOperator] = useState(null);
  const [calcPrevValue, setCalcPrevValue] = useState(null);
  const [calcWaitingForOperand, setCalcWaitingForOperand] = useState(false);

  // Invoice search & print
  const [invoiceSearchOpen, setInvoiceSearchOpen] = useState(false);

  // Fetch coupons when modal opens
  const fetchCoupons = async () => {
    setCouponsLoading(true);
    setCouponError(null);
    try {
      const res = await api.get(POS_COUPONS, { params: { per_page: 100 } });
      const data = res.data?.data?.data || res.data?.data || [];
      const validCoupons = data.filter(c => c.is_valid);
      setCoupons(validCoupons);
      await cacheEntity(TABLES.COUPONS, validCoupons);
    } catch (err) {
      const cached = await getCachedEntity(TABLES.COUPONS);
      if (cached.length > 0) {
        setCoupons(cached);
        setCouponError(null);
      } else {
        setCouponError(t('Failed to load coupons'));
      }
    } finally {
      setCouponsLoading(false);
    }
  };

  useEffect(() => {
    if (couponsOpen) fetchCoupons();
  }, [couponsOpen]);

  // Calculator functions
  const calcClear = () => {
    setCalcDisplay('0');
    setCalcOperator(null);
    setCalcPrevValue(null);
    setCalcWaitingForOperand(false);
  };

  const calcInputDigit = (digit) => {
    if (calcWaitingForOperand) {
      setCalcDisplay(digit === '.' ? '0.' : digit);
      setCalcWaitingForOperand(false);
    } else {
      setCalcDisplay(prev => prev === '0' && digit !== '.' ? digit : prev + digit);
    }
  };

  const calcInputDecimal = () => {
    if (calcWaitingForOperand) {
      setCalcDisplay('0.');
      setCalcWaitingForOperand(false);
    } else if (!calcDisplay.includes('.')) {
      setCalcDisplay(prev => prev + '.');
    }
  };

  const calcHandleOperator = (nextOperator) => {
    const inputValue = parseFloat(calcDisplay);
    if (calcPrevValue === null) {
      setCalcPrevValue(inputValue);
    } else if (calcOperator) {
      const result = calcPerformCalculation(calcPrevValue, inputValue, calcOperator);
      setCalcDisplay(String(result));
      setCalcPrevValue(result);
    }
    setCalcWaitingForOperand(true);
    setCalcOperator(nextOperator);
  };

  const calcPerformCalculation = (prev, current, operator) => {
    switch (operator) {
      case '+': return prev + current;
      case '-': return prev - current;
      case '*': return prev * current;
      case '/': return current !== 0 ? prev / current : 0;
      case '%': return prev % current;
      default: return current;
    }
  };

  const calcEquals = () => {
    if (calcOperator && calcPrevValue !== null) {
      const inputValue = parseFloat(calcDisplay);
      const result = calcPerformCalculation(calcPrevValue, inputValue, calcOperator);
      setCalcDisplay(String(result));
      setCalcPrevValue(null);
      setCalcOperator(null);
      setCalcWaitingForOperand(true);
    }
  };

  const calcPercent = () => {
    const value = parseFloat(calcDisplay);
    setCalcDisplay(String(value / 100));
  };

  const calcToggleSign = () => {
    const value = parseFloat(calcDisplay);
    setCalcDisplay(String(-value));
  };

  const calcBackspace = () => {
    setCalcDisplay(prev => prev.length === 1 ? '0' : prev.slice(0, -1));
  };

  const getCustomerName = (c) => {
    if (!c) return t('Walk-in Customer');
    return c.name || c.first_name || c.phone || t('Customer');
  };

  const orderTypeIcons = {
    dine_in: Utensils,
    takeaway: Coffee,
    delivery: Bike,
  };

  const getOrderTypeIcon = (ot) => {
    if (typeof ot.icon === 'string' && orderTypeIcons[ot.icon]) {
      return orderTypeIcons[ot.icon];
    }
    return orderTypeIcons[ot.value] || Store;
  };

  return (
    <Box px={4} py={2} bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderDefault}>
      <Flex gap={3} align="center" wrap={{ base: 'wrap', md: 'nowrap' }}>
        {branches.length > 0 && (
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              variant="outline"
              rightIcon={canSelectBranch ? <ChevronDownIcon /> : undefined}
              leftIcon={<Building2 size={14} />}
              borderRadius="lg"
              borderColor={colors.borderInput}
              fontWeight="600"
              isDisabled={!canSelectBranch}
              minW={{ base: '100%', sm: '150px' }}
              justifyContent="space-between"
            >
              {selectedBranch?.name || t('Select Branch')}
            </MenuButton>
            <MenuList maxH="300px" overflowY="auto">
              {branches.map(b => (
                <MenuItem key={b.id} onClick={() => setSelectedBranchId(b.id)}>
                  <HStack>
                    <Building2 size={14} />
                    <Text fontSize="sm">{b.name}</Text>
                    {selectedBranchId === b.id && <CheckIcon ml="auto" boxSize={3} color="green.500" />}
                  </HStack>
                </MenuItem>
              ))}
              {branches.length === 0 && (
                <MenuItem isDisabled>
                  <Text color={colors.textMuted}>{t('No branches found')}</Text>
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        )}

        {enableCustomer && (
          <Menu closeOnSelect={false}>
            <MenuButton
              as={Button}
              size="sm"
              variant="outline"
              rightIcon={<ChevronDownIcon />}
              leftIcon={<User size={14} />}
              borderRadius="lg"
              borderColor={colors.borderInput}
              fontWeight="600"
              minW={{ base: '100%', sm: '160px' }}
              justifyContent="space-between"
            >
              {getCustomerName(selectedCustomer)}
            </MenuButton>
            <MenuList p={2} minW="280px">
              <Input
                size="sm"
                placeholder={t('Search customer...')}
                mb={2}
                autoFocus
                value={customerSearch}
                onClick={(e) => e.stopPropagation()}
                onChange={handleCustomerSearch}
                onKeyDown={(e) => e.stopPropagation()}
              />
              <Box maxH="250px" overflowY="auto">
                <MenuItem onClick={() => handleCustomerSelect(null)}>
                  <HStack>
                    <User size={14} />
                    <Text>{t('Walk-in Customer')}</Text>
                    {!selectedCustomer && <CheckIcon ml={2} boxSize={3} color="green.500" />}
                  </HStack>
                </MenuItem>
                {customerSearch && customerSearchResults.length === 0 ? (
                  <MenuItem isDisabled>
                    <HStack spacing={2}>
                      <User size={14} />
                      <Text color={colors.textMuted}>{t('No customers found')}</Text>
                    </HStack>
                  </MenuItem>
                ) : (
                  (customerSearchResults.length > 0 ? customerSearchResults : (customers || [])).slice(0, 50).map(c => (
                    <MenuItem key={c.id} onClick={() => handleCustomerSelect(c)}>
                      <HStack>
                        <User size={14} />
                        <VStack spacing={0} align="start">
                          <Text fontSize="sm">{c.name || c.first_name || `Customer #${c.id}`}</Text>
                          {c.phone && <Text fontSize="xs" color={colors.textMuted}>{c.phone}</Text>}
                        </VStack>
                        {selectedCustomer?.id === c.id && <CheckIcon ml="auto" boxSize={3} color="green.500" />}
                      </HStack>
                    </MenuItem>
                  ))
                )}
                {!customerSearch && (customers || []).length === 0 && (
                  <MenuItem isDisabled>
                    <Text color={colors.textMuted}>{t('No customers found')}</Text>
                  </MenuItem>
                )}
              </Box>
            </MenuList>
          </Menu>
        )}

        <InputGroup size="sm" flex="1" minW={{ base: '100%', md: '200px' }}>
          <Input
            placeholder={t('Scan / Search product by code or name')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                onBarcodeScan?.(searchQuery.trim());
                setSearchQuery('');
              }
            }}
            borderRadius="lg"
            bg={colors.bgInput}
            border="1px solid"
            borderColor={colors.borderInput}
            _focus={{ borderColor: 'brand.400', boxShadow: 'outline' }}
          />
          <InputRightElement>
            <SearchIcon color={colors.textMuted} boxSize={4} />
          </InputRightElement>
        </InputGroup>

        <HStack spacing={1} flexShrink={0}>
          <Tooltip label={t('Order Type')} placement="top">
            <Menu>
              <MenuButton as={IconButton} size="sm" icon={<Store size={16} />} borderRadius="lg"
                bg={colors.topbarOrderType} color="white"
                _hover={{ bg: colors.topbarOrderTypeHover }} />
              <MenuList>
                {(orderTypes || []).map(ot => {
                  const Icon = getOrderTypeIcon(ot);
                  return (
                    <MenuItem key={ot.value} onClick={() => setOrderType(ot.value)}>
                      <HStack>
                        <Icon size={14} />
                        <Text>{t(ot.label)}</Text>
                        {orderType === ot.value && <CheckIcon ml={2} boxSize={3} color="green.500" />}
                      </HStack>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Menu>
          </Tooltip>

          <Tooltip label={t('Coupons')} placement="top">
            <IconButton size="sm" icon={<Gift size={16} />} borderRadius="lg"
              bg={colors.topbarCoupon} color="white"
              _hover={{ bg: colors.topbarCouponHover }} onClick={() => setCouponsOpen(true)} />
          </Tooltip>
          <Tooltip label={t('Calculator')} placement="top">
            <IconButton size="sm" icon={<Calculator size={16} />} borderRadius="lg"
              bg={colors.topbarCalc} color="white"
              _hover={{ bg: colors.topbarCalcHover }} onClick={() => setCalcOpen(true)} />
          </Tooltip>
          <Tooltip label={isFullscreen ? t('Exit Fullscreen') : t('Fullscreen')} placement="top">
            <IconButton size="sm" icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              borderRadius="lg" bg={colors.topbarFullscreen} color="white"
              _hover={{ bg: colors.topbarFullscreenHover }} onClick={toggleFullscreen} />
          </Tooltip>
          <Tooltip label={t('Print Invoice / KOT')} placement="top">
            <IconButton size="sm" icon={<Printer size={16} />} borderRadius="lg"
              bg={colors.topbarPrint} color="white"
              _hover={{ bg: colors.topbarPrintHover }} onClick={() => setInvoiceSearchOpen(true)} />
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

      {/* Coupons Modal */}
      <Modal isOpen={couponsOpen} onClose={() => setCouponsOpen(false)} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('Active Coupons')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {couponsLoading && (
              <Center py={8}><Spinner size="lg" color="brand.500" /></Center>
            )}
            {couponError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {couponError}
              </Alert>
            )}
            {!couponsLoading && !couponError && coupons.length === 0 && (
              <Center py={8}>
                <Text color={colors.textMuted}>{t('No active coupons found')}</Text>
              </Center>
            )}
            {!couponsLoading && coupons.length > 0 && (
              <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="left">{t('Code')}</Th>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="left">{t('Type')}</Th>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="right">{t('Value')}</Th>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="right">{t('Min Order')}</Th>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="right">{t('Max Discount')}</Th>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="center">{t('Valid Until')}</Th>
                      <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="center">{t('Action')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {coupons.map(c => (
                      <Tr key={c.id}>
                        <Td fontSize="sm" fontWeight="600" fontFamily="mono">{c.code}</Td>
                        <Td fontSize="sm" textTransform="capitalize">{c.type}</Td>
                        <Td fontSize="sm" textAlign="right">
                          {c.type === 'percent' ? `${c.value}%` : formatAmount(c.value)}
                        </Td>
                        <Td fontSize="sm" textAlign="right">{formatAmount(c.min_order_amount || 0)}</Td>
                        <Td fontSize="sm" textAlign="right">
                          {c.max_discount_amount ? formatAmount(c.max_discount_amount) : t('No limit')}
                        </Td>
                        <Td fontSize="sm" textAlign="center" color={colors.textSecondary}>
                          {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : t('No expiry')}
                        </Td>
                        <Td fontSize="sm" textAlign="center">
                          <Button
                            size="sm"
                            colorScheme="brand"
                            onClick={() => {
                              setCouponCode(c.code);
                              setCouponsOpen(false);
                            }}
                          >
                            {t('Apply')}
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setCouponsOpen(false)}>{t('Close')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Calculator Modal */}
      <Modal isOpen={calcOpen} onClose={() => { calcClear(); setCalcOpen(false); }} size="sm" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('Calculator')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <Box
              bg={colors.bgInput}
              borderRadius="lg"
              p={4}
              border="1px solid"
              borderColor={colors.borderInput}
              style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 700, textAlign: 'right', minHeight: '60px' }}
            >
              {calcDisplay}
            </Box>
            <VStack spacing={2} mt={4}>
              <HStack spacing={2}>
                <Button size="lg" variant="outline" borderRadius="lg" onClick={calcClear} flex="1">
                  <RefreshCw size={18} />
                </Button>
                <Button size="lg" variant="outline" borderRadius="lg" onClick={calcBackspace} flex="1">
                  <ArrowLeft size={18} />
                </Button>
                <Button size="lg" variant="outline" borderRadius="lg" onClick={() => calcHandleOperator('%')} flex="1">
                  <Percent size={18} />
                </Button>
                <Button size="lg" variant="outline" borderRadius="lg" onClick={() => calcHandleOperator('/')} flex="1" bg="brand.100" color="brand.600" _hover={{ bg: 'brand.200' }}>
                  <Slash size={18} />
                </Button>
              </HStack>
              <HStack spacing={2}>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={() => calcInputDigit('7')} flex="1" fontSize="lg">7</Button>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={() => calcInputDigit('8')} flex="1" fontSize="lg">8</Button>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={() => calcInputDigit('9')} flex="1" fontSize="lg">9</Button>
                <Button size="lg" variant="outline" borderRadius="lg" onClick={() => calcHandleOperator('*')} flex="1" bg="brand.100" color="brand.600" _hover={{ bg: 'brand.200' }}>
                  <X size={18} />
                </Button>
              </HStack>
              <HStack spacing={2}>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={() => calcInputDigit('4')} flex="1" fontSize="lg">4</Button>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={() => calcInputDigit('5')} flex="1" fontSize="lg">5</Button>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={() => calcInputDigit('6')} flex="1" fontSize="lg">6</Button>
                <Button size="lg" variant="outline" borderRadius="lg" onClick={() => calcHandleOperator('-')} flex="1" bg="brand.100" color="brand.600" _hover={{ bg: 'brand.200' }}>
                  <Minus size={18} />
                </Button>
              </HStack>
              <HStack spacing={2}>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={() => calcInputDigit('1')} flex="1" fontSize="lg">1</Button>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={() => calcInputDigit('2')} flex="1" fontSize="lg">2</Button>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={() => calcInputDigit('3')} flex="1" fontSize="lg">3</Button>
                <Button size="lg" variant="outline" borderRadius="lg" onClick={() => calcHandleOperator('+')} flex="1" bg="brand.100" color="brand.600" _hover={{ bg: 'brand.200' }}>
                  <Plus size={18} />
                </Button>
              </HStack>
              <HStack spacing={2}>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={calcToggleSign} flex="1" fontSize="lg">±</Button>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={() => calcInputDigit('0')} flex="1" fontSize="lg">0</Button>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={calcInputDecimal} flex="1" fontSize="lg">.</Button>
                <Button size="lg" variant="solid" borderRadius="lg" onClick={calcEquals} flex="1" fontSize="lg" bg="brand.500" color="white" _hover={{ bg: 'brand.600' }}>
                  =
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <InvoiceSearchModal
        isOpen={invoiceSearchOpen}
        onClose={() => setInvoiceSearchOpen(false)}
      />
    </Box>
  );
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
