import { ExternalLinkIcon, CheckIcon } from '@chakra-ui/icons';
import {
  ShoppingBag, User, Printer, Calculator, Maximize2, Minimize2,
  Tag as TagIcon, Gift, CreditCard, Banknote, Smartphone,
  RotateCcw, Pause, ClipboardList, Users, GitMerge,
  Package, Store, Coffee, Utensils, Bike, Star,
  FileText, StickyNote, Truck,
} from 'lucide-react';

export const ORDER_TYPES = [
  { value: 'dine_in', label: 'Dine In', icon: Utensils },
  { value: 'takeaway', label: 'Takeaway', icon: Coffee },
  { value: 'delivery', label: 'Delivery', icon: Bike },
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'online', label: 'Online', icon: ExternalLinkIcon },
  { value: 'credit', label: 'Credit', icon: ClipboardList },
  { value: 'loyalty', label: 'Loyalty', icon: Star },
  { value: 'gift_card', label: 'Gift Card', icon: Gift },
  { value: 'other', label: 'Other', icon: FileText },
];
