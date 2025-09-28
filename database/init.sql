-- Code4Mena Legal Assistant Database Initialization
-- This script sets up the initial database structure

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'code4mena_user') THEN
        CREATE ROLE code4mena_user WITH LOGIN PASSWORD 'secure_password_2024';
    END IF;
END
$$;

-- Grant permissions
GRANT CONNECT ON DATABASE code4mena_legal TO code4mena_user;
GRANT USAGE ON SCHEMA public TO code4mena_user;
GRANT CREATE ON SCHEMA public TO code4mena_user;

-- Legal documents table with vector embeddings
CREATE TABLE IF NOT EXISTS legal_documents (
    id SERIAL PRIMARY KEY,
    article_number VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    source_document VARCHAR(200),
    official_url TEXT,
    language VARCHAR(10) DEFAULT 'ar',
    embedding vector(384),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query logs table (privacy-compliant)
CREATE TABLE IF NOT EXISTS query_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_query_hash VARCHAR(64) NOT NULL,
    abstract_query TEXT NOT NULL,
    user_id VARCHAR(100),
    language VARCHAR(10) DEFAULT 'ar',
    pii_detected JSONB,
    response_generated BOOLEAN DEFAULT FALSE,
    sources_count INTEGER DEFAULT 0,
    error_message TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Query analytics table
CREATE TABLE IF NOT EXISTS query_analytics (
    id SERIAL PRIMARY KEY,
    abstract_query_hash VARCHAR(64) NOT NULL,
    abstract_query TEXT NOT NULL,
    language VARCHAR(10),
    category VARCHAR(100),
    query_count INTEGER DEFAULT 1,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    avg_processing_time_ms INTEGER DEFAULT 0,
    last_queried TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(abstract_query_hash, language)
);

-- User feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id SERIAL PRIMARY KEY,
    query_id UUID REFERENCES query_logs(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    helpful BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2),
    metric_data JSONB,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS legal_documents_embedding_idx 
ON legal_documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS legal_documents_content_idx 
ON legal_documents USING gin(to_tsvector('arabic', content));

CREATE INDEX IF NOT EXISTS legal_documents_category_idx 
ON legal_documents(category);

CREATE INDEX IF NOT EXISTS legal_documents_language_idx 
ON legal_documents(language);

CREATE INDEX IF NOT EXISTS query_logs_created_at_idx 
ON query_logs(created_at);

CREATE INDEX IF NOT EXISTS query_logs_user_id_idx 
ON query_logs(user_id);

CREATE INDEX IF NOT EXISTS query_analytics_category_idx 
ON query_analytics(category);

CREATE INDEX IF NOT EXISTS query_analytics_query_count_idx 
ON query_analytics(query_count DESC);

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO code4mena_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO code4mena_user;

-- Insert sample legal documents
INSERT INTO legal_documents (article_number, title, content, category, source_document, official_url, language) VALUES
('المادة 1', 'تأسيس الشركات التجارية', 'يجب على كل من يرغب في تأسيس شركة تجارية أن يقدم طلباً إلى السجل التجاري مرفقاً بالوثائق المطلوبة وهي: عقد التأسيس، رأس المال المطلوب، هوية المؤسسين، عنوان المقر الاجتماعي. يجب أن يكون رأس المال المدفوع لا يقل عن الحد الأدنى المحدد قانونياً.', 'business_law', 'مجلة الشركات التجارية', 'https://legislation.tn/business-law/article-1', 'ar'),

('المادة 15', 'رخص المؤسسات الغذائية', 'تخضع المؤسسات التي تمارس أنشطة تحضير أو بيع المواد الغذائية لترخيص مسبق من وزارة الصحة. يجب تقديم شهادة صحية، خطة المحل، وشهادة تكوين في النظافة الغذائية. مدة صلاحية الترخيص سنة واحدة قابلة للتجديد.', 'administrative_law', 'قانون سلامة الغذاء', 'https://legislation.tn/food-safety/article-15', 'ar'),

('المادة 8', 'عقود العمل', 'يجب أن يكون عقد العمل مكتوباً ويتضمن: هوية الطرفين، طبيعة العمل، مدة العقد، الأجر، ساعات العمل، مكان العمل. يحق للعامل الحصول على نسخة من العقد. العقد الشفهي صحيح لكن يصعب إثباته عند النزاع.', 'labor_law', 'مجلة الشغل', 'https://legislation.tn/labor-law/article-8', 'ar'),

('المادة 22', 'الضرائب على الدخل', 'يخضع كل شخص طبيعي أو معنوي يحقق دخلاً في تونس لضريبة على الدخل. المعدلات تتراوح من 0% إلى 35% حسب شرائح الدخل المحددة في القانون. يجب التصريح بالدخل سنوياً قبل 31 مارس من السنة الموالية.', 'tax_law', 'مجلة الضرائب', 'https://legislation.tn/tax-law/article-22', 'ar'),

('المادة 5', 'حقوق الملكية العقارية', 'يثبت حق الملكية العقارية بالرسم العقاري المسجل لدى إدارة أملاك الدولة. يجب تسجيل كل عملية بيع أو شراء عقار خلال 30 يوماً من تاريخ العقد. عدم التسجيل في الآجال يعرض للغرامات المالية.', 'civil_law', 'مجلة الحقوق العينية', 'https://legislation.tn/property-law/article-5', 'ar'),

('المادة 12', 'الزواج والطلاق', 'يتم عقد الزواج أمام ضابط الحالة المدنية بحضور الشاهدين وبموافقة الطرفين. السن القانونية للزواج 18 سنة للذكر والأنثى. يمكن طلب الطلاق بالتراضي أو أمام المحكمة في حالة الخلاف.', 'family_law', 'مجلة الأحوال الشخصية', 'https://legislation.tn/family-law/article-12', 'ar');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_legal_documents_updated_at 
    BEFORE UPDATE ON legal_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_query_logs_updated_at 
    BEFORE UPDATE ON query_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for analytics dashboard
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_queries,
    COUNT(*) FILTER (WHERE response_generated = true) as successful_queries,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(processing_time_ms) as avg_processing_time,
    language
FROM query_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), language
ORDER BY date DESC;

