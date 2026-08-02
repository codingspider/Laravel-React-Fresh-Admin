import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link as ReactRouterLink } from "react-router-dom";
import {
  Box, Card, CardBody, Breadcrumb, BreadcrumbItem, BreadcrumbLink, useToast,
  Heading, Text, Flex, Button, Tabs, TabList, Tab, TabPanels, TabPanel,
  Table, Thead, Tbody, Tr, Th, Td, Badge, SimpleGrid, Input, Select, FormControl, FormLabel,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  useDisclosure, Divider,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import api from "../../../axios";
import {
  GET_EDIT_PURCHASE, RECEIVE_GOODS, ADD_PURCHASE_PAYMENT, CREATE_PURCHASE_RETURN, LIST_PURCHASE_PAYMENTS, LIST_PURCHASE_RETURNS,
} from "../../../routes/apiRoutes";
import { DASHBOARD_PATH, PURCHASE_LIST_PATH } from "../../../routes/superAdminRoutes";
import useThemeColors from "../../../hooks/useThemeColors";

const PurchaseView = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const colors = useThemeColors();
  const [purchase, setPurchase] = useState(null);
  const [payments, setPayments] = useState([]);
  const [returns, setReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen: isGrnOpen, onOpen: onGrnOpen, onClose: onGrnClose } = useDisclosure();
  const { isOpen: isPayOpen, onOpen: onPayOpen, onClose: onPayClose } = useDisclosure();
  const { isOpen: isRetOpen, onOpen: onRetOpen, onClose: onRetClose } = useDisclosure();
  const [grnItems, setGrnItems] = useState({});
  const [paymentForm, setPaymentForm] = useState({ amount: "", payment_method: "cash", payment_date: new Date().toISOString().split("T")[0], reference_number: "", notes: "" });
  const [returnForm, setReturnForm] = useState({ type: "return", reason: "", items: {} });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [pRes, payRes, retRes] = await Promise.all([
        api.get(GET_EDIT_PURCHASE(id)),
        api.get(LIST_PURCHASE_PAYMENTS(id)),
        api.get(LIST_PURCHASE_RETURNS(id)),
      ]);
      setPurchase(pRes.data?.data);
      setPayments(payRes.data?.data || []);
      setReturns(retRes.data?.data || []);
    } catch (err) {
      toast({ title: t("error"), description: t("failed_to_load_purchase"), status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  }, [id, t, toast]);

  useEffect(() => {
    const app_name = localStorage.getItem("app_name");
    document.title = `${app_name} | ${t("purchase_details")}`;
    fetchData();
  }, [fetchData, t]);

  const openGrn = () => {
    const initial = {};
    (purchase?.items || []).forEach((pi) => {
      initial[pi.id] = { received_quantity: pi.quantity, rejected_quantity: 0, batch_number: "", expiry_date: "" };
    });
    setGrnItems(initial);
    onGrnOpen();
  };

  const submitGrn = async () => {
    setIsSubmitting(true);
    try {
      const items = Object.entries(grnItems).map(([purchaseItemId, vals]) => ({
        purchase_item_id: Number(purchaseItemId),
        received_quantity: Number(vals.received_quantity) || 0,
        rejected_quantity: Number(vals.rejected_quantity) || 0,
        batch_number: vals.batch_number || null,
        expiry_date: vals.expiry_date || null,
      }));
      const res = await api.post(RECEIVE_GOODS(id), { items });
      toast({ title: res.data.message || t("grn_created"), status: "success", duration: 3000, isClosable: true });
      onGrnClose();
      fetchData();
    } catch (err) {
      toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitPayment = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post(ADD_PURCHASE_PAYMENT(id), paymentForm);
      toast({ title: res.data.message || t("payment_created"), status: "success", duration: 3000, isClosable: true });
      setPaymentForm({ amount: "", payment_method: "cash", payment_date: new Date().toISOString().split("T")[0], reference_number: "", notes: "" });
      onPayClose();
      fetchData();
    } catch (err) {
      toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReturn = () => {
    const initial = {};
    (purchase?.items || []).forEach((pi) => {
      initial[pi.id] = { inventory_item_id: pi.inventory_item_id, quantity: "", unit_cost: pi.unit_price, reason: "" };
    });
    setReturnForm((prev) => ({ ...prev, items: initial }));
    onRetOpen();
  };

  const submitReturn = async () => {
    setIsSubmitting(true);
    try {
      const items = Object.entries(returnForm.items)
        .filter(([_, vals]) => Number(vals.quantity) > 0)
        .map(([purchaseItemId, vals]) => ({
          purchase_item_id: Number(purchaseItemId),
          inventory_item_id: Number(vals.inventory_item_id),
          quantity: Number(vals.quantity),
          unit_cost: Number(vals.unit_cost) || 0,
          reason: vals.reason || null,
        }));
      const res = await api.post(CREATE_PURCHASE_RETURN(id), { type: returnForm.type, reason: returnForm.reason, items });
      toast({ title: res.data.message || t("purchase_return_created"), status: "success", duration: 3000, isClosable: true });
      onRetClose();
      fetchData();
    } catch (err) {
      toast({ title: t("error"), description: err?.response?.data?.message || t("something_went_wrong"), status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !purchase) return null;

  const due = Number(purchase.due_amount);

  return (
    <Box py={3}>
      <Box mx="auto">
        <Card mb={4} bg={colors.bgCard} shadow="sm" borderRadius="lg" border="none">
          <CardBody py={3}>
            <Breadcrumb fontSize="sm" color={colors.textSecondary}>
              <BreadcrumbItem>
                <BreadcrumbLink as={ReactRouterLink} to={DASHBOARD_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>{t("dashboard")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink as={ReactRouterLink} to={PURCHASE_LIST_PATH} fontWeight="medium" _hover={{ color: "teal.500" }}>{t("purchases")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink color={colors.textPrimary} fontWeight="bold">{purchase.reference_number}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4} mb={4}>
          <Card bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
            <CardBody>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("total")}</Text>
              <Heading size="lg" color={colors.textPrimary} mt={1}>{purchase.total}</Heading>
            </CardBody>
          </Card>
          <Card bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
            <CardBody>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("paid")}</Text>
              <Heading size="lg" color="green.500" mt={1}>{purchase.paid_amount}</Heading>
            </CardBody>
          </Card>
          <Card bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
            <CardBody>
              <Text fontSize="xs" color={colors.textSecondary} fontWeight="600">{t("due")}</Text>
              <Heading size="lg" color={due > 0 ? "red.500" : "green.500"} mt={1}>{purchase.due_amount}</Heading>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card mb={4} bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Box>
                <Text fontSize="xs" color={colors.textSecondary}>{t("supplier")}</Text>
                <Text fontSize="sm" fontWeight="600">{purchase.supplier?.name || "-"}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={colors.textSecondary}>{t("branch")}</Text>
                <Text fontSize="sm" fontWeight="600">{purchase.branch?.name || "-"}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={colors.textSecondary}>{t("purchase_date")}</Text>
                <Text fontSize="sm" fontWeight="600">{purchase.purchase_date || "-"}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={colors.textSecondary}>{t("invoice_number")}</Text>
                <Text fontSize="sm" fontWeight="600">{purchase.invoice_number || "-"}</Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card bg={colors.bgCard} borderRadius="xl" boxShadow="card" border="1px solid" borderColor={colors.borderDefault}>
          <CardBody>
            <Tabs variant="enclosed" colorScheme="teal">
              <TabList mb={4}>
                <Tab>{t("items")}</Tab>
                <Tab>{t("receive_goods")} ({purchase.goods_received_notes?.length || 0})</Tab>
                <Tab>{t("payments")} ({payments.length})</Tab>
                <Tab>{t("returns")} ({returns.length})</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>{t("item")}</Th>
                        <Th isNumeric>{t("quantity")}</Th>
                        <Th isNumeric>{t("unit_price")}</Th>
                        <Th isNumeric>{t("tax")}</Th>
                        <Th isNumeric>{t("total")}</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(purchase.items || []).map((pi) => (
                        <Tr key={pi.id}>
                          <Td>{pi.inventory_item?.name || pi.item_name}</Td>
                          <Td isNumeric>{pi.quantity}</Td>
                          <Td isNumeric>{pi.unit_price}</Td>
                          <Td isNumeric>{pi.tax_amount}</Td>
                          <Td isNumeric fontWeight="600">{pi.total}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TabPanel>
                <TabPanel>
                  <Flex justify="flex-end" mb={3}>
                    <Button size="sm" colorScheme="teal" onClick={openGrn}>{t("receive_goods")}</Button>
                  </Flex>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>{t("grn_number")}</Th>
                        <Th>{t("received_date")}</Th>
                        <Th isNumeric>{t("total_received")}</Th>
                        <Th isNumeric>{t("total_rejected")}</Th>
                        <Th>{t("status")}</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(purchase.goods_received_notes || []).map((grn) => (
                        <Tr key={grn.id}>
                          <Td fontWeight="600">{grn.grn_number}</Td>
                          <Td>{grn.received_date}</Td>
                          <Td isNumeric>{grn.total_received}</Td>
                          <Td isNumeric>{grn.total_rejected}</Td>
                          <Td><Badge colorScheme="green" variant="subtle">{grn.status}</Badge></Td>
                        </Tr>
                      ))}
                      {(purchase.goods_received_notes || []).length === 0 && (
                        <Tr><Td colSpan={5} textAlign="center" color={colors.textMuted}>{t("no_grn_yet")}</Td></Tr>
                      )}
                    </Tbody>
                  </Table>
                </TabPanel>
                <TabPanel>
                  <Flex justify="flex-end" mb={3}>
                    <Button size="sm" colorScheme="teal" onClick={onPayOpen}>{t("add_payment")}</Button>
                  </Flex>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>{t("payment_number")}</Th>
                        <Th>{t("date")}</Th>
                        <Th isNumeric>{t("amount")}</Th>
                        <Th>{t("method")}</Th>
                        <Th>{t("status")}</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {payments.map((p) => (
                        <Tr key={p.id}>
                          <Td fontWeight="600">{p.payment_number}</Td>
                          <Td>{p.payment_date}</Td>
                          <Td isNumeric fontWeight="600">{p.amount}</Td>
                          <Td>{p.payment_method}</Td>
                          <Td><Badge colorScheme={p.status === "completed" ? "green" : "yellow"} variant="subtle">{p.status}</Badge></Td>
                        </Tr>
                      ))}
                      {payments.length === 0 && <Tr><Td colSpan={5} textAlign="center" color={colors.textMuted}>{t("no_payments_yet")}</Td></Tr>}
                    </Tbody>
                  </Table>
                </TabPanel>
                <TabPanel>
                  <Flex justify="flex-end" mb={3}>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={openReturn}>{t("create_return")}</Button>
                  </Flex>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>{t("return_number")}</Th>
                        <Th>{t("date")}</Th>
                        <Th>{t("type")}</Th>
                        <Th isNumeric>{t("total")}</Th>
                        <Th>{t("status")}</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {returns.map((r) => (
                        <Tr key={r.id}>
                          <Td fontWeight="600">{r.return_number}</Td>
                          <Td>{r.return_date}</Td>
                          <Td>{r.type === "debit_note" ? t("debit_note") : t("return")}</Td>
                          <Td isNumeric fontWeight="600">{r.total}</Td>
                          <Td><Badge colorScheme={r.status === "approved" ? "green" : "yellow"} variant="subtle">{r.status}</Badge></Td>
                        </Tr>
                      ))}
                      {returns.length === 0 && <Tr><Td colSpan={5} textAlign="center" color={colors.textMuted}>{t("no_returns_yet")}</Td></Tr>}
                    </Tbody>
                  </Table>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

        {/* GRN Modal */}
        <Modal isOpen={isGrnOpen} onClose={onGrnClose} size="xl">
          <ModalOverlay />
          <ModalContent bg={colors.bgCard}>
            <ModalHeader>{t("receive_goods")}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>{t("item")}</Th>
                    <Th>{t("received")}</Th>
                    <Th>{t("rejected")}</Th>
                    <Th>{t("batch")}</Th>
                    <Th>{t("expiry")}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                                  {(purchase.items || []).map((pi) => (
                    <Tr key={pi.id}>
                      <Td>{pi.inventory_item?.name || pi.item_name}</Td>
                      <Td>
                        <Input size="sm" type="number" min="0" step="0.01" value={grnItems[pi.id]?.received_quantity ?? ""} onChange={(e) => setGrnItems((prev) => ({ ...prev, [pi.id]: { ...prev[pi.id], received_quantity: e.target.value } }))} bg={colors.bgInput}
                          borderRadius="md" border="1px solid" borderColor={colors.borderInput}
                        />
                      </Td>
                      <Td>
                        <Input size="sm" type="number" min="0" step="0.01" value={grnItems[pi.id]?.rejected_quantity ?? ""} onChange={(e) => setGrnItems((prev) => ({ ...prev, [pi.id]: { ...prev[pi.id], rejected_quantity: e.target.value } }))} bg={colors.bgInput}
                          borderRadius="md" border="1px solid" borderColor={colors.borderInput}
                        />
                      </Td>
                      <Td>
                        <Input size="sm" value={grnItems[pi.id]?.batch_number ?? ""} placeholder={t("batch_number")} onChange={(e) => setGrnItems((prev) => ({ ...prev, [pi.id]: { ...prev[pi.id], batch_number: e.target.value } }))} bg={colors.bgInput}
                          borderRadius="md" border="1px solid" borderColor={colors.borderInput}
                        />
                      </Td>
                      <Td>
                        <Input size="sm" type="date" value={grnItems[pi.id]?.expiry_date ?? ""} onChange={(e) => setGrnItems((prev) => ({ ...prev, [pi.id]: { ...prev[pi.id], expiry_date: e.target.value } }))} bg={colors.bgInput}
                          borderRadius="md" border="1px solid" borderColor={colors.borderInput}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onGrnClose}>{t("cancel")}</Button>
              <Button colorScheme="teal" isLoading={isSubmitting} onClick={submitGrn}>{t("confirm_receive")}</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Payment Modal */}
        <Modal isOpen={isPayOpen} onClose={onPayClose}>
          <ModalOverlay />
          <ModalContent bg={colors.bgCard}>
            <ModalHeader>{t("add_payment")}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
             <Flex direction="column" gap={4}>
                 <FormControl isRequired>
                   <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("amount")}</FormLabel>
                   <Input type="number" min="0" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} bg={colors.bgInput}
                     borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                   />
                 </FormControl>
                 <FormControl>
                   <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("payment_date")}</FormLabel>
                   <Input type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm((p) => ({ ...p, payment_date: e.target.value }))} bg={colors.bgInput}
                     borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                   />
                 </FormControl>
                 <FormControl>
                   <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("method")}</FormLabel>
                   <Select value={paymentForm.payment_method} onChange={(e) => setPaymentForm((p) => ({ ...p, payment_method: e.target.value }))} bg={colors.bgInput}
                     borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                   >
                     <option value="cash">{t("cash")}</option>
                     <option value="bank_transfer">{t("bank_transfer")}</option>
                     <option value="cheque">{t("cheque")}</option>
                     <option value="card">{t("card")}</option>
                     <option value="other">{t("other")}</option>
                   </Select>
                 </FormControl>
                 <FormControl>
                   <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("reference_number")}</FormLabel>
                   <Input value={paymentForm.reference_number} onChange={(e) => setPaymentForm((p) => ({ ...p, reference_number: e.target.value }))} bg={colors.bgInput}
                     borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                   />
                 </FormControl>
                 <FormControl>
                   <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("notes")}</FormLabel>
                   <Input value={paymentForm.notes} onChange={(e) => setPaymentForm((p) => ({ ...p, notes: e.target.value }))} bg={colors.bgInput}
                     borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                   />
                 </FormControl>
               </Flex>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onPayClose}>{t("cancel")}</Button>
              <Button colorScheme="teal" isLoading={isSubmitting} onClick={submitPayment}>{t("save")}</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Return Modal */}
        <Modal isOpen={isRetOpen} onClose={onRetClose} size="xl">
          <ModalOverlay />
          <ModalContent bg={colors.bgCard}>
            <ModalHeader>{t("create_return")}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex direction="column" gap={4}>
                <Flex gap={4}>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("type")}</FormLabel>
                    <Select value={returnForm.type} onChange={(e) => setReturnForm((r) => ({ ...r, type: e.target.value }))} bg={colors.bgInput}
                      borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                    >
                      <option value="return">{t("return")}</option>
                      <option value="debit_note">{t("debit_note")}</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={colors.textPrimary} mb={2}>{t("reason")}</FormLabel>
                    <Input value={returnForm.reason} onChange={(e) => setReturnForm((r) => ({ ...r, reason: e.target.value }))} bg={colors.bgInput}
                      borderRadius="md" border="1px solid" borderColor={colors.borderInput} focusBorderColor="teal.500" _hover={{ borderColor: "gray.300" }}
                    />
                  </FormControl>
                </Flex>
                <Divider />
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>{t("item")}</Th>
                      <Th>{t("quantity")}</Th>
                      <Th>{t("unit_cost")}</Th>
                      <Th>{t("reason")}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(purchase.items || []).map((pi) => (
                      <Tr key={pi.id}>
                        <Td>{pi.inventory_item?.name || pi.item_name}</Td>
                        <Td>
                          <Input size="sm" type="number" min="0" step="0.01" value={returnForm.items[pi.id]?.quantity ?? ""} onChange={(e) => setReturnForm((r) => ({ ...r, items: { ...r.items, [pi.id]: { ...r.items[pi.id], quantity: e.target.value } } }))} bg={colors.bgInput}
                            borderRadius="md" border="1px solid" borderColor={colors.borderInput}
                          />
                        </Td>
                        <Td>
                          <Input size="sm" type="number" min="0" step="0.01" value={returnForm.items[pi.id]?.unit_cost ?? pi.unit_price} onChange={(e) => setReturnForm((r) => ({ ...r, items: { ...r.items, [pi.id]: { ...r.items[pi.id], unit_cost: e.target.value } } }))} bg={colors.bgInput}
                            borderRadius="md" border="1px solid" borderColor={colors.borderInput}
                          />
                        </Td>
                        <Td>
                          <Input size="sm" value={returnForm.items[pi.id]?.reason ?? ""} onChange={(e) => setReturnForm((r) => ({ ...r, items: { ...r.items, [pi.id]: { ...r.items[pi.id], reason: e.target.value } } }))} bg={colors.bgInput}
                            borderRadius="md" border="1px solid" borderColor={colors.borderInput}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onRetClose}>{t("cancel")}</Button>
              <Button colorScheme="red" isLoading={isSubmitting} onClick={submitReturn}>{t("submit")}</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default PurchaseView;
