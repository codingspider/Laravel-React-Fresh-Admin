import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Image,
    Text,
    useToast,
    SimpleGrid
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import { GET_OWNER_BUSINESS, UPDATE_BUSINESS } from "../../../routes/apiRoutes";
import { usePermission } from "../../../context/PermissionContext";

const Setting = () => {
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

        // Files
        if (data.logo?.length) {
            formData.append("logo", data.logo[0]);
        }

        // For Laravel PUT request
        formData.append("_method", "PUT");

        try {
            const res = await api.post(
                UPDATE_BUSINESS(business.id),
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            toast({
                position: "bottom-right",
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Refresh user data so the whole app uses the new restaurant name/logo
            await refetchPermissions();
        } catch (err) {
            const errorResponse = err?.response?.data;
            const errorMessage = errorResponse?.errors
                ? Object.values(errorResponse.errors).flat().join(" ")
                : errorResponse?.message || "Something went wrong";

            toast({
                position: "bottom-right",
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

    return (
        <>
            <Box mt={5} mx="auto" p={6} borderWidth={1} borderRadius="lg">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    encType="multipart/form-data"
                >
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <FormControl isRequired>
                            <FormLabel>{t("restaurant_name")}</FormLabel>
                            <Input
                                type="text"
                                {...register("name", { required: true })}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>{t("phone_number")}</FormLabel>
                            <Input
                                type="text"
                                {...register("phone", { required: true })}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>{t("email")}</FormLabel>
                            <Input
                                type="email"
                                {...register("email")}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>{t("address")}</FormLabel>
                            <Input
                                type="text"
                                {...register("address")}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>{t("city")}</FormLabel>
                            <Input
                                type="text"
                                {...register("city")}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>{t("state")}</FormLabel>
                            <Input
                                type="text"
                                {...register("state")}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>{t("country")}</FormLabel>
                            <Input
                                type="text"
                                {...register("country")}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>{t("zip")}</FormLabel>
                            <Input
                                type="text"
                                {...register("zip_code")}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>{t("timezone")}</FormLabel>
                            <Input
                                type="text"
                                placeholder="e.g. Asia/Dhaka"
                                {...register("timezone")}
                            />
                        </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={8}>
                        <FormControl>
                            <FormLabel>{t("restaurant_logo")}</FormLabel>
                            <Input type="file" accept="image/*" {...register("logo")} />
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

                    <Stack direction="row" justify="flex-end" mt={8}>
                        <Button
                            isLoading={isSubmitting}
                            loadingText="Saving..."
                            type="submit"
                            colorScheme="teal"
                        >
                            {t("save")}
                        </Button>
                    </Stack>
                </form>
            </Box>
        </>
    );
};

export default Setting;
