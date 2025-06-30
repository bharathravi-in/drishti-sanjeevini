export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: string;
  currency: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SahTplg2TL2Yi1',
    priceId: 'price_1RfW52EFZ4chzwCDvlpo4Td3',
    name: 'DRiSHTi Premium',
    description: 'Unlock premium features and enhanced community support',
    mode: 'payment',
    price: '₹100.00',
    currency: 'INR',
  },
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};