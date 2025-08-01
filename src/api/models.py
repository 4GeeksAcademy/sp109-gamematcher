from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

# Users


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    nickname: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(200), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "nickname": self.nickname,
            "email": self.email,
            "password": self.password
        }

# Games


class Game(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description
        }

# Genres


class Genre(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    image: Mapped[str] = mapped_column(Text, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "image": self.image
        }

# Platforms


class Platform(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    price: Mapped[int] = mapped_column(nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price
        }


class GamePlatform(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    game_id: Mapped[int] = mapped_column(
        db.ForeignKey("game.id"), nullable=False)
    platform_id: Mapped[int] = mapped_column(
        db.ForeignKey("platform.id"), nullable=False)

    game = db.relationship("Game", backref="game_platforms")
    platform = db.relationship("Platform", backref="platform_games")

    def serialize(self):
        return {
            "id": self.id,
            "game_id": self.game_id,
            "platform_id": self.platform_id,
            "game_name": self.game.name,
            "platform_name": self.platform.name
        }


class GameGenre(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    game_id: Mapped[int] = mapped_column(db.ForeignKey("game.id"), nullable=False)
    genre_id: Mapped[int] = mapped_column(db.ForeignKey("genre.id"), nullable=False)

    game = db.relationship("Game", backref="game_genres")
    genre = db.relationship("Genre", backref="genre_games")

    def serialize(self):
        return {
            "id": self.id,
            "game_id": self.game_id,
            "genre_id": self.genre_id,
            "game_name": self.game.name,
            "genre_name": self.genre.name
        }


class AdminUser(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(200), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email
        }
    
# Platform-Preference

class UserPlatformPreference(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(db.ForeignKey("user.id"), nullable=False)
    platform_id: Mapped[int] = mapped_column(db.ForeignKey("platform.id"), nullable=False)

    user = db.relationship("User", backref="platform_preferences")
    platform = db.relationship("Platform", backref="user_preferences")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "platform_id": self.platform_id,
            "user_nickname": self.user.nickname,
            "platform_name": self.platform.name
        }
    

class UserGenrePreference(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(db.ForeignKey("user.id"), nullable=False)
    genre_id: Mapped[int] = mapped_column(db.ForeignKey("genre.id"), nullable=False)

    user = db.relationship("User", backref="user_genres")
    genre = db.relationship("Genre", backref="genre_users")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "genre_id": self.genre_id,
            "user_name": self.user.nickname,
            "genre_name": self.genre.name
        }

# User-Game-favorites


class User_Game_Favorite(db.Model):
    __tablename__ = 'user_game_favorite'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "game_id": self.game_id
        }

class NonFavoriteGame(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(db.ForeignKey('user.id'), nullable=False)
    game_id: Mapped[int] = mapped_column(db.ForeignKey('game.id'), nullable=False)

    user = db.relationship('User', backref='non_favorite_games')
    game = db.relationship('Game', backref='non_favorited_by_users')

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "game_id": self.game_id,
            "game_name": self.game.name
        }
    
