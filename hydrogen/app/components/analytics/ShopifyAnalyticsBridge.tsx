import {useEffect} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {pushEcommerceEvent} from '~/utils/data-layer';
import type {DataLayerItem} from '~/types/data-layer';

function stripGid(gid: string): string {
  return gid.split('/').pop() ?? gid;
}

function lineToItem(line: any, index: number): DataLayerItem {
  const merch = line.merchandise;
  const product = merch?.product ?? {};
  const opts: Array<{name: string; value: string}> = merch?.selectedOptions ?? [];
  const variantTitle =
    opts
      .filter((o) => !(o.name === 'Title' && o.value === 'Default Title'))
      .map((o) => o.value)
      .join(' / ') ||
    merch?.title ||
    'Default';
  const unitPrice = parseFloat(
    merch?.price?.amount ?? line.cost?.amountPerQuantity?.amount ?? '0',
  );
  return {
    item_id: merch?.sku || stripGid(merch?.id || ''),
    item_name: product?.title ?? '',
    item_brand: product?.vendor ?? '',
    item_category: product?.productType ?? '',
    item_variant: variantTitle,
    price: unitPrice,
    quantity: line.quantity ?? 1,
    index: index + 1,
  };
}

/**
 * Bridges Hydrogen's native analytics events to the GTM dataLayer.
 * Must be rendered inside Analytics.Provider.
 *
 * Handles: add_to_cart, remove_from_cart
 * (view_item, view_item_list, view_cart, begin_checkout, purchase are pushed
 * directly in their respective route files for richer data fidelity.)
 */
export function ShopifyAnalyticsBridge(): null {
  const {subscribe, register} = useAnalytics();
  const {ready} = register('ShopifyAnalyticsBridge');

  useEffect(() => {
    subscribe('product_add_to_cart', (payload: any) => {
      const {cart, prevCart} = payload;
      const prevIds = new Set(
        (prevCart?.lines?.nodes ?? []).map((l: any) => l.id),
      );
      const added = (cart?.lines?.nodes ?? []).filter(
        (l: any) => !prevIds.has(l.id),
      );
      if (!added.length) return;

      const currency = cart?.cost?.totalAmount?.currencyCode ?? 'USD';
      const items = added.map(lineToItem);
      const value = items.reduce((s, i) => s + i.price * i.quantity, 0);
      pushEcommerceEvent({
        event: 'add_to_cart',
        ecommerce: {currency, value, items: items as [DataLayerItem]},
      });
    });

    subscribe('product_removed_from_cart', (payload: any) => {
      const {cart, prevCart} = payload;
      const currentIds = new Set(
        (cart?.lines?.nodes ?? []).map((l: any) => l.id),
      );
      const removed = (prevCart?.lines?.nodes ?? []).filter(
        (l: any) => !currentIds.has(l.id),
      );
      if (!removed.length) return;

      const currency = prevCart?.cost?.totalAmount?.currencyCode ?? 'USD';
      const items = removed.map(lineToItem);
      const value = items.reduce((s, i) => s + i.price * i.quantity, 0);
      pushEcommerceEvent({
        event: 'remove_from_cart',
        ecommerce: {currency, value, items: items as [DataLayerItem]},
      });
    });

    ready();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
