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
    IconButton,
    Tooltip,
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
    ChevronsLeft,
    ChevronsRight,
    Inbox,
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
            {/* ── Toolbar ── */}
            <Flex mb={4} justify="space-between" align="center" wrap="wrap" gap={3}>
                <HStack spacing={3} flex="1" minW={{ base: "100%", md: "auto" }}>
                    <InputGroup maxW={{ base: "100%", md: "280px" }} size="sm" flex="1">
                        <InputLeftElement pointerEvents="none">
                            <Icon as={Search} color="gray.400" boxSize={4} />
                        </InputLeftElement>
                        <Input
                            placeholder={searchPlaceholder}
                            value={globalFilter ?? ""}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </InputGroup>
                    {children}
                </HStack>

                <HStack spacing={3} flexShrink={0}>
                    {totalItems > 0 && (
                        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                            {totalItems} {t("items") || "items"}
                        </Text>
                    )}
                    {hideAddBtn !== "true" && addURL && (
                        <Button
                            as={ReactRouterLink}
                            to={addURL}
                            leftIcon={<Icon as={Plus} boxSize={4} />}
                            colorScheme="teal"
                            size="sm"
                            whiteSpace="nowrap"
                        >
                            {t("add_new")}
                        </Button>
                    )}
                </HStack>
            </Flex>

            {/* ── Table ── */}
            <Box overflowX="auto">
                <Table variant="simple" size="sm" whiteSpace="nowrap">
                    <Thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Th key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
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
                                <Td colSpan={columns.length} textAlign="center" py={10}>
                                    <Spinner size="md" color="teal.500" />
                                </Td>
                            </Tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <Tr>
                                <Td colSpan={columns.length} textAlign="center" py={10}>
                                    <VStack spacing={2}>
                                        <Icon as={Inbox} boxSize={8} color="gray.300" />
                                        <Text fontSize="sm" color="gray.500">{t("no_data_found")}</Text>
                                        {addURL && hideAddBtn !== "true" && (
                                            <Button
                                                as={ReactRouterLink}
                                                to={addURL}
                                                leftIcon={<Icon as={Plus} boxSize={3} />}
                                                colorScheme="teal"
                                                size="sm"
                                                mt={2}
                                            >
                                                {t("add_new")}
                                            </Button>
                                        )}
                                    </VStack>
                                </Td>
                            </Tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <Td key={cell.id}>
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

            {/* ── Pagination ── */}
            {pageCount > 1 && (
                <Flex justify="space-between" align="center" mt={4} direction={{ base: "column", md: "row" }} gap={3}>
                    <Text fontSize="sm" color="gray.500">
                        {t("page") || "Page"} {pageIndex + 1} {t("of") || "of"} {pageCount}
                    </Text>
                    <HStack spacing={1}>
                        <Tooltip label="First" hasArrow>
                            <IconButton
                                size="sm"
                                onClick={() => setPageIndex(0)}
                                isDisabled={!table.getCanPreviousPage()}
                                icon={<Icon as={ChevronsLeft} boxSize={4} />}
                                aria-label="First page"
                                variant="outline"
                            />
                        </Tooltip>
                        <Tooltip label="Previous" hasArrow>
                            <IconButton
                                size="sm"
                                onClick={() => setPageIndex(pageIndex - 1)}
                                isDisabled={!table.getCanPreviousPage()}
                                icon={<Icon as={ChevronLeft} boxSize={4} />}
                                aria-label="Previous page"
                                variant="outline"
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
                            const isActive = pageIndex === pageNum;
                            return (
                                <Button
                                    key={pageNum}
                                    size="sm"
                                    onClick={() => setPageIndex(pageNum)}
                                    minW="36px"
                                    variant={isActive ? "solid" : "outline"}
                                    colorScheme={isActive ? "teal" : "gray"}
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
                                variant="outline"
                            />
                        </Tooltip>
                        <Tooltip label="Last" hasArrow>
                            <IconButton
                                size="sm"
                                onClick={() => setPageIndex(pageCount - 1)}
                                isDisabled={!table.getCanNextPage()}
                                icon={<Icon as={ChevronsRight} boxSize={4} />}
                                aria-label="Last page"
                                variant="outline"
                            />
                        </Tooltip>
                    </HStack>
                </Flex>
            )}
        </Box>
    );
}