-- Grant view permissions
GRANT SELECT ON analytics_dashboard TO code4mena_user;

-- KANOUNJI 2025 REVOLUTIONARY VECTOR-ENABLED TABLES FOR SCRAPED DATA STORAGE

-- Legal signals from all sources (government social, parliamentary, 9anoun)
CREATE TABLE IF NOT EXISTS legal_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signal_id VARCHAR(50) UNIQUE NOT NULL,
    source_platform VARCHAR(50) NOT NULL, -- 'facebook', 'twitter', 'marsad', '9anoun', 'government_website'
    source_account VARCHAR(200),
    ministry VARCHAR(200),
    content TEXT NOT NULL,
    content_hash VARCHAR(64) UNIQUE, -- Prevent duplicates
    legal_relevance_score FLOAT DEFAULT 0.0,
    detected_topics TEXT[], -- Array of detected legal topics
    signal_type VARCHAR(50), -- 'announcement', 'discussion', 'vote', 'law_change'
    language VARCHAR(10) DEFAULT 'ar',
    urgency VARCHAR(20) DEFAULT 'normal', -- 'high', 'normal', 'low'
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    embedding vector(384), -- Vector embedding for semantic search
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Government social media posts
CREATE TABLE IF NOT EXISTS government_social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministry VARCHAR(200) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'facebook', 'twitter', 'instagram', 'website'
    account_name VARCHAR(200),
    post_content TEXT NOT NULL,
    post_url TEXT,
    post_date TIMESTAMP,
    engagement_metrics JSONB DEFAULT '{}', -- likes, shares, comments
    legal_significance FLOAT DEFAULT 0.0,
    extracted_legal_info JSONB DEFAULT '{}',
    content_hash VARCHAR(64) UNIQUE,
    embedding vector(384), -- Vector embedding for semantic search
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE
);

-- Parliamentary activity from Marsad
CREATE TABLE IF NOT EXISTS parliamentary_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) UNIQUE NOT NULL,
    session_date DATE NOT NULL,
    session_type VARCHAR(50), -- 'plenary', 'committee', 'special'
    topics_discussed TEXT[],
    mp_attendance JSONB DEFAULT '{}',
    voting_results JSONB DEFAULT '{}',
    transcripts TEXT,
    marsad_url TEXT,
    legal_significance FLOAT DEFAULT 0.0,
    embedding vector(384), -- Vector embedding for semantic search
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9anoun.tn legal documents (enhanced with vectors)
CREATE TABLE IF NOT EXISTS qanoun_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(100) UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    full_content TEXT,
    document_url TEXT,
    document_type VARCHAR(50), -- 'law', 'decree', 'decision', 'jurisprudence'
    legal_category VARCHAR(100),
    legal_reference VARCHAR(200), -- e.g., "قانون عدد 123 لسنة 2024"
    publication_date DATE,
    source_section VARCHAR(100),
    content_hash VARCHAR(64) UNIQUE,
    embedding vector(384), -- Vector embedding for semantic search
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MP voting patterns and activity
CREATE TABLE IF NOT EXISTS mp_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mp_id VARCHAR(100) NOT NULL,
    mp_name VARCHAR(200) NOT NULL,
    party VARCHAR(200),
    constituency VARCHAR(200),
    attendance_rate FLOAT DEFAULT 0.0,
    voting_record JSONB DEFAULT '{}', -- law_id -> vote
    questions_asked INTEGER DEFAULT 0,
    interventions INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mp_id, mp_name)
);

