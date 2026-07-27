import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, VStack, Text, Badge, IconButton, useToast,
  useColorModeValue, Spinner, Center, Menu, MenuButton, MenuList, MenuItem,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter, useDisclosure, Flex, Input, InputGroup, InputLeftElement,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiSearch } from 'react-icons/fi';
import PageHeader from '../ui/PageHeader';
import api from '../../axios';

export default function ModifierGroupList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
      const res = await api.get('/v1/menu/modifier-groups', { params });
      setGroups(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast({ title: t('Error fetching data'), status: 'error', position: 'bottom-right' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleDelete = async () => {
    try {
      await api.delete(`/v1/menu/modifier-groups/${deleteItem.id}`);
      toast({ title: t('Modifier group deleted successfully'), status: 'success', position: 'bottom-right' });
      fetchData();
    } catch (err) {
      toast({ title: t('Error deleting modifier group'), status: 'error', position: 'bottom-right' });
    }
    onClose();
  };

  return (
    <Box>
      <PageHeader
        title={t('Modifier Groups')}
        subtitle={t('Manage modifier groups')}
        breadcrumbs={[{ label: t('Dashboard'), link: '/dashboard' }, { label: t('Menu'), link: '/menu/items' }, { label: t('Modifier Groups') }]}
      >
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={() => navigate('/menu/modifier-group/create')}>
          {t('Add Modifier Group')}
        </Button>
      </PageHeader>

      <Box bg={bg} borderRadius="xl" border="1px solid" borderColor={borderColor} p={6}>
        <Flex mb={4} gap={4} direction={{ base: 'column', md: 'row' }} align="center">
          <InputGroup maxW="300px">
            <InputLeftElement><FiSearch /></InputLeftElement>
            <Input placeholder={t('Search modifier groups...')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </InputGroup>
        </Flex>

        {loading ? (
          <Center py={10}><Spinner size="lg" color="teal.500" /></Center>
        ) : groups.length === 0 ? (
          <Center py={10}><Text color="gray.500">{t('No modifier groups found')}</Text></Center>
        ) : (
          <Box overflowX="auto">
            <Box as="table" w="100%" fontSize="sm">
              <Box as="thead">
                <Box as="tr" borderBottom="1px solid" borderColor={borderColor}>
                  {[t('Name'), t('Modifiers'), t('Required'), t('Selections'), t('Actions')].map((h) => (
                    <Box as="th" key={h} px={4} py={3} textAlign="left" fontWeight="600" color="gray.500">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {groups.map((g) => (
                  <Box as="tr" key={g.id} borderBottom="1px solid" borderColor={borderColor} _hover={{ bg: hoverBg }}>
                    <Box as="td" px={4} py={3} fontWeight="600">{g.name}</Box>
                    <Box as="td" px={4} py={3}>
                      <Badge colorScheme="blue">{g.modifiers_count ?? g.modifiers?.length ?? 0} {t('modifiers')}</Badge>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Badge colorScheme={g.is_required ? 'red' : 'gray'}>{g.is_required ? t('Required') : t('Optional')}</Badge>
                    </Box>
                    <Box as="td" px={4} py={3}>{g.min_selections ?? 0} - {g.max_selections ?? '∞'}</Box>
                    <Box as="td" px={4} py={3}>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                        <MenuList>
                          <MenuItem icon={<FiEdit2 />} onClick={() => navigate(`/menu/modifier-group/edit/${g.id}`)}>{t('Edit')}</MenuItem>
                          <MenuItem icon={<FiTrash2 />} color="red.500" onClick={() => { setDeleteItem(g); onOpen(); }}>{t('Delete')}</MenuItem>
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
            <AlertDialogHeader>{t('Delete Modifier Group')}</AlertDialogHeader>
            <AlertDialogBody>{t('Are you sure you want to delete this modifier group?')}</AlertDialogBody>
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
