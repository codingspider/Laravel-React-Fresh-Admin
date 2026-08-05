import React, { useState, useEffect, useRef } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Text,
    Box,
    Spinner,
    useToast,
    useColorModeValue,
    IconButton,
    Tooltip,
    Image,
    Icon,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { DownloadIcon, RepeatIcon, CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { Printer } from "lucide-react";
import api from "../../axios";
import { TABLE_QR_CODE, REGENERATE_TABLE_QR } from "../../routes/apiRoutes";

export default function QRCodeModal({ isOpen, onClose, table }) {
    const { t } = useTranslation();
    const toast = useToast();
    const printRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [qrData, setQrData] = useState(null);

    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    useEffect(() => {
        if (isOpen && table) {
            fetchQrCode();
        }
    }, [isOpen, table]);

    const fetchQrCode = async () => {
        setLoading(true);
        try {
            const res = await api.get(TABLE_QR_CODE(table.id));
            setQrData(res.data?.data || res.data);
        } catch (err) {
            toast({
                title: t("error_loading_qr_code"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const res = await api.put(REGENERATE_TABLE_QR(table.id));
            setQrData(res.data?.data || res.data);
            toast({
                title: t("qr_code_regenerated"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: t("error_regenerating_qr_code"),
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setRegenerating(false);
        }
    };

    const handleDownload = () => {
        if (!qrData?.qr_image) return;
        const url = `/${qrData.qr_image}`;
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-table-${table.name || table.id}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleCopyUrl = () => {
        if (!qrData?.qr_code_url) return;
        navigator.clipboard.writeText(qrData.qr_code_url).then(() => {
            toast({
                title: t("url_copied"),
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        });
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank", "width=400,height=500");
        const qrImageUrl = qrData?.qr_image ? `/${qrData.qr_image}` : null;
        const tableLabel = table?.name || "";
        const restaurantName = qrData?.qr_url ? "Restaurant" : "";
        const orderUrl = qrData?.qr_code_url || "";

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - ${tableLabel}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    .qr-card {
                        text-align: center;
                        padding: 30px;
                        border: 2px dashed #ccc;
                        border-radius: 12px;
                        max-width: 300px;
                    }
                    .qr-image {
                        width: 200px;
                        height: 200px;
                        margin: 0 auto 15px;
                    }
                    .qr-image img {
                        width: 100%;
                        height: 100%;
                    }
                    .table-name {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                    .scan-text {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 5px;
                    }
                    .order-url {
                        font-size: 10px;
                        color: #999;
                        word-break: break-all;
                    }
                    @media print {
                        body { padding: 0; }
                        .qr-card { border: 2px dashed #ccc; }
                    }
                </style>
            </head>
            <body>
                <div class="qr-card">
                    <div class="qr-image">
                        ${qrImageUrl ? `<img src="${qrImageUrl}" alt="QR Code" />` : `<p>QR Code</p>`}
                    </div>
                    <div class="table-name">${tableLabel}</div>
                    <div class="scan-text">Scan to order</div>
                    <div class="order-url">${orderUrl}</div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() { window.print(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const qrImageUrl = qrData?.qr_image ? `/${qrData.qr_image}` : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay />
            <ModalContent bg={bgColor} borderRadius="xl" overflow="hidden">
                <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
                    {t("qr_code")} — {table?.name}
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody p={6}>
                    {loading ? (
                        <VStack py={10}>
                            <Spinner size="xl" color="teal.500" />
                            <Text color="gray.500">{t("loading")}</Text>
                        </VStack>
                    ) : qrData ? (
                        <VStack spacing={5}>
                            <Box
                                ref={printRef}
                                p={4}
                                bg="white"
                                borderRadius="xl"
                                border="1px solid"
                                borderColor={borderColor}
                                display="inline-block"
                            >
                                {qrImageUrl ? (
                                    <Image
                                        src={qrImageUrl}
                                        boxSize="220px"
                                        alt="QR Code"
                                        fallback={
                                            qrData?.qr_svg ? (
                                                <div
                                                    dangerouslySetInnerHTML={{ __html: qrData.qr_svg }}
                                                    style={{ width: 220, height: 220, lineHeight: 0 }}
                                                />
                                            ) : (
                                                <Box w="220px" h="220px" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                                                    <Text color="gray.400">QR</Text>
                                                </Box>
                                            )
                                        }
                                    />
                                ) : qrData?.qr_svg ? (
                                    <div
                                        dangerouslySetInnerHTML={{ __html: qrData.qr_svg }}
                                        style={{ width: 220, height: 220, lineHeight: 0 }}
                                    />
                                ) : (
                                    <Box w="220px" h="220px" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
                                        <Text color="gray.400">QR</Text>
                                    </Box>
                                )}
                            </Box>

                            <VStack spacing={1}>
                                <Text fontSize="xs" color="gray.500">
                                    {t("scan_to_order")}
                                </Text>
                                <Text fontSize="xs" color="gray.400" fontFamily="mono" noOfLines={1} maxW="280px">
                                    {qrData.qr_code_url}
                                </Text>
                            </VStack>

                            <HStack spacing={2} w="full" justify="center">
                                <Tooltip label={t("print_qr")}>
                                    <IconButton
                                        icon={<Icon as={Printer} boxSize={4} />}
                                        size="sm"
                                        variant="outline"
                                        colorScheme="teal"
                                        onClick={handlePrint}
                                        aria-label={t("print")}
                                    />
                                </Tooltip>
                                <Tooltip label={t("download")}>
                                    <IconButton
                                        icon={<DownloadIcon />}
                                        size="sm"
                                        variant="outline"
                                        onClick={handleDownload}
                                        aria-label={t("download")}
                                        isDisabled={!qrImageUrl}
                                    />
                                </Tooltip>
                                <Tooltip label={t("copy_url")}>
                                    <IconButton
                                        icon={<CopyIcon />}
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCopyUrl}
                                        aria-label={t("copy")}
                                    />
                                </Tooltip>
                                <Tooltip label={t("open_order_page")}>
                                    <IconButton
                                        icon={<ExternalLinkIcon />}
                                        size="sm"
                                        variant="outline"
                                        as="a"
                                        href={qrData.qr_code_url}
                                        target="_blank"
                                        aria-label={t("open")}
                                    />
                                </Tooltip>
                            </HStack>
                        </VStack>
                    ) : (
                        <VStack py={10}>
                            <Text color="gray.500">{t("no_qr_code")}</Text>
                        </VStack>
                    )}
                </ModalBody>

                <ModalFooter borderTop="1px solid" borderColor={borderColor}>
                    <Button
                        variant="ghost"
                        mr={3}
                        onClick={onClose}
                    >
                        {t("close")}
                    </Button>
                    <Button
                        colorScheme="teal"
                        leftIcon={<RepeatIcon />}
                        onClick={handleRegenerate}
                        isLoading={regenerating}
                    >
                        {t("regenerate_qr")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
