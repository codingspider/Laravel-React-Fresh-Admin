import React from 'react';
import {
  Box, Flex, Text, Button, HStack, VStack, Input, InputGroup, InputRightElement,
  IconButton, Badge, Tooltip, Menu, MenuButton, MenuList, MenuItem,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SearchIcon, ChevronDownIcon, CheckIcon } from '@chakra-ui/icons';
import {
  ShoppingBag, User, Printer, Calculator, Maximize2, Minimize2,
  Tag as TagIcon, Gift, Store, Building2, Utensils, Coffee, Bike,
} from 'lucide-react';
import useThemeColors from '../../../hooks/useThemeColors';

export default function TopBar({
  customers, selectedCustomer, setSelectedCustomer, searchQuery, setSearchQuery,
  orderType, setOrderType, cart, cartItemCount, isFullscreen, toggleFullscreen,
  setMobileCartOpen, orderTypes, enableCustomer,
  branches, selectedBranchId, setSelectedBranchId, canSelectBranch, selectedBranch,
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();

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
          <Menu>
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
            <MenuList maxH="300px" overflowY="auto">
              <MenuItem onClick={() => setSelectedCustomer(null)}>
                <HStack>
                  <User size={14} />
                  <Text>{t('Walk-in Customer')}</Text>
                  {!selectedCustomer && <CheckIcon ml={2} boxSize={3} color="green.500" />}
                </HStack>
              </MenuItem>
              {customers.map(c => (
                <MenuItem key={c.id} onClick={() => setSelectedCustomer(c)}>
                  <HStack>
                    <User size={14} />
                    <VStack spacing={0} align="start">
                      <Text fontSize="sm">{c.name || c.first_name || `Customer #${c.id}`}</Text>
                      {c.phone && <Text fontSize="xs" color={colors.textMuted}>{c.phone}</Text>}
                    </VStack>
                    {selectedCustomer?.id === c.id && <CheckIcon ml="auto" boxSize={3} color="green.500" />}
                  </HStack>
                </MenuItem>
              ))}
              {customers.length === 0 && (
                <MenuItem isDisabled>
                  <Text color={colors.textMuted}>{t('No customers found')}</Text>
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        )}

        <InputGroup size="sm" flex="1" minW={{ base: '100%', md: '200px' }}>
          <Input
            placeholder={t('Scan / Search product by code or name')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
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
              _hover={{ bg: colors.topbarCouponHover }} onClick={() => { }} />
          </Tooltip>
          <Tooltip label={t('Calculator')} placement="top">
            <IconButton size="sm" icon={<Calculator size={16} />} borderRadius="lg"
              bg={colors.topbarCalc} color="white"
              _hover={{ bg: colors.topbarCalcHover }} onClick={() => { }} />
          </Tooltip>
          <Tooltip label={isFullscreen ? t('Exit Fullscreen') : t('Fullscreen')} placement="top">
            <IconButton size="sm" icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              borderRadius="lg" bg={colors.topbarFullscreen} color="white"
              _hover={{ bg: colors.topbarFullscreenHover }} onClick={toggleFullscreen} />
          </Tooltip>
          <Tooltip label={t('Print')} placement="top">
            <IconButton size="sm" icon={<Printer size={16} />} borderRadius="lg"
              bg={colors.topbarPrint} color="white"
              _hover={{ bg: colors.topbarPrintHover }} onClick={() => window.print()} />
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
  );
}
