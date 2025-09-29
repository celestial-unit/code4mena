"""Create user tables

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('phone_number', sa.String(length=20), nullable=True),
        sa.Column('preferred_language', sa.String(length=10), nullable=False, server_default='ar'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_superuser', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_users')),
        sa.UniqueConstraint('email', name=op.f('uq_users_email')),
        sa.UniqueConstraint('username', name=op.f('uq_users_username'))
    )
    op.create_index(op.f('ix_email'), 'users', ['email'], unique=False)
    op.create_index(op.f('ix_username'), 'users', ['username'], unique=False)

    # Create user_sessions table
    op.create_table('user_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('session_token', sa.String(length=255), nullable=False),
        sa.Column('refresh_token', sa.String(length=255), nullable=True),
        sa.Column('device_info', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_accessed', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_user_sessions')),
        sa.UniqueConstraint('session_token', name=op.f('uq_user_sessions_session_token')),
        sa.UniqueConstraint('refresh_token', name=op.f('uq_user_sessions_refresh_token'))
    )
    op.create_index(op.f('ix_user_id'), 'user_sessions', ['user_id'], unique=False)
    op.create_index(op.f('ix_session_token'), 'user_sessions', ['session_token'], unique=False)
    op.create_index(op.f('ix_refresh_token'), 'user_sessions', ['refresh_token'], unique=False)

    # Create user_preferences table
    op.create_table('user_preferences',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('push_notifications', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('legal_updates', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('theme', sa.String(length=20), nullable=False, server_default='light'),
        sa.Column('font_size', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('data_collection_consent', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('analytics_consent', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_user_preferences')),
        sa.UniqueConstraint('user_id', name=op.f('uq_user_preferences_user_id'))
    )
    op.create_index(op.f('ix_user_preferences_user_id'), 'user_preferences', ['user_id'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_index(op.f('ix_user_preferences_user_id'), table_name='user_preferences')
    op.drop_table('user_preferences')
    
    op.drop_index(op.f('ix_refresh_token'), table_name='user_sessions')
    op.drop_index(op.f('ix_session_token'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_id'), table_name='user_sessions')
    op.drop_table('user_sessions')
    
    op.drop_index(op.f('ix_username'), table_name='users')
    op.drop_index(op.f('ix_email'), table_name='users')
    op.drop_table('users')