import React, { useState } from "react";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Button,
    Box,
    Spinner,
    Text,
    Icon,
    HStack,
    VStack,
    Badge,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Tooltip,
    Select,
} from "@chakra-ui/react";
import useThemeColors from "./hooks/useThemeColors";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Link as ReactRouterLink } from "react-router-dom";
import {
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Edit,
    Trash2,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

function fuzzyGlobalFilter(row, columnId, filterValue) {
    if (!filterValue) return true;
    const search = filterValue.toLowerCase();
    if (columnId === "actions") return true;
    const value = row.getValue(columnId);
    if (value == null) return false;
    return String(value).toLowerCase().includes(search);
}

export default function TanStackTable({
    columns,
    data,
    pageIndex,
    pageSize,
    setPageIndex,
    pageCount,
    isLoading,
    addURL,
    hideAddBtn = "false",
    title,
    onSearch,
    searchPlaceholder = "Search...",
    totalItems = 0,
    children,
}) {
    const [globalFilter, setGlobalFilter] = useState("");
    const colors = useThemeColors();

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: (updater) =>
            setPageIndex(
                typeof updater === "function"
                    ? updater({ pageIndex }).pageIndex
                    : updater.pageIndex
            ),
        manualPagination: true,
        pageCount,
        globalFilterFn: fuzzyGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const { t } = useTranslation();

    const handleSearch = (value) => {
        setGlobalFilter(value);
        if (onSearch) onSearch(value);
    };

    return (
        <Box>
            <Flex
                mb={4}
                justifyContent="space-between"
                align="center"
                direction={{ base: "column", md: "row" }}
                gap={3}
            >
                <InputGroup maxW={{ base: "100%", md: "280px" }} size="md">
                    <InputLeftElement pointerEvents="none">
                        <Icon as={Search} color="gray.400" boxSize={4} />
                    </InputLeftElement>
                    <Input
                        placeholder={searchPlaceholder}
                        value={globalFilter ?? ""}
                        onChange={(e) => handleSearch(e.target.value)}
                        borderRadius="lg"
                        bg={colors.bgSubtle}
                        _placeholder={{ color: "gray.400" }}
                    />
                </InputGroup>

                {children}

                <HStack spacing={3}>
                    <Text fontSize="sm" color="gray.500" display={{ base: "none", md: "block" }}>
                        {totalItems > 0 ? `${totalItems} items` : ""}
                    </Text>
                    {hideAddBtn !== "true" && addURL && (
                        <Button
                            variant="primary"
                            leftIcon={<Icon as={Plus} boxSize={4} />}
                            as={ReactRouterLink}
                            to={addURL}
                            size="md"
                        >
                            {t("add_new")}
                        </Button>
                    )}
                </HStack>
            </Flex>

            <Box overflowX="auto" borderRadius="lg" border="1px solid" borderColor={colors.borderDefault}>
                <Table variant="simple" size="sm">
                    <Thead bg={colors.bgSubtle}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Th
                                        key={header.id}
                                        whiteSpace="nowrap"
                                        borderColor={colors.borderDefault}
                                        fontSize="xs"
                                        fontWeight="600"
                                        color="gray.500"
                                        py={3}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </Thead>
                    <Tbody>
                        {isLoading ? (
                            <Tr>
                                <Td
                                    colSpan={columns.length}
                                    textAlign="center"
                                    py={12}
                                    borderColor={colors.borderDefault}
                                >
                                    <VStack spacing={3}>
                                        <Spinner size="lg" color="brand.500" />
                                        <Text fontSize="sm" color="gray.500">
                                            Loading...
                                        </Text>
                                    </VStack>
                                </Td>
                            </Tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <Tr>
                                <Td
                                    colSpan={columns.length}
                                    textAlign="center"
                                    py={12}
                                    borderColor={colors.borderDefault}
                                >
                                    <VStack spacing={2}>
                                        <Text fontSize="sm" color="gray.500">
                                            No data found
                                        </Text>
                                    </VStack>
                                </Td>
                            </Tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <Tr
                                    key={row.id}
                                    _hover={{ bg: colors.bgHover }}
                                    transition="background 0.15s ease"
                                    borderColor={colors.borderDefault}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <Td key={cell.id} borderColor={colors.borderDefault} py={3}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </Td>
                                    ))}
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </Table>
            </Box>

            {pageCount > 1 && (
                <Flex
                    justify="space-between"
                    align="center"
                    mt={4}
                    pt={4}
                    borderTop="1px solid"
                    borderColor={colors.borderDefault}
                    direction={{ base: "column", md: "row" }}
                    gap={3}
                >
                    <Text fontSize="sm" color="gray.500">
                        Page {pageIndex + 1} of {pageCount}
                    </Text>
                    <HStack spacing={1}>
                        <Tooltip label="First page" hasArrow>
                            <IconButton
                                size="sm"
                                onClick={() => setPageIndex(0)}
                                isDisabled={!table.getCanPreviousPage()}
                                icon={<Icon as={ChevronsLeft} boxSize={4} />}
                                aria-label="First page"
                                variant="ghost"
                                borderRadius="lg"
                            />
                        </Tooltip>
                        <Tooltip label="Previous" hasArrow>
                            <IconButton
                                size="sm"
                                onClick={() => setPageIndex(pageIndex - 1)}
                                isDisabled={!table.getCanPreviousPage()}
                                icon={<Icon as={ChevronLeft} boxSize={4} />}
                                aria-label="Previous page"
                                variant="ghost"
                                borderRadius="lg"
                            />
                        </Tooltip>

                        {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                            let pageNum;
                            if (pageCount <= 5) {
                                pageNum = i;
                            } else if (pageIndex < 3) {
                                pageNum = i;
                            } else if (pageIndex > pageCount - 4) {
                                pageNum = pageCount - 5 + i;
                            } else {
                                pageNum = pageIndex - 2 + i;
                            }
                            return (
                                <Button
                                    key={pageNum}
                                    size="sm"
                                    onClick={() => setPageIndex(pageNum)}
                                    variant={pageIndex === pageNum ? "primary" : "ghost"}
                                    minW="36px"
                                    borderRadius="lg"
                                >
                                    {pageNum + 1}
                                </Button>
                            );
                        })}

                        <Tooltip label="Next" hasArrow>
                            <IconButton
                                size="sm"
                                onClick={() => setPageIndex(pageIndex + 1)}
                                isDisabled={!table.getCanNextPage()}
                                icon={<Icon as={ChevronRight} boxSize={4} />}
                                aria-label="Next page"
                                variant="ghost"
                                borderRadius="lg"
                            />
                        </Tooltip>
                        <Tooltip label="Last page" hasArrow>
                            <IconButton
                                size="sm"
                                onClick={() => setPageIndex(pageCount - 1)}
                                isDisabled={!table.getCanNextPage()}
                                icon={<Icon as={ChevronsRight} boxSize={4} />}
                                aria-label="Last page"
                                variant="ghost"
                                borderRadius="lg"
                            />
                        </Tooltip>
                    </HStack>
                </Flex>
            )}
        </Box>
    );
}
