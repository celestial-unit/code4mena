"""Create chat and conversation tables

Revision ID: 003
Revises: 002
Create Date: 2024-01-01 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types
    op.execute("CREATE TYPE messagetype AS ENUM ('text', 'audio', 'image', 'file', 'system')")
    op.execute("CREATE TYPE messagerole AS ENUM ('user', 'assistant', 'system')")
    op.execute("CREATE TYPE conversationstatus AS ENUM ('active', 'archived', 'deleted')")

    # Create chat_conversations table
    op.create_table('chat_conversations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('title_ar', sa.String(length=255), nullable=True),
        sa.Column('title_fr', sa.String(length=255), nullable=True),
        sa.Column('title_en', sa.String(length=255), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=False, server_default='ar'),
        sa.Column('status', postgresql.ENUM('active', 'archived', 'deleted', name='conversationstatus'), nullable=False, server_default='active'),
        sa.Column('message_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('context', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('settings', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_private', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('shared_with', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_message_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_chat_conversations'))
    )
    op.create_index(op.f('ix_chat_conversations_user_id'), 'chat_conversations', ['user_id'], unique=False)
    op.create_index(op.f('ix_chat_conversations_title'), 'chat_conversations', ['title'], unique=False)
    op.create_index(op.f('ix_chat_conversations_language'), 'chat_conversations', ['language'], unique=False)
    op.create_index(op.f('ix_chat_conversations_status'), 'chat_conversations', ['status'], unique=False)
    op.create_index('ix_chat_conversations_user_status', 'chat_conversations', ['user_id', 'status'], unique=False)
    op.create_index('ix_chat_conversations_updated_desc', 'chat_conversations', [sa.text('updated_at DESC')], unique=False)

    # Create chat_messages table
    op.create_table('chat_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('content_ar', sa.Text(), nullable=True),
        sa.Column('content_fr', sa.Text(), nullable=True),
        sa.Column('content_en', sa.Text(), nullable=True),
        sa.Column('role', postgresql.ENUM('user', 'assistant', 'system', name='messagerole'), nullable=False),
        sa.Column('message_type', postgresql.ENUM('text', 'audio', 'image', 'file', 'system', name='messagetype'), nullable=False, server_default='text'),
        sa.Column('sequence_number', sa.Integer(), nullable=False),
        sa.Column('input_tokens', sa.Integer(), nullable=True),
        sa.Column('output_tokens', sa.Integer(), nullable=True),
        sa.Column('total_tokens', sa.Integer(), nullable=True),
        sa.Column('model_used', sa.String(length=100), nullable=True),
        sa.Column('processing_time_ms', sa.Integer(), nullable=True),
        sa.Column('attachments', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('media_urls', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_edited', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_flagged', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('error_occurred', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('user_rating', sa.Integer(), nullable=True),
        sa.Column('user_feedback', sa.Text(), nullable=True),
        sa.Column('helpful', sa.Boolean(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('edited_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_chat_messages'))
    )
    op.create_index(op.f('ix_chat_messages_conversation_id'), 'chat_messages', ['conversation_id'], unique=False)
    op.create_index(op.f('ix_chat_messages_role'), 'chat_messages', ['role'], unique=False)
    op.create_index(op.f('ix_chat_messages_message_type'), 'chat_messages', ['message_type'], unique=False)
    op.create_index('ix_chat_messages_conversation_sequence', 'chat_messages', ['conversation_id', 'sequence_number'], unique=False)
    op.create_index('ix_chat_messages_created_desc', 'chat_messages', [sa.text('created_at DESC')], unique=False)

    # Create chat_templates table
    op.create_table('chat_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('name_ar', sa.String(length=255), nullable=False),
        sa.Column('name_fr', sa.String(length=255), nullable=True),
        sa.Column('name_en', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('description_ar', sa.Text(), nullable=True),
        sa.Column('description_fr', sa.Text(), nullable=True),
        sa.Column('description_en', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False, server_default='ar'),
        sa.Column('initial_messages', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('suggested_responses', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('difficulty_level', sa.String(length=20), nullable=True),
        sa.Column('estimated_duration', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('usage_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('success_rate', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_chat_templates'))
    )
    op.create_index(op.f('ix_chat_templates_name'), 'chat_templates', ['name'], unique=False)
    op.create_index(op.f('ix_chat_templates_name_ar'), 'chat_templates', ['name_ar'], unique=False)
    op.create_index(op.f('ix_chat_templates_category'), 'chat_templates', ['category'], unique=False)
    op.create_index(op.f('ix_chat_templates_language'), 'chat_templates', ['language'], unique=False)
    op.create_index('ix_chat_templates_category_active', 'chat_templates', ['category', 'is_active'], unique=False)

    # Create chat_sessions table
    op.create_table('chat_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_token', sa.String(length=255), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('device_info', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=False, server_default='ar'),
        sa.Column('theme', sa.String(length=20), nullable=False, server_default='light'),
        sa.Column('conversation_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('message_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_anonymous', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_activity', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_chat_sessions')),
        sa.UniqueConstraint('session_token', name=op.f('uq_chat_sessions_session_token'))
    )
    op.create_index(op.f('ix_chat_sessions_session_token'), 'chat_sessions', ['session_token'], unique=False)
    op.create_index(op.f('ix_chat_sessions_user_id'), 'chat_sessions', ['user_id'], unique=False)
    op.create_index('ix_chat_sessions_user_active', 'chat_sessions', ['user_id', 'is_active'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index('ix_chat_sessions_user_active', table_name='chat_sessions')
    op.drop_index(op.f('ix_chat_sessions_user_id'), table_name='chat_sessions')
    op.drop_index(op.f('ix_chat_sessions_session_token'), table_name='chat_sessions')
    op.drop_table('chat_sessions')
    
    op.drop_index('ix_chat_templates_category_active', table_name='chat_templates')
    op.drop_index(op.f('ix_chat_templates_language'), table_name='chat_templates')
    op.drop_index(op.f('ix_chat_templates_category'), table_name='chat_templates')
    op.drop_index(op.f('ix_chat_templates_name_ar'), table_name='chat_templates')
    op.drop_index(op.f('ix_chat_templates_name'), table_name='chat_templates')
    op.drop_table('chat_templates')
    
    op.drop_index('ix_chat_messages_created_desc', table_name='chat_messages')
    op.drop_index('ix_chat_messages_conversation_sequence', table_name='chat_messages')
    op.drop_index(op.f('ix_chat_messages_message_type'), table_name='chat_messages')
    op.drop_index(op.f('ix_chat_messages_role'), table_name='chat_messages')
    op.drop_index(op.f('ix_chat_messages_conversation_id'), table_name='chat_messages')
    op.drop_table('chat_messages')
    
    op.drop_index('ix_chat_conversations_updated_desc', table_name='chat_conversations')
    op.drop_index('ix_chat_conversations_user_status', table_name='chat_conversations')
    op.drop_index(op.f('ix_chat_conversations_status'), table_name='chat_conversations')
    op.drop_index(op.f('ix_chat_conversations_language'), table_name='chat_conversations')
    op.drop_index(op.f('ix_chat_conversations_title'), table_name='chat_conversations')
    op.drop_index(op.f('ix_chat_conversations_user_id'), table_name='chat_conversations')
    op.drop_table('chat_conversations')
    
    # Drop enum types
    op.execute("DROP TYPE conversationstatus")
    op.execute("DROP TYPE messagerole")
    op.execute("DROP TYPE messagetype")