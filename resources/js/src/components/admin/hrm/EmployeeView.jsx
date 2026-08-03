import React, { useState, useEffect } from "react";
import {
  Box, Text, SimpleGrid, Heading, useToast, Badge,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../axios";
import PageHeader from "../../ui/PageHeader";
import useThemeColors from "../../../hooks/useThemeColors";
import {
  GET_EMPLOYEE,
} from "../../../routes/apiRoutes";
import {
  HRM_EMPLOYEE_LIST_PATH,
  DASHBOARD_PATH,
} from "../../../routes/superAdminRoutes";

export default function EmployeeView() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
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
      .catch((err) => {
        toast({ title: t("error"), status: "error", duration: 3000, isClosable: true });
      })
      .finally(() => setIsLoading(false));
  }, [id, t, toast]);

  if (isLoading) {
    return (
      <Box bg={colors.bgSubtle} minH="100vh">
        <PageHeader
          title={t("employee_details")}
          breadcrumbs={[
            { label: t("dashboard"), path: DASHBOARD_PATH },
            { label: t("employees"), path: HRM_EMPLOYEE_LIST_PATH },
            { label: t("employee_details"), isCurrent: true },
          ]}
        />
        <Box bg={colors.bgCard} p={6} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
          <Text color={colors.textSecondary}>{t("loading_data")}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg={colors.bgSubtle} minH="100vh">
      <PageHeader
        title={t("employee_details")}
        breadcrumbs={[
          { label: t("dashboard"), path: DASHBOARD_PATH },
          { label: t("employees"), path: HRM_EMPLOYEE_LIST_PATH },
          { label: t("employee_details"), isCurrent: true },
        ]}
      />

      <Box bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault} overflow="hidden">
        <Box p={{ base: 4, md: 6 }} borderBottom="1px" borderColor={colors.borderDefault}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} alignItems="center">
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color={colors.textPrimary}>
                {employee?.full_name || employee?.first_name}
              </Text>
              <Text fontSize="sm" color={colors.textSecondary}>{employee?.employee_id}</Text>
            </Box>
            <Box>
              <Badge colorScheme={employee?.status === "active" ? "green" : employee?.status === "inactive" ? "orange" : "red"} variant="subtle" borderRadius="full" px={3} py={1} fontSize="sm">
                {employee?.status || "inactive"}
              </Badge>
            </Box>
            <Box textAlign={{ base: "left", md: "right" }}>
              <Text fontSize="sm" color={colors.textSecondary}>{employee?.email}</Text>
              <Text fontSize="sm" color={colors.textSecondary}>{employee?.phone}</Text>
            </Box>
          </SimpleGrid>
        </Box>

        <Box p={{ base: 4, md: 6 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("employee_id")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.employee_id || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("department")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.department?.name || employee?.department_id || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("designation")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.designation?.name || employee?.designation_id || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("employment_type")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.employment_type || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("email")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.email || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("phone_number")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.phone || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("gender")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.gender || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("salary")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.salary || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("date_of_birth")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.date_of_birth || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("date_of_joining")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.date_of_joining || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("emergency_contact_name")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.emergency_contact_name || "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("emergency_contact_number")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee?.emergency_contact_number || "-"}</Text>
            </Box>
          </SimpleGrid>

          {employee?.address && (
            <Box mt={4}>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("address")}</Text>
              <Text fontSize="sm" color={colors.textPrimary} mt={1}>{employee.address}</Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
