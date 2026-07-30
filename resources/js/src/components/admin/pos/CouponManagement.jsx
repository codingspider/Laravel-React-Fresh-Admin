import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, VStack, HStack, Text, Button, Card, CardBody, Switch, Input, InputGroup,
  InputLeftElement, Badge, Heading, Divider, useToast, Spinner, Center, Flex,
  IconButton, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure,
  Select, Textarea, FormControl, FormLabel, NumberInput,
  NumberInputField, SimpleGrid,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { AddIcon, DeleteIcon, EditIcon, SettingsIcon } from '@chakra-ui/icons';
import { Save, Tag, Search } from 'lucide-react';
import axios from 'axios';
import { POS_COUPONS, POS_COUPON } from '../../../routes/apiRoutes';
import useThemeColors from '../../../hooks/useThemeColors';

const defaultForm = {
  code: '',
  type: 'fixed',
  value: '',
  min_order_amount: '',
  max_discount_amount: '',
  usage_limit: '',
  per_customer_limit: '',
  is_active: true,
  starts_at: '',
  expires_at: '',
};

export default function CouponManagement() {
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteModal = useDisclosure();
  const colors = useThemeColors();

  const pageBg = colors.bgPage;
  const panelBg = colors.bgCard;
  const panelBorder = colors.borderDefault;
  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const subtleBg = colors.bgSubtle;
  const inputBg = colors.bgInput;
  const inputBorder = colors.borderInput;

  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  const [search, setSearch] = useState('');

  const fetchCoupons = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const res = await axios.get(POS_COUPONS, { params });
      setCoupons(res.data.data?.data || []);
    } catch {
      toast({ title: t('Failed to load coupons'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [search, toast, t]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        value: parseFloat(form.value) || 0,
        min_order_amount: parseFloat(form.min_order_amount) || 0,
        max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        per_customer_limit: form.per_customer_limit ? parseInt(form.per_customer_limit) : null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
        restaurant_id: 1,
      };

      if (editingId) {
        await axios.put(POS_COUPON(editingId), payload);
        toast({ title: t('Coupon updated successfully'), status: 'success', duration: 2000, isClosable: true });
      } else {
        await axios.post(POS_COUPONS, payload);
        toast({ title: t('Coupon created successfully'), status: 'success', duration: 2000, isClosable: true });
      }
      onClose();
      setForm(defaultForm);
      setEditingId(null);
      fetchCoupons();
    } catch {
      toast({ title: editingId ? t('Failed to update coupon') : t('Failed to create coupon'), status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleDelete = async () => {
    if (!deletingCoupon) return;
    try {
      await axios.delete(POS_COUPON(deletingCoupon.id));
      toast({ title: t('Coupon deleted successfully'), status: 'success', duration: 2000, isClosable: true });
      setDeletingCoupon(null);
      deleteModal.onClose();
      fetchCoupons();
    } catch {
      toast({ title: t('Failed to delete coupon'), status: 'error', duration: 3000, isClosable: true });
    }
  };

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value?.toString() || '',
      min_order_amount: coupon.min_order_amount?.toString() || '',
      max_discount_amount: coupon.max_discount_amount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      per_customer_limit: coupon.per_customer_limit?.toString() || '',
      is_active: coupon.is_active,
      starts_at: coupon.starts_at ? coupon.starts_at.slice(0, 16) : '',
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 16) : '',
    });
    setEditingId(coupon.id);
    onOpen();
  };

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    onOpen();
  };

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <Center h="calc(100vh - 60px)" bg={pageBg}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="3px" />
          <Text color={textSecondary}>{t('Loading Coupons...')}</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <>
      <Card mb={5}>
        <CardBody>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack>
              <Box p={2} bg="brand.500" color="white" borderRadius="lg">
                <Tag size={20} />
              </Box>
              <VStack spacing={0} align="start">
                <Heading size="lg" color={textPrimary}>{t('Coupon Management')}</Heading>
                <Text fontSize="sm" color={textSecondary}>{t('Create and manage discount coupons')}</Text>
              </VStack>
            </HStack>
            <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={openCreate} borderRadius="lg">
              {t('Create Coupon')}
            </Button>
          </Flex>
        </CardBody>
      </Card>

      <SimpleGrid columns={1} spacing={5}>
        <Card>
          <CardBody>
            <HStack mb={4}>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <Search size={14} />
                </InputLeftElement>
                <Input
                  size="sm"
                  placeholder={t('Search by code...')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  borderRadius="lg"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={inputBorder}
                />
              </InputGroup>
            </HStack>

            {coupons.length === 0 ? (
              <Center py={12}>
                <VStack spacing={3}>
                  <Tag size={40} color={textSecondary} strokeWidth={1} />
                  <Text color={textSecondary}>{t('No coupons found')}</Text>
                </VStack>
              </Center>
            ) : (
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>{t('Code')}</Th>
                      <Th>{t('Type')}</Th>
                      <Th>{t('Value')}</Th>
                      <Th>{t('Min Order')}</Th>
                      <Th>{t('Used')}</Th>
                      <Th>{t('Status')}</Th>
                      <Th>{t('Expires')}</Th>
                      <Th textAlign="right">{t('Actions')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {coupons.map(coupon => (
                      <Tr key={coupon.id}>
                        <Td fontWeight="700" fontFamily="mono">{coupon.code}</Td>
                        <Td>
                          <Badge colorScheme={coupon.type === 'fixed' ? 'blue' : 'purple'}>
                            {coupon.type === 'fixed' ? t('Fixed') : '%'}
                          </Badge>
                        </Td>
                        <Td>{coupon.type === 'fixed' ? coupon.value : `${coupon.value}%`}</Td>
                        <Td>{coupon.min_order_amount || '-'}</Td>
                        <Td>{coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}</Td>
                        <Td>
                          <Badge colorScheme={coupon.is_active ? 'green' : 'red'}>
                            {coupon.is_active ? t('Active') : t('Inactive')}
                          </Badge>
                        </Td>
                        <Td>{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : '-'}</Td>
                        <Td textAlign="right">
                          <HStack spacing={1} justify="flex-end">
                            <IconButton size="xs" icon={<EditIcon />} onClick={() => openEdit(coupon)} borderRadius="md" />
                            <IconButton size="xs" icon={<DeleteIcon />} colorScheme="red" variant="ghost"
                              onClick={() => { setDeletingCoupon(coupon); deleteModal.onOpen(); }} borderRadius="md" />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={() => { onClose(); setEditingId(null); }} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent bg={panelBg}>
          <ModalHeader>
            <HStack>
              <Tag size={16} />
              <Text>{editingId ? t('Edit Coupon') : t('Create Coupon')}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">{t('Coupon Code')}</FormLabel>
                  <Input
                    value={form.code}
                    onChange={e => updateField('code', e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER20"
                    borderRadius="lg" bg={inputBg} border="1px solid" borderColor={inputBorder}
                    textTransform="uppercase"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">{t('Type')}</FormLabel>
                  <Select
                    value={form.type}
                    onChange={e => updateField('type', e.target.value)}
                    borderRadius="lg" bg={inputBg} border="1px solid" borderColor={inputBorder}
                  >
                    <option value="fixed">{t('Fixed Amount')}</option>
                    <option value="percent">{t('Percent Off')}</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">{t('Discount Value')}</FormLabel>
                  <NumberInput value={form.value} onChange={v => updateField('value', v)} min={0}>
                    <NumberInputField borderRadius="lg" bg={inputBg} border="1px solid" borderColor={inputBorder} />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">{t('Min Order Amount')}</FormLabel>
                  <NumberInput value={form.min_order_amount} onChange={v => updateField('min_order_amount', v)} min={0}>
                    <NumberInputField borderRadius="lg" bg={inputBg} border="1px solid" borderColor={inputBorder} />
                  </NumberInput>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">{t('Max Discount Amount')}</FormLabel>
                  <NumberInput value={form.max_discount_amount} onChange={v => updateField('max_discount_amount', v)} min={0}>
                    <NumberInputField borderRadius="lg" bg={inputBg} border="1px solid" borderColor={inputBorder} />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">{t('Usage Limit')}</FormLabel>
                  <NumberInput value={form.usage_limit} onChange={v => updateField('usage_limit', v)} min={0}>
                    <NumberInputField borderRadius="lg" bg={inputBg} border="1px solid" borderColor={inputBorder} />
                  </NumberInput>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">{t('Per Customer Limit')}</FormLabel>
                  <NumberInput value={form.per_customer_limit} onChange={v => updateField('per_customer_limit', v)} min={0}>
                    <NumberInputField borderRadius="lg" bg={inputBg} border="1px solid" borderColor={inputBorder} />
                  </NumberInput>
                </FormControl>
                <FormControl display="flex" alignItems="flex-end" pb={1}>
                  <HStack spacing={3}>
                    <Switch
                      isChecked={form.is_active}
                      onChange={e => updateField('is_active', e.target.checked)}
                      colorScheme="green"
                    />
                    <Text fontSize="sm" fontWeight="600">{form.is_active ? t('Active') : t('Inactive')}</Text>
                  </HStack>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">{t('Start Date')}</FormLabel>
                  <Input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={e => updateField('starts_at', e.target.value)}
                    borderRadius="lg" bg={inputBg} border="1px solid" borderColor={inputBorder}
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">{t('Expiry Date')}</FormLabel>
                  <Input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={e => updateField('expires_at', e.target.value)}
                    borderRadius="lg" bg={inputBg} border="1px solid" borderColor={inputBorder}
                    size="sm"
                  />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => { onClose(); setEditingId(null); }} borderRadius="lg" mr={3}>
              {t('Cancel')}
            </Button>
            <Button leftIcon={<Save size={16} />} colorScheme="brand" onClick={handleSave} borderRadius="lg">
              {editingId ? t('Update') : t('Create')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={deleteModal.isOpen} onClose={() => { deleteModal.onClose(); setDeletingCoupon(null); }} isCentered size="sm">
        <ModalOverlay />
        <ModalContent bg={panelBg}>
          <ModalHeader>{t('Confirm Delete Coupon?')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color={textSecondary}>{t('This will permanently delete this coupon.')}</Text>
            {deletingCoupon && (
              <Badge mt={2} fontSize="md" colorScheme="red">{deletingCoupon.code}</Badge>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => { deleteModal.onClose(); setDeletingCoupon(null); }} borderRadius="lg" mr={3}>
              {t('Cancel')}
            </Button>
            <Button colorScheme="red" onClick={handleDelete} borderRadius="lg" fontWeight="700">
              {t('Delete')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
