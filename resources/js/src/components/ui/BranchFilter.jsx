import React, { useEffect, useState } from "react";
import { Select, FormControl, FormLabel } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../../axios";
import { BRANCH_OPTIONS } from "../../routes/apiRoutes";
import { usePermission } from "../../context/PermissionContext";
import useThemeColors from "../../hooks/useThemeColors";

const OWNER_ROLES = ["super_admin", "admin", "restaurant_owner"];

export default function BranchFilter({ value, onChange, maxW = "180px" }) {
    const { t } = useTranslation();
    const { roles } = usePermission();
    const colors = useThemeColors();
    const [branches, setBranches] = useState([]);

    const isOwner = roles.some((role) => OWNER_ROLES.includes(role));

    useEffect(() => {
        if (!isOwner) return;
        api.get(BRANCH_OPTIONS)
            .then((res) => {
                const data = res.data?.data || res.data?.data?.data || [];
                setBranches(data);
            })
            .catch(() => { });
    }, [isOwner]);

    if (!isOwner) return null;

    return (
        <FormControl maxW={maxW}>
            <Select
                size="md"
                value={value || ""}
                onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                placeholder={t("all_branches")}
                borderRadius="lg"
                bg={colors.bgSubtle}
                _placeholder={{ color: "gray.400" }}
            >
                {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                        {branch.name}
                    </option>
                ))}
            </Select>
        </FormControl>
    );
}
