import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, Input, InputGroup, InputLeftElement, Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Center, Text, HStack, Badge, Box,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SearchIcon, FileText, ChefHat } from 'lucide-react';
import useThemeColors from '../../../hooks/useThemeColors';
import api from '../../../axios';
import { LIST_POS_SALES } from '../../../routes/apiRoutes';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import { usePermission } from '../../../context/PermissionContext';
import { buildA4Html, printHtml } from './ReceiptPrint';
import { buildKotHtml } from './KOTPrint';
import { createPrintFrame, writeAndPrint } from '../../../utils/printUtil';

export default function InvoiceSearchModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { restaurant } = usePermission();
  const { formatAmount } = useCurrencyFormatter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSearched(false);
    }
  }, [isOpen]);

  const search = useCallback(async () => {
    const needle = query.trim();
    if (!needle) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(LIST_POS_SALES, { params: { search: needle, per_page: 20 } });
      setResults(res.data?.data?.data || res.data?.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const getCustomerName = (sale) =>
    sale.customer?.name || sale.guest_name || t('Walk-in Customer');

  const printInvoice = (sale) => {
    const html = buildA4Html(sale, restaurant, formatAmount, t);
    printHtml(html);
  };

  const printKot = (sale) => {
    const iframe = createPrintFrame();
    writeAndPrint(iframe, buildKotHtml(sale, restaurant)).then(() => {
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1000);
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader>{t('Print Invoice / KOT')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <InputGroup size="md" mb={4}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon size={16} color={colors.textMuted} />
            </InputLeftElement>
            <Input
              placeholder={t('Search by invoice number or order id...')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') search(); }}
              borderRadius="lg"
              bg={colors.bgInput}
              border="1px solid"
              borderColor={colors.borderInput}
              _focus={{ borderColor: 'brand.400', boxShadow: 'outline' }}
            />
          </InputGroup>

          {loading && (
            <Center py={8}>
              <Spinner size="lg" color="brand.500" />
            </Center>
          )}

          {!loading && searched && results.length === 0 && (
            <Center py={8}>
              <Text color={colors.textMuted}>{t('No invoices found')}</Text>
            </Center>
          )}

          {!loading && results.length > 0 && (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th fontSize="xs" fontWeight="600" color={colors.textSecondary}>{t('Order ID')}</Th>
                    <Th fontSize="xs" fontWeight="600" color={colors.textSecondary}>{t('Customer')}</Th>
                    <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="right">{t('Total')}</Th>
                    <Th fontSize="xs" fontWeight="600" color={colors.textSecondary} textAlign="center">{t('Action')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {results.map((sale) => (
                    <Tr key={sale.id}>
                      <Td fontSize="sm" fontWeight="600" fontFamily="mono">{sale.invoice_number || `#${sale.id}`}</Td>
                      <Td fontSize="sm">{getCustomerName(sale)}</Td>
                      <Td fontSize="sm" fontWeight="600" textAlign="right" color="brand.500">{formatAmount(sale.total)}</Td>
                      <Td textAlign="center">
                        <HStack spacing={1} justify="center">
                          <Button
                            size="xs"
                            colorScheme="brand"
                            leftIcon={<FileText size={13} />}
                            borderRadius="lg"
                            fontWeight="600"
                            onClick={() => printInvoice(sale)}
                          >
                            {t('Print Invoice')}
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="orange"
                            leftIcon={<ChefHat size={13} />}
                            borderRadius="lg"
                            fontWeight="600"
                            onClick={() => printKot(sale)}
                          >
                            {t('Print KOT')}
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} borderRadius="lg">{t('Close')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
