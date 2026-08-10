import React, {useEffect, useState} from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel, TabIndicator,
    Box,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Flex,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Text,
 } from '@chakra-ui/react';

 import {
    MdReceiptLong,
    MdSettings,
    MdAttachMoney,
    MdNotificationsActive,
    MdQrCodeScanner,
} from "react-icons/md";

import { Link as ReactRouterLink } from "react-router-dom";
import { ADMIN_DASHBOARD_PATH } from "../../../routes/adminRoutes";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import { GET_INVOICE_SETTING } from "../../../routes/apiRoutes";
import useThemeColors from "../../../hooks/useThemeColors";
import Setting from "./Setting";
import NotificationSettings from "./NotificationSettings";
import InvoiceSetting from "./InvoiceSetting";
import CurrencySetting from "./CurrencySetting";
import QrOrderingSettings from "./QrOrderingSettings";

const General = () => {
    const colors = useThemeColors();
    const { t } = useTranslation();
    const [invoiceSetting, setInvoiceSetting] = useState(null);

    const getInvoiceSettings = async () => {
        try {
            const res = await api.get(GET_INVOICE_SETTING);
            setInvoiceSetting(res.data.data);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };

    useEffect(() => {
        getInvoiceSettings();
    }, []);

    return (
        <Box className="form-dark-surface" bg={colors.bgSubtle} minH="100vh" py={3}>
            <Box mx="auto">

                {/* Breadcrumb */}
                <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={colors.textSecondary}>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    as={ReactRouterLink}
                                    to={ADMIN_DASHBOARD_PATH}
                                    fontWeight="medium"
                                    _hover={{ color: "teal.500" }}
                                >
                                    {t("dashboard")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {t("system_settings")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                {/* Main Settings Card */}
                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader
                        bg={colors.bgCard}
                        borderBottom="1px solid"
                        borderColor={colors.borderSubtle}
                        pb={6}
                    >
                        <Flex mb={4} justifyContent="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                                    {t("system_settings")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t("manage_your_system_settings")}
                                </Text>
                            </Box>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <Tabs variant="enclosed" isFitted size="md" overflowX="auto">
                            <TabList
                                display="flex"
                                flexWrap={{ base: "nowrap", md: "wrap" }}
                                overflowX={{ base: "auto", md: "visible" }}
                                sx={{
                                "&::-webkit-scrollbar": { display: "none" },
                                }}
                            >
                                <Tab whiteSpace="nowrap">
                                <Box as={MdSettings} mr={2} />
                                {t("general")}
                                </Tab>

                                <Tab whiteSpace="nowrap">
                                <Box as={MdReceiptLong} mr={2} />
                                {t("invoice_setting")}
                                </Tab>

                                <Tab whiteSpace="nowrap">
                                <Box as={MdAttachMoney} mr={2} />
                                {t("currency")}
                                </Tab>

                                <Tab whiteSpace="nowrap">
                                <Box as={MdNotificationsActive} mr={2} />
                                {t("notification")}
                                </Tab>

                                <Tab whiteSpace="nowrap">
                                <Box as={MdQrCodeScanner} mr={2} />
                                {t("qr_ordering")}
                                </Tab>
                            </TabList>
                            <TabIndicator
                                mt="-1.5px"
                                height="2px"
                                bg="teal.500"
                                borderRadius="1px"
                            />
                            <TabPanels>
                                <TabPanel>
                                    <Setting></Setting>
                                </TabPanel>
                                <TabPanel>
                                    <InvoiceSetting invoiceSetting={invoiceSetting}></InvoiceSetting>
                                </TabPanel>
                                <TabPanel>
                                    <CurrencySetting></CurrencySetting>
                                </TabPanel>
                                <TabPanel>
                                    <NotificationSettings></NotificationSettings>
                                </TabPanel>
                                <TabPanel>
                                    <QrOrderingSettings />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
};

export default General;
