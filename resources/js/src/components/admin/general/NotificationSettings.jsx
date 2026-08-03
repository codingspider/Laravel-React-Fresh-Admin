import React, { useEffect, useState } from "react";
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Select as ChakraSelect,
    SimpleGrid,
    Switch,
    useToast,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import api from "../../../axios";
import { CREATE_NOTIFICATION_SETTING } from "../../../routes/apiRoutes";
import { useTranslation } from "react-i18next";
import useThemeColors from "../../../hooks/useThemeColors";

const NotificationSettings = ({ existingSetting }) => {
    const colors = useThemeColors();
    const { t } = useTranslation();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, control, watch, reset, setValue } = useForm(
        {
            defaultValues: {
                type: "email",
                provider: "smtp",
                settings: {
                    email: {},
                    sms: {},
                },
                is_active: true,
            },
        }
    );

    const watchType = watch("type");

    useEffect(() => {
        if (existingSetting) {
            reset({
                type: existingSetting.email ? "email" : "sms",
                provider: existingSetting.email ? "smtp" : "twilio",
                settings: {
                    email: existingSetting.email || {},
                    sms: existingSetting.sms || {},
                },
                is_active: existingSetting.is_active ?? true,
            });
        }
    }, [existingSetting, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        const payload = {
            type: data.type,
            provider: data.provider,
            settings:
                data.type === "email" ? data.settings.email : data.settings.sms,
            is_active: data.is_active,
        };

        try {
            const res = await api.post(CREATE_NOTIFICATION_SETTING, payload);
            toast({
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            const errorResponse = err?.response?.data;
            const errorMessage = errorResponse?.errors
                ? Object.values(errorResponse.errors).flat().join(" ")
                : errorResponse?.message || "Something went wrong";

            toast({
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const inputProps = {
        bg: colors.bgInput,
        border: "1px solid",
        borderColor: colors.borderInput,
        borderRadius: "md",
        focusBorderColor: "teal.500",
        _hover: { borderColor: "gray.300" },
        size: "md",
        transition: "all 0.2s",
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Type Selector */}
                <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("type")}</FormLabel>
                    <ChakraSelect {...inputProps} {...register("type")}>
                        <option value="email">{t("email")}</option>
                        <option value="sms">{t("sms")}</option>
                    </ChakraSelect>
                </FormControl>

                {/* Provider Selector */}
                <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("provider")}</FormLabel>
                    <ChakraSelect {...inputProps} {...register("provider")}>
                        {watchType === "email" ? (
                            <option value="smtp">{t("smtp")}</option>
                        ) : (
                            <>
                                <option value="twilio">
                                    {t("twilio")}
                                </option>
                                <option value="nexmo">{t("nexmo")}</option>
                            </>
                        )}
                    </ChakraSelect>
                </FormControl>

                {/* Email Settings */}
                {watchType === "email" && (
                    <>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("host")}</FormLabel>
                            <Input {...inputProps} {...register("settings.email.host")} />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("port")}</FormLabel>
                            <Input
                                type="number"
                                {...inputProps}
                                {...register("settings.email.port")}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("username")}</FormLabel>
                            <Input
                                {...inputProps}
                                {...register("settings.email.username")}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("password")}</FormLabel>
                            <Input
                                type="password"
                                {...inputProps}
                                {...register("settings.email.password")}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("encryption")}</FormLabel>
                            <ChakraSelect
                                {...inputProps}
                                {...register("settings.email.encryption")}
                            >
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                            </ChakraSelect>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("from_email")}</FormLabel>
                            <Input
                                {...inputProps}
                                {...register("settings.email.from_email")}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("from_name")}</FormLabel>
                            <Input
                                {...inputProps}
                                {...register("settings.email.from_name")}
                            />
                        </FormControl>
                    </>
                )}

                {/* SMS Settings */}
                {watchType === "sms" && (
                    <>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>SID / Key</FormLabel>
                            <Input {...inputProps} {...register("settings.sms.sid")} />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>Token / Secret</FormLabel>
                            <Input {...inputProps} {...register("settings.sms.token")} />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>From Number</FormLabel>
                            <Input {...inputProps} {...register("settings.sms.from")} />
                        </FormControl>
                    </>
                )}

                {/* Active Switch */}
                <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="is_active" mb="0" fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>
                        Active
                    </FormLabel>
                    <Controller
                        name="is_active"
                        control={control}
                        render={({ field }) => (
                            <Switch
                                id="is_active"
                                isChecked={field.value}
                                onChange={field.onChange}
                                colorScheme="teal"
                            />
                        )}
                    />
                </FormControl>
            </SimpleGrid>

            <Button
                mt={8}
                float="right"
                type="submit"
                isLoading={loading}
                loadingText={t("saving_data")}
                colorScheme="teal"
                bg="teal.500"
                color="white"
                fontWeight="semibold"
                px={8}
                h={12}
                borderRadius="md"
                _hover={{ bg: "teal.600" }}
                _active={{ bg: "teal.700" }}
                boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)"
            >
                {t("save")}
            </Button>
        </form>
    );
};

export default NotificationSettings;
