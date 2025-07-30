"""merge game-genre and game-platform heads

Revision ID: 2e31d32ae025
Revises: 4bbd662ed363, 5f70780ca32b
Create Date: 2025-07-29 20:33:19.969641

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2e31d32ae025'
down_revision = ('4bbd662ed363', '5f70780ca32b')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
