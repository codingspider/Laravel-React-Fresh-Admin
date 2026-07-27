import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, HStack, VStack, Text, Badge, IconButton, useToast,
  useColorModeValue, Spinner, Center, Menu, MenuButton, MenuList, MenuItem,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter, useDisclosure, Flex, Input, InputGroup, InputLeftElement, Select, Image,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiSearch, FiEye } from 'react-icons/fi';
import PageHeader from '../ui/PageHeader';
import api from '../../axios';

export default function MenuItemList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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
      if (categoryFilter) params.category_id = categoryFilter;
      const res = await api.get('/v1/menu/items', { params });
      setItems(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast({ title: t('Error fetching data'), status: 'error', position: 'bottom-right' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search, categoryFilter]);

  const handleDelete = async () => {
    try {
      await api.delete(`/v1/menu/items/${deleteItem.id}`);
      toast({ title: t('Menu item deleted successfully'), status: 'success', position: 'bottom-right' });
      fetchData();
    } catch (err) {
      toast({ title: t('Error deleting menu item'), status: 'error', position: 'bottom-right' });
    }
    onClose();
  };

  return (
    <Box>
      <PageHeader
        title={t('Menu Items')}
        subtitle={t('Manage all menu items')}
        breadcrumbs={[{ label: t('Dashboard'), link: '/dashboard' }, { label: t('Menu'), link: '/menu/items' }, { label: t('Items') }]}
      >
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={() => navigate('/menu/item/create')}>
          {t('Add Item')}
        </Button>
      </PageHeader>

      <Box bg={bg} borderRadius="xl" border="1px solid" borderColor={borderColor} p={6}>
        <Flex mb={4} gap={4} direction={{ base: 'column', md: 'row' }} align="center">
          <InputGroup maxW="300px">
            <InputLeftElement><FiSearch /></InputLeftElement>
            <Input placeholder={t('Search items...')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </InputGroup>
        </Flex>

        {loading ? (
          <Center py={10}><Spinner size="lg" color="teal.500" /></Center>
        ) : items.length === 0 ? (
          <Center py={10}><Text color="gray.500">{t('No menu items found')}</Text></Center>
        ) : (
          <Box overflowX="auto">
            <Box as="table" w="100%" fontSize="sm">
              <Box as="thead">
                <Box as="tr" borderBottom="1px solid" borderColor={borderColor}>
                  {[t('Item'), t('Category'), t('Price'), t('Prep Time'), t('Status'), t('Actions')].map((h) => (
                    <Box as="th" key={h} px={4} py={3} textAlign="left" fontWeight="600" color="gray.500">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {items.map((item) => (
                  <Box as="tr" key={item.id} borderBottom="1px solid" borderColor={borderColor} _hover={{ bg: hoverBg }}>
                    <Box as="td" px={4} py={3}>
                      <HStack>
                        {item.image && <Box boxSize="40px" borderRadius="md" overflow="hidden"><Image src={item.image} alt={item.name} boxSize="100%" objectFit="cover" /></Box>}
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600">{item.name}</Text>
                          <HStack spacing={1}>
                            {item.is_vegetarian && <Badge colorScheme="green" size="xs">{t("veg")}</Badge>}
                            {item.is_vegan && <Badge colorScheme="teal" size="xs">{t("vegan")}</Badge>}
                            {item.is_featured && <Badge colorScheme="yellow" size="xs">{t("featured")}</Badge>}
                          </HStack>
                        </VStack>
                      </HStack>
                    </Box>
                    <Box as="td" px={4} py={3}>{item.category?.name || '-'}</Box>
                    <Box as="td" px={4} py={3} fontWeight="600">{item.formatted_price}</Box>
                    <Box as="td" px={4} py={3}>{item.preparation_time ? `${item.preparation_time} min` : '-'}</Box>
                    <Box as="td" px={4} py={3}>
                      <Badge colorScheme={item.is_available ? 'green' : 'red'}>{item.is_available ? t('Available') : t('Unavailable')}</Badge>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                        <MenuList>
                          <MenuItem icon={<FiEye />} onClick={() => navigate(`/menu/item/view/${item.id}`)}>{t('View')}</MenuItem>
                          <MenuItem icon={<FiEdit2 />} onClick={() => navigate(`/menu/item/edit/${item.id}`)}>{t('Edit')}</MenuItem>
                          <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => { setDeleteItem(item); onOpen(); }}>{t('Delete')}</MenuItem>
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
            <AlertDialogHeader>{t('Delete Menu Item')}</AlertDialogHeader>
            <AlertDialogBody>{t('Are you sure you want to delete this menu item?')}</AlertDialogBody>
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
