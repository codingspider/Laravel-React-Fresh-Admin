import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Textarea,
  Button,
  SimpleGrid,
  IconButton,
  HStack,
  Divider,
  Text,
  Select,
  Stack,
  useToast
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { UPDATE_INVOICE_SETTING } from "../../../routes/apiRoutes";
import api from "../../../axios";
import { usePermission } from "../../../context/PermissionContext";


export default function InvoiceSetting({invoiceSetting}) {
    const [isSubmitting, seIsSubmitting] = useState(false); 
    const { register, handleSubmit, control, watch, reset, setValue } = useForm();
    const toast = useToast();
    const { refetchPermissions } = usePermission();


    const onSubmit = async (data) => {
        seIsSubmitting(true);

        try {
            const res = await api.post(UPDATE_INVOICE_SETTING, data);
            await refetchPermissions();
            toast({
                position: "bottom-right",
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
                position: "bottom-right",
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            seIsSubmitting(false);
        }
    };

    useEffect( () => {
        if(invoiceSetting){
            reset({
                'invoice_prefix': invoiceSetting.invoice_prefix,
                'invoice_start_number': invoiceSetting.invoice_start_number,
                'header_text': invoiceSetting.header_text,
                'footer_text': invoiceSetting.footer_text,
                'tax_number': invoiceSetting.tax_number,
                show_logo: Boolean(invoiceSetting.show_logo),
                show_address: Boolean(invoiceSetting.show_address),
                show_city: Boolean(invoiceSetting.show_city),
                show_zip: Boolean(invoiceSetting.show_zip),
                show_state: Boolean(invoiceSetting.show_state),
                show_tax_number: Boolean(invoiceSetting.show_tax_number),
                show_waiter_name: Boolean(invoiceSetting.show_waiter_name),
                show_table_number: Boolean(invoiceSetting.show_table_number),
                show_kitchen_notes: Boolean(invoiceSetting.show_kitchen_notes),
                show_discount_info: Boolean(invoiceSetting.show_discount_info),
                show_payment_info: Boolean(invoiceSetting.show_payment_info),
                show_tax_info: Boolean(invoiceSetting.show_tax_info),
                invoice_direct_print: Boolean(invoiceSetting.invoice_direct_print),
            });
        }
    }, [invoiceSetting, reset]);

  return (
    <Box p={6} borderWidth="1px" rounded="lg">
      <form onSubmit={handleSubmit(onSubmit)}>

        <VStack spacing={6} align="stretch">

          {/* ====================== GENERAL SETTINGS ===================== */}
          <Box>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5}>

              <FormControl>
                <FormLabel>{t('invoice_prefix')}</FormLabel>
                <Input placeholder="INV-" {...register("invoice_prefix")} />
              </FormControl>

              <FormControl>
                <FormLabel>{t('invoice_start_number')}</FormLabel>
                <Input type="number" {...register("invoice_start_number")} />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('show_logo')}</FormLabel>
                <Controller
                    name="show_logo"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>

            </SimpleGrid>
          </Box>

          <Divider />

          {/* ====================== ADDRESS & BUSINESS DETAILS ===================== */}
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={3}>{t('business_info')}</Text>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5}>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('show_address')}</FormLabel>
                <Controller
                    name="show_address"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('show_city')}</FormLabel>
                <Controller
                    name="show_city"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('show_state')}</FormLabel>
                <Controller
                    name="show_state"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t("show_zip")}</FormLabel>

                <Controller
                    name="show_zip"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
            </FormControl>


              

            </SimpleGrid>
          </Box>

          <Divider />

          {/* ====================== INVOICE TEXTS ===================== */}
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4}>{t('invoice_text')}</Text>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5}>
              <FormControl>
                <FormLabel>{t('header_text')}</FormLabel>
                <Textarea placeholder="Ex: Welcome !" {...register("header_text")} />
              </FormControl>

              <FormControl>
                <FormLabel>{t('footer_text')}</FormLabel>
                <Textarea placeholder="Ex: Visit again!" {...register("footer_text")} />
              </FormControl>

              <FormControl>
                <FormLabel>{t('tax_number')}</FormLabel>
                <Input placeholder="" {...register("tax_number")} />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('show_tax_info')}</FormLabel>
                <Controller
                    name="show_tax_info"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('show_tax_number')}</FormLabel>
                <Controller
                    name="show_tax_number"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('show_discount_info')}</FormLabel>
                <Controller
                    name="show_discount_info"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('show_payment_info')}</FormLabel>
                <Controller
                    name="show_payment_info"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>

            </SimpleGrid>
          </Box>

          <Divider />

          {/* ====================== ORDER INFORMATION DISPLAY ===================== */}
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4}>{t('order_info_display')}</Text>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5}>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('show_table_number')}</FormLabel>
                <Controller
                    name="show_table_number"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('show_waiter_name')}</FormLabel>
                <Controller
                    name="show_waiter_name"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('show_kitchen_notes')}</FormLabel>
                <Controller
                    name="show_kitchen_notes"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">{t('invoice_direct_print')}</FormLabel>
                <Controller
                    name="invoice_direct_print"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            colorScheme="teal"
                            isChecked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
              </FormControl>

            </SimpleGrid>
          </Box>

          <Divider />


          {/* ====================== SUBMIT ===================== */}
          <Stack direction="row" justify="flex-end" mt={8}>
                <Button
                    isLoading={isSubmitting}
                    type="submit"
                    loadingText="Saving Data..."
                    colorScheme="teal"
                >
                    {t("save")}
                </Button>
            </Stack>

        </VStack>
      </form>
    </Box>
  );
}
