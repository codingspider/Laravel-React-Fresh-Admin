import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, HStack, VStack, Text, Badge, IconButton, useToast,
  useColorModeValue, Spinner, Center, Menu, MenuButton, MenuList, MenuItem,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter, useDisclosure, Flex, Input, InputGroup, InputLeftElement, Select,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiSearch } from 'react-icons/fi';
import PageHeader from '../ui/PageHeader';
import api from '../../axios';

const statusColors = { pending: 'yellow', confirmed: 'green', seated: 'blue', completed: 'gray', cancelled: 'red', no_show: 'orange' };

export default function ReservationList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const [reservations, setReservations] = useState([]);
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
      const res = await api.get('/v1/reservations', { params });
      setReservations(res.data.data || []);
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
      await api.delete(`/v1/reservations/${deleteItem.id}`);
      toast({ title: t('Reservation deleted successfully'), status: 'success', position: 'bottom-right' });
      fetchData();
    } catch (err) {
      toast({ title: t('Error deleting reservation'), status: 'error', position: 'bottom-right' });
    }
    onClose();
  };

  return (
    <Box>
      <PageHeader
        title={t('Reservations')}
        subtitle={t('Manage table reservations')}
        breadcrumbs={[{ label: t('Dashboard'), link: '/dashboard' }, { label: t('Table Management') }, { label: t('Reservations') }]}
      >
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={() => navigate('/table-management/reservation/create')}>
          {t('New Reservation')}
        </Button>
      </PageHeader>

      <Box bg={bg} borderRadius="xl" border="1px solid" borderColor={borderColor} p={6}>
        <Flex mb={4} gap={4} direction={{ base: 'column', md: 'row' }} align="center">
          <InputGroup maxW="300px">
            <InputLeftElement><FiSearch /></InputLeftElement>
            <Input placeholder={t('Search reservations...')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </InputGroup>
          <Select maxW="160px" placeholder={t('All Status')} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            {Object.keys(statusColors).map((s) => (<option key={s} value={s}>{t(s.charAt(0).toUpperCase() + s.slice(1))}</option>))}
          </Select>
        </Flex>

        {loading ? (
          <Center py={10}><Spinner size="lg" color="teal.500" /></Center>
        ) : reservations.length === 0 ? (
          <Center py={10}><Text color="gray.500">{t('No reservations found')}</Text></Center>
        ) : (
          <Box overflowX="auto">
            <Box as="table" w="100%" fontSize="sm">
              <Box as="thead">
                <Box as="tr" borderBottom="1px solid" borderColor={borderColor}>
                  {[t('Guest'), t('Date & Time'), t('Table'), t('Guests'), t('Status'), t('Actions')].map((h) => (
                    <Box as="th" key={h} px={4} py={3} textAlign="left" fontWeight="600" color="gray.500">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {reservations.map((r) => (
                  <Box as="tr" key={r.id} borderBottom="1px solid" borderColor={borderColor} _hover={{ bg: hoverBg }}>
                    <Box as="td" px={4} py={3}>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="600">{r.guest_name}</Text>
                        <Text fontSize="xs" color="gray.500">{r.guest_phone}</Text>
                      </VStack>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <VStack align="start" spacing={0}>
                        <Text>{r.reservation_date}</Text>
                        <Text fontSize="xs" color="gray.500">{r.reservation_time} ({r.duration} min)</Text>
                      </VStack>
                    </Box>
                    <Box as="td" px={4} py={3}>{r.table?.name || '-'}</Box>
                    <Box as="td" px={4} py={3}>{r.guest_count}</Box>
                    <Box as="td" px={4} py={3}>
                      <Badge colorScheme={statusColors[r.status]} textTransform="capitalize">{t(r.status)}</Badge>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                        <MenuList>
                          <MenuItem icon={<FiEdit2 />} onClick={() => navigate(`/table-management/reservation/edit/${r.id}`)}>{t('Edit')}</MenuItem>
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
            <AlertDialogHeader>{t('Delete Reservation')}</AlertDialogHeader>
            <AlertDialogBody>{t('Are you sure you want to delete this reservation?')}</AlertDialogBody>
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
