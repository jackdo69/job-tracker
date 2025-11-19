"""add user authentication

Revision ID: ec8b491d2943
Revises:
Create Date: 2025-11-19 05:27:36.283642

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'ec8b491d2943'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)

    # Create job_applications table with user_id
    op.create_table(
        'job_applications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('company_name', sa.String(length=255), nullable=False),
        sa.Column('position_title', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('application_date', sa.Date(), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('interview_stage', sa.String(length=100), nullable=True),
        sa.Column('rejection_stage', sa.String(length=100), nullable=True),
        sa.Column('salary_range', sa.String(length=100), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index(op.f('ix_job_applications_id'), 'job_applications', ['id'], unique=False)
    op.create_index(op.f('ix_job_applications_user_id'), 'job_applications', ['user_id'], unique=False)
    op.create_index(op.f('ix_job_applications_status'), 'job_applications', ['status'], unique=False)
    op.create_index(op.f('ix_job_applications_application_date'), 'job_applications', ['application_date'], unique=False)


def downgrade() -> None:
    # Drop job_applications table
    op.drop_index(op.f('ix_job_applications_application_date'), table_name='job_applications')
    op.drop_index(op.f('ix_job_applications_status'), table_name='job_applications')
    op.drop_index(op.f('ix_job_applications_user_id'), table_name='job_applications')
    op.drop_index(op.f('ix_job_applications_id'), table_name='job_applications')
    op.drop_table('job_applications')

    # Drop users table
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
