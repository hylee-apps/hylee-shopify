// ─── Primitives ──────────────────────────────────────────────────────────────

export type ConsentState = 'granted' | 'denied';
export type Environment = 'production' | 'staging' | 'development';
export type CustomerStatus = 'guest' | 'new' | 'returning' | 'vip' | 'at_risk';

export type PageType =
    | 'home'
    | 'product'
    | 'collection'
    | 'cart'
    | 'search'
    | 'blog'
    | 'article'
    | 'account'
    | 'not_found'
    | 'other';

// ─── Consent ─────────────────────────────────────────────────────────────────

export interface ConsentPayload {
    ad_storage: ConsentState;
    ad_user_data: ConsentState;
    ad_personalization: ConsentState;
    analytics_storage: ConsentState;
    functionality_storage: ConsentState;
    personalization_storage: ConsentState;
}

export interface ConsentDefaultEvent {
    event: 'consent_default';
    consent: ConsentPayload & { wait_for_update: number };
}

export interface ConsentUpdateEvent {
    event: 'consent_update';
    consent: ConsentPayload;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface AbTest {
    test_id: string;
    variant: string;
}

export interface SessionEvent {
    event: 'dl_session';
    session: {
        environment: Environment;
        store_locale: string;
        store_currency: string;
        is_bot: boolean;
        ab_tests: AbTest[];
    };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export interface PageEvent {
    event: 'dl_page';
    page: {
        type: PageType;
        path: string;
        title: string;
        referrer: string;

        product_id?: string;
        product_name?: string;
        variant_id?: string;
        vendor?: string;
        product_type?: string;

        collection_id?: string;
        collection_name?: string;

        search_term?: string;
        search_results_count?: number;
    };
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserEvent {
    event: 'dl_user';
    user: {
        id: string | null;
        email_hashed: string | null;
        phone_hashed: string | null;
        is_authenticated: boolean;
        status: CustomerStatus;
        lifetime_orders: number;
        lifetime_value: number;
        days_since_last_order: number | null;
        predicted_ltv: number | null;
        customer_tags: string[];
        acquisition_source: string | null;
    };
}

// ─── Ecommerce ───────────────────────────────────────────────────────────────

export interface DataLayerItem {
    item_id: string;
    item_name: string;
    item_brand: string;
    item_category: string;
    item_category2?: string;
    item_category3?: string;
    item_variant: string;
    price: number;
    quantity: number;
    discount?: number;
    index?: number;
    item_list_id?: string;
    item_list_name?: string;
    affiliation?: string;
}

export interface EcommerceReset { ecommerce: null }

export interface ViewItemListEvent {
    event: 'view_item_list';
    ecommerce: {
        item_list_id: string;
        item_list_name: string;
        items: DataLayerItem[];
    };
}

export interface SelectItemEvent {
    event: 'select_item';
    ecommerce: {
        item_list_id: string;
        item_list_name: string;
        items: [DataLayerItem];
    };
}

export interface ViewItemEvent {
    event: 'view_item';
    ecommerce: { currency: string; value: number; items: [DataLayerItem] };
}

export interface AddToCartEvent {
    event: 'add_to_cart';
    ecommerce: { currency: string; value: number; items: [DataLayerItem] };
}

export interface RemoveFromCartEvent {
    event: 'remove_from_cart';
    ecommerce: { currency: string; value: number; items: [DataLayerItem] };
}

export interface ViewCartEvent {
    event: 'view_cart';
    ecommerce: { currency: string; value: number; items: DataLayerItem[] };
}

export interface BeginCheckoutEvent {
    event: 'begin_checkout';
    ecommerce: { currency: string; value: number; coupon: string; items: DataLayerItem[] };
}

export interface PurchaseEvent {
    event: 'purchase';
    ecommerce: {
        transaction_id: string;
        value: number;
        tax: number;
        shipping: number;
        currency: string;
        coupon: string;
        affiliation: string;
        items: DataLayerItem[];
    };
}

export interface SearchEvent {
    event: 'search';
    search_term: string;
    search_results_count: number;
}

export interface PageViewEvent {
    event: 'page_view';
    page_path: string;
    page_title: string;
}

// ─── Union ───────────────────────────────────────────────────────────────────

export type DataLayerPush =
    | ConsentDefaultEvent
    | ConsentUpdateEvent
    | SessionEvent
    | PageEvent
    | UserEvent
    | EcommerceReset
    | ViewItemListEvent
    | SelectItemEvent
    | ViewItemEvent
    | AddToCartEvent
    | RemoveFromCartEvent
    | ViewCartEvent
    | BeginCheckoutEvent
    | PurchaseEvent
    | SearchEvent
    | PageViewEvent;