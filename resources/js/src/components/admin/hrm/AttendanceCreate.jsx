import React, { useState, useEffect, useCallback } from "react";
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
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    useToast,
    Flex,
    Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import api from "../../../axios";
import {
    STORE_ATTENDANCE,
    GET_ATTENDANCE,
    UPDATE_ATTENDANCE,
    LIST_EMPLOYEE,
    LIST_BRANCH,
} from "../../../routes/apiRoutes";
import {
    HRM_ATTENDANCE_LIST_PATH,
    DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

const extractTime = (val) => {
    if (!val) return "";
    const str = String(val);
    const match = str.match(/(\d{2}:\d{2})/);
    return match ? match[1] : "";
};

const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    if (parts.length < 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
};

const calcWorkHours = (clockIn, clockOut, breakStart, breakEnd) => {
    if (!clockIn || !clockOut) return "";
    const start = toMinutes(clockIn);
    let end = toMinutes(clockOut);
    if (end <= start) end += 24 * 60;
    let total = end - start;
    if (breakStart && breakEnd) {
        let bs = toMinutes(breakStart);
        let be = toMinutes(breakEnd);
        if (be <= bs) be += 24 * 60;
        total -= be - bs;
    }
    if (total < 0) total = 0;
    return (total / 60).toFixed(2);
};

export default function AttendanceCreate() {
    const { t } = useTranslation();
    const colors = useThemeColors();
    const navigate = useNavigate();
    const toast = useToast();
    const { id } = useParams();
    const isEdit = !!id;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);

    const [clockIn, setClockIn] = useState("");
    const [clockOut, setClockOut] = useState("");
    const [breakStart, setBreakStart] = useState("");
    const [breakEnd, setBreakEnd] = useState("");

    const { register, handleSubmit, reset, setValue } = useForm({
        defaultValues: {
            employee_id: "",
            branch_id: "",
            date: new Date().toISOString().split("T")[0],
            clock_in: "",
            clock_out: "",
            break_start: "",
            break_end: "",
            work_hours: "",
            overtime_hours: "0",
            status: "present",
            notes: "",
        },
    });

    useEffect(() => {
        document.title = `${localStorage.getItem("app_name") || ""} | ${t(isEdit ? "edit_attendance" : "add_attendance")}`;
    }, [t, isEdit]);

    useEffect(() => {
        api.get(LIST_EMPLOYEE, { params: { per_page: 200 } })
            .then((res) => setEmployees(res.data?.data?.data || res.data?.data || []))
            .catch(() => {});
        api.get(LIST_BRANCH, { params: { per_page: 500 } })
            .then((res) => setBranches(res.data?.data?.data || res.data?.data || []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (isEdit) {
            api.get(GET_ATTENDANCE(id))
                .then((res) => {
                    const att = res.data?.data || res.data?.data?.data;
                    if (att) {
                        const ci = extractTime(att.clock_in);
                        const co = extractTime(att.clock_out);
                        const bs = extractTime(att.break_start);
                        const be = extractTime(att.break_end);
                        reset({
                            employee_id: att.employee_id || "",
                            branch_id: att.branch_id || "",
                            date: att.date?.split("T")[0] || "",
                            clock_in: ci,
                            clock_out: co,
                            break_start: bs,
                            break_end: be,
                            work_hours: att.work_hours || "",
                            overtime_hours: att.overtime_hours || "0",
                            status: att.status || "present",
                            notes: att.notes || "",
                        });
                        setClockIn(ci);
                        setClockOut(co);
                        setBreakStart(bs);
                        setBreakEnd(be);
                    }
                })
                .catch(() => {});
        }
    }, [id, isEdit, reset]);

    const syncTime = useCallback((setter, field) => (e) => {
        const val = e.target.value;
        setter(val);
        setValue(field, val, { shouldDirty: true });
    }, [setValue]);

    useEffect(() => {
        const wh = calcWorkHours(clockIn, clockOut, breakStart, breakEnd);
        setValue("work_hours", wh, { shouldDirty: true });
    }, [clockIn, clockOut, breakStart, breakEnd, setValue]);

    const onSubmit = async (values) => {
        setIsSubmitting(true);
        try {
            const payload = { ...values };
            ["clock_in", "clock_out", "break_start", "break_end"].forEach((field) => {
                if (payload[field] && payload[field].split(":").length === 2) {
                    payload[field] += ":00";
                }
            });
            const res = isEdit
                ? await api.put(UPDATE_ATTENDANCE(id), payload)
                : await api.post(STORE_ATTENDANCE, payload);
            toast({
                title: res.data.message || t(isEdit ? "attendance_updated" : "attendance_created"),
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate(HRM_ATTENDANCE_LIST_PATH);
        } catch (err) {
            const errorResponse = err?.response?.data;
            const message =
                errorResponse?.errors
                    ? Object.values(errorResponse.errors).flat().join(" ")
                    : errorResponse?.message || t("something_went_wrong");
            toast({
                title: t("error"),
                description: message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
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
        <Box className="form-dark-surface" bg={colors.bgSubtle} minH="100vh" py={3}>
            <Box mx="auto">
                <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
                    <CardBody py={3}>
                        <Breadcrumb fontSize="sm" color={colors.textSecondary}>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={DASHBOARD_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                                    {t("dashboard")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink as={ReactRouterLink} to={HRM_ATTENDANCE_LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>
                                    {t("attendance")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem isCurrentPage>
                                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">
                                    {t(isEdit ? "edit_attendance" : "add_attendance")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </CardBody>
                </Card>

                <Card shadow="xl" borderRadius="xl" overflow="hidden" bg={colors.bgCard}>
                    <CardHeader bg={colors.bgCard} borderBottom="1px solid" borderColor={colors.borderSubtle} pb={6}>
                        <Flex justify="space-between" align="center">
                            <Box>
                                <Heading size="sm" color={colors.textPrimary} fontWeight="bold">
                                    {t(isEdit ? "edit_attendance" : "add_attendance")}
                                </Heading>
                                <Text fontSize="sm" color={colors.textSecondary} mt={1}>
                                    {t(isEdit ? "update_attendance_record" : "create_new_attendance")}
                                </Text>
                            </Box>
                            <Button colorScheme="teal" as={ReactRouterLink} to={HRM_ATTENDANCE_LIST_PATH} variant="outline" display={{ base: "none", md: "inline-flex" }} size="sm" fontWeight="600">
                                {t("list")}
                            </Button>
                        </Flex>
                    </CardHeader>

                    <CardBody p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("employee")}</FormLabel>
                                    <Select {...register("employee_id", { required: true })} placeholder={t("select_employee")} {...inputProps}>
                                        {employees.map((e) => (
                                            <option key={e.id} value={e.id}>{e.full_name || e.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("branch")}</FormLabel>
                                    <Select {...register("branch_id")} placeholder={t("select_branch")} {...inputProps}>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("date")}</FormLabel>
                                    <Input {...register("date", { required: true })} type="date" {...inputProps} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("clock_in")}</FormLabel>
                                    <Input type="time" value={clockIn} onChange={syncTime(setClockIn, "clock_in")} {...inputProps} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("clock_out")}</FormLabel>
                                    <Input type="time" value={clockOut} onChange={syncTime(setClockOut, "clock_out")} {...inputProps} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("break_start")}</FormLabel>
                                    <Input type="time" value={breakStart} onChange={syncTime(setBreakStart, "break_start")} {...inputProps} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("break_end")}</FormLabel>
                                    <Input type="time" value={breakEnd} onChange={syncTime(setBreakEnd, "break_end")} {...inputProps} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("work_hours")}</FormLabel>
                                    <Input {...register("work_hours")} type="number" min="0" step="0.01" placeholder="0.00" readOnly bg={colors.bgSubtle} _hover={{ borderColor: colors.borderInput }} {...inputProps} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("overtime_hours")}</FormLabel>
                                    <Input {...register("overtime_hours")} type="number" min="0" step="0.01" placeholder="0.00" {...inputProps} />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("status")}</FormLabel>
                                    <Select {...register("status", { required: true })} {...inputProps}>
                                        <option value="present">{t("present")}</option>
                                        <option value="absent">{t("absent")}</option>
                                        <option value="late">{t("late")}</option>
                                        <option value="half_day">{t("half_day")}</option>
                                        <option value="holiday">{t("holiday")}</option>
                                        <option value="weekend">{t("weekend")}</option>
                                    </Select>
                                </FormControl>

                                <FormControl gridColumn={{ base: "auto", md: "span 2" }}>
                                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("notes")}</FormLabel>
                                    <Input {...register("notes")} placeholder={t("notes")} {...inputProps} />
                                </FormControl>
                            </SimpleGrid>

                            <Flex mt={10} justify={{ base: "stretch", md: "flex-end" }} gap={4}>
                                <Button type="button" as={ReactRouterLink} to={HRM_ATTENDANCE_LIST_PATH} colorScheme="gray" variant="outline" fontWeight="semibold" px={6} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "gray.50" }}>
                                    {t("cancel")}
                                </Button>
                                <Button type="submit" isLoading={isSubmitting} loadingText={t("saving_data")} colorScheme="teal" bg="teal.500" color="white" fontWeight="semibold" px={8} h={12} borderRadius="md" w={{ base: "full", md: "auto" }} _hover={{ bg: "teal.600" }} _active={{ bg: "teal.700" }} boxShadow="0 4px 6px -1px rgba(20, 184, 166, 0.4)">
                                    {t("save")}
                                </Button>
                            </Flex>
                        </form>
                    </CardBody>
                </Card>
            </Box>
        </Box>
    );
}
