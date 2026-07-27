import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useTranslation } from 'react-i18next';

const MasterSetting = () => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <div>
      {/* Breadcrumb */}
      <Card mb={5}>
        <CardBody>
          <Breadcrumb fontSize={{ base: 'sm', md: 'md' }}>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t("home")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">Breadcrumb</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </CardBody>
      </Card>

      <Box>
      <Card  mx="auto" boxShadow="lg">
        <CardBody>
          <Heading size="md" mb={6}>
            {t('master_setting')}
          </Heading>

          <form>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <FormControl isRequired>
              <FormLabel>{t('application_name')}</FormLabel>
              <Input type='text' placeholder={t('application_name')} {...register("application_name", { required: true, maxLength: 20 })} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t('phone_number')}</FormLabel>
              <Input type="text" placeholder={t('phone_number')} {...register("phone_number", { required: true, maxLength: 20 })} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t('alternative_phone_number')}</FormLabel>
              <Input type="text" placeholder={t('alternative_phone_number')} {...register("alternative_phone_number", { required: true, maxLength: 20 })} />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>{t('whats_app_number')}</FormLabel>
              <Input type="text" placeholder={t('whats_app_number')} {...register("whats_app_number", { required: true, maxLength: 20 })} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t('email')}</FormLabel>
              <Input type="email" placeholder={t('email')}  {...register("email", { required: "Email Address is required" })} aria-invalid={errors.email ? "true" : "false"} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t('address')}</FormLabel>
              <Input type='text' placeholder={t('address')} {...register("address", { required: true, maxLength: 20 })} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t('country')}</FormLabel>
              <Input type='text' placeholder={t('country')} {...register("country", { required: true, maxLength: 20 })} />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>{t('state')}</FormLabel>
              <Input type='text' placeholder={t('state')} {...register("state", { required: true, maxLength: 20 })} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t('city')}</FormLabel>
              <Input type='text' placeholder={t('city')} {...register("city", { required: true, maxLength: 20 })} />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>{t('district')}</FormLabel>
              <Input type='text' placeholder={t('district')} {...register("district", { required: true, maxLength: 20 })} />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>{t('zip')}</FormLabel>
              <Input type='text' placeholder={t('zip')} {...register("zip", { required: true, maxLength: 20 })} />
            </FormControl>

          </SimpleGrid>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} marginTop={10}>
            <FormControl>
              <FormLabel>{t('app_logo')}</FormLabel>
              <Input type='file' name="app_logo" placeholder={t('app_logo')} {...register("app_logo")} />
            </FormControl>

            <FormControl>
              <FormLabel>{t('fav_icon')}</FormLabel>
              <Input type="file" name="fav_icon" placeholder={t('fav_icon')} {...register("fav_icon")} />
            </FormControl>

            
          </SimpleGrid>

          <Stack direction="row" justify="flex-end" mt={8}>
            <Button isLoading={isSubmitting}
                                loadingText={t("saving_data")}
                                 type='submit' 
                                 colorScheme="teal">{t('save')}</Button>
          </Stack>

          </form>
        </CardBody>
      </Card>
    </Box>
    </div>
  )
}

export default MasterSetting