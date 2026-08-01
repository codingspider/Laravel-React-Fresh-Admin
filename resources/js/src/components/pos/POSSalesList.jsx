import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    useToast,
    Icon,
    IconButton,
    Text,
    Badge,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Select,
    NumberInput,
    NumberInputField,
    Textarea,
    VStack,
    FormControl,
    FormLabel,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Flex,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal, RotateCw } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../axios";
import TanStackTable from "../../TanStackTable";
import PageHeader from "../ui/PageHeader";
import TableExportButtons from "../ui/TableExportButtons";
import { LIST_POS_SALES, POS_REFUND } from "../../routes/apiRoutes";
import useThemeColors from "../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../useCurrencyFormatter";

const statusColors = {
    pending: "yellow",
    confirmed: "blue",
    preparing: "orange",
    completed: "green",
    cancelled: "red",
    refunded: "purple",
};

const paymentColors = {
    unpaid: "red",
    partial: "yellow",
    paid: "green",
    refunded: "purple",
};

export default function POSSalesList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(15);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("");
    const [refundSale, setRefundSale] = useState(null);
    const [refundAmount, setRefundAmount] = useState("");
    const [refundMethod, setRefundMethod] = useState("cash");
    const [refundReason, setRefundReason] = useState("");
    const [refundNotes, setRefundNotes] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_POS_SALES, {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: globalFilter || "",
                    status: statusFilter || "",
                    payment_status: paymentFilter || "",
                },
            });
            const items = res.data?.data?.data || res.data?.data || [];
            const total = res.data?.meta?.total || res.data?.data?.total || items.length;
            setData(items);
            setPageCount(Math.ceil(total / pageSize));
            setTotalItems(total);
        } catch (err) {
            console.error("fetchData error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [pageIndex, globalFilter, pageSize, statusFilter, paymentFilter]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | POS Sales`;
        fetchData();
    }, [fetchData]);

    const handleRefundOpen = (sale) => {
        setRefundSale(sale);
        const maxRefund = (parseFloat(sale.total) || 0) - (parseFloat(sale.refunded_amount) || 0);
        setRefundAmount(String(Math.max(0, maxRefund).toFixed(2)));
        setRefundMethod("cash");
        setRefundReason("");
        setRefundNotes("");
        onOpen();
    };

    const handleRefundSubmit = async () => {
        if (!refundSale) return;
        const amount = parseFloat(refundAmount);
        const maxRefund = (parseFloat(refundSale.total) || 0) - (parseFloat(refundSale.refunded_amount) || 0);
        if (isNaN(amount) || amount <= 0 || amount > maxRefund) {
            toast({
                position: "top-right",
                title: t("invalid_amount"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        try {
            await api.post(POS_REFUND(refundSale.id), {
                amount,
                method: refundMethod,
                reason: refundReason,
                notes: refundNotes,
            });
            toast({
                position: "top-right",
                title: t("refund_processed_successfully"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
            fetchData();
        } catch (error) {
            toast({
                position: "top-right",
                title: t("error_processing_refund"),
                description: error.response?.data?.message || t("something_went_wrong"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const columns = [
        {
            header: "#",
            cell: ({ row }) => (
                <Text fontSize="sm" fontWeight="500" color="gray.500">
                    {row.index + 1}
                </Text>
            ),
        },
        {
            header: t("invoice"),
            accessorKey: "invoice_number",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600" fontFamily="mono">
                    {getValue() || "-"}
                </Text>
            ),
        },
        {
            header: t("order_type"),
            accessorKey: "order_type",
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <Badge
                        colorScheme={val === "dine_in" ? "blue" : val === "takeaway" ? "orange" : "purple"}
                        variant="subtle"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="capitalize"
                    >
                        {t(val || "unknown")}
                    </Badge>
                );
            },
        },
        {
            header: t("status"),
            accessorKey: "status",
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <Badge
                        colorScheme={statusColors[val] || "gray"}
                        variant="subtle"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="capitalize"
                    >
                        {t(val)}
                    </Badge>
                );
            },
        },
        {
            header: t("payment_status"),
            accessorKey: "payment_status",
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <Badge
                        colorScheme={paymentColors[val] || "gray"}
                        variant="subtle"
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="capitalize"
                    >
                        {t(val)}
                    </Badge>
                );
            },
        },
        {
            header: t("total"),
            accessorKey: "total",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600">
                    {formatAmount(getValue())}
                </Text>
            ),
        },
        {
            header: t("paid"),
            accessorKey: "amount_paid",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{formatAmount(getValue())}</Text>
            ),
        },
        {
            header: t("refunded"),
            accessorKey: "refunded_amount",
            cell: ({ getValue }) => {
                const val = parseFloat(getValue()) || 0;
                return val > 0 ? (
                    <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
                        {formatAmount(val)}
                    </Badge>
                ) : (
                    <Text fontSize="sm" color="gray.400">-</Text>
                );
            },
        },
        {
            header: t("date"),
            accessorKey: "created_at",
            cell: ({ getValue }) => {
                const val = getValue();
                if (!val) return <Text fontSize="sm">-</Text>;
                const d = new Date(val);
                return (
                    <Text fontSize="sm">
                        {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                );
            },
        },
        {
            header: t("actions"),
            cell: ({ row }) => {
                const sale = row.original;
                const maxRefund = (parseFloat(sale.total) || 0) - (parseFloat(sale.refunded_amount) || 0);
                const canRefund = sale.payment_status !== "unpaid" && maxRefund > 0 && !["cancelled", "refunded"].includes(sale.status);
                return (
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            icon={<Icon as={MoreHorizontal} boxSize={4} />}
                            variant="ghost"
                            size="sm"
                            borderRadius="lg"
                            aria-label={t("actions")}
                        />
                        <MenuList minW="140px" p={1.5}>
                            <MenuItem
                                icon={<Icon as={ViewIcon} boxSize={4} />}
                                borderRadius="md"
                                fontSize="sm"
                                onClick={() => navigate("/pos/sales/view/" + sale.id)}
                            >
                                {t("view")}
                            </MenuItem>
                            {canRefund && (
                                <MenuItem
                                    icon={<Icon as={RotateCw} boxSize={4} />}
                                    borderRadius="md"
                                    fontSize="sm"
                                    color="orange.500"
                                    _hover={{ bg: "orange.50", _dark: { bg: "orange.900" } }}
                                    onClick={() => handleRefundOpen(sale)}
                                >
                                    {t("refund")}
                                </MenuItem>
                            )}
                        </MenuList>
                    </Menu>
                );
            },
        },
    ];

    return (
        <Box>
            <PageHeader
                title={t("pos_sales")}
                subtitle={t("manage_pos_sales")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("pos_sales"), isCurrent: true },
                ]}
            >
                <TableExportButtons data={data} columns={columns} filename="pos-sales" />
            </PageHeader>

            <Box
                bg={colors.bgCard}
                p={{ base: 4, md: 6 }}
                borderRadius="xl"
                boxShadow="card"
                border="1px solid"
                borderColor={colors.borderDefault}
            >
                <TanStackTable
                    columns={columns}
                    data={data}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    setPageIndex={setPageIndex}
                    pageCount={pageCount}
                    isLoading={isLoading}
                    totalItems={totalItems}
                >
                    <Select
                        maxW="160px"
                        size="md"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("all_status")}
                        borderRadius="lg"
                    >
                        {Object.keys(statusColors).map((s) => (
                            <option key={s} value={s}>{t(s)}</option>
                        ))}
                    </Select>
                    <Select
                        maxW="160px"
                        size="md"
                        value={paymentFilter}
                        onChange={(e) => { setPaymentFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("all_payment")}
                        borderRadius="lg"
                    >
                        {Object.keys(paymentColors).map((s) => (
                            <option key={s} value={s}>{t(s)}</option>
                        ))}
                    </Select>
                </TanStackTable>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader borderBottom="1px solid" borderColor={colors.borderDefault}>
                        {t("process_refund")}
                    </ModalHeader>
                    <ModalBody py={6}>
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <Text fontSize="sm" fontWeight="600" color={colors.textSecondary}>
                                    {t("invoice")}: {refundSale?.invoice_number}
                                </Text>
                                <Text fontSize="sm" color={colors.textSecondary}>
                                    {t("total")}: {formatAmount(refundSale?.total)} | {t("already_refunded")}: {formatAmount(refundSale?.refunded_amount)}
                                </Text>
                            </Box>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="600" color={colors.textPrimary}>{t("refund_amount")}</FormLabel>
                                <NumberInput
                                    value={refundAmount}
                                    onChange={setRefundAmount}
                                    min={0.01}
                                    max={parseFloat(refundSale?.total || 0) - parseFloat(refundSale?.refunded_amount || 0)}
                                    precision={2}
                                >
                                    <NumberInputField bg={colors.bgInput} borderColor={colors.borderInput} borderRadius="lg" />
                                </NumberInput>
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="600" color={colors.textPrimary}>{t("method")}</FormLabel>
                                <Select
                                    value={refundMethod}
                                    onChange={(e) => setRefundMethod(e.target.value)}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                >
                                    <option value="cash">{t("cash")}</option>
                                    <option value="card">{t("card")}</option>
                                    <option value="upi_online">{t("upi_online")}</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="600" color={colors.textPrimary}>{t("reason")}</FormLabel>
                                <Textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                    rows={2}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="600" color={colors.textPrimary}>{t("notes")}</FormLabel>
                                <Textarea
                                    value={refundNotes}
                                    onChange={(e) => setRefundNotes(e.target.value)}
                                    bg={colors.bgInput}
                                    borderColor={colors.borderInput}
                                    borderRadius="lg"
                                    rows={2}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTop="1px solid" borderColor={colors.borderDefault}>
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">{t("cancel")}</Button>
                        <Button
                            colorScheme="red"
                            onClick={handleRefundSubmit}
                            borderRadius="lg"
                            fontWeight="600"
                        >
                            {t("process_refund")}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
