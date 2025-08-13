"""Add Platform.image

Revision ID: 0ae0fb9257cc
Revises: c1ecdaa85d24
Create Date: 2025-08-13 15:41:07.001284

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0ae0fb9257cc'
down_revision = '2091ca555f28'
branch_labels = None
depends_on = None


def upgrade():
    # Solo añadir la columna 'image' en 'platform' si no existe ya
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = [col['name']
                        for col in inspector.get_columns('platform')]
    if 'image' not in existing_columns:
        with op.batch_alter_table('platform', schema=None) as batch_op:
            batch_op.add_column(sa.Column('image', sa.Text(), nullable=True))


def downgrade():
    # Solo eliminar la columna si existe
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = [col['name']
                        for col in inspector.get_columns('platform')]
    if 'image' in existing_columns:
        with op.batch_alter_table('platform', schema=None) as batch_op:
            batch_op.drop_column('image')
