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

const statusColors = { active: 'green', inactive: 'red' };

export default function FloorList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const [floors, setFloors] = useState([]);
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
      const res = await api.get('/v1/floors', { params });
      setFloors(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast({ title: t('error_fetching_data'), status: 'error', position: 'bottom-right' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search, statusFilter]);

  const handleDelete = async () => {
    try {
      await api.delete(`/v1/floors/${deleteItem.id}`);
      toast({ title: t('floor_deleted'), status: 'success', position: 'bottom-right' });
      fetchData();
    } catch (err) {
      toast({ title: t('error_deleting_floor'), status: 'error', position: 'bottom-right' });
    }
    onClose();
  };

  return (
    <Box>
      <PageHeader
        title={t('floors')}
        subtitle={t('manage_restaurant_floors')}
        breadcrumbs={[{ label: t('dashboard'), link: '/dashboard' }, { label: t('table_management') }, { label: t('floors') }]}
      >
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={() => navigate('/table-management/floor/create')}>
          {t('add_floor')}
        </Button>
      </PageHeader>

      <Box bg={bg} borderRadius="xl" border="1px solid" borderColor={borderColor} p={6}>
        <Flex mb={4} gap={4} direction={{ base: 'column', md: 'row' }} align="center">
          <InputGroup maxW="300px">
            <InputLeftElement><FiSearch /></InputLeftElement>
            <Input placeholder={t('search_floors')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </InputGroup>
          <Select maxW="160px" placeholder={t('all_status')} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="active">{t('active')}</option>
            <option value="inactive">{t('inactive')}</option>
          </Select>
        </Flex>

        {loading ? (
          <Center py={10}><Spinner size="lg" color="teal.500" /></Center>
        ) : floors.length === 0 ? (
          <Center py={10}><Text color="gray.500">{t('no_floors_found')}</Text></Center>
        ) : (
          <Box overflowX="auto">
            <Box as="table" w="100%" fontSize="sm">
              <Box as="thead">
                <Box as="tr" borderBottom="1px solid" borderColor={borderColor}>
                  {[t('name'), t('tables'), t('status'), t('sort_order'), t('actions')].map((h) => (
                    <Box as="th" key={h} px={4} py={3} textAlign="left" fontWeight="600" color="gray.500">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {floors.map((f) => (
                  <Box as="tr" key={f.id} borderBottom="1px solid" borderColor={borderColor} _hover={{ bg: hoverBg }}>
                    <Box as="td" px={4} py={3} fontWeight="600">{f.name}</Box>
                    <Box as="td" px={4} py={3}><Badge colorScheme="blue">{f.tables_count ?? 0}</Badge></Box>
                    <Box as="td" px={4} py={3}>
                      <Badge colorScheme={statusColors[f.status] || 'gray'}>{t(f.status)}</Badge>
                    </Box>
                    <Box as="td" px={4} py={3}>{f.sort_order ?? 0}</Box>
                    <Box as="td" px={4} py={3}>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                        <MenuList>
                          <MenuItem icon={<FiEdit2 />} onClick={() => navigate(`/table-management/floor/edit/${f.id}`)}>{t('edit')}</MenuItem>
                          <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => { setDeleteItem(f); onOpen(); }}>{t('delete')}</MenuItem>
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
            <Button size="sm" isDisabled={page === 1} onClick={() => setPage(page - 1)}>{t('previous')}</Button>
            <Text alignSelf="center" fontSize="sm" mx={2}>{t('page')} {meta.current_page} {t('of')} {meta.last_page}</Text>
            <Button size="sm" isDisabled={page === meta.last_page} onClick={() => setPage(page + 1)}>{t('next')}</Button>
          </Flex>
        )}
      </Box>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>{t('delete_floor')}</AlertDialogHeader>
            <AlertDialogBody>{t('confirm_delete_floor')}</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>{t('cancel')}</Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>{t('delete')}</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
