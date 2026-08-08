import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Flex,
    Text,
    Heading,
    Badge,
    Avatar,
    VStack,
    HStack,
    Button,
    Spinner,
    Icon,
    IconButton,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Input,
    Textarea,
    FormControl,
    FormLabel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useToast,
    useDisclosure,
    Divider,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
    Mail,
    Phone,
    MapPin,
    Cake,
    Heart,
    CalendarClock,
    Check,
    Trash2,
    Plus,
    ArrowLeft,
    StickyNote,
} from 'lucide-react';
import api from '../../../axios';
import {
    CRM_CUSTOMER,
    CRM_CUSTOMER_NOTES,
    CRM_NOTE,
    CRM_FOLLOW_UPS,
    CRM_FOLLOW_UP_COMPLETE,
} from '../../../routes/apiRoutes';
import {
    CRM_CUSTOMER_LIST_PATH,
    CRM_CUSTOMER_EDIT_PATH,
} from '../../../routes/superAdminRoutes';
import useThemeColors from '../../../hooks/useThemeColors';
import { usePermission } from '../../../context/PermissionContext';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';

const SOURCE_COLORS = {
    manual: 'gray',
    pos: 'teal',
    web: 'blue',
    qr: 'purple',
    reservation: 'orange',
    delivery: 'green',
};

const LEAD_STATUS_COLORS = {
    new: 'blue',
    contacted: 'purple',
    qualified: 'teal',
    won: 'green',
    lost: 'red',
};

const FOLLOW_UP_STATUS_COLORS = {
    pending: 'orange',
    completed: 'green',
};

export default function CrmCustomerDetail() {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const colors = useThemeColors();
    const { can } = usePermission();
    const { formatAmount } = useCurrencyFormatter();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [customer, setCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [noteBody, setNoteBody] = useState('');
    const [submittingNote, setSubmittingNote] = useState(false);

    const [followUpForm, setFollowUpForm] = useState({ title: '', notes: '', due_at: '', status: 'pending' });
    const [submittingFollowUp, setSubmittingFollowUp] = useState(false);
    const [completingId, setCompletingId] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(CRM_CUSTOMER(id));
            setCustomer(res.data?.data || res.data || null);
        } catch (err) {
            console.error('CrmCustomerDetail fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const app_name = localStorage.getItem('app_name');
        document.title = `${app_name} | Customer 360`;
        fetchData();
    }, [fetchData]);

    const submitNote = async () => {
        if (!noteBody.trim()) {
            toast({ title: t('Note body is required'), status: 'warning', duration: 2500, isClosable: true });
            return;
        }
        setSubmittingNote(true);
        try {
            await api.post(CRM_CUSTOMER_NOTES(id), { body: noteBody.trim() });
            setNoteBody('');
            toast({ title: t('Note added'), status: 'success', duration: 2500, isClosable: true });
            fetchData();
        } catch (err) {
            toast({
                title: t('Failed to add note'),
                description: err.response?.data?.message || t('Something went wrong'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmittingNote(false);
        }
    };

    const deleteNote = async (noteId) => {
        try {
            await api.delete(CRM_NOTE(noteId));
            toast({ title: t('Note deleted'), status: 'success', duration: 2500, isClosable: true });
            fetchData();
        } catch (err) {
            toast({
                title: t('Failed to delete note'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const submitFollowUp = async () => {
        if (!followUpForm.title.trim()) {
            toast({ title: t('Title is required'), status: 'warning', duration: 2500, isClosable: true });
            return;
        }
        setSubmittingFollowUp(true);
        try {
            await api.post(CRM_FOLLOW_UPS, {
                customer_id: id,
                title: followUpForm.title.trim(),
                notes: followUpForm.notes,
                due_at: followUpForm.due_at || null,
                status: followUpForm.status,
            });
            setFollowUpForm({ title: '', notes: '', due_at: '', status: 'pending' });
            onClose();
            toast({ title: t('Follow-up created'), status: 'success', duration: 2500, isClosable: true });
            fetchData();
        } catch (err) {
            toast({
                title: t('Failed to create follow-up'),
                description: err.response?.data?.message || t('Something went wrong'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmittingFollowUp(false);
        }
    };

    const completeFollowUp = async (followUpId) => {
        setCompletingId(followUpId);
        try {
            await api.post(CRM_FOLLOW_UP_COMPLETE(followUpId));
            toast({ title: t('Follow-up completed'), status: 'success', duration: 2500, isClosable: true });
            fetchData();
        } catch (err) {
            toast({
                title: t('Failed to complete follow-up'),
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setCompletingId(null);
        }
    };

    if (isLoading) {
        return (
            <Flex justify="center" py={20}>
                <VStack spacing={3}>
                    <Spinner size="lg" color="brand.500" />
                    <Text fontSize="sm" color="gray.500">{t('Loading...')}</Text>
                </VStack>
            </Flex>
        );
    }

    if (!customer) {
        return (
            <Box>
                <Text>{t('Customer not found')}</Text>
                <Button mt={4} leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(CRM_CUSTOMER_LIST_PATH)}>
                    {t('Back to Customers')}
                </Button>
            </Box>
        );
    }

    const notes = Array.isArray(customer.notes) ? customer.notes : [];
    const followUps = Array.isArray(customer.follow_ups) ? customer.follow_ups : [];
    const segments = Array.isArray(customer.segments) ? customer.segments : [];

    return (
        <Box>
            <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft size={16} />}
                mb={3}
                onClick={() => navigate(CRM_CUSTOMER_LIST_PATH)}
            >
                {t('Back to Customers')}
            </Button>

            {/* Header Card */}
            <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} overflow="hidden" mb={{ base: 4, md: 6 }}>
                <Box h="90px" bgGradient="linear(to-r, brand.600, brand.400)" />
                <Flex p={{ base: 4, md: 6 }} direction={{ base: 'column', md: 'row' }} gap={4} align={{ base: 'flex-start', md: 'center' }} mt="-40px">
                    <Avatar size="2xl" name={customer.name} bg="brand.500" color="white" border="4px solid" borderColor={colors.bgCard} />
                    <Box flex="1">
                        <Flex align="center" gap={3} flexWrap="wrap">
                            <Heading size="lg" fontWeight="bold" color={colors.textHeading}>{customer.name}</Heading>
                            {customer.is_active === false && (
                                <Badge colorScheme="red" variant="subtle" borderRadius="full" px={2.5} py={0.5}>{t('Inactive')}</Badge>
                            )}
                        </Flex>
                        <HStack spacing={3} mt={2} flexWrap="wrap">
                            {customer.source && (
                                <Badge colorScheme={SOURCE_COLORS[customer.source] || 'gray'} variant="subtle" borderRadius="full" px={2.5} py={0.5} textTransform="capitalize">
                                    {customer.source}
                                </Badge>
                            )}
                            {customer.lead_status && (
                                <Badge colorScheme={LEAD_STATUS_COLORS[customer.lead_status] || 'gray'} variant="subtle" borderRadius="full" px={2.5} py={0.5} textTransform="capitalize">
                                    {customer.lead_status}
                                </Badge>
                            )}
                            {segments.map((segment) => (
                                <Badge key={segment.id} bg={segment.color || 'teal.500'} color="white" borderRadius="full" px={2.5} py={0.5}>
                                    {segment.name}
                                </Badge>
                            ))}
                        </HStack>
                        <HStack spacing={4} mt={3} flexWrap="wrap" fontSize="sm" color="gray.500">
                            {customer.email && (
                                <HStack spacing={1.5}>
                                    <Icon as={Mail} boxSize={3.5} />
                                    <Text>{customer.email}</Text>
                                </HStack>
                            )}
                            {customer.phone && (
                                <HStack spacing={1.5}>
                                    <Icon as={Phone} boxSize={3.5} />
                                    <Text>{customer.phone}</Text>
                                </HStack>
                            )}
                            {(customer.city || customer.address) && (
                                <HStack spacing={1.5}>
                                    <Icon as={MapPin} boxSize={3.5} />
                                    <Text>{[customer.address, customer.city, customer.country].filter(Boolean).join(', ')}</Text>
                                </HStack>
                            )}
                        </HStack>
                    </Box>
                    {can('update_customers') && (
                        <Button colorScheme="teal" size="sm" onClick={() => navigate(CRM_CUSTOMER_EDIT_PATH(customer.id))}>
                            {t('Edit')}
                        </Button>
                    )}
                </Flex>
                <Divider borderColor={colors.borderDefault} />
                <Box p={{ base: 4, md: 6 }}>
                    <Flex wrap="wrap" gap={4}>
                        {[
                            { label: t('Total Spent'), value: formatAmount(parseFloat(customer.total_spent || 0)) },
                            { label: t('Total Orders'), value: customer.total_orders ?? 0 },
                            { label: t('Last Visit'), value: customer.last_visit_at ? new Date(customer.last_visit_at).toLocaleDateString() : '-' },
                            { label: t('Segments'), value: segments.length },
                        ].map((item, index) => (
                            <Box key={index} flex="1" minW="140px">
                                <Text fontSize="xs" color="gray.500">{item.label}</Text>
                                <Text fontSize="lg" fontWeight="bold" color={colors.textHeading}>{item.value}</Text>
                            </Box>
                        ))}
                    </Flex>
                </Box>
            </Box>

            <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                <Tabs colorScheme="teal" variant="enclosed" isLazy>
                    <TabList px={4} pt={2}>
                        <Tab><Icon as={CalendarClock} boxSize={4} mr={2} />{t('Follow-ups')} {followUps.length > 0 && `(${followUps.length})`}</Tab>
                        <Tab><Icon as={StickyNote} boxSize={4} mr={2} />{t('Notes')} {notes.length > 0 && `(${notes.length})`}</Tab>
                        <Tab><Icon as={Cake} boxSize={4} mr={2} />{t('Details')}</Tab>
                    </TabList>

                    <TabPanels p={0}>
                        {/* Follow-ups Tab */}
                        <TabPanel>
                            <Flex justify="space-between" align="center" mb={4}>
                                <Text fontSize="sm" color="gray.500">{t('Scheduled calls and follow-up activities')}</Text>
                                {can('create_follow_ups') && (
                                    <Button colorScheme="teal" size="sm" leftIcon={<Plus size={15} />} onClick={onOpen}>
                                        {t('Add Follow-up')}
                                    </Button>
                                )}
                            </Flex>
                            {followUps.length === 0 ? (
                                <Text fontSize="sm" color="gray.500" py={6}>{t('No follow-ups yet')}</Text>
                            ) : (
                                <VStack spacing={3} align="stretch">
                                    {followUps.map((followUp) => (
                                        <Flex
                                            key={followUp.id}
                                            justify="space-between"
                                            align="center"
                                            p={3.5}
                                            bg={colors.bgSubtle}
                                            borderRadius="lg"
                                            gap={3}
                                        >
                                            <Box minW={0}>
                                                <Flex align="center" gap={2}>
                                                    <Text fontSize="sm" fontWeight="600">{followUp.title}</Text>
                                                    <Badge colorScheme={FOLLOW_UP_STATUS_COLORS[followUp.status] || 'gray'} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs" textTransform="capitalize">
                                                        {followUp.status || 'pending'}
                                                    </Badge>
                                                </Flex>
                                                {followUp.notes && <Text fontSize="xs" color="gray.500" mt={1} noOfLines={2}>{followUp.notes}</Text>}
                                                {followUp.due_at && (
                                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                                        {t('Due')}: {new Date(followUp.due_at).toLocaleDateString()}
                                                    </Text>
                                                )}
                                            </Box>
                                            {followUp.status !== 'completed' && can('complete_follow_ups') && (
                                                <IconButton
                                                    size="sm"
                                                    colorScheme="green"
                                                    variant="outline"
                                                    icon={<Check size={16} />}
                                                    isLoading={completingId === followUp.id}
                                                    aria-label={t('Complete')}
                                                    onClick={() => completeFollowUp(followUp.id)}
                                                />
                                            )}
                                        </Flex>
                                    ))}
                                </VStack>
                            )}
                        </TabPanel>

                        {/* Notes Tab */}
                        <TabPanel>
                            {can('create_customer_notes') && (
                                <Box mb={5}>
                                    <Textarea
                                        value={noteBody}
                                        onChange={(e) => setNoteBody(e.target.value)}
                                        placeholder={t('Write a note about this customer...')}
                                        bg={colors.bgInput}
                                        borderColor={colors.borderInput}
                                        borderRadius="lg"
                                        size="sm"
                                        rows={3}
                                    />
                                    <Flex justify="flex-end" mt={2}>
                                        <Button colorScheme="teal" size="sm" isLoading={submittingNote} onClick={submitNote}>
                                            {t('Add Note')}
                                        </Button>
                                    </Flex>
                                </Box>
                            )}
                            {notes.length === 0 ? (
                                <Text fontSize="sm" color="gray.500" py={6}>{t('No notes yet')}</Text>
                            ) : (
                                <VStack spacing={3} align="stretch">
                                    {notes.map((note) => (
                                        <Flex key={note.id} p={3.5} bg={colors.bgSubtle} borderRadius="lg" justify="space-between" gap={3}>
                                            <Box minW={0}>
                                                <Text fontSize="sm">{note.body}</Text>
                                                <Text fontSize="xs" color="gray.500" mt={1.5}>
                                                    {note.creator?.name || t('Unknown')} · {new Date(note.created_at).toLocaleString()}
                                                </Text>
                                            </Box>
                                            {can('delete_customer_notes') && (
                                                <IconButton
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="red"
                                                    icon={<Trash2 size={15} />}
                                                    aria-label={t('Delete note')}
                                                    onClick={() => deleteNote(note.id)}
                                                />
                                            )}
                                        </Flex>
                                    ))}
                                </VStack>
                            )}
                        </TabPanel>

                        {/* Details Tab */}
                        <TabPanel>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                {[
                                    { label: t('Date of Birth'), value: customer.dob ? new Date(customer.dob).toLocaleDateString() : '-', icon: Cake },
                                    { label: t('Anniversary'), value: customer.anniversary ? new Date(customer.anniversary).toLocaleDateString() : '-', icon: Heart },
                                    { label: t('Gender'), value: customer.gender ? t(customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1)) : '-', icon: null },
                                    { label: t('Favourite Food'), value: customer.favourite_food || '-', icon: null },
                                    { label: t('Last Visit'), value: customer.last_visit_at ? new Date(customer.last_visit_at).toLocaleDateString() : '-', icon: null },
                                    { label: t('Company'), value: customer.company || '-', icon: null },
                                    { label: t('Email'), value: customer.email || '-', icon: Mail },
                                    { label: t('Phone'), value: customer.phone || '-', icon: Phone },
                                ].map((field, index) => (
                                    <Flex key={index} p={3.5} bg={colors.bgSubtle} borderRadius="lg" align="center" gap={3}>
                                        {field.icon && <Icon as={field.icon} boxSize={4} color="gray.400" />}
                                        <Box>
                                            <Text fontSize="xs" color="gray.500">{field.label}</Text>
                                            <Text fontSize="sm" fontWeight="600">{field.value}</Text>
                                        </Box>
                                    </Flex>
                                ))}
                            </SimpleGrid>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>

            {/* Add Follow-up Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>{t('Add Follow-up')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={4} pt={5}>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Title')}</FormLabel>
                                <Input
                                    value={followUpForm.title}
                                    onChange={(e) => setFollowUpForm({ ...followUpForm, title: e.target.value })}
                                    placeholder={t('e.g. Birthday call, follow-up on feedback')}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Notes')}</FormLabel>
                                <Textarea
                                    value={followUpForm.notes}
                                    onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                    size="sm"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" color={colors.textSecondary}>{t('Due Date')}</FormLabel>
                                <Input
                                    type="datetime-local"
                                    value={followUpForm.due_at}
                                    onChange={(e) => setFollowUpForm({ ...followUpForm, due_at: e.target.value })}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTop="1px solid" borderColor={colors.borderDefault}>
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">{t('Cancel')}</Button>
                        <Button colorScheme="teal" onClick={submitFollowUp} isLoading={submittingFollowUp} borderRadius="lg" fontWeight="700">
                            {t('Save')}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
