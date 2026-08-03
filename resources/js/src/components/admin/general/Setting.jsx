import React, { useState, useEffect } from "react";
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    SimpleGrid,
    useToast,
    Image,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import { GET_OWNER_BUSINESS, UPDATE_BUSINESS } from "../../../routes/apiRoutes";
import { usePermission } from "../../../context/PermissionContext";
import useThemeColors from "../../../hooks/useThemeColors";

const Setting = () => {
    const colors = useThemeColors();
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();
    const { restaurant, refetchPermissions } = usePermission();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [business, setBusiness] = useState(null);
    const toast = useToast();

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        const formData = new FormData();

        formData.append("name", data.name ?? "");
        formData.append("phone", data.phone ?? "");
        formData.append("email", data.email ?? "");
        formData.append("address", data.address ?? "");
        formData.append("city", data.city ?? "");
        formData.append("state", data.state ?? "");
        formData.append("country", data.country ?? "");
        formData.append("zip_code", data.zip_code ?? "");
        formData.append("timezone", data.timezone ?? "");

        if (data.logo?.length) {
            formData.append("logo", data.logo[0]);
        }

        formData.append("_method", "PUT");

        try {
            const res = await api.post(
                UPDATE_BUSINESS(business.id),
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            toast({
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            await refetchPermissions();
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
            setIsSubmitting(false);
        }
    };

    const getBusiness = async () => {
        const res = await api.get(GET_OWNER_BUSINESS);
        const business = res.data.data;
        setBusiness(business);
        reset({
            name: business.name,
            phone: business.phone,
            email: business.email,
            address: business.address,
            city: business.city,
            state: business.state,
            country: business.country,
            zip_code: business.zip_code,
            timezone: business.timezone,
        });
        document.title = `${business.name} | ${t("system_settings")}`;
    };

    useEffect(() => {
        getBusiness();
    }, []);

    const currentLogo = business?.logo || restaurant?.logo;

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
        <form
            onSubmit={handleSubmit(onSubmit)}
            encType="multipart/form-data"
        >
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("restaurant_name")}
                    </FormLabel>
                    <Input
                        type="text"
                        placeholder={t("restaurant_name")}
                        {...inputProps}
                        {...register("name", { required: true })}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("phone_number")}
                    </FormLabel>
                    <Input
                        type="text"
                        placeholder={t("phone_number")}
                        {...inputProps}
                        {...register("phone", { required: true })}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("email")}
                    </FormLabel>
                    <Input
                        type="email"
                        placeholder={t("email")}
                        {...inputProps}
                        {...register("email")}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("address")}
                    </FormLabel>
                    <Input
                        type="text"
                        placeholder={t("address")}
                        {...inputProps}
                        {...register("address")}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("city")}
                    </FormLabel>
                    <Input
                        type="text"
                        placeholder={t("city")}
                        {...inputProps}
                        {...register("city")}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("state")}
                    </FormLabel>
                    <Input
                        type="text"
                        placeholder={t("state")}
                        {...inputProps}
                        {...register("state")}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("country")}
                    </FormLabel>
                    <Input
                        type="text"
                        placeholder={t("country")}
                        {...inputProps}
                        {...register("country")}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("zip")}
                    </FormLabel>
                    <Input
                        type="text"
                        placeholder={t("zip_code")}
                        {...inputProps}
                        {...register("zip_code")}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("timezone")}
                    </FormLabel>
                    <Input
                        type="text"
                        placeholder="e.g. Asia/Dhaka"
                        {...inputProps}
                        {...register("timezone")}
                    />
                </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={8}>
                <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>
                        {t("restaurant_logo")}
                    </FormLabel>
                    <Input
                        type="file"
                        accept="image/*"
                        p={1}
                        {...inputProps}
                        {...register("logo")}
                    />
                    {currentLogo && (
                        <Image
                            src={'/' + currentLogo}
                            alt={t("restaurant_logo")}
                            mt={2}
                            maxH="70px"
                            objectFit="contain"
                        />
                    )}
                </FormControl>
            </SimpleGrid>

            <Button
                mt={8}
                float="right"
                type="submit"
                isLoading={isSubmitting}
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

export default Setting;