-- Legal predictions and analytics
CREATE TABLE IF NOT EXISTS legal_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id VARCHAR(100) UNIQUE NOT NULL,
    law_title TEXT NOT NULL,
    law_category VARCHAR(100),
    passage_probability FLOAT,
    confidence_score FLOAT,
    timeline_estimate VARCHAR(100),
    key_factors TEXT[],
    risk_factors TEXT[],
    prediction_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Intelligence queries and responses (for analytics)
CREATE TABLE IF NOT EXISTS intelligence_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id VARCHAR(100) UNIQUE NOT NULL,
    original_query TEXT NOT NULL,
    sanitized_query TEXT NOT NULL,
    sources_used JSONB DEFAULT '{}', -- count of each source type
    confidence_score FLOAT,
    response_generated BOOLEAN DEFAULT FALSE,
    processing_time_ms INTEGER,
    user_id VARCHAR(100),
    language VARCHAR(10) DEFAULT 'ar',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vector indexes for semantic search performance
CREATE INDEX IF NOT EXISTS idx_legal_signals_embedding ON legal_signals USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_gov_posts_embedding ON government_social_posts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_parliamentary_embedding ON parliamentary_activity USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_qanoun_embedding ON qanoun_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create regular indexes for performance
CREATE INDEX IF NOT EXISTS idx_legal_signals_source ON legal_signals(source_platform, source_account);
CREATE INDEX IF NOT EXISTS idx_legal_signals_timestamp ON legal_signals(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_legal_signals_relevance ON legal_signals(legal_relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_legal_signals_processed ON legal_signals(processed);

CREATE INDEX IF NOT EXISTS idx_gov_posts_ministry ON government_social_posts(ministry);
CREATE INDEX IF NOT EXISTS idx_gov_posts_platform ON government_social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_gov_posts_date ON government_social_posts(post_date DESC);
CREATE INDEX IF NOT EXISTS idx_gov_posts_significance ON government_social_posts(legal_significance DESC);

CREATE INDEX IF NOT EXISTS idx_parliamentary_date ON parliamentary_activity(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_parliamentary_type ON parliamentary_activity(session_type);
CREATE INDEX IF NOT EXISTS idx_parliamentary_significance ON parliamentary_activity(legal_significance DESC);

CREATE INDEX IF NOT EXISTS idx_qanoun_category ON qanoun_documents(legal_category);
CREATE INDEX IF NOT EXISTS idx_qanoun_type ON qanoun_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_qanoun_date ON qanoun_documents(publication_date DESC);

CREATE INDEX IF NOT EXISTS idx_mp_activity_party ON mp_activity(party);
CREATE INDEX IF NOT EXISTS idx_mp_activity_attendance ON mp_activity(attendance_rate DESC);

CREATE INDEX IF NOT EXISTS idx_predictions_probability ON legal_predictions(passage_probability DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_category ON legal_predictions(law_category);

CREATE INDEX IF NOT EXISTS idx_intelligence_queries_date ON intelligence_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligence_queries_confidence ON intelligence_queries(confidence_score DESC);

-- Grant permissions for new tables
GRANT SELECT, INSERT, UPDATE, DELETE ON legal_signals TO code4mena_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON government_social_posts TO code4mena_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON parliamentary_activity TO code4mena_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON qanoun_documents TO code4mena_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON mp_activity TO code4mena_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON legal_predictions TO code4mena_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON intelligence_queries TO code4mena_user;

-- Insert initial system metrics
INSERT INTO system_metrics (metric_name, metric_value, metric_data) VALUES
('database_version', 2.0, '{"initialized_at": "' || CURRENT_TIMESTAMP || '", "schema_version": "2.0.0-kanounji2025"}'),
('legal_documents_count', (SELECT COUNT(*) FROM legal_documents), '{"last_updated": "' || CURRENT_TIMESTAMP || '"}'),
('kanounji_tables_created', 7, '{"tables": ["legal_signals", "government_social_posts", "parliamentary_activity", "qanoun_documents", "mp_activity", "legal_predictions", "intelligence_queries"]}');

COMMIT;