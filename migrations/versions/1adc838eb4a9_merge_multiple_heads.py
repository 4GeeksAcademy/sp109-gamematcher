"""Merge multiple heads

Revision ID: 1adc838eb4a9
Revises: 45b668a52e07, 53247548b7cc, a9a9e3c52701
Create Date: 2025-07-30 19:37:09.270202

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1adc838eb4a9'
down_revision = ('45b668a52e07', '53247548b7cc', 'a9a9e3c52701')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
