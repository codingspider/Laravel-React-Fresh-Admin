import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Text, Badge, Button, HStack, Flex, FormControl, FormLabel,
  Icon, Input, InputGroup, InputLeftElement, SimpleGrid, Tooltip,
  IconButton, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
  Search, Database, Plus, Download, RotateCcw, Trash2, Upload, TriangleAlert, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import api from '../../../axios';
import {
  BACKUP_LIST,
  BACKUP_CREATE,
  BACKUP_DOWNLOAD,
  BACKUP_RESTORE,
  BACKUP_RESTORE_UPLOAD,
  BACKUP_DELETE,
} from '../../../routes/apiRoutes';
import { DASHBOARD_PATH } from '../../../routes/superAdminRoutes';
import TanStackTable from '../../../TanStackTable';
import PageHeader from '../../ui/PageHeader';
import useThemeColors from '../../../hooks/useThemeColors';

const STATUS_META = {
  completed: { color: 'green', label: 'Completed' },
  running: { color: 'blue', label: 'Running' },
  failed: { color: 'red', label: 'Failed' },
};

const TYPE_META = {
  manual: { color: 'brand', label: 'Manual' },
  schedule: { color: 'purple', label: 'Scheduled' },
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

export default function BackupList() {
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [lastBackupAt, setLastBackupAt] = useState(null);

  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [restoreTarget, setRestoreTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const restoreRef = useRef();
  const deleteRef = useRef();
  const uploadRef = useRef();
  const fileInputRef = useRef();

  const { t } = useTranslation();
  const colors = useThemeColors();
  const toast = useToast();

  const notify = (title, status, description) =>
    toast({ title, description, status, duration: 3000, isClosable: true });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pageIndex + 1,
        per_page: pageSize,
        search: search || undefined,
      };
      const res = await api.get(BACKUP_LIST, { params });
      const items = res.data?.data?.data || res.data?.data || [];
      const total = res.data?.meta?.total || res.data?.data?.total || items.length;
      setData(items);
      setPageCount(Math.ceil(total / pageSize));
      setTotalItems(total);
      setTotalSize(res.data?.summary?.total_size || 0);
      setLastBackupAt(res.data?.summary?.last_backup_at || null);
    } catch (err) {
      console.error('BackupList fetchData error:', err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, search]);

  useEffect(() => {
    const app_name = localStorage.getItem('app_name');
    document.title = `${app_name} | ${t('Backups')}`;
  }, [t]);

  const lastParamsRef = useRef('');
  useEffect(() => {
    const key = `${pageIndex}|${search}`;
    if (lastParamsRef.current === key) return;
    lastParamsRef.current = key;
    fetchData();
  }, [fetchData, pageIndex, search]);

  const applySearch = () => {
    setPageIndex(0);
  };

  const resetSearch = () => {
    setSearch('');
    setPageIndex(0);
  };

  const createBackup = async () => {
    setIsCreating(true);
    try {
      const res = await api.post(BACKUP_CREATE);
      notify(res.data?.message || t('Database backup created successfully'), 'success');
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || t('Failed to create the database backup'), 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const downloadBackup = async (backup) => {
    try {
      const res = await api.get(BACKUP_DOWNLOAD(backup.id), { responseType: 'blob' });
      if (res.data?.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result);
            notify(parsed.message || t('Failed to download backup'), 'error');
          } catch {
            notify(t('Failed to download backup'), 'error');
          }
        };
        reader.readAsText(res.data);
        return;
      }
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = backup.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      notify(err.response?.data?.message || t('Failed to download backup'), 'error');
    }
  };

  const confirmRestore = async () => {
    setIsProcessing(true);
    try {
      const res = await api.post(BACKUP_RESTORE(restoreTarget.id));
      notify(res.data?.message || t('Database restored successfully'), 'success');
      setRestoreTarget(null);
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || t('Failed to restore the database'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmUploadRestore = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const res = await api.post(BACKUP_RESTORE_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notify(res.data?.message || t('Database restored successfully'), 'success');
      setIsUploadOpen(false);
      setUploadFile(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || t('Failed to restore the database');
      notify(msg, 'error');
      if (err.response?.status !== 422) {
        setIsUploadOpen(false);
        setUploadFile(null);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = async () => {
    setIsProcessing(true);
    try {
      const res = await api.delete(BACKUP_DELETE(deleteTarget.id));
      notify(res.data?.message || t('Backup deleted successfully'), 'success');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      notify(err.response?.data?.message || t('Failed to delete backup'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setIsUploadOpen(true);
    e.target.value = '';
  };

  const columns = [
    {
      header: '#',
      cell: ({ row }) => (
        <Text fontSize="sm" fontWeight="500" color="gray.500">{row.index + 1 + pageIndex * pageSize}</Text>
      ),
    },
    {
      header: t('File Name'),
      accessorKey: 'filename',
      cell: ({ getValue, row }) => (
        <Box minW="220px">
          <Text fontSize="sm" fontWeight="600" noOfLines={1}>{getValue()}</Text>
          <Text fontSize="xs" color="gray.500" noOfLines={1}>
            {row.original.status === 'completed' ? formatBytes(row.original.size) : ''}
          </Text>
        </Box>
      ),
    },
    {
      header: t('Status'),
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const meta = STATUS_META[getValue()] || { color: 'gray', label: getValue() };
        const IconEl = getValue() === 'completed' ? CheckCircle2 : getValue() === 'running' ? Clock : XCircle;
        return (
          <HStack spacing={1.5}>
            <Icon as={IconEl} boxSize={3.5} color={`${meta.color}.500`} />
            <Badge colorScheme={meta.color} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
              {t(meta.label)}
            </Badge>
          </HStack>
        );
      },
    },
    {
      header: t('Type'),
      accessorKey: 'type',
      cell: ({ getValue }) => {
        const meta = TYPE_META[getValue()] || { color: 'gray', label: getValue() };
        return (
          <Badge colorScheme={meta.color} variant="subtle" borderRadius="full" px={2.5} py={0.5} fontSize="xs" fontWeight="600">
            {t(meta.label)}
          </Badge>
        );
      },
    },
    {
      header: t('Size'),
      accessorKey: 'size',
      cell: ({ getValue }) => (
        <Text fontSize="sm" fontWeight="500" whiteSpace="nowrap">{formatBytes(getValue())}</Text>
      ),
    },
    {
      header: t('Created By'),
      accessorKey: 'creator',
      cell: ({ getValue }) => (
        <Text fontSize="sm" noOfLines={1}>{getValue()?.name || t('System')}</Text>
      ),
    },
    {
      header: t('Created At'),
      accessorKey: 'created_at',
      cell: ({ getValue }) => (
        <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
          {getValue() ? new Date(getValue()).toLocaleString() : '-'}
        </Text>
      ),
    },
    {
      header: t('Actions'),
      id: 'actions',
      cell: ({ row }) => (
        <HStack spacing={1}>
          <Tooltip label={t('Download')} hasArrow>
            <IconButton
              size="sm"
              variant="ghost"
              icon={<Icon as={Download} boxSize={4} />}
              onClick={() => downloadBackup(row.original)}
              aria-label={t('Download')}
              borderRadius="lg"
            />
          </Tooltip>
          {row.original.status === 'completed' && (
            <Tooltip label={t('Restore')} hasArrow>
              <IconButton
                size="sm"
                variant="ghost"
                color="orange.500"
                icon={<Icon as={RotateCcw} boxSize={4} />}
                onClick={() => setRestoreTarget(row.original)}
                aria-label={t('Restore')}
                borderRadius="lg"
              />
            </Tooltip>
          )}
          <Tooltip label={t('Delete')} hasArrow>
            <IconButton
              size="sm"
              variant="ghost"
              color="red.500"
              icon={<Icon as={Trash2} boxSize={4} />}
              onClick={() => setDeleteTarget(row.original)}
              aria-label={t('Delete')}
              borderRadius="lg"
            />
          </Tooltip>
        </HStack>
      ),
    },
  ];

  const stats = [
    { label: t('Total Backups'), value: totalItems, color: 'brand.500' },
    { label: t('Total Size'), value: formatBytes(totalSize), color: 'purple.500' },
    {
      label: t('Last Backup'),
      value: lastBackupAt ? new Date(lastBackupAt).toLocaleDateString() : '-',
      color: 'green.500',
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('Database Backups')}
        subtitle={t('Create, download, restore and manage database backups')}
        breadcrumbs={[
          { label: t('Dashboard'), path: DASHBOARD_PATH },
          { label: t('Backups'), isCurrent: true },
        ]}
      />

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        {stats.map((s) => (
          <Box
            key={s.label}
            bg={colors.bgCard}
            border="1px solid"
            borderColor={colors.borderDefault}
            borderRadius="xl"
            p={4}
          >
            <Text fontSize="xs" color={colors.textSecondary} mb={1}>{s.label}</Text>
            <Text fontSize="2xl" fontWeight="700" color={s.color} noOfLines={1}>{s.value}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box
        bg={colors.bgCard}
        p={{ base: 4, md: 6 }}
        borderRadius="xl"
        boxShadow="card"
        border="1px solid"
        borderColor={colors.borderDefault}
      >
        <Flex direction={{ base: 'column', lg: 'row' }} gap={3} mb={4} align={{ base: 'stretch', lg: 'flex-end' }} justify="space-between">
          <Flex direction={{ base: 'column', sm: 'row' }} gap={3} align={{ base: 'stretch', sm: 'flex-end' }}>
            <FormControl maxW={{ base: '100%', lg: '280px' }}>
              <FormLabel fontSize="xs" color={colors.textSecondary}>{t('Search')}</FormLabel>
              <InputGroup size="md">
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="gray.400" boxSize={4} />
                </InputLeftElement>
                <Input
                  placeholder={t('Search by file name...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                  bg={colors.bgInput}
                  borderColor={colors.borderInput}
                  borderRadius="lg"
                />
              </InputGroup>
            </FormControl>
            <HStack spacing={2} pb={0.5}>
              <Button variant="outline" borderRadius="lg" onClick={applySearch}>
                {t('Search')}
              </Button>
              <Button variant="ghost" borderRadius="lg" onClick={resetSearch}>
                {t('Reset')}
              </Button>
            </HStack>
          </Flex>
          <HStack spacing={2} align={{ base: 'stretch', lg: 'center' }}>
            <Input
              type="file"
              accept=".sql"
              hidden
              ref={fileInputRef}
              onChange={onFileSelected}
            />
            <Button
              variant="outline"
              colorScheme="brand"
              leftIcon={<Icon as={Upload} boxSize={4} />}
              borderRadius="lg"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('Restore Upload')}
            </Button>
            <Button
              colorScheme="brand"
              leftIcon={<Icon as={Plus} boxSize={4} />}
              borderRadius="lg"
              onClick={createBackup}
              isLoading={isCreating}
              loadingText={t('Creating...')}
            >
              {t('Create Backup')}
            </Button>
          </HStack>
        </Flex>

        <TanStackTable
          columns={columns}
          data={data}
          pageIndex={pageIndex}
          pageSize={pageSize}
          setPageIndex={setPageIndex}
          pageCount={pageCount}
          isLoading={isLoading}
          hideAddBtn="true"
          searchPlaceholder={t('Search...')}
          totalItems={totalItems}
        />
      </Box>

      <AlertDialog isOpen={!!restoreTarget} leastDestructiveRef={restoreRef} onClose={() => setRestoreTarget(null)} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent bg={colors.bgCard}>
            <AlertDialogHeader>
              <HStack>
                <Icon as={TriangleAlert} color="orange.500" boxSize={5} />
                <Text>{t('Restore Database?')}</Text>
              </HStack>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={2}>{t('Restoring this backup will replace all current data in the database with the data from the backup.')}</Text>
              <Text fontSize="sm" color={colors.textSecondary} fontWeight="600">
                {restoreTarget?.filename}
              </Text>
              <Text fontSize="sm" color="red.500" mt={2}>{t('This action cannot be undone.')}</Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={restoreRef} onClick={() => setRestoreTarget(null)} borderRadius="lg">{t('Cancel')}</Button>
              <Button colorScheme="orange" onClick={confirmRestore} ml={3} borderRadius="lg" fontWeight="700" isLoading={isProcessing}>
                {t('Restore')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog isOpen={isUploadOpen} leastDestructiveRef={uploadRef} onClose={() => { setIsUploadOpen(false); setUploadFile(null); }} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent bg={colors.bgCard}>
            <AlertDialogHeader>
              <HStack>
                <Icon as={TriangleAlert} color="orange.500" boxSize={5} />
                <Text>{t('Restore Uploaded Backup?')}</Text>
              </HStack>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={2}>{t('Restoring an uploaded backup will replace all current data in the database.')}</Text>
              <Text fontSize="sm" color={colors.textSecondary} fontWeight="600" noOfLines={1}>
                {uploadFile?.name}
              </Text>
              <Text fontSize="sm" color="red.500" mt={2}>{t('This action cannot be undone.')}</Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={uploadRef} onClick={() => { setIsUploadOpen(false); setUploadFile(null); }} borderRadius="lg">{t('Cancel')}</Button>
              <Button colorScheme="orange" onClick={confirmUploadRestore} ml={3} borderRadius="lg" fontWeight="700" isLoading={isProcessing}>
                {t('Restore')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog isOpen={!!deleteTarget} leastDestructiveRef={deleteRef} onClose={() => setDeleteTarget(null)} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent bg={colors.bgCard}>
            <AlertDialogHeader>
              <HStack>
                <Icon as={Trash2} color="red.500" boxSize={5} />
                <Text>{t('Delete Backup?')}</Text>
              </HStack>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={2}>{t('Are you sure you want to delete this backup?')}</Text>
              <Text fontSize="sm" color={colors.textSecondary} fontWeight="600" noOfLines={1}>
                {deleteTarget?.filename}
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteRef} onClick={() => setDeleteTarget(null)} borderRadius="lg">{t('Cancel')}</Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3} borderRadius="lg" fontWeight="700" isLoading={isProcessing}>
                {t('Delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
