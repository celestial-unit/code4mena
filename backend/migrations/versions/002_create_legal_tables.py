"""Create legal document tables with pgvector support

Revision ID: 002
Revises: 001
Create Date: 2024-01-01 01:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')
    
    # Create legal_categories table
    op.create_table('legal_categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('name_ar', sa.String(length=255), nullable=False),
        sa.Column('name_fr', sa.String(length=255), nullable=True),
        sa.Column('name_en', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('description_ar', sa.Text(), nullable=True),
        sa.Column('description_fr', sa.Text(), nullable=True),
        sa.Column('description_en', sa.Text(), nullable=True),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_legal_categories')),
        sa.UniqueConstraint('code', name=op.f('uq_legal_categories_code'))
    )
    op.create_index(op.f('ix_name'), 'legal_categories', ['name'], unique=False)
    op.create_index(op.f('ix_name_ar'), 'legal_categories', ['name_ar'], unique=False)
    op.create_index(op.f('ix_code'), 'legal_categories', ['code'], unique=False)

    # Create legal_documents table
    op.create_table('legal_documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('title_ar', sa.String(length=500), nullable=False),
        sa.Column('title_fr', sa.String(length=500), nullable=True),
        sa.Column('title_en', sa.String(length=500), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('content_ar', sa.Text(), nullable=False),
        sa.Column('content_fr', sa.Text(), nullable=True),
        sa.Column('content_en', sa.Text(), nullable=True),
        sa.Column('article_number', sa.String(length=100), nullable=True),
        sa.Column('document_type', sa.String(length=100), nullable=False),
        sa.Column('source', sa.String(length=255), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False, server_default='ar'),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('embedding', Vector(1536), nullable=True),
        sa.Column('embedding_model', sa.String(length=100), nullable=True, server_default='text-embedding-ada-002'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('version', sa.String(length=50), nullable=False, server_default='1.0'),
        sa.Column('view_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('search_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_accessed', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_legal_documents'))
    )
    op.create_index(op.f('ix_title'), 'legal_documents', ['title'], unique=False)
    op.create_index(op.f('ix_title_ar'), 'legal_documents', ['title_ar'], unique=False)
    op.create_index(op.f('ix_article_number'), 'legal_documents', ['article_number'], unique=False)
    op.create_index(op.f('ix_document_type'), 'legal_documents', ['document_type'], unique=False)
    op.create_index(op.f('ix_source'), 'legal_documents', ['source'], unique=False)
    op.create_index(op.f('ix_language'), 'legal_documents', ['language'], unique=False)
    op.create_index(op.f('ix_category_id'), 'legal_documents', ['category_id'], unique=False)
    
    # Create vector similarity index for embeddings
    op.execute('CREATE INDEX ix_legal_documents_embedding ON legal_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)')
    
    # Create composite indexes for better query performance
    op.create_index('ix_legal_documents_category_type', 'legal_documents', ['category_id', 'document_type'], unique=False)
    op.create_index('ix_legal_documents_source_language', 'legal_documents', ['source', 'language'], unique=False)

    # Create legal_queries table
    op.create_table('legal_queries',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('original_query', sa.Text(), nullable=False),
        sa.Column('processed_query', sa.Text(), nullable=False),
        sa.Column('query_hash', sa.String(length=64), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('session_id', sa.String(length=255), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=False, server_default='ar'),
        sa.Column('query_type', sa.String(length=50), nullable=False, server_default='search'),
        sa.Column('pii_detected', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('pii_masked', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('results_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('response_generated', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('processing_time_ms', sa.Integer(), nullable=True),
        sa.Column('error_occurred', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('user_rating', sa.Integer(), nullable=True),
        sa.Column('user_feedback', sa.Text(), nullable=True),
        sa.Column('helpful', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_legal_queries'))
    )
    op.create_index(op.f('ix_query_hash'), 'legal_queries', ['query_hash'], unique=False)
    op.create_index(op.f('ix_legal_queries_user_id'), 'legal_queries', ['user_id'], unique=False)
    op.create_index(op.f('ix_legal_queries_language'), 'legal_queries', ['language'], unique=False)
    op.create_index('ix_legal_queries_created_language', 'legal_queries', ['created_at', 'language'], unique=False)

    # Create legal_search_results table
    op.create_table('legal_search_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('query_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('query_text', sa.Text(), nullable=False),
        sa.Column('query_hash', sa.String(length=64), nullable=False),
        sa.Column('document_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('relevance_score', sa.Float(), nullable=False),
        sa.Column('similarity_score', sa.Float(), nullable=True),
        sa.Column('rank_position', sa.Integer(), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('clicked', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('clicked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('search_language', sa.String(length=10), nullable=False, server_default='ar'),
        sa.Column('search_filters', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_legal_search_results'))
    )
    op.create_index(op.f('ix_legal_search_results_query_id'), 'legal_search_results', ['query_id'], unique=False)
    op.create_index(op.f('ix_legal_search_results_query_hash'), 'legal_search_results', ['query_hash'], unique=False)
    op.create_index(op.f('ix_legal_search_results_document_id'), 'legal_search_results', ['document_id'], unique=False)
    op.create_index(op.f('ix_legal_search_results_relevance_score'), 'legal_search_results', [sa.text('relevance_score DESC')], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index(op.f('ix_legal_search_results_relevance_score'), table_name='legal_search_results')
    op.drop_index(op.f('ix_legal_search_results_document_id'), table_name='legal_search_results')
    op.drop_index(op.f('ix_legal_search_results_query_hash'), table_name='legal_search_results')
    op.drop_index(op.f('ix_legal_search_results_query_id'), table_name='legal_search_results')
    op.drop_table('legal_search_results')
    
    op.drop_index('ix_legal_queries_created_language', table_name='legal_queries')
    op.drop_index(op.f('ix_legal_queries_language'), table_name='legal_queries')
    op.drop_index(op.f('ix_legal_queries_user_id'), table_name='legal_queries')
    op.drop_index(op.f('ix_query_hash'), table_name='legal_queries')
    op.drop_table('legal_queries')
    
    op.drop_index('ix_legal_documents_source_language', table_name='legal_documents')
    op.drop_index('ix_legal_documents_category_type', table_name='legal_documents')
    op.execute('DROP INDEX IF EXISTS ix_legal_documents_embedding')
    op.drop_index(op.f('ix_category_id'), table_name='legal_documents')
    op.drop_index(op.f('ix_language'), table_name='legal_documents')
    op.drop_index(op.f('ix_source'), table_name='legal_documents')
    op.drop_index(op.f('ix_document_type'), table_name='legal_documents')
    op.drop_index(op.f('ix_article_number'), table_name='legal_documents')
    op.drop_index(op.f('ix_title_ar'), table_name='legal_documents')
    op.drop_index(op.f('ix_title'), table_name='legal_documents')
    op.drop_table('legal_documents')
    
    op.drop_index(op.f('ix_code'), table_name='legal_categories')
    op.drop_index(op.f('ix_name_ar'), table_name='legal_categories')
    op.drop_index(op.f('ix_name'), table_name='legal_categories')
    op.drop_table('legal_categories')