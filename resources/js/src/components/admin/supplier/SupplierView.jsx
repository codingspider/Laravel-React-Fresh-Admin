import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box, useToast, Text, Badge, Button, SimpleGrid, Tabs, TabList, Tab, TabPanels, TabPanel,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
    useDisclosure, Input, FormControl, FormLabel, Textarea, Select, IconButton, Flex, HStack, VStack,
    Stat, StatLabel, StatNumber, StatHelpText, Avatar, Divider, Link,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { AddIcon, DeleteIcon, DownloadIcon, EditIcon, StarIcon } from "@chakra-ui/icons";
import Swal from "sweetalert2";
import api from "../../../axios";
import PageHeader from "../../ui/PageHeader";
import TanStackTable from "../../../TanStackTable";
import {
    SUPPLIER_OVERVIEW, SUPPLIER_CONTACTS, DELETE_SUPPLIER_CONTACT, SUPPLIER_DOCUMENTS,
    DELETE_SUPPLIER_DOCUMENT, SUPPLIER_TRANSACTIONS, STORE_SUPPLIER_TRANSACTION, RATE_SUPPLIER,
} from "../../../routes/apiRoutes";
import { SUPPLIER_LIST_PATH, SUPPLIER_EDIT_PATH, DASHBOARD_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";

export default function SupplierView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const toast = useToast();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();

    const [overview, setOverview] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [transactions, setTransactions] = useState({ data: [], total: 0 });
    const [transPageIndex, setTransPageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [contactForm, setContactForm] = useState({ name: "", designation: "", email: "", phone: "", is_primary: false, notes: "" });
    const [transactionForm, setTransactionForm] = useState({ type: "adjustment", debit: "", credit: "", description: "", transaction_date: "" });
    const [ratingForm, setRatingForm] = useState({ quality_rating: 5, delivery_rating: 5, price_rating: 5, comment: "" });
    const [documentForm, setDocumentForm] = useState({ title: "", document_type: "other", issue_date: "", expiry_date: "", notes: "", file: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const contactModal = useDisclosure();
    const transactionModal = useDisclosure();
    const documentModal = useDisclosure();
    const ratingModal = useDisclosure();

    const fetchOverview = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(SUPPLIER_OVERVIEW(id));
            setOverview(res.data?.data || null);
        } catch (err) {
            console.error("overview error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const fetchContacts = useCallback(async () => {
        try {
            const res = await api.get(SUPPLIER_CONTACTS(id));
            setContacts(res.data?.data || []);
        } catch (err) {
            console.error("contacts error:", err);
        }
    }, [id]);

    const fetchDocuments = useCallback(async () => {
        try {
            const res = await api.get(SUPPLIER_DOCUMENTS(id));
            setDocuments(res.data?.data || []);
        } catch (err) {
            console.error("documents error:", err);
        }
    }, [id]);

    const fetchTransactions = useCallback(async () => {
        try {
            const res = await api.get(SUPPLIER_TRANSACTIONS(id), { params: { per_page: 15, page: transPageIndex + 1 } });
            const list = res.data?.data?.data || res.data?.data || [];
            const total = res.data?.meta?.total || res.data?.data?.total || list.length;
            setTransactions({ data: list, total });
        } catch (err) {
            console.error("transactions error:", err);
        }
    }, [id, transPageIndex]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | ${t("supplier_details")}`;
        fetchOverview();
        fetchContacts();
        fetchDocuments();
        fetchTransactions();
    }, [fetchOverview, fetchContacts, fetchDocuments, fetchTransactions, t]);

    const saveContact = async () => {
        setIsSubmitting(true);
        try {
            const res = await api.post(SUPPLIER_CONTACTS(id), contactForm);
            toast({ title: res.data.message || t("contact_added"), status: "success", duration: 3000, isClosable: true });
            contactModal.onClose();
            setContactForm({ name: "", designation: "", email: "", phone: "", is_primary: false, notes: "" });
            fetchContacts();
            fetchOverview();
        } catch (err) {
            toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteContact = async (contactId) => {
        const result = await Swal.fire({
            title: t("are_you_sure"),
            text: t("data_will_be_deleted"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0d9488",
            cancelButtonColor: "#6b7280",
            confirmButtonText: t("yes_delete"),
            cancelButtonText: t("cancel"),
            reverseButtons: true,
        });
        if (result.isConfirmed) {
            try {
                const res = await api.delete(DELETE_SUPPLIER_CONTACT(id, contactId));
                toast({ title: res.data.message || t("data_deleted_successfully"), status: "success", duration: 3000, isClosable: true });
                fetchContacts();
                fetchOverview();
            } catch (err) {
                toast({ title: t("error_deleting_data"), status: "error", duration: 3000, isClosable: true });
            }
        }
    };

    const saveDocument = async () => {
        setIsSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(documentForm).forEach(([key, value]) => {
                if (value !== null && value !== "") fd.append(key, value);
            });
            const res = await api.post(SUPPLIER_DOCUMENTS(id), fd, { headers: { "Content-Type": "multipart/form-data" } });
            toast({ title: res.data.message || t("document_uploaded"), status: "success", duration: 3000, isClosable: true });
            documentModal.onClose();
            setDocumentForm({ title: "", document_type: "other", issue_date: "", expiry_date: "", notes: "", file: null });
            fetchDocuments();
        } catch (err) {
            toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteDocument = async (documentId) => {
        const result = await Swal.fire({
            title: t("are_you_sure"),
            text: t("data_will_be_deleted"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0d9488",
            cancelButtonColor: "#6b7280",
            confirmButtonText: t("yes_delete"),
            cancelButtonText: t("cancel"),
            reverseButtons: true,
        });
        if (result.isConfirmed) {
            try {
                const res = await api.delete(DELETE_SUPPLIER_DOCUMENT(id, documentId));
                toast({ title: res.data.message || t("data_deleted_successfully"), status: "success", duration: 3000, isClosable: true });
                fetchDocuments();
            } catch (err) {
                toast({ title: t("error_deleting_data"), status: "error", duration: 3000, isClosable: true });
            }
        }
    };

    const saveTransaction = async () => {
        setIsSubmitting(true);
        try {
            const res = await api.post(STORE_SUPPLIER_TRANSACTION(id), {
                ...transactionForm,
                debit: Number(transactionForm.debit) || 0,
                credit: Number(transactionForm.credit) || 0,
                transaction_date: transactionForm.transaction_date || undefined,
            });
            toast({ title: res.data.message || t("transaction_added"), status: "success", duration: 3000, isClosable: true });
            transactionModal.onClose();
            setTransactionForm({ type: "adjustment", debit: "", credit: "", description: "", transaction_date: "" });
            fetchTransactions();
            fetchOverview();
        } catch (err) {
            toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const saveRating = async () => {
        setIsSubmitting(true);
        try {
            const res = await api.post(RATE_SUPPLIER(id), ratingForm);
            toast({ title: res.data.message || t("rating_saved"), status: "success", duration: 3000, isClosable: true });
            ratingModal.onClose();
            fetchOverview();
        } catch (err) {
            toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
        } finally {
            setIsSubmitting(false);
        }
    };

    const supplier = overview?.supplier;

    const renderStars = (value) => {
        const v = Number(value) || 0;
        return (
            <HStack spacing={0.5}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <StarIcon key={n} boxSize={3.5} color={n <= v ? "yellow.400" : colors.textMuted} />
                ))}
            </HStack>
        );
    };

    const transactionColumns = [
        { header: t("date"), accessorKey: "transaction_date", cell: ({ getValue }) => <Text fontSize="sm">{getValue()}</Text> },
        { header: t("type"), accessorKey: "type", cell: ({ getValue }) => <Badge colorScheme={getValue() === "payment" ? "green" : getValue() === "purchase" ? "blue" : getValue() === "return" ? "cyan" : "gray"} variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="xs">{getValue()}</Badge> },
        { header: t("debit"), accessorKey: "debit", cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{formatAmount(getValue() || 0)}</Text> },
        { header: t("credit"), accessorKey: "credit", cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{formatAmount(getValue() || 0)}</Text> },
        { header: t("balance"), accessorKey: "balance", cell: ({ getValue }) => <Text fontSize="sm" fontWeight="600">{formatAmount(getValue() || 0)}</Text> },
        { header: t("description"), accessorKey: "description", cell: ({ getValue }) => <Text fontSize="sm" noOfLines={1}>{getValue() || "-"}</Text> },
    ];

    if (isLoading && !overview) {
        return <Box>...</Box>;
    }

    return (
        <Box>
            <PageHeader
                title={supplier?.name || t("supplier_details")}
                subtitle={supplier?.company || supplier?.code || ""}
                breadcrumbs={[{ label: t("dashboard"), path: DASHBOARD_PATH }, { label: t("supplier_management"), path: SUPPLIER_LIST_PATH }, { label: supplier?.name || t("details"), isCurrent: true }]}
            >
                <Button variant="outline" leftIcon={<EditIcon />} onClick={() => navigate(SUPPLIER_EDIT_PATH(id), { state: { supplier } })}>{t("edit")}</Button>
            </PageHeader>

            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4} mb={6}>
                <Stat bg={colors.bgCard} p={5} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                    <StatLabel fontSize="sm" color={colors.textMuted}>{t("total_purchases")}</StatLabel>
                    <StatNumber fontSize="2xl">{formatAmount(overview?.total_purchases || 0)}</StatNumber>
                    <StatHelpText>{overview?.purchase_count || 0} {t("purchases")}</StatHelpText>
                </Stat>
                <Stat bg={colors.bgCard} p={5} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                    <StatLabel fontSize="sm" color={colors.textMuted}>{t("total_paid")}</StatLabel>
                    <StatNumber fontSize="2xl">{formatAmount(overview?.total_paid || 0)}</StatNumber>
                </Stat>
                <Stat bg={colors.bgCard} p={5} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                    <StatLabel fontSize="sm" color={colors.textMuted}>{t("total_returns")}</StatLabel>
                    <StatNumber fontSize="2xl">{formatAmount(overview?.total_returns || 0)}</StatNumber>
                </Stat>
                <Stat bg={colors.bgCard} p={5} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                    <StatLabel fontSize="sm" color={colors.textMuted}>{t("outstanding_balance")}</StatLabel>
                    <StatNumber fontSize="2xl" color={Number(overview?.outstanding_balance) > 0 ? "red.500" : "green.500"}>{formatAmount(overview?.outstanding_balance || 0)}</StatNumber>
                </Stat>
            </SimpleGrid>

            <Box bg={colors.bgCard} p={{ base: 4, md: 6 }} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
                <Tabs colorScheme="teal" variant="enclosed" isLazy>
                    <TabList overflowX="auto">
                        <Tab>{t("information")}</Tab>
                        <Tab>{t("contacts")} ({contacts.length})</Tab>
                        <Tab>{t("documents")} ({documents.length})</Tab>
                        <Tab>{t("transactions")}</Tab>
                        <Tab>{t("ratings")}</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel px={0} pt={6}>
                            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
                                <InfoItem label={t("name")} value={supplier?.name} />
                                <InfoItem label={t("company")} value={supplier?.company} />
                                <InfoItem label={t("code")} value={supplier?.code} />
                                <InfoItem label={t("contact_person")} value={supplier?.contact_person} />
                                <InfoItem label={t("email")} value={supplier?.email} />
                                <InfoItem label={t("phone")} value={supplier?.phone} />
                                <InfoItem label={t("tax_number")} value={supplier?.tax_number} />
                                <InfoItem label={t("gst_number")} value={supplier?.gst_number} />
                                <InfoItem label={t("address")} value={supplier?.address} />
                                <InfoItem label={t("city")} value={supplier?.city} />
                                <InfoItem label={t("state")} value={supplier?.state} />
                                <InfoItem label={t("zip_code")} value={supplier?.zip_code} />
                                <InfoItem label={t("country")} value={supplier?.country} />
                                <InfoItem label={t("opening_balance")} value={formatAmount(supplier?.opening_balance || 0)} />
                                <InfoItem label={t("credit_limit")} value={supplier?.credit_limit ? formatAmount(supplier.credit_limit) : "-"} />
                                <InfoItem label={t("payment_terms_days")} value={supplier?.payment_terms ? `${supplier.payment_terms} ${t("days")}` : "-"} />
                            </SimpleGrid>
                        </TabPanel>

                        <TabPanel px={0} pt={6}>
                            <Flex justify="flex-end" mb={4}>
                                <Button colorScheme="teal" size="sm" leftIcon={<AddIcon />} onClick={contactModal.onOpen}>{t("add_contact")}</Button>
                            </Flex>
                            <VStack align="stretch" spacing={3}>
                                {contacts.length === 0 && <Text color={colors.textMuted} fontSize="sm">{t("no_contacts_yet")}</Text>}
                                {contacts.map((c) => (
                                    <Flex key={c.id} align="center" justify="space-between" p={3} border="1px solid" borderColor={colors.borderDefault} borderRadius="lg" gap={3}>
                                        <HStack spacing={3}>
                                            <Avatar size="sm" name={c.name} />
                                            <Box>
                                                <HStack spacing={2}>
                                                    <Text fontWeight="600" fontSize="sm">{c.name}</Text>
                                                    {c.is_primary && <Badge colorScheme="teal" variant="subtle" fontSize="xs" borderRadius="full" px={2}>{t("primary")}</Badge>}
                                                </HStack>
                                                <Text fontSize="xs" color={colors.textMuted}>{c.designation} {c.email ? `| ${c.email}` : ""} {c.phone ? `| ${c.phone}` : ""}</Text>
                                            </Box>
                                        </HStack>
                                        <IconButton size="sm" variant="ghost" colorScheme="red" icon={<DeleteIcon />} aria-label={t("delete")} onClick={() => deleteContact(c.id)} />
                                    </Flex>
                                ))}
                            </VStack>
                        </TabPanel>

                        <TabPanel px={0} pt={6}>
                            <Flex justify="flex-end" mb={4}>
                                <Button colorScheme="teal" size="sm" leftIcon={<AddIcon />} onClick={documentModal.onOpen}>{t("upload_document")}</Button>
                            </Flex>
                            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                                {documents.length === 0 && <Text color={colors.textMuted} fontSize="sm">{t("no_documents_yet")}</Text>}
                                {documents.map((d) => (
                                    <Box key={d.id} p={4} border="1px solid" borderColor={colors.borderDefault} borderRadius="lg">
                                        <Flex justify="space-between" align="start" mb={1}>
                                            <Text fontWeight="600" fontSize="sm" noOfLines={1}>{d.title}</Text>
                                            <IconButton size="xs" variant="ghost" colorScheme="red" icon={<DeleteIcon />} aria-label={t("delete")} onClick={() => deleteDocument(d.id)} />
                                        </Flex>
                                        <Badge colorScheme="teal" variant="subtle" fontSize="xs" mb={2}>{d.document_type}</Badge>
                                        <Text fontSize="xs" color={colors.textMuted} noOfLines={1}>{d.file_name}</Text>
                                        {d.expiry_date && <Text fontSize="xs" color={colors.textMuted}>Exp: {d.expiry_date}</Text>}
                                        <Link href={`/${d.file_path}`} target="_blank" fontSize="sm" color="teal.500" mt={2} display="inline-flex" alignItems="center" gap={1}>
                                            <DownloadIcon boxSize={3} /> {t("download")}
                                        </Link>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </TabPanel>

                        <TabPanel px={0} pt={6}>
                            <Flex justify="flex-end" mb={4}>
                                <Button colorScheme="teal" size="sm" leftIcon={<AddIcon />} onClick={transactionModal.onOpen}>{t("add_transaction")}</Button>
                            </Flex>
                            <TanStackTable
                                columns={transactionColumns}
                                data={transactions.data}
                                pageIndex={transPageIndex}
                                pageSize={15}
                                setPageIndex={setTransPageIndex}
                                pageCount={Math.ceil(transactions.total / 15)}
                                totalItems={transactions.total}
                                isLoading={false}
                            />
                        </TabPanel>

                        <TabPanel px={0} pt={6}>
                            <Flex justify="flex-end" mb={4}>
                                <Button colorScheme="teal" size="sm" leftIcon={<StarIcon />} onClick={ratingModal.onOpen}>{t("rate_supplier")}</Button>
                            </Flex>
                            <VStack align="stretch" spacing={4}>
                                {(!supplier?.ratings || supplier.ratings.length === 0) && <Text color={colors.textMuted} fontSize="sm">{t("no_ratings_yet")}</Text>}
                                {supplier?.ratings?.map((r) => (
                                    <Box key={r.id} p={4} border="1px solid" borderColor={colors.borderDefault} borderRadius="lg">
                                        <Flex justify="space-between" align="center" mb={2}>
                                            <HStack spacing={3}>
                                                <Avatar size="sm" name={r.user?.name} />
                                                <Text fontWeight="600" fontSize="sm">{r.user?.name || t("user")}</Text>
                                            </HStack>
                                            <HStack spacing={2}>{renderStars(r.overall_rating)}</HStack>
                                        </Flex>
                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={2} mb={2}>
                                            <HStack spacing={2}><Text fontSize="xs" color={colors.textMuted}>{t("quality")}:</Text>{renderStars(r.quality_rating)}</HStack>
                                            <HStack spacing={2}><Text fontSize="xs" color={colors.textMuted}>{t("delivery")}:</Text>{renderStars(r.delivery_rating)}</HStack>
                                            <HStack spacing={2}><Text fontSize="xs" color={colors.textMuted}>{t("price")}:</Text>{renderStars(r.price_rating)}</HStack>
                                        </SimpleGrid>
                                        {r.comment && <Text fontSize="sm" color={colors.textSecondary}>{r.comment}</Text>}
                                    </Box>
                                ))}
                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>

            <Modal isOpen={contactModal.isOpen} onClose={contactModal.onClose}>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader>{t("add_contact")}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                         <VStack spacing={4} align="stretch">
                             <FormControl isRequired>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("name")}</FormLabel>
                                 <Input value={contactForm.name} onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 />
                             </FormControl>
                             <FormControl>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("designation")}</FormLabel>
                                 <Input value={contactForm.designation} onChange={(e) => setContactForm((f) => ({ ...f, designation: e.target.value }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 />
                             </FormControl>
                             <SimpleGrid columns={2} spacing={4}>
                                 <FormControl>
                                     <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("email")}</FormLabel>
                                     <Input type="email" value={contactForm.email} onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))} bg={colors.bgInput}
                                       borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                     />
                                 </FormControl>
                                 <FormControl>
                                     <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("phone")}</FormLabel>
                                     <Input value={contactForm.phone} onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))} bg={colors.bgInput}
                                       borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                     />
                                 </FormControl>
                             </SimpleGrid>
                             <FormControl>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("notes")}</FormLabel>
                                 <Textarea value={contactForm.notes} onChange={(e) => setContactForm((f) => ({ ...f, notes: e.target.value }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 />
                             </FormControl>
                         </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={contactModal.onClose}>{t("cancel")}</Button>
                        <Button colorScheme="teal" isLoading={isSubmitting} onClick={saveContact}>{t("save")}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={documentModal.isOpen} onClose={documentModal.onClose}>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader>{t("upload_document")}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                         <VStack spacing={4} align="stretch">
                             <FormControl isRequired>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("title")}</FormLabel>
                                 <Input value={documentForm.title} onChange={(e) => setDocumentForm((f) => ({ ...f, title: e.target.value }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 />
                             </FormControl>
                             <FormControl>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("document_type")}</FormLabel>
                                 <Select value={documentForm.document_type} onChange={(e) => setDocumentForm((f) => ({ ...f, document_type: e.target.value }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 >
                                     <option value="licence">licence</option>
                                     <option value="contract">contract</option>
                                     <option value="invoice">invoice</option>
                                     <option value="certificate">certificate</option>
                                     <option value="tax_document">tax_document</option>
                                     <option value="other">other</option>
                                 </Select>
                             </FormControl>
                             <SimpleGrid columns={2} spacing={4}>
                                 <FormControl>
                                     <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("issue_date")}</FormLabel>
                                     <Input type="date" value={documentForm.issue_date} onChange={(e) => setDocumentForm((f) => ({ ...f, issue_date: e.target.value }))} bg={colors.bgInput}
                                       borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                     />
                                 </FormControl>
                                 <FormControl>
                                     <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("expiry_date")}</FormLabel>
                                     <Input type="date" value={documentForm.expiry_date} onChange={(e) => setDocumentForm((f) => ({ ...f, expiry_date: e.target.value }))} bg={colors.bgInput}
                                       borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                     />
                                 </FormControl>
                             </SimpleGrid>
                             <FormControl>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("notes")}</FormLabel>
                                 <Textarea value={documentForm.notes} onChange={(e) => setDocumentForm((f) => ({ ...f, notes: e.target.value }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 />
                             </FormControl>
                             <FormControl isRequired>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("file")}</FormLabel>
                                 <Input type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.webp" onChange={(e) => setDocumentForm((f) => ({ ...f, file: e.target.files?.[0] || null }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 />
                             </FormControl>
                         </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={documentModal.onClose}>{t("cancel")}</Button>
                        <Button colorScheme="teal" isLoading={isSubmitting} onClick={saveDocument}>{t("upload")}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={transactionModal.isOpen} onClose={transactionModal.onClose}>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader>{t("add_transaction")}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                         <VStack spacing={4} align="stretch">
                             <FormControl isRequired>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("type")}</FormLabel>
                                 <Select value={transactionForm.type} onChange={(e) => setTransactionForm((f) => ({ ...f, type: e.target.value }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 >
                                     <option value="adjustment">adjustment</option>
                                     <option value="credit_note">credit_note</option>
                                     <option value="debit_note">debit_note</option>
                                 </Select>
                             </FormControl>
                             <SimpleGrid columns={2} spacing={4}>
                                 <FormControl>
                                     <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("debit")}</FormLabel>
                                     <Input type="number" min="0" step="0.01" value={transactionForm.debit} onChange={(e) => setTransactionForm((f) => ({ ...f, debit: e.target.value }))} bg={colors.bgInput}
                                       borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                     />
                                 </FormControl>
                                 <FormControl>
                                     <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("credit")}</FormLabel>
                                     <Input type="number" min="0" step="0.01" value={transactionForm.credit} onChange={(e) => setTransactionForm((f) => ({ ...f, credit: e.target.value }))} bg={colors.bgInput}
                                       borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                     />
                                 </FormControl>
                             </SimpleGrid>
                             <FormControl>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("date")}</FormLabel>
                                 <Input type="date" value={transactionForm.transaction_date} onChange={(e) => setTransactionForm((f) => ({ ...f, transaction_date: e.target.value }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 />
                             </FormControl>
                             <FormControl>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("description")}</FormLabel>
                                 <Textarea value={transactionForm.description} onChange={(e) => setTransactionForm((f) => ({ ...f, description: e.target.value }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 />
                             </FormControl>
                         </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={transactionModal.onClose}>{t("cancel")}</Button>
                        <Button colorScheme="teal" isLoading={isSubmitting} onClick={saveTransaction}>{t("save")}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={ratingModal.isOpen} onClose={ratingModal.onClose}>
                <ModalOverlay />
                <ModalContent bg={colors.bgCard}>
                    <ModalHeader>{t("rate_supplier")}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                         <VStack spacing={4} align="stretch">
                             <FormControl>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("quality")}</FormLabel>
                                 <Select value={ratingForm.quality_rating} onChange={(e) => setRatingForm((f) => ({ ...f, quality_rating: Number(e.target.value) }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 >
                                     {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
                                 </Select>
                             </FormControl>
                             <FormControl>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("delivery")}</FormLabel>
                                 <Select value={ratingForm.delivery_rating} onChange={(e) => setRatingForm((f) => ({ ...f, delivery_rating: Number(e.target.value) }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 >
                                     {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
                                 </Select>
                             </FormControl>
                             <FormControl>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("price")}</FormLabel>
                                 <Select value={ratingForm.price_rating} onChange={(e) => setRatingForm((f) => ({ ...f, price_rating: Number(e.target.value) }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 >
                                     {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
                                 </Select>
                             </FormControl>
                             <FormControl>
                                 <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("comment")}</FormLabel>
                                 <Textarea value={ratingForm.comment} onChange={(e) => setRatingForm((f) => ({ ...f, comment: e.target.value }))} bg={colors.bgInput}
                                   borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                                 />
                             </FormControl>
                         </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={ratingModal.onClose}>{t("cancel")}</Button>
                        <Button colorScheme="teal" isLoading={isSubmitting} onClick={saveRating}>{t("save")}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

function InfoItem({ label, value }) {
    const colors = useThemeColors();
    return (
        <Box>
            <Text fontSize="xs" color={colors.textMuted} mb={1}>{label}</Text>
            <Text fontSize="sm" fontWeight="500">{value || "-"}</Text>
        </Box>
    );
}
