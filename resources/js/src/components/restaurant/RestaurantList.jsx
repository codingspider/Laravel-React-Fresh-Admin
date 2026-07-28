import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, HStack, VStack, Text, Badge, IconButton, useToast,
  useColorModeValue, Spinner, Center, Menu, MenuButton, MenuList, MenuItem,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter, useDisclosure, Flex, Input, InputGroup, InputLeftElement,
  Select, Tag, TagLabel, Wrap, WrapItem,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiSearch, FiFilter } from 'react-icons/fi';
import PageHeader from '../ui/PageHeader';
import api from '../../axios';

const statusColors = { active: 'green', inactive: 'red', suspended: 'yellow' };

export default function RestaurantList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBorderColor = useColorModeValue("gray.100", "gray.700");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.500", "gray.400");
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const fieldBg = useColorModeValue("gray.50", "gray.700");
  const fieldHoverBorder = useColorModeValue("gray.300", "gray.600");

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [deleteItem, setDeleteItem] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/v1/restaurants', { params });
      setRestaurants(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast({ title: t('Error fetching data'), status: 'error', position: 'bottom-right' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search, statusFilter]);

  const handleDelete = async () => {
    try {
      await api.delete(`/v1/restaurants/${deleteItem.id}`);
      toast({ title: t('Restaurant deleted successfully'), status: 'success', position: 'bottom-right' });
      fetchData();
    } catch (err) {
      toast({ title: t('Error deleting restaurant'), status: 'error', position: 'bottom-right' });
    }
    onClose();
  };

  return (
    <Box>
      <PageHeader
        title={t('Restaurants')}
        subtitle={t('Manage all restaurants')}
        breadcrumbs={[{ label: t('Dashboard'), link: '/dashboard' }, { label: t('Restaurants') }]}
      >
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={() => navigate('/restaurant/create')}>
          {t('Add Restaurant')}
        </Button>
      </PageHeader>

      <Box bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor} p={6}>
        <Flex mb={4} gap={4} direction={{ base: 'column', md: 'row' }} align="center">
          <InputGroup maxW="300px">
            <InputLeftElement><FiSearch /></InputLeftElement>
            <Input placeholder={t('Search restaurants...')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </InputGroup>
          <Select maxW="160px" placeholder={t('All Status')} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="active">{t('Active')}</option>
            <option value="inactive">{t('Inactive')}</option>
            <option value="suspended">{t('Suspended')}</option>
          </Select>
        </Flex>

        {loading ? (
          <Center py={10}><Spinner size="lg" color="teal.500" /></Center>
        ) : restaurants.length === 0 ? (
          <Center py={10}><Text color={textColor}>{t('No restaurants found')}</Text></Center>
        ) : (
          <Box overflowX="auto">
            <Box as="table" w="100%" fontSize="sm">
              <Box as="thead">
                <Box as="tr" borderBottom="1px solid" borderColor={borderColor}>
                  {[t('Name'), t('Email'), t('Phone'), t('Currency'), t('Status'), t('Actions')].map((h) => (
                    <Box as="th" key={h} px={4} py={3} textAlign="left" fontWeight="600" color={textColor}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {restaurants.map((r) => (
                  <Box as="tr" key={r.id} borderBottom="1px solid" borderColor={borderColor} _hover={{ bg: hoverBg }}>
                    <Box as="td" px={4} py={3}>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="600">{r.name}</Text>
                        <Text fontSize="xs" color={textColor}>{r.slug}</Text>
                      </VStack>
                    </Box>
                    <Box as="td" px={4} py={3}>{r.email || '-'}</Box>
                    <Box as="td" px={4} py={3}>{r.phone || '-'}</Box>
                    <Box as="td" px={4} py={3}>
                      <Tag size="sm" colorScheme="blue"><TagLabel>{r.currency} ({r.currency_symbol})</TagLabel></Tag>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Badge colorScheme={statusColors[r.status]} textTransform="capitalize">{t(r.status)}</Badge>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                        <MenuList>
                          <MenuItem icon={<FiEye />} onClick={() => navigate(`/restaurant/view/${r.id}`)}>{t('View')}</MenuItem>
                          <MenuItem icon={<FiEdit2 />} onClick={() => navigate(`/restaurant/edit/${r.id}`)}>{t('Edit')}</MenuItem>
                          <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => { setDeleteItem(r); onOpen(); }}>{t('Delete')}</MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {meta.last_page > 1 && (
          <Flex mt={4} justify="center" gap={2}>
            <Button size="sm" isDisabled={page === 1} onClick={() => setPage(page - 1)}>{t('Previous')}</Button>
            <Text alignSelf="center" fontSize="sm" mx={2}>{t('Page')} {meta.current_page} {t('of')} {meta.last_page}</Text>
            <Button size="sm" isDisabled={page === meta.last_page} onClick={() => setPage(page + 1)}>{t('Next')}</Button>
          </Flex>
        )}
      </Box>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>{t('Delete Restaurant')}</AlertDialogHeader>
            <AlertDialogBody>{t('Are you sure you want to delete this restaurant?')}</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>{t('Cancel')}</Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>{t('Delete')}</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
