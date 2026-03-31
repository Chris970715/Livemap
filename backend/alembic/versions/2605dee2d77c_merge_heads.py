"""merge heads

Revision ID: 2605dee2d77c
Revises: a9b7b29fc14f, be8b3c3a2f2f
Create Date: 2026-03-31 10:47:59.484998

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2605dee2d77c'
down_revision: Union[str, Sequence[str], None] = ('a9b7b29fc14f', 'be8b3c3a2f2f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
