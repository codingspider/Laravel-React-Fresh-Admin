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
    useColorMode,
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
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";

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

    const glassBg = isDark ? "rgba(26, 32, 44, 0.6)" : "rgba(255, 255, 255, 0.6)";
    const glassBorder = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.18)";
    const glassShadow = isDark ? "0 8px 32px rgba(0, 0, 0, 0.3)" : "0 8px 32px rgba(0, 0, 0, 0.06)";
    const headerBg = isDark ? "rgba(45,212,191,0.06)" : "rgba(45,212,191,0.12)";
    const rowHoverBg = isDark ? "rgba(45,212,191,0.06)" : "rgba(45,212,191,0.04)";
    const rowBorderColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
    const glassInputBg = isDark ? "rgba(26,32,44,0.5)" : "rgba(255,255,255,0.5)";
    const glassInputFocusBg = isDark ? "rgba(26,32,44,0.8)" : "rgba(255,255,255,0.8)";
    const glassInputBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(20,184,166,0.4)";
    const countBg = isDark ? "rgba(45,212,191,0.12)" : "rgba(45,212,191,0.08)";
    const countBorder = isDark ? "rgba(45,212,191,0.1)" : "rgba(45,212,191,0.15)";
    const emptyBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
    const hoverPill = isDark ? "rgba(45,212,191,0.1)" : "rgba(45,212,191,0.1)";
    const paginationContainerBg = isDark
        ? "linear-gradient(135deg, rgba(26,32,44,0.7) 0%, rgba(26,32,44,0.5) 100%)"
        : "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,253,250,0.6) 100%)";
    const paginationContainerBorder = isDark
        ? "rgba(45,212,191,0.08)"
        : "rgba(45,212,191,0.18)";

    return (
        <Box>
            {/* ── Header Bar ── */}
            <Flex
                mb={5}
                justifyContent="space-between"
                align="center"
                direction={{ base: "column", md: "row" }}
                gap={4}
            >
                <InputGroup maxW={{ base: "100%", md: "340px" }} size="lg">
                    <InputLeftElement pointerEvents="none">
                        <Icon as={Search} color="brand.400" boxSize={4.5} />
                    </InputLeftElement>
                    <Input
                        placeholder={searchPlaceholder}
                        value={globalFilter ?? ""}
                        onChange={(e) => handleSearch(e.target.value)}
                        borderRadius="2xl"
                        bg={glassInputBg}
                        border="1px solid"
                        borderColor={glassInputBorder}
                        backdropFilter="blur(12px)"
                        WebkitBackdropFilter="blur(12px)"
                        _placeholder={{ color: "gray.400", fontWeight: "400" }}
                        _focus={{
                            borderColor: "brand.400",
                            boxShadow: "0 0 0 3px rgba(45,212,191,0.15), 0 4px 16px rgba(0,0,0,0.04)",
                            bg: glassInputFocusBg,
                        }}
                        transition="all 0.25s ease"
                        fontWeight="500"
                        fontSize="sm"
                    />
                </InputGroup>

                <HStack spacing={3}>
                    {children}

                    {totalItems > 0 && (
                        <Box
                            px={3.5}
                            py={1.5}
                            borderRadius="full"
                            bg={countBg}
                            border="1px solid"
                            borderColor={countBorder}
                        >
                            <Text fontSize="xs" fontWeight="600" color="brand.600">
                                {totalItems} {t("items") || "items"}
                            </Text>
                        </Box>
                    )}
                    {hideAddBtn !== "true" && addURL && (
                        <Button
                            variant="primary"
                            leftIcon={<Icon as={Plus} boxSize={4} />}
                            as={ReactRouterLink}
                            to={addURL}
                            size="md"
                            borderRadius="2xl"
                            fontWeight="600"
                            px={6}
                            boxShadow="0 4px 14px rgba(13,148,136,0.25)"
                            _hover={{
                                boxShadow: "0 6px 20px rgba(13,148,136,0.35)",
                                transform: "translateY(-1px)",
                            }}
                            transition="all 0.2s ease"
                        >
                            {t("add_new")}
                        </Button>
                    )}
                </HStack>
            </Flex>

            {/* ── Table Glass Card ── */}
            <Box
                overflowX="auto"
                borderRadius="2xl"
                bg={glassBg}
                border="1px solid"
                borderColor={glassBorder}
                boxShadow={glassShadow}
                backdropFilter="blur(16px)"
                WebkitBackdropFilter="blur(16px)"
            >
                <Table variant="simple" size="sm">
                    <Thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id} bg={headerBg}>
                                {headerGroup.headers.map((header) => (
                                    <Th
                                        key={header.id}
                                        whiteSpace="nowrap"
                                        borderColor={rowBorderColor}
                                        fontSize="10px"
                                        fontWeight="700"
                                        color="gray.400"
                                        textTransform="uppercase"
                                        letterSpacing="0.1em"
                                        py={4}
                                        px={5}
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
                                    py={20}
                                    borderColor="transparent"
                                >
                                    <VStack spacing={5}>
                                        <Box
                                            w={16}
                                            h={16}
                                            borderRadius="2xl"
                                            bg={countBg}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Spinner size="lg" color="brand.400" thickness="3px" />
                                        </Box>
                                        <Text fontSize="sm" fontWeight="500" color="gray.400">
                                            {t("loading_data")}
                                        </Text>
                                    </VStack>
                                </Td>
                            </Tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <Tr>
                                <Td
                                    colSpan={columns.length}
                                    textAlign="center"
                                    py={20}
                                    borderColor="transparent"
                                >
                                    <VStack spacing={5} px={4}>
                                        <Box
                                            w={18}
                                            h={18}
                                            bg={emptyBg}
                                            borderRadius="2xl"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Icon as={Inbox} boxSize={8} color="gray.300" />
                                        </Box>
                                        <VStack spacing={1.5}>
                                            <Text fontSize="sm" fontWeight="600" color="gray.500">
                                                {t("no_data_found")}
                                            </Text>
                                            <Text fontSize="xs" color="gray.400" maxW="260px">
                                                {t("no_items_in_list")}
                                            </Text>
                                        </VStack>
                                        {addURL && hideAddBtn !== "true" && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                leftIcon={<Icon as={Plus} boxSize={3} />}
                                                as={ReactRouterLink}
                                                to={addURL}
                                                borderRadius="2xl"
                                                mt={2}
                                                boxShadow="0 4px 14px rgba(13,148,136,0.2)"
                                            >
                                                {t("add_new")}
                                            </Button>
                                        )}
                                    </VStack>
                                </Td>
                            </Tr>
                        ) : (
                            table.getRowModel().rows.map((row, rowIdx) => (
                                <Tr
                                    key={row.id}
                                    _hover={{ bg: rowHoverBg }}
                                    transition="all 0.2s ease"
                                    borderColor="transparent"
                                    borderBottom={
                                        rowIdx < table.getRowModel().rows.length - 1
                                            ? `1px solid ${rowBorderColor}`
                                            : "transparent"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <Td
                                            key={cell.id}
                                            borderColor="transparent"
                                            py={4}
                                            px={5}
                                            fontSize="sm"
                                            color={colors.textPrimary}
                                            fontWeight="400"
                                        >
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
                <Flex
                    justify="space-between"
                    align="center"
                    mt={5}
                    direction={{ base: "column", md: "row" }}
                    gap={4}
                >
                    <Text fontSize="sm" color="gray.400" fontWeight="500">
                        {t("page") || "Page"} {pageIndex + 1} {t("of") || "of"} {pageCount}
                    </Text>
                    <HStack
                        spacing={2}
                        p={2}
                        borderRadius="2xl"
                        bg={paginationContainerBg}
                        border="1px solid"
                        borderColor={paginationContainerBorder}
                        backdropFilter="blur(16px)"
                        WebkitBackdropFilter="blur(16px)"
                        boxShadow={isDark
                            ? "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)"
                            : "0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)"
                        }
                    >
                        {/* Prev controls */}
                        <HStack spacing={0.5} pr={2} borderRight="1px solid" borderColor={paginationContainerBorder}>
                            <Tooltip label="First" hasArrow placement="top">
                                <IconButton
                                    size="xs"
                                    onClick={() => setPageIndex(0)}
                                    isDisabled={!table.getCanPreviousPage()}
                                    icon={<Icon as={ChevronsLeft} boxSize={3.5} />}
                                    aria-label="First page"
                                    variant="ghost"
                                    borderRadius="lg"
                                    color="gray.400"
                                    minW="28px"
                                    h="28px"
                                    _hover={{ bg: hoverPill, color: "brand.500", transform: "scale(1.05)" }}
                                    _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
                                    transition="all 0.2s ease"
                                />
                            </Tooltip>
                            <Tooltip label="Previous" hasArrow placement="top">
                                <IconButton
                                    size="xs"
                                    onClick={() => setPageIndex(pageIndex - 1)}
                                    isDisabled={!table.getCanPreviousPage()}
                                    icon={<Icon as={ChevronLeft} boxSize={3.5} />}
                                    aria-label="Previous page"
                                    variant="ghost"
                                    borderRadius="lg"
                                    color="gray.400"
                                    minW="28px"
                                    h="28px"
                                    _hover={{ bg: hoverPill, color: "brand.500", transform: "scale(1.05)" }}
                                    _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
                                    transition="all 0.2s ease"
                                />
                            </Tooltip>
                        </HStack>

                        {/* Page numbers */}
                        <HStack spacing={1} px={1}>
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
                                        size="xs"
                                        onClick={() => setPageIndex(pageNum)}
                                        minW="32px"
                                        h="32px"
                                        borderRadius="lg"
                                        fontWeight={isActive ? "700" : "500"}
                                        fontSize="xs"
                                        bg={isActive ? (isDark ? "brand.400" : "brand.500") : "transparent"}
                                        color={isActive ? "white" : "gray.400"}
                                        boxShadow={
                                            isActive
                                                ? isDark
                                                    ? "0 2px 10px rgba(45,212,191,0.35), 0 0 0 1px rgba(45,212,191,0.2)"
                                                    : "0 2px 10px rgba(13,148,136,0.25), 0 0 0 1px rgba(13,148,136,0.15)"
                                                : "none"
                                        }
                                        _hover={
                                            !isActive
                                                ? {
                                                    bg: hoverPill,
                                                    color: "brand.500",
                                                    transform: "scale(1.08)",
                                                }
                                                : {
                                                    transform: "scale(1.05)",
                                                }
                                        }
                                        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                    >
                                        {pageNum + 1}
                                    </Button>
                                );
                            })}
                        </HStack>

                        {/* Next controls */}
                        <HStack spacing={0.5} pl={2} borderLeft="1px solid" borderColor={paginationContainerBorder}>
                            <Tooltip label="Next" hasArrow placement="top">
                                <IconButton
                                    size="xs"
                                    onClick={() => setPageIndex(pageIndex + 1)}
                                    isDisabled={!table.getCanNextPage()}
                                    icon={<Icon as={ChevronRight} boxSize={3.5} />}
                                    aria-label="Next page"
                                    variant="ghost"
                                    borderRadius="lg"
                                    color="gray.400"
                                    minW="28px"
                                    h="28px"
                                    _hover={{ bg: hoverPill, color: "brand.500", transform: "scale(1.05)" }}
                                    _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
                                    transition="all 0.2s ease"
                                />
                            </Tooltip>
                            <Tooltip label="Last" hasArrow placement="top">
                                <IconButton
                                    size="xs"
                                    onClick={() => setPageIndex(pageCount - 1)}
                                    isDisabled={!table.getCanNextPage()}
                                    icon={<Icon as={ChevronsRight} boxSize={3.5} />}
                                    aria-label="Last page"
                                    variant="ghost"
                                    borderRadius="lg"
                                    color="gray.400"
                                    minW="28px"
                                    h="28px"
                                    _hover={{ bg: hoverPill, color: "brand.500", transform: "scale(1.05)" }}
                                    _disabled={{ opacity: 0.3, cursor: "not-allowed" }}
                                    transition="all 0.2s ease"
                                />
                            </Tooltip>
                        </HStack>
                    </HStack>
                </Flex>
            )}
        </Box>
    );
}
