"""sync schema for fresh deployments

Brings a freshly migrated database in line with the models and the
frontend Prisma schema:
- post_likes / post_media tables and posts counter columns (models existed,
  migrations did not)
- articles.search_vector generated tsvector + GIN index (used by
  GET /api/v1/feeds?q=...)
- "Role" enum on users.role, matching Prisma's `enum Role` so NextAuth's
  Prisma client can insert users

Revision ID: f7c1d2e3a4b5
Revises: e23201edfb42
Create Date: 2026-10-01 19:23:49.766978

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7c1d2e3a4b5'
down_revision: Union[str, Sequence[str], None] = 'e23201edfb42'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('post_likes',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('post_id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.String(length=25), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('post_id', 'user_id', name='uq_post_like_post_user')
    )
    op.create_index(op.f('ix_post_likes_post_id'), 'post_likes', ['post_id'], unique=False)
    op.create_index(op.f('ix_post_likes_user_id'), 'post_likes', ['user_id'], unique=False)
    op.create_table('post_media',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('post_id', sa.UUID(), nullable=False),
    sa.Column('media_type', sa.Enum('IMAGE', 'VIDEO', name='MediaType'), nullable=False),
    sa.Column('url', sa.String(length=1000), nullable=False),
    sa.Column('thumbnail_url', sa.String(length=1000), nullable=True),
    sa.Column('original_filename', sa.String(length=255), nullable=True),
    sa.Column('file_size', sa.Integer(), nullable=True),
    sa.Column('duration', sa.Integer(), nullable=True),
    sa.Column('width', sa.Integer(), nullable=True),
    sa.Column('height', sa.Integer(), nullable=True),
    sa.Column('order', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_post_media_post_id'), 'post_media', ['post_id'], unique=False)
    op.create_index('ix_post_media_post_id_order', 'post_media', ['post_id', 'order'], unique=False)
    op.add_column('posts', sa.Column('like_count', sa.Integer(), server_default='0', nullable=False))
    op.add_column('posts', sa.Column('view_count', sa.Integer(), server_default='0', nullable=False))
    op.add_column('posts', sa.Column('comment_count', sa.Integer(), server_default='0', nullable=False))
    op.add_column('posts', sa.Column('popularity_score', sa.Float(), server_default='0', nullable=False))

    # Full-text search: English config for EN fields, 'simple' for KO fields
    op.execute("""
        ALTER TABLE articles ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
            to_tsvector('english',
                coalesce(headline_en, '') || ' ' || coalesce(lead_en, '') || ' ' || coalesce(body_en, ''))
            || to_tsvector('simple',
                coalesce(headline_ko, '') || ' ' || coalesce(lead_ko, '') || ' ' || coalesce(body_ko, ''))
        ) STORED
    """)
    op.execute("CREATE INDEX ix_articles_search_vector ON articles USING GIN (search_vector)")

    # Prisma `enum Role` expects a native enum type named "Role"
    op.execute("""CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN')""")
    op.execute("""ALTER TABLE users ALTER COLUMN role TYPE "Role" USING role::"Role\"""")
    op.execute("""ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'""")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(10) USING role::text")
    op.execute('DROP TYPE "Role"')

    op.execute("DROP INDEX IF EXISTS ix_articles_search_vector")
    op.drop_column('articles', 'search_vector')

    op.drop_column('posts', 'popularity_score')
    op.drop_column('posts', 'comment_count')
    op.drop_column('posts', 'view_count')
    op.drop_column('posts', 'like_count')
    op.drop_index('ix_post_media_post_id_order', table_name='post_media')
    op.drop_index(op.f('ix_post_media_post_id'), table_name='post_media')
    op.drop_table('post_media')
    sa.Enum(name='MediaType').drop(op.get_bind(), checkfirst=True)
    op.drop_index(op.f('ix_post_likes_user_id'), table_name='post_likes')
    op.drop_index(op.f('ix_post_likes_post_id'), table_name='post_likes')
    op.drop_table('post_likes')
