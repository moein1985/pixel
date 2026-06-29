-- Phase 5: Database Index Optimization
-- Run after all migrations for Phase 2-5 schemas

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products (category_id, price_per_unit);
CREATE INDEX IF NOT EXISTS idx_products_supplier_active ON products (supplier_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products (stock_status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON orders (buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_status ON orders (supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- RFQ indexes
CREATE INDEX IF NOT EXISTS idx_rfqs_status_created ON rfqs (status, created_at DESC) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer ON rfqs (buyer_id, created_at DESC);

-- RFQ bids
CREATE INDEX IF NOT EXISTS idx_rfq_bids_rfq ON rfq_bids (rfq_id, created_at DESC);

-- Market prices
CREATE INDEX IF NOT EXISTS idx_market_prices_product_date ON market_prices (product_name, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_prices_province ON market_prices (province, recorded_at DESC);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages (conversation_id, created_at DESC);

-- Articles
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles (published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category, published_at DESC) WHERE status = 'published';

-- Market reports
CREATE INDEX IF NOT EXISTS idx_market_reports_published ON market_reports (published_at DESC) WHERE status = 'published';

-- Networks
CREATE INDEX IF NOT EXISTS idx_networks_type ON farmer_networks (network_type, is_active);
CREATE INDEX IF NOT EXISTS idx_network_posts_network ON network_posts (network_id, created_at DESC);

-- Shipments
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments (order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_shipment ON shipment_tracking (shipment_id, recorded_at DESC);

-- Webhooks
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries (webhook_id, created_at DESC);

-- API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys (user_id, is_active);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews (reviewee_type, reviewee_id, created_at DESC);

-- Inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status, created_at DESC);

-- Advertisements
CREATE INDEX IF NOT EXISTS idx_ads_active ON advertisements (is_active, start_date, end_date);
