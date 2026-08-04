import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  useToast,
  Badge,
  Divider,
  VStack,
  Flex,
  Button,
  Skeleton,
  SkeletonText,
  Avatar,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Link as ReactRouterLink } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
import api from "../../../axios";
import useThemeColors from "../../../hooks/useThemeColors";
import { useCurrencyFormatter } from "../../../useCurrencyFormatter";
import { GET_EMPLOYEE } from "../../../routes/apiRoutes";
import {
  HRM_EMPLOYEE_LIST_PATH,
  HRM_EMPLOYEE_EDIT_PATH,
  DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";

const SectionHeader = ({ title, colors }) => (
  <Text fontSize="md" fontWeight="bold" color={colors.textPrimary}>
    {title}
  </Text>
);

const DetailRow = ({ label, value, colors, valueColor }) => (
  <Flex justify="space-between" align="center" py={2}>
    <Text fontSize="sm" color={colors.textSecondary}>{label}</Text>
    <Text fontSize="sm" fontWeight="semibold" color={valueColor || colors.textPrimary} textAlign="right">{value}</Text>
  </Flex>
);

export default function EmployeeView() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const { formatAmount } = useCurrencyFormatter();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("employee_details")}`;

    api.get(GET_EMPLOYEE(id))
      .then((res) => {
        const emp = res.data?.data || res.data?.data?.data;
        setEmployee(emp);
      })
      .catch(() => {
        toast({ title: t("error"), status: "error", duration: 3000, isClosable: true });
      })
      .finally(() => setIsLoading(false));
  }, [id, t, toast]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "green";
      case "inactive": return "orange";
      case "terminated": return "red";
      default: return "gray";
    }
  };

  const sectionBoxProps = {
    bg: colors.bgCard,
    border: "1px solid",
    borderColor: colors.borderDefault,
    borderRadius: "xl",
    boxShadow: "card",
    overflow: "hidden",
  };

  const formatDate = (d) => {
    if (!d) return "-";
    const dateStr = String(d).split("T")[0];
    const [y, m, day] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Box bg={colors.bgSubtle} minH="100vh" py={3}>
        <Box mx="auto">
          <Box mb={4}>
            <Skeleton height="40px" width="300px" />
            <SkeletonText mt={2} noOfLines={1} width="200px" />
          </Box>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} {...sectionBoxProps} p={6}>
                <SkeletonText noOfLines={4} spacing={4} />
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box bg={colors.bgSubtle} minH="100vh" py={3}>
        <Box mx="auto">
          <Box mb={4}>
            <Text fontSize="xl" fontWeight="bold" color={colors.textPrimary}>{t("employee_details")}</Text>
            <Text fontSize="sm" color={colors.textSecondary}>{t("not_found")}</Text>
          </Box>
          <Button as={ReactRouterLink} to={HRM_EMPLOYEE_LIST_PATH} leftIcon={<ArrowLeft />} colorScheme="teal" variant="outline">
            {t("back_to_list")}
          </Button>
        </Box>
      </Box>
    );
  }

  const fullAddress = [employee.address, employee.city, employee.state, employee.country, employee.postal_code].filter(Boolean).join(", ");

  return (
    <Box bg={colors.bgSubtle} minH="100vh" py={3}>
      <Box mx="auto">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={4}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" color={colors.textPrimary}>
              {t("employee_details")}
            </Text>
            <Text fontSize="sm" color={colors.textSecondary}>
              {employee?.employee_id}
            </Text>
          </Box>
          <Flex gap={3}>
            <Button
              as={ReactRouterLink}
              to={HRM_EMPLOYEE_LIST_PATH}
              leftIcon={<ArrowLeft />}
              variant="outline"
              colorScheme="teal"
              size="sm"
            >
              {t("back_to_list")}
            </Button>
            <Button
              as={ReactRouterLink}
              to={HRM_EMPLOYEE_EDIT_PATH(employee.id)}
              leftIcon={<Edit />}
              colorScheme="teal"
              size="sm"
            >
              {t("edit")}
            </Button>
          </Flex>
        </Flex>

        {/* Header Card - Name, Status, Contact */}
        <Box {...sectionBoxProps} mb={6}>
          <Box p={5}>
            <Flex align="center" gap={5}>
              <Avatar
                size="xl"
                name={employee?.full_name || employee?.first_name}
                src={employee?.photo}
                bg="teal.500"
                color="white"
              />
              <Box flex={1}>
                <Flex align="center" gap={3} mb={1}>
                  <Text fontSize="2xl" fontWeight="bold" color={colors.textPrimary}>
                    {employee?.full_name || employee?.first_name}
                  </Text>
                  <Badge
                    colorScheme={getStatusColor(employee?.status)}
                    variant="subtle"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="sm"
                  >
                    {t(employee?.status || "active")}
                  </Badge>
                </Flex>
                <Text fontSize="sm" color={colors.textSecondary} mb={2}>
                  {employee?.employee_id}
                </Text>
                <Flex gap={6} flexWrap="wrap">
                  {employee?.email && (
                    <Text fontSize="sm" color={colors.textSecondary}>{employee.email}</Text>
                  )}
                  {employee?.phone && (
                    <Text fontSize="sm" color={colors.textSecondary}>{employee.phone}</Text>
                  )}
                  {employee?.branch?.name && (
                    <Text fontSize="sm" color={colors.textSecondary}>{employee.branch.name}</Text>
                  )}
                </Flex>
              </Box>
            </Flex>
          </Box>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>

          {/* Job Information */}
          <Box {...sectionBoxProps}>
            <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
              <SectionHeader title={t("job_information")} colors={colors} />
            </Box>
            <Box p={5}>
              <VStack spacing={0} align="stretch" divider={<Divider borderColor={colors.borderDefault} />}>
                <DetailRow label={t("employee_id")} value={employee?.employee_id || "-"} colors={colors} />
                <DetailRow label={t("department")} value={employee?.department?.name || "-"} colors={colors} />
                <DetailRow label={t("designation")} value={employee?.designation?.name || "-"} colors={colors} />
                <DetailRow label={t("branch")} value={employee?.branch?.name || "-"} colors={colors} />
                <DetailRow label={t("employment_type")} value={employee?.employment_type ? t(employee.employment_type) : "-"} colors={colors} />
                <DetailRow label={t("date_of_joining")} value={formatDate(employee?.date_of_joining)} colors={colors} />
              </VStack>
            </Box>
          </Box>

          {/* Personal Information */}
          <Box {...sectionBoxProps}>
            <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
              <SectionHeader title={t("personal_information")} colors={colors} />
            </Box>
            <Box p={5}>
              <VStack spacing={0} align="stretch" divider={<Divider borderColor={colors.borderDefault} />}>
                <DetailRow label={t("email")} value={employee?.email || "-"} colors={colors} />
                <DetailRow label={t("phone_number")} value={employee?.phone || "-"} colors={colors} />
                <DetailRow label={t("gender")} value={employee?.gender ? t(employee.gender) : "-"} colors={colors} />
                <DetailRow label={t("date_of_birth")} value={formatDate(employee?.date_of_birth)} colors={colors} />
              </VStack>
            </Box>
          </Box>

          {/* Address */}
          <Box {...sectionBoxProps}>
            <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
              <SectionHeader title={t("address")} colors={colors} />
            </Box>
            <Box p={5}>
              <VStack spacing={0} align="stretch" divider={<Divider borderColor={colors.borderDefault} />}>
                <DetailRow label={t("address")} value={employee?.address || "-"} colors={colors} />
                <DetailRow label={t("city")} value={employee?.city || "-"} colors={colors} />
                <DetailRow label={t("state")} value={employee?.state || "-"} colors={colors} />
                <DetailRow label={t("country")} value={employee?.country || "-"} colors={colors} />
                <DetailRow label={t("postal_code")} value={employee?.postal_code || "-"} colors={colors} />
              </VStack>
            </Box>
          </Box>

          {/* Salary & Payroll */}
          <Box {...sectionBoxProps}>
            <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
              <SectionHeader title={t("salary_&_payroll")} colors={colors} />
            </Box>
            <Box p={5}>
              <VStack spacing={0} align="stretch" divider={<Divider borderColor={colors.borderDefault} />}>
                <DetailRow label={t("salary")} value={formatAmount(employee?.salary || 0)} colors={colors} />
                <DetailRow label={t("overtime_rate")} value={formatAmount(employee?.overtime_rate || 0)} colors={colors} />
                <DetailRow label={t("pf")} value={formatAmount(employee?.pf || 0)} colors={colors} />
                <DetailRow label={t("tax")} value={`${employee?.tax ?? 0} %`} colors={colors} />
              </VStack>
            </Box>
          </Box>

          {/* Emergency Contact */}
          <Box {...sectionBoxProps}>
            <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
              <SectionHeader title={t("emergency_contact")} colors={colors} />
            </Box>
            <Box p={5}>
              <VStack spacing={0} align="stretch" divider={<Divider borderColor={colors.borderDefault} />}>
                <DetailRow label={t("name")} value={employee?.emergency_contact_name || "-"} colors={colors} />
                <DetailRow label={t("phone_number")} value={employee?.emergency_contact_number || "-"} colors={colors} />
              </VStack>
            </Box>
          </Box>

          {/* System Info */}
          <Box {...sectionBoxProps}>
            <Box p={5} borderBottom="1px solid" borderColor={colors.borderDefault}>
              <SectionHeader title={t("system_info")} colors={colors} />
            </Box>
            <Box p={5}>
              <VStack spacing={0} align="stretch" divider={<Divider borderColor={colors.borderDefault} />}>
                <DetailRow label={t("created_at")} value={employee?.created_at ? new Date(employee.created_at).toLocaleString() : "-"} colors={colors} />
                <DetailRow label={t("updated_at")} value={employee?.updated_at ? new Date(employee.updated_at).toLocaleString() : "-"} colors={colors} />
              </VStack>
            </Box>
          </Box>

        </SimpleGrid>
      </Box>
    </Box>
  );
}
