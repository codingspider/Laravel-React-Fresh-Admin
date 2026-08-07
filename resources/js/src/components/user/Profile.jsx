import React, { useState } from 'react';
import {
  Box, VStack, HStack, Text, Button, Card, CardBody, CardHeader, Avatar,
  SimpleGrid, Divider, useToast, FormControl, FormLabel, Input,
  InputGroup, InputRightElement, IconButton, Tag, Spinner, Center,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Save, Lock, Eye, EyeOff, UserRound, Building2, MapPin, ShieldCheck } from 'lucide-react';
import api from '../../axios';
import { UPDATE_PROFILE, CHANGE_PASSWORD } from '../../routes/apiRoutes';
import { DASHBOARD_PATH } from '../../routes/superAdminRoutes';
import useThemeColors from '../../hooks/useThemeColors';
import { usePermission } from '../../context/PermissionContext';
import PageHeader from '../ui/PageHeader';

const EMPTY_PROFILE = { name: '', email: '' };
const EMPTY_PASSWORD = { current_password: '', password: '', password_confirmation: '' };

export default function Profile() {
  const { t } = useTranslation();
  const toast = useToast();
  const colors = useThemeColors();
  const { user, refetchPermissions } = usePermission();

  const [profileForm, setProfileForm] = useState({
    ...EMPTY_PROFILE,
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const panelBg = colors.bgCard;
  const panelBorder = colors.borderDefault;
  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const inputBg = colors.bgInput;
  const inputBorder = colors.borderInput;

  const setProfileField = (key) => (e) =>
    setProfileForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setPasswordField = (key) => (e) =>
    setPasswordForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await api.post(UPDATE_PROFILE, profileForm);
      const data = res.data?.data || {};
      setProfileForm((prev) => ({ ...prev, name: data.name || prev.name, email: data.email || prev.email }));
      await refetchPermissions();
      toast({ title: t('Profile updated successfully'), status: 'success', duration: 2500, isClosable: true });
    } catch (err) {
      const message = err.response?.data?.message || t('Failed to update profile');
      toast({ title: message, status: 'error', duration: 3500, isClosable: true });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setSavingPassword(true);
    try {
      await api.post(CHANGE_PASSWORD, passwordForm);
      setPasswordForm(EMPTY_PASSWORD);
      toast({ title: t('Password changed successfully'), status: 'success', duration: 2500, isClosable: true });
    } catch (err) {
      const message = err.response?.data?.message || t('Failed to change password');
      toast({ title: message, status: 'error', duration: 3500, isClosable: true });
    } finally {
      setSavingPassword(false);
    }
  };

  const roles = user?.roles || [];
  const restaurant = user?.restaurant || null;
  const branch = user?.branch || null;

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information and password"
        breadcrumbs={[
          { label: t('Dashboard'), path: DASHBOARD_PATH },
          { label: t('Profile'), isCurrent: true },
        ]}
      />

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} align="start">
        <Card bg={panelBg} border="1px solid" borderColor={panelBorder} borderRadius="xl" shadow="none">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <VStack spacing={3} py={4}>
                <Avatar
                  size="2xl"
                  name={user?.name || 'User'}
                  bg="brand.500"
                  color="white"
                />
                <VStack spacing={1}>
                  <Text fontWeight="700" fontSize="lg" color={textPrimary}>
                    {user?.name || 'User'}
                  </Text>
                  <Text fontSize="sm" color={textSecondary}>
                    {user?.email || 'user@example.com'}
                  </Text>
                </VStack>
                <HStack spacing={2} flexWrap="wrap" justify="center">
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <Tag key={role} size="sm" colorScheme="brand" variant="subtle" borderRadius="full">
                        {role}
                      </Tag>
                    ))
                  ) : (
                    <Tag size="sm" colorScheme="gray" variant="subtle" borderRadius="full">
                      {t('No Role')}
                    </Tag>
                  )}
                </HStack>
              </VStack>

              <Divider />

              <VStack spacing={3} align="stretch">
                {restaurant && (
                  <HStack spacing={3} align="flex-start">
                    <Box bg={colors.bgSubtle} p={2} borderRadius="lg">
                      <Building2 size={18} color="brand.500" />
                    </Box>
                    <Box>
                      <Text fontSize="xs" color={textSecondary}>{t('Restaurant')}</Text>
                      <Text fontSize="sm" fontWeight="600" color={textPrimary}>{restaurant.name}</Text>
                    </Box>
                  </HStack>
                )}
                {branch && (
                  <HStack spacing={3} align="flex-start">
                    <Box bg={colors.bgSubtle} p={2} borderRadius="lg">
                      <MapPin size={18} color="purple.500" />
                    </Box>
                    <Box>
                      <Text fontSize="xs" color={textSecondary}>{t('Branch')}</Text>
                      <Text fontSize="sm" fontWeight="600" color={textPrimary}>{branch.name}</Text>
                    </Box>
                  </HStack>
                )}
                <HStack spacing={3} align="flex-start">
                  <Box bg={colors.bgSubtle} p={2} borderRadius="lg">
                    <ShieldCheck size={18} color="green.500" />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={textSecondary}>{t('User ID')}</Text>
                    <Text fontSize="sm" fontWeight="600" color={textPrimary}>#{user?.id ?? '—'}</Text>
                  </Box>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <VStack spacing={6} align="stretch" gridColumn={{ lg: 'span 2' }}>
          <Card bg={panelBg} border="1px solid" borderColor={panelBorder} borderRadius="xl" shadow="none">
            <CardHeader pb={2}>
              <HStack spacing={2}>
                <UserRound size={18} color="brand.500" />
                <Text fontWeight="700" fontSize="md" color={textPrimary}>
                  {t('Edit Profile')}
                </Text>
              </HStack>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color={textSecondary}>{t('Name')}</FormLabel>
                    <Input
                      value={profileForm.name}
                      onChange={setProfileField('name')}
                      placeholder={t('Enter your name')}
                      bg={inputBg}
                      borderColor={inputBorder}
                      focusBorderColor="brand.500"
                      borderRadius="lg"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color={textSecondary}>{t('Email')}</FormLabel>
                    <Input
                      type="email"
                      value={profileForm.email}
                      onChange={setProfileField('email')}
                      placeholder={t('Enter your email')}
                      bg={inputBg}
                      borderColor={inputBorder}
                      focusBorderColor="brand.500"
                      borderRadius="lg"
                    />
                  </FormControl>
                </SimpleGrid>
                <Box>
                  <Button
                    leftIcon={<Save size={16} />}
                    colorScheme="brand"
                    isLoading={savingProfile}
                    loadingText={t('Saving...')}
                    onClick={handleUpdateProfile}
                  >
                    {t('Save Changes')}
                  </Button>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={panelBg} border="1px solid" borderColor={panelBorder} borderRadius="xl" shadow="none">
            <CardHeader pb={2}>
              <HStack spacing={2}>
                <Lock size={18} color="orange.500" />
                <Text fontWeight="700" fontSize="md" color={textPrimary}>
                  {t('Change Password')}
                </Text>
              </HStack>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color={textSecondary}>{t('Current Password')}</FormLabel>
                  <InputGroup>
                    <Input
                      type={showCurrent ? 'text' : 'password'}
                      value={passwordForm.current_password}
                      onChange={setPasswordField('current_password')}
                      placeholder={t('Enter current password')}
                      bg={inputBg}
                      borderColor={inputBorder}
                      focusBorderColor="brand.500"
                      borderRadius="lg"
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        onClick={() => setShowCurrent((v) => !v)}
                        aria-label={t('Toggle current password visibility')}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color={textSecondary}>{t('New Password')}</FormLabel>
                    <InputGroup>
                      <Input
                        type={showNew ? 'text' : 'password'}
                        value={passwordForm.password}
                        onChange={setPasswordField('password')}
                        placeholder={t('Enter new password')}
                        bg={inputBg}
                        borderColor={inputBorder}
                        focusBorderColor="brand.500"
                        borderRadius="lg"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          icon={showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                          onClick={() => setShowNew((v) => !v)}
                          aria-label={t('Toggle new password visibility')}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color={textSecondary}>{t('Confirm New Password')}</FormLabel>
                    <InputGroup>
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        value={passwordForm.password_confirmation}
                        onChange={setPasswordField('password_confirmation')}
                        placeholder={t('Confirm new password')}
                        bg={inputBg}
                        borderColor={inputBorder}
                        focusBorderColor="brand.500"
                        borderRadius="lg"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          icon={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          onClick={() => setShowConfirm((v) => !v)}
                          aria-label={t('Toggle confirm password visibility')}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>

                <Box>
                  <Button
                    leftIcon={<Lock size={16} />}
                    colorScheme="orange"
                    isLoading={savingPassword}
                    loadingText={t('Updating...')}
                    onClick={handleChangePassword}
                  >
                    {t('Update Password')}
                  </Button>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}
