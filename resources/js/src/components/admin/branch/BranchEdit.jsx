import {
    Box,
    Button,
    Card,
    CardHeader,
    CardBody,
    Heading,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    Select,
    InputGroup,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    HStack,
    useToast,
    Flex,
    InputRightElement,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import { ADMIN_DASHBOARD_PATH, BRANCH_LIST_PATH } from "../../../routes/adminRoutes";
import { useGoogleMaps } from './../../../useGoogleMaps';
import { GET_EDIT_BRANCH, STORE_BRANCH, UPDATE_BRANCH } from "../../../routes/apiRoutes";
import api from "../../../axios";

const BranchEdit = () => {
    const { register, handleSubmit, reset, setValue } = useForm();
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [branch, setBranch] = useState();
    const handleClick = () => setShow(!show);
    const { id } = useParams();
    // maps 
    const mapRef = useRef(null);
    const [marker, setMarker] = useState(null);
    const autocompleteRef = useRef(null);
    const [map, setMap] = useState(null);
    const map_api_key = localStorage.getItem("map_api_key");
    const googleMapsPromise = useGoogleMaps(map_api_key);
    const geocoderRef = useRef(null);

    function initMap() {
        const coords = "23.8103, 90.4125";
        let mapInstance = null;

        // Initialize map
        if (coords) {
            const [latStr, lonStr] = coords.split(",");
            mapInstance = new google.maps.Map(mapRef.current, {
                center: { lat: parseFloat(latStr), lng: parseFloat(lonStr) },
                zoom: 13,
            });
        } else {
            mapInstance = new google.maps.Map(mapRef.current, {
                center: { lat: 0, lng: 0 },
                zoom: 2,
            });
        }

        setMap(mapInstance);

        // Marker (not draggable)
        const marker = new google.maps.Marker({
            map: mapInstance,
            draggable: false,
        });
        setMarker(marker);

        // Move marker to initial location if coords exist
        if (branch) {
            marker.setPosition({
                lat: parseFloat(branch.lat),
                lng: parseFloat(branch.long),
            });
        }

        // Autocomplete
        const input = document.querySelector('input[name="area"]');
        const autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo("bounds", mapInstance);

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) return;

            mapInstance.setCenter(place.geometry.location);
            mapInstance.setZoom(15);
            marker.setPosition(place.geometry.location);

            setValue("lat", place.geometry.location.lat());
            setValue("long", place.geometry.location.lng());
        });

        autocompleteRef.current = autocomplete;
    }

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.put(UPDATE_BRANCH(id), data);
            reset();
            toast({
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(`${BRANCH_LIST_PATH}`);
        } catch (err) {
            const errorResponse = err?.response?.data;
            if (errorResponse?.errors) {
                const errorMessage = Object.values(errorResponse.errors)
                    .flat()
                    .join(" ");
                toast({
                    title: "Error",
                    description: errorMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (errorResponse?.message) {
                toast({
                    title: "Error",
                    description: errorResponse.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getBranch = async () => {
        const res = await api.get(GET_EDIT_BRANCH(id));
        const branch = res.data.data;
        setBranch(branch);
        reset({
          name: branch.name,
          area: branch.area,
          address: branch.address,
          phone: branch.phone,
          is_active: branch.is_active
        });

    };

    useEffect(() => {
        const app_name = localStorage.getItem("app_name");
        document.title = `${app_name} | Branch Update`;

        getBranch();

        if (!googleMapsPromise) return;
        googleMapsPromise.then(() => initMap());
    }, [googleMapsPromise]);

    return (
        <>
            {/* Breadcrumb */}
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
                            <BreadcrumbLink
                                as={ReactRouterLink}
                                to={BRANCH_LIST_PATH}
                            >
                                {t("list")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </CardBody>
            </Card>

            <Box>
                <Card shadow="md" borderRadius="2xl">
                    <CardHeader>
                        <Flex mb={4} justifyContent="space-between">
                            <Heading size="md">{t("add")}</Heading>
                            <Button
                                colorScheme="teal"
                                as={ReactRouterLink}
                                to={BRANCH_LIST_PATH}
                                display={{ base: "none", md: "inline-flex" }}
                                px={4}
                                py={2}
                                whiteSpace="normal"
                                textAlign="center"
                            >
                                {t("list")}
                            </Button>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Plan Info */}
                            <SimpleGrid
                                columns={{ base: 1, md: 2 }}
                                spacing={6}
                            >
                                <FormControl isRequired>
                                    <FormLabel>{t("name")}</FormLabel>
                                    <Input
                                        {...register("name", {
                                            required: true,
                                        })}
                                        placeholder={t("name")}
                                    />
                                </FormControl>

                                <input type="hidden" {...register("lat")} />
                                <input type="hidden" {...register("long")} />

                                <FormControl isRequired>
                                    <FormLabel>{t("area")}</FormLabel>
                                    <Input
                                        {...register("area", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("area")}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>{t("address")}</FormLabel>
                                    <Input
                                        {...register("address", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("address")}
                                    />
                                </FormControl>
                                
                                <FormControl isRequired>
                                    <FormLabel>{t("phone")}</FormLabel>
                                    <Input
                                        {...register("phone", {
                                            required: true,
                                        })}
                                        type="text"
                                        placeholder={t("phone")}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>{t("status")}</FormLabel>
                                    <Select
                                        {...register("is_active")}
                                    >
                                        <option value="1">{t('active')}</option>
                                        <option value="0"> {t('inactive')} </option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>
                            <HStack spacing={4} mt={6}>
                                <Button
                                    type="button"
                                    as={ReactRouterLink}
                                    to={BRANCH_LIST_PATH}
                                    colorScheme="orange"
                                    flex={1}
                                >
                                    {t("cancel")}
                                </Button>

                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    loadingText="Saving Data..."
                                    colorScheme="teal"
                                    flex={1}
                                >
                                    {t("save")}
                                </Button>
                            </HStack>
                        </form>
                        <Box ref={mapRef} height="400px" mt={4}></Box>
                    </CardBody>
                </Card>
            </Box>
        </>
    );
};

export default BranchEdit;
