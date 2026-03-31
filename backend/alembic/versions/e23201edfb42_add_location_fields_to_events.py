"""add location fields to events

Revision ID: e23201edfb42
Revises: 2605dee2d77c
Create Date: 2026-03-31 10:48:08.110446

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e23201edfb42'
down_revision: Union[str, Sequence[str], None] = '2605dee2d77c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add location fields to events table for map display."""
    op.add_column('events', sa.Column('location_lat', sa.Float(), nullable=True))
    op.add_column('events', sa.Column('location_lng', sa.Float(), nullable=True))
    op.add_column('events', sa.Column('location_name', sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Remove location fields from events table."""
    op.drop_column('events', 'location_name')
    op.drop_column('events', 'location_lng')
    op.drop_column('events', 'location_lat')
