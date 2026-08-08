import React, { useState, useEffect } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, Switch, Text,
  Flex, useToast, Spinner, VStack, HStack, Badge, Code, IconButton,
  Tooltip, InputGroup, InputRightElement, Select,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { CopyIcon, CheckIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import api from "../../../axios";
import useThemeColors from "../../../hooks/useThemeColors";

export default function QrOrderingSettings() {
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    allow_guest_name: false,
    allow_guest_phone: false,
    show_preparation_time: true,
    order_timeout_minutes: 30,
    auto_cancel_minutes: 60,
    default_order_type: "dine_in",
  });
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/owner/business");
        const restaurant = res.data?.data || res.data;
        const meta = restaurant?.metadata || {};
        const qr = meta.qr_ordering || {};
        setSettings((prev) => ({ ...prev, ...qr }));
        setBaseUrl(window.location.origin);
      } catch (err) {
        console.error("Failed to load QR settings:", err);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.get("/owner/business");
      const restaurant = res.data?.data || res.data;
      const meta = restaurant?.metadata || {};
      meta.qr_ordering = settings;

      await api.put(`/v1/restaurants/${restaurant.id}`, {
        metadata: meta,
      });

      toast({ title: t("settings_saved"), status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
    }
    setSaving(false);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`${baseUrl}/order?table=YOUR_TABLE_TOKEN`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle = {
    bg: colors.bgInput,
    borderRadius: "md",
    border: "1px solid",
    borderColor: colors.borderInput,
    focusBorderColor: "teal.500",
    _hover: { borderColor: "gray.300" },
  };

  const labelProps = { fontSize: "sm", fontWeight: "semibold", color: colors.textPrimary, mb: 1 };

  if (loading) {
    return (
      <Flex justify="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* URL Info */}
      <Box p={4} bg="teal.50" _dark={{ bg: "teal.900", borderColor: "teal.700" }} borderRadius="lg" border="1px solid" borderColor="teal.200">
        <Text fontWeight="bold" color="teal.700" _dark={{ color: "teal.200" }} mb={2}>
          {t("how_it_works")}
        </Text>
        <Text fontSize="sm" color="teal.600" _dark={{ color: "teal.300" }} mb={3}>
          {t("qr_ordering_url_info")}
        </Text>
        <HStack>
          <Code flex={1} p={2} borderRadius="md" bg="white" _dark={{ bg: "gray.800" }} fontSize="xs" overflow="auto" whiteSpace="nowrap">
            {baseUrl}/order?table={"{"}QR_TOKEN{"}"}
          </Code>
          <Tooltip label={copied ? t("copied") : t("copy")}>
            <IconButton
              size="sm"
              icon={copied ? <CheckIcon /> : <CopyIcon />}
              onClick={copyUrl}
              colorScheme={copied ? "green" : "teal"}
              variant="outline"
            />
          </Tooltip>
        </HStack>
        <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }} mt={2}>
          {t("qr_ordering_url_example")}: {baseUrl}/order?table=t1a2b3c4d5e6f7g8h9
        </Text>
      </Box>

      {/* Enable/Disable */}
      <Flex justify="space-between" align="center" p={4} bg={colors.bgSubtle} borderRadius="lg">
        <Box>
          <Text fontWeight="semibold" color={colors.textPrimary}>{t("enable_qr_ordering")}</Text>
          <Text fontSize="xs" color={colors.textSecondary}>{t("enable_qr_ordering_help")}</Text>
        </Box>
        <Switch
          colorScheme="teal"
          isChecked={settings.enabled}
          onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
          size="lg"
        />
      </Flex>

      {/* Guest Options */}
      <Box>
        <Text fontWeight="bold" color={colors.textPrimary} mb={3}>{t("guest_options")}</Text>
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center" p={3} bg={colors.bgSubtle} borderRadius="lg">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("collect_guest_name")}</Text>
              <Text fontSize="xs" color={colors.textSecondary}>{t("collect_guest_name_help")}</Text>
            </Box>
            <Switch
              colorScheme="teal"
              isChecked={settings.allow_guest_name}
              onChange={(e) => setSettings({ ...settings, allow_guest_name: e.target.checked })}
            />
          </Flex>
          <Flex justify="space-between" align="center" p={3} bg={colors.bgSubtle} borderRadius="lg">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("collect_guest_phone")}</Text>
              <Text fontSize="xs" color={colors.textSecondary}>{t("collect_guest_phone_help")}</Text>
            </Box>
            <Switch
              colorScheme="teal"
              isChecked={settings.allow_guest_phone}
              onChange={(e) => setSettings({ ...settings, allow_guest_phone: e.target.checked })}
            />
          </Flex>
          <Flex justify="space-between" align="center" p={3} bg={colors.bgSubtle} borderRadius="lg">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("show_preparation_time")}</Text>
              <Text fontSize="xs" color={colors.textSecondary}>{t("show_preparation_time_help")}</Text>
            </Box>
            <Switch
              colorScheme="teal"
              isChecked={settings.show_preparation_time}
              onChange={(e) => setSettings({ ...settings, show_preparation_time: e.target.checked })}
            />
          </Flex>
        </VStack>
      </Box>

      {/* Order Settings */}
      <Box>
        <Text fontWeight="bold" color={colors.textPrimary} mb={3}>{t("order_settings")}</Text>
        <VStack spacing={3} align="stretch">
          <FormControl>
            <FormLabel {...labelProps}>{t("default_order_type")}</FormLabel>
            <Select
              value={settings.default_order_type}
              onChange={(e) => setSettings({ ...settings, default_order_type: e.target.value })}
              {...inputStyle}
            >
              <option value="dine_in">{t("dine_in")}</option>
              <option value="takeaway">{t("takeaway")}</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel {...labelProps}>{t("order_timeout_minutes")}</FormLabel>
            <Input
              type="number"
              min={1}
              max={120}
              value={settings.order_timeout_minutes}
              onChange={(e) => setSettings({ ...settings, order_timeout_minutes: parseInt(e.target.value) || 30 })}
              {...inputStyle}
            />
            <Text fontSize="xs" color={colors.textSecondary} mt={1}>{t("order_timeout_help")}</Text>
          </FormControl>
          <FormControl>
            <FormLabel {...labelProps}>{t("auto_cancel_minutes")}</FormLabel>
            <Input
              type="number"
              min={0}
              max={480}
              value={settings.auto_cancel_minutes}
              onChange={(e) => setSettings({ ...settings, auto_cancel_minutes: parseInt(e.target.value) || 60 })}
              {...inputStyle}
            />
            <Text fontSize="xs" color={colors.textSecondary} mt={1}>{t("auto_cancel_help")}</Text>
          </FormControl>
        </VStack>
      </Box>

      {/* Save Button */}
      <Flex justify="flex-end" pt={4}>
        <Button
          colorScheme="teal"
          onClick={handleSave}
          isLoading={saving}
          loadingText={t("saving")}
          px={8}
          fontWeight="semibold"
        >
          {t("save")}
        </Button>
      </Flex>
    </VStack>
  );
}
