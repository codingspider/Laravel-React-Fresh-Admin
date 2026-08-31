import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    useToast,
    useDisclosure,
    Icon,
    IconButton,
    Text,
    Image,
    Badge,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
    Checkbox,
    FormControl,
    FormLabel,
    Select,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { MoreHorizontal, Copy } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../axios";
import TanStackTable from "../../TanStackTable";
import PageHeader from "../ui/PageHeader";
import TableExportButtons from "../ui/TableExportButtons";
import { LIST_MENU_ITEM, DELETE_MENU_ITEM, BRANCH_OPTIONS, ASSIGN_MENU_ITEM_BRANCH } from "../../routes/apiRoutes";
import useThemeColors from "../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../useCurrencyFormatter";
import BranchFilter from "../../../src/components/ui/BranchFilter";

export default function MenuItemList() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize] = useState(10);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [branches, setBranches] = useState([]);
    const [branchFilter, setBranchFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [targetBranchId, setTargetBranchId] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const colors = useThemeColors();
    const { formatAmount } = useCurrencyFormatter();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get(LIST_MENU_ITEM, {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: globalFilter || "",
                    branch_id: branchFilter || "",
                    status: statusFilter || "",
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
    }, [pageIndex, globalFilter, pageSize, branchFilter, statusFilter]);

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Menu Item Management`;
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await api.get(BRANCH_OPTIONS);
                const items = res.data?.data?.data || res.data?.data || [];
                setBranches(items);
            } catch (err) {
                console.error("fetchBranches error:", err);
            }
        };
        fetchBranches();
    }, []);

    const deleteItem = async (id) => {
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
            customClass: { popup: "swal-popup" },
        });

        if (result.isConfirmed) {
            try {
                await api.delete(DELETE_MENU_ITEM(id));
                toast({
                    title: t("data_deleted_successfully"),
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchData();
            } catch (error) {
                toast({
                    title: t("error_deleting_data"),
                    description: error.response?.data?.message || t("something_went_wrong"),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const pageIds = data.map((item) => item.id);
        const allSelected = pageIds.every((id) => selectedIds.includes(id));
        setSelectedIds((prev) =>
            allSelected ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])]
        );
    };

    const openAssignModal = (ids) => {
        setSelectedIds(ids);
        setTargetBranchId("");
        onOpen();
    };

    const assignToBranch = async () => {
        if (!targetBranchId || selectedIds.length === 0) return;
        try {
            setIsAssigning(true);
            const res = await api.post(ASSIGN_MENU_ITEM_BRANCH, {
                item_ids: selectedIds,
                branch_id: targetBranchId,
            });
            toast({
                title: res.data?.message || t("assign_to_branch"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setSelectedIds([]);
            onClose();
            fetchData();
        } catch (error) {
            toast({
                title: t("error_assigning_branch"),
                description: error.response?.data?.message || t("something_went_wrong"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsAssigning(false);
        }
    };

    const columns = [
        {
            id: "select",
            header: () => (
                <Checkbox
                    isChecked={data.length > 0 && data.every((item) => selectedIds.includes(item.id))}
                    onChange={toggleSelectAll}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    isChecked={selectedIds.includes(row.original.id)}
                    onChange={() => toggleSelect(row.original.id)}
                />
            ),
        },
        {
            header: "#",
            cell: ({ row }) => (
                <Text fontSize="sm" fontWeight="500" color="gray.500">
                    {row.index + 1 + pageIndex * pageSize}
                </Text>
            ),
        },
        {
            header: t("item"),
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <Flex align="center" gap={3}>
                        {item.image_url ? (
                            <Image src={item.image_url} alt="" boxSize="40px" borderRadius="md" objectFit="cover" />
                        ) : (
                            <Box boxSize="40px" borderRadius="md" bg="gray.100" _dark={{ bg: "gray.700" }} />
                        )}
                        <Box>
                            <Flex align="center" gap={1.5}>
                                <Text fontSize="sm" fontWeight="600">{item.name}</Text>
                                {item.is_vegetarian ? (
                                    <Badge colorScheme="green" variant="subtle" fontSize="xs" borderRadius="full" px={1.5}>V</Badge>
                                ) : null}
                                {item.is_vegan ? (
                                    <Badge colorScheme="teal" variant="subtle" fontSize="xs" borderRadius="full" px={1.5}>VG</Badge>
                                ) : null}
                                {item.is_featured ? (
                                    <Badge colorScheme="yellow" variant="subtle" fontSize="xs" borderRadius="full" px={1.5}>★</Badge>
                                ) : null}
                            </Flex>
                        </Box>
                    </Flex>
                );
            },
        },
        {
            header: t("category"),
            cell: ({ row }) => (
                <Text fontSize="sm">{row.original.category?.name || "-"}</Text>
            ),
        },
        {
            header: t("branch"),
            cell: ({ row }) => (
                <Text fontSize="sm">{row.original.branch || "-"}</Text>
            ),
        },
        {
            header: t("price"),
            accessorKey: "price",
            cell: ({ getValue }) => (
                <Text fontSize="sm" fontWeight="600">
                    {formatAmount(getValue())}
                </Text>
            ),
        },
        {
            header: t("prep_time"),
            accessorKey: "preparation_time",
            cell: ({ getValue }) => (
                <Text fontSize="sm">{getValue() ? `${getValue()}m` : "-"}</Text>
            ),
        },
        {
            header: t("status"),
            accessorKey: "status",
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <Badge
                        colorScheme={val === "available" ? "green" : val === "unavailable" ? "red" : "gray"}
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
            header: t("actions"),
            cell: ({ row }) => (
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
                            onClick={() => navigate(`/menu/item/view/${row.original.id}`)}
                        >
                            {t("view")}
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={EditIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => navigate(`/menu/item/edit/${row.original.id}`, { state: { item: row.original } })}
                        >
                            {t("edit")}
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={Copy} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            onClick={() => openAssignModal([row.original.id])}
                        >
                            {t("assign_to_branch")}
                        </MenuItem>
                        <MenuItem
                            icon={<Icon as={DeleteIcon} boxSize={4} />}
                            borderRadius="md"
                            fontSize="sm"
                            color="red.500"
                            _hover={{ bg: "red.50", _dark: { bg: "red.900" } }}
                            onClick={() => deleteItem(row.original.id)}
                        >
                            {t("delete")}
                        </MenuItem>
                    </MenuList>
                </Menu>
            ),
        },
    ];

    return (
        <Box>
            <PageHeader
                title={t("menu_item_management")}
                subtitle={t("manage_all_menu_items")}
                breadcrumbs={[
                    { label: t("dashboard"), path: "/dashboard" },
                    { label: t("menu_items"), isCurrent: true },
                ]}
                action="/menu/item/create"
                actionLabel={t("add_menu_item")}
            >
                <Flex gap={2}>
                    {selectedIds.length > 0 && (
                        <Button
                            variant="primary"
                            leftIcon={<Icon as={Copy} boxSize={4} />}
                            onClick={() => openAssignModal(selectedIds)}
                        >
                            {t("assign_to_branch")} ({selectedIds.length})
                        </Button>
                    )}
                    <TableExportButtons data={data} columns={columns} filename="menu-items" />
                </Flex>
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
                    addURL="/menu/item/create"
                    totalItems={totalItems}
                    hideAddBtn="true"
                >
                    <BranchFilter value={branchFilter} onChange={setBranchFilter} />
                    <Select
                        maxW="170px"
                        size="md"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }}
                        placeholder={t("all_status")}
                        borderRadius="lg"
                    >
                        <option value="active">{t("active")}</option>
                        <option value="inactive">{t("inactive")}</option>
                    </Select>
                </TanStackTable>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t("assign_to_branch")}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontSize="sm" color="gray.500" mb={4}>
                            {t("selected_items")}: {selectedIds.length}
                        </Text>
                        <FormControl>
                            <FormLabel>{t("target_branch")}</FormLabel>
                            <Select
                                placeholder={t("select_branch")}
                                value={targetBranchId}
                                onChange={(e) => setTargetBranchId(e.target.value)}
                            >
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter gap={2}>
                        <Button variant="ghost" onClick={onClose}>
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            isLoading={isAssigning}
                            isDisabled={!targetBranchId}
                            onClick={assignToBranch}
                        >
                            {t("assign")}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
