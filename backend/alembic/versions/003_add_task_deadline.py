"""Add deadline column to tasks table

Revision ID: 003
Revises: 002
Create Date: 2026-01-01 19:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add deadline column to tasks table."""
    op.add_column('tasks', sa.Column('deadline', sa.TIMESTAMP(), nullable=True))
    op.create_index('idx_tasks_deadline', 'tasks', ['deadline'], unique=False)


def downgrade() -> None:
    """Remove deadline column from tasks table."""
    op.drop_index('idx_tasks_deadline', table_name='tasks')
    op.drop_column('tasks', 'deadline')
