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
 } from '@chakra-ui/react';

 import {
    MdReceiptLong,
    MdSettings,
    MdAttachMoney,
    MdNotificationsActive,
} from "react-icons/md";

import { Link as ReactRouterLink } from "react-router-dom";
import { ADMIN_DASHBOARD_PATH } from "../../../routes/adminRoutes";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import { GET_INVOICE_SETTING, GET_NOTIFICATION_SETTING } from "../../../routes/apiRoutes";
import Setting from "./Setting";
import NotificationSettings from "./NotificationSettings";
import InvoiceSetting from "./InvoiceSetting";
import CurrencySetting from "./CurrencySetting";

const General = () => {
    const { t } = useTranslation();
    const [invoiceSetting, setInvoiceSetting] = useState(null);
    const [existingSetting, setExistingSetting] = useState([]);

    const getSettings = async () => {
        try {
            const res = await api.get(GET_NOTIFICATION_SETTING);
            setExistingSetting(res.data.data);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };
    
    const getInvoiceSettings = async () => {
        try {
            const res = await api.get(GET_INVOICE_SETTING);
            setInvoiceSetting(res.data.data);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };

    useEffect(() => {
        getSettings();
        getInvoiceSettings();
    }, []);

    return (
        <>
            <Card mb={5}>
                <CardBody>
                    <Breadcrumb fontSize={{ base: "sm", md: "md" }}>
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                as={ReactRouterLink}
                                to={ADMIN_DASHBOARD_PATH}
                            >
                                {t("dashboard")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink as={ReactRouterLink} to={ADMIN_DASHBOARD_PATH}>
                                {t("system_settings")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </CardBody>
            </Card>
            <Box>
                <Card shadow="md">
                    <CardHeader>
                        <Flex mb={4} justifyContent="space-between">
                            <Heading size="md">
                                {t("system_settings")}
                            </Heading>
                        </Flex>
                    </CardHeader>

                    <CardBody>
                        <Tabs variant="enclosed" isFitted size="md" overflowX="auto">
                            <TabList
                                display="flex"
                                flexWrap={{ base: "nowrap", md: "wrap" }}
                                overflowX={{ base: "auto", md: "visible" }}
                                sx={{
                                "&::-webkit-scrollbar": { display: "none" }, // hide scrollbar
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
                                    <NotificationSettings existingSetting={existingSetting}></NotificationSettings>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>
            </Box>
            
        </>
    );
};

export default General;
