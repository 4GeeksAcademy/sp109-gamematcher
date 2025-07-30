"""merge multiple heads

Revision ID: 12a549f17670
Revises: 35c831e03185, 48f95637f1d7
Create Date: 2025-07-30 13:27:36.885770

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '12a549f17670'
down_revision = ('35c831e03185', '48f95637f1d7')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
