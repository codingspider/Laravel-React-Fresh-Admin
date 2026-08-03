import React, { useEffect, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Select,
  Stack,
  useToast
} from '@chakra-ui/react';
import { t } from 'i18next';
import { useForm } from "react-hook-form";
import api from '../../../axios';
import { UPDATE_VAT } from '../../../routes/apiRoutes';
import useThemeColors from '../../../hooks/useThemeColors';

const VatEdit = ({ isOpen, onClose, vat, onSuccess }) => {
    const colors = useThemeColors();
    const { register, handleSubmit, reset, setValue } = useForm();
    const [data, setData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const getBranchList = async () => {
       const res = await api.get('get/branches');
       setData(res.data.data);
    }
    useEffect(() => {
      getBranchList();
    }, [])

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.put(UPDATE_VAT(vat.id), data);
            reset();
            onClose();
            onSuccess();
            toast({
                title: res.data.message,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
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

    useEffect(() => {
      if (vat) {
        let parsedUseFor = [];

        try {
          parsedUseFor = JSON.parse(vat.use_for || "[]");
        } catch (e) {
          parsedUseFor = [];
        }

        reset({
          vat_amount: vat.vat_amount,
          item_tax_include: vat.item_tax_include === 1,
          branch_id: vat.branch_id,
          use_for: parsedUseFor,
        });
      }
    }, [vat, reset]);

  return (
    <>
    <Modal blockScrollOnMount={false} isOpen={isOpen} size="lg" onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={colors.bgCard}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader color={colors.textPrimary}>{t('edit_vat')}</ModalHeader>
          <ModalCloseButton color={colors.textSecondary} />

          <ModalBody>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t('vat_percent')}</FormLabel>
              <Input
                type='number'
                placeholder='Enter Vat/Tax Percent'
                {...register('vat_amount', { required: true })}
                bg={colors.bgInput}
                border="1px solid"
                borderColor={colors.borderInput}
                borderRadius="md"
                focusBorderColor="teal.500"
                _hover={{ borderColor: "gray.300" }}
                size="md"
                transition="all 0.2s"
              />
            </FormControl>

            <FormControl mt={4}>
              <Checkbox colorScheme="teal" {...register('item_tax_include')} defaultChecked>
                <Text color={colors.textPrimary}>{t('item_tax_include')}</Text>
              </Checkbox>
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("use_in")}</FormLabel>
              <Select
                {...register("branch_id")}
                bg={colors.bgInput}
                border="1px solid"
                borderColor={colors.borderInput}
                borderRadius="md"
                focusBorderColor="teal.500"
                _hover={{ borderColor: "gray.300" }}
                size="md"
                transition="all 0.2s"
              >
                {data.map((item, index) => (
                  <option key={index} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary}>{t("use_for")}</FormLabel>
              <Stack spacing={5} direction='row'>
                <Checkbox {...register('use_for')} colorScheme='teal' value="dine">
                  <Text color={colors.textPrimary}>{t('dine')}</Text>
                </Checkbox>
                <Checkbox {...register('use_for')} colorScheme='teal' value="pickup">
                  <Text color={colors.textPrimary}>{t('pickup')}</Text>
                </Checkbox>
              </Stack>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='gray' variant="outline" mr={3} onClick={onClose} fontWeight="semibold" px={6}>
              {t('cancel')}
            </Button>
            <Button
              type='submit'
              isLoading={isSubmitting}
              loadingText={t("saving_data")}
              colorScheme='teal'
              bg="teal.500"
              color="white"
              fontWeight="semibold"
              px={8}
              _hover={{ bg: "teal.600" }}
              _active={{ bg: "teal.700" }}
            >
              {t('update')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
    </>
  )
}

export default VatEdit
