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
import { useTranslation } from 'react-i18next';
import { useForm } from "react-hook-form"; 
import api from '../../../axios';
import { STORE_VAT } from '../../../routes/apiRoutes';
import useThemeColors from '../../../hooks/useThemeColors';

const VatCreate = ({ isOpen, onClose, onSuccess }) => {
    const { register, handleSubmit, reset, setValue } = useForm();
    const [data, setData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const toast = useToast();
    const { t } = useTranslation();
    const colors = useThemeColors();

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
            const res = await api.post(STORE_VAT, data);
            reset();
            onClose();
            onSuccess();
            toast({
                position: "bottom-right",
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
                    position: "bottom-right",
                    title: t("error"),
                    description: errorMessage,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (errorResponse?.message) {
                toast({
                    position: "bottom-right",
                    title: t("error"),
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
    
  return (
    <>
    <Modal blockScrollOnMount={false} isOpen={isOpen} size="lg" onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>{t('add_vat')}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t('vat_percent')}</FormLabel>
              <Input
                type='number'
                placeholder={t('enter_vat_percent')}
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

            <FormControl mt={3}>
              <Checkbox colorScheme="teal" {...register('item_tax_include')} defaultChecked>
                {t('item_tax_include')}
              </Checkbox>
            </FormControl>

            <FormControl mt={3} isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("use_in")}</FormLabel>
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

            <FormControl mt={3}>
              <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("use_for")}</FormLabel>
              <Stack spacing={5} direction='row'>
                <Checkbox {...register('use_for')} colorScheme='teal' value="dine">
                  {t('dine')}
                </Checkbox>
                <Checkbox {...register('use_for')} colorScheme='teal' value="pickup">
                  {t('pickup')}
                </Checkbox>
              </Stack>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" variant="outline" mr={3} onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type='submit' 
            isLoading={isSubmitting}
            loadingText={t("saving_data")}
            colorScheme="teal"
            bg="teal.500"
            color="white"
            fontWeight="semibold"
            _hover={{ bg: "teal.600" }}
            _active={{ bg: "teal.700" }}>
              {t('add')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>

    </>
  )
}

export default VatCreate
