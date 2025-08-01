"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Game, Genre, Platform, GamePlatform, AdminUser, GameGenre, UserPlatformPreference, User_Game_Favorite, UserGenrePreference, NonFavoriteGame

from api.utils import generate_sitemap, APIException
from flask_cors import CORS

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required

from sqlalchemy import select

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! Desde el back"
    }

    return jsonify(response_body), 200

# GET all games


@api.route('/games', methods=['GET'])
def get_all_games():
    games = Game.query.all()
    return jsonify([game.serialize() for game in games]), 200


# GET one game by ID
@api.route('/games/<int:game_id>', methods=['GET'])
def get_one_game(game_id):
    game = Game.query.get(game_id)
    if not game:
        raise APIException("Game not found", status_code=404)
    return jsonify(game.serialize()), 200


# POST a new game
@api.route('/games', methods=['POST'])
def create_game():
    data = request.get_json()

    if not data.get("name"):
        raise APIException("Game name is required", status_code=400)

    # Si se proporciona un ID específico (como de RAWG), verificar si ya existe
    if data.get("id"):
        existing_game = Game.query.get(data["id"])
        if existing_game:
            # Si el juego ya existe, devolvemos el existente
            return jsonify(existing_game.serialize()), 200

        # Crear juego con ID específico
        new_game = Game(
            id=data["id"],
            name=data["name"],
            description=data.get("description")
        )
    else:
        # Crear juego con ID auto-generado
        new_game = Game(
            name=data["name"],
            description=data.get("description")
        )

    db.session.add(new_game)

    try:
        db.session.commit()
        return jsonify(new_game.serialize()), 201
    except Exception as e:
        db.session.rollback()
        # Si hay un error de duplicado, intentar buscar el juego existente
        if data.get("id"):
            existing_game = Game.query.get(data["id"])
            if existing_game:
                return jsonify(existing_game.serialize()), 200
        raise APIException("Error creating game", status_code=500)


# PUT update a game
@api.route('/games/<int:game_id>', methods=['PUT'])
def update_game(game_id):
    game = Game.query.get(game_id)
    if not game:
        raise APIException("Game not found", status_code=404)

    data = request.get_json()
    game.name = data.get("name", game.name)
    game.description = data.get("description", game.description)

    db.session.commit()
    return jsonify(game.serialize()), 200


# DELETE a game
@api.route('/games/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    game = Game.query.get(game_id)
    if not game:
        raise APIException("Game not found", status_code=404)

    db.session.delete(game)
    db.session.commit()
    return jsonify({"message": f"Game {game_id} deleted"}), 200


# GET all genres
@api.route('/genres', methods=['GET'])
def get_all_genres():
    genres = Genre.query.all()
    return jsonify([genre.serialize() for genre in genres]), 200


# GET one genre by ID
@api.route('/genres/<int:genre_id>', methods=['GET'])
def get_one_genre(genre_id):
    genre = Genre.query.get(genre_id)
    if not genre:
        raise APIException("Genre not found", status_code=404)
    return jsonify(genre.serialize()), 200


# POST a new genre
@api.route('/genres', methods=['POST'])
def create_genre():
    data = request.get_json()

    if not data.get("name"):
        raise APIException("Genre name is required", status_code=400)

    new_genre = Genre(
        name=data["name"],
        image=data.get("image")
    )

    db.session.add(new_genre)
    db.session.commit()

    return jsonify(new_genre.serialize()), 201


# PUT update a genre
@api.route('/genres/<int:genre_id>', methods=['PUT'])
def update_genre(genre_id):
    genre = Genre.query.get(genre_id)
    if not genre:
        raise APIException("Genre not found", status_code=404)

    data = request.get_json()
    genre.name = data.get("name", genre.name)
    genre.image = data.get("image", genre.image)

    db.session.commit()
    return jsonify(genre.serialize()), 200


# DELETE a genre
@api.route('/genres/<int:genre_id>', methods=['DELETE'])
def delete_genre(genre_id):
    genre = Genre.query.get(genre_id)
    if not genre:
        raise APIException("Genre not found", status_code=404)

    db.session.delete(genre)
    db.session.commit()
    return jsonify({"message": f"Genre {genre_id} deleted"}), 200

# GET all platforms


@api.route('/platforms', methods=['GET'])
def get_all_platforms():
    platforms = Platform.query.all()
    return jsonify([platform.serialize() for platform in platforms]), 200


# GET one platform by ID


@api.route('/platforms/<int:platform_id>', methods=['GET'])
def get_one_platform(platform_id):
    platform = Platform.query.get(platform_id)
    if not platform:
        raise APIException("Platform not found", status_code=404)
    return jsonify(platform.serialize()), 200


# POST a new platform


@api.route('/platforms', methods=['POST'])
def create_platform():
    data = request.get_json()

    if not data.get("name"):
        raise APIException("Platform name is required", status_code=400)

    new_platform = Platform(
        name=data["name"],
        price=data.get("price")
    )

    db.session.add(new_platform)
    db.session.commit()

    return jsonify(new_platform.serialize()), 201


# PUT update a platform


@api.route('/platforms/<int:platform_id>', methods=['PUT'])
def update_platform(platform_id):
    platform = Platform.query.get(platform_id)
    if not platform:
        raise APIException("Platform not found", status_code=404)

    data = request.get_json()
    platform.name = data.get("name", platform.name)
    platform.price = data.get("price", platform.price)

    db.session.commit()
    return jsonify(platform.serialize()), 200


# DELETE a platform


@api.route('/platforms/<int:platform_id>', methods=['DELETE'])
def delete_platform(platform_id):
    platform = Platform.query.get(platform_id)
    if not platform:
        raise APIException("Platform not found", status_code=404)

    db.session.delete(platform)
    db.session.commit()
    return jsonify({"message": f"Platform {platform_id} deleted"}), 200


# GET all users


@api.route('/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200

# GET one user by ID


@api.route('/users/<int:user_id>', methods=['GET'])
def get_one_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise APIException("User not found", status_code=404)
    return jsonify(user.serialize()), 200

# POST a new user


@api.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()

    if not data.get("nickname") or not data.get("email") or not data.get("password"):
        raise APIException(
            "Nickname, email, and password are required", status_code=400)

    new_user = User(
        nickname=data["nickname"],
        email=data["email"],
        password=data["password"]
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.serialize()), 201

# PUT update a user


@api.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise APIException("User not found", status_code=404)

    data = request.get_json()
    user.nickname = data.get("nickname", user.nickname)
    user.email = data.get("email", user.email)
    user.password = data.get("password", user.password)

    db.session.commit()
    return jsonify(user.serialize()), 200

# DELETE a user


@api.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise APIException("User not found", status_code=404)

    try:
        UserPlatformPreference.query.filter_by(user_id=user_id).delete()

        UserGenrePreference.query.filter_by(user_id=user_id).delete()

        User_Game_Favorite.query.filter_by(user_id=user_id).delete()

        NonFavoriteGame.query.filter_by(user_id=user_id).delete()

        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": f"User {user_id} and all related data deleted"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error deleting user {user_id}: {str(e)}")
        raise APIException(f"Error deleting user: {str(e)}", status_code=500)


@api.route('/game-platforms', methods=['GET'])
def get_all_game_platforms():
    associations = GamePlatform.query.all()
    return jsonify([a.serialize() for a in associations]), 200


@api.route('/game-platforms', methods=['POST'])
def create_game_platform():
    data = request.get_json()

    game_id = data.get("game_id")
    platform_id = data.get("platform_id")

    if not game_id or not platform_id:
        return jsonify({"error": "game_id and platform_id are required"}), 400

    game = Game.query.get(game_id)
    platform = Platform.query.get(platform_id)

    if not game or not platform:
        return jsonify({"error": "Invalid game_id or platform_id"}), 404

    existing_relation = GamePlatform.query.filter_by(
        game_id=game_id, platform_id=platform_id).first()
    if existing_relation:
        return jsonify({"error": "Game-Platform association already exists"}), 409

    new_relation = GamePlatform(game_id=game_id, platform_id=platform_id)
    db.session.add(new_relation)
    db.session.commit()

    return jsonify(new_relation.serialize()), 201


@api.route('/game-platforms/<int:id>', methods=['DELETE'])
def delete_game_platform(id):
    relation = GamePlatform.query.get(id)

    if not relation:
        return jsonify({"error": "GamePlatform relation not found"}), 404

    db.session.delete(relation)
    db.session.commit()

    return jsonify({"message": f"Deleted GamePlatform with id {id}"}), 200


@api.route('/game-platforms/game/<int:game_id>', methods=['GET'])
def get_platforms_for_game(game_id):
    relations = GamePlatform.query.filter_by(game_id=game_id).all()
    return jsonify([r.serialize() for r in relations]), 200


@api.route('/game-platforms/platform/<int:platform_id>', methods=['GET'])
def get_games_for_platform(platform_id):
    relations = GamePlatform.query.filter_by(platform_id=platform_id).all()
    return jsonify([r.serialize() for r in relations]), 200


# Admin users CRUD operations


@api.route('/admins', methods=['GET'])
def get_all_admin_users():
    admins = AdminUser.query.all()
    return jsonify([a.serialize() for a in admins]), 200

# GET one admin


@api.route('/admins/<int:admin_id>', methods=['GET'])
def get_admin_user(admin_id):
    admin = AdminUser.query.get(admin_id)
    if not admin:
        raise APIException("Admin not found", status_code=404)
    return jsonify(admin.serialize()), 200

# POST new admin


@api.route('/admins', methods=['POST'])
def create_admin_user():
    data = request.get_json()
    if not data.get("email") or not data.get("name"):
        raise APIException("Missing fields", status_code=400)

    new_admin = AdminUser(
        email=data["email"],
        name=data["name"],
        password=data["password"]
    )
    db.session.add(new_admin)
    db.session.commit()
    return jsonify(new_admin.serialize()), 201

# PUT update admin


@api.route('/admins/<int:admin_id>', methods=['PUT'])
def update_admin_user(admin_id):
    admin = AdminUser.query.get(admin_id)
    if not admin:
        raise APIException("Admin not found", status_code=404)

    data = request.get_json()
    admin.email = data.get("email", admin.email)
    admin.name = data.get("name", admin.name)
    admin.password = data.get("password", admin.password)

    db.session.commit()
    return jsonify(admin.serialize()), 200

# DELETE admin


@api.route('/admins/<int:admin_id>', methods=['DELETE'])
def delete_admin_user(admin_id):
    admin = AdminUser.query.get(admin_id)
    if not admin:
        raise APIException("Admin not found", status_code=404)

    db.session.delete(admin)
    db.session.commit()
    return jsonify({"message": f"Admin {admin_id} deleted"}), 200


# Game-Genre association operations


@api.route('/game-genres', methods=['GET'])
def get_all_game_genres():
    associations = GameGenre.query.all()
    return jsonify([a.serialize() for a in associations]), 200


@api.route('/game-genres', methods=['POST'])
def create_game_genre():
    data = request.get_json()
    print("Dades rebudes al POST:", data)

    game_id = int(data.get("game_id"))
    genre_id = int(data.get("genre_id"))

    if not game_id or not genre_id:
        return jsonify({"error": "game_id and genre_id are required"}), 400

    game = Game.query.get(game_id)
    genre = Genre.query.get(genre_id)

    print("Game:", game)
    print("Genre:", genre)

    if not game or not genre:
        return jsonify({"error": "Invalid game_id or genre_id"}), 404

    new_relation = GameGenre(game_id=game_id, genre_id=genre_id)
    db.session.add(new_relation)
    db.session.commit()

    return jsonify(new_relation.serialize()), 201


@api.route('/game-genres/<int:id>', methods=['DELETE'])
def delete_game_genre(id):
    relation = GameGenre.query.get(id)

    if not relation:
        return jsonify({"error": "GameGenre relation not found"}), 404

    db.session.delete(relation)
    db.session.commit()

    return jsonify({"message": f"Deleted GameGenre with id {id}"}), 200


@api.route('/game-genres/game/<int:game_id>', methods=['GET'])
def get_genres_for_game(game_id):
    relations = GameGenre.query.filter_by(game_id=game_id).all()
    return jsonify([r.serialize() for r in relations]), 200


@api.route('/game-genres/genre/<int:genre_id>', methods=['GET'])
def get_games_for_genre(genre_id):
    relations = GameGenre.query.filter_by(genre_id=genre_id).all()
    return jsonify([r.serialize() for r in relations]), 200


# GET all user-platform preferences


@api.route('/user-platform-preferences', methods=['GET'])
def get_all_user_platform_preferences():
    preferences = UserPlatformPreference.query.all()
    return jsonify([p.serialize() for p in preferences]), 200


# POST new user-platform preference


@api.route('/user-platform-preferences', methods=['POST'])
def create_user_platform_preference():
    data = request.get_json()

    user_id = data.get("user_id")
    platform_id = data.get("platform_id")

    if not user_id or not platform_id:
        return jsonify({"error": "user_id and platform_id are required"}), 400

    user = User.query.get(user_id)
    platform = Platform.query.get(platform_id)

    if not user or not platform:
        return jsonify({"error": "Invalid user_id or platform_id"}), 404

    new_preference = UserPlatformPreference(
        user_id=user_id, platform_id=platform_id)
    db.session.add(new_preference)
    db.session.commit()

    return jsonify(new_preference.serialize()), 201


# DELETE a user-platform preference


@api.route('/user-platform-preferences/<int:id>', methods=['DELETE'])
def delete_user_platform_preference(id):
    relation = UserPlatformPreference.query.get(id)

    if not relation:
        return jsonify({"error": "UserPlatformPreference not found"}), 404

    db.session.delete(relation)
    db.session.commit()

    return jsonify({"message": f"Deleted UserPlatformPreference with id {id}"}), 200


# GET platforms preferred by a specific user


@api.route('/user-platform-preferences/user/<int:user_id>', methods=['GET'])
def get_preferences_for_user(user_id):
    relations = UserPlatformPreference.query.filter_by(user_id=user_id).all()
    return jsonify([r.serialize() for r in relations]), 200


# GET users who prefer a specific platform


@api.route('/user-platform-preferences/platform/<int:platform_id>', methods=['GET'])
def get_users_for_platform_preference(platform_id):
    relations = UserPlatformPreference.query.filter_by(
        platform_id=platform_id).all()
    return jsonify([r.serialize() for r in relations]), 200


# GET all favorites


@api.route('/favorites', methods=['GET'])
def get_all_favorites():
    favorites = User_Game_Favorite.query.all()
    return jsonify([f.serialize() for f in favorites]), 200

# GET one favorite


@api.route('/favorites/<int:favorite_id>', methods=['GET'])
def get_favorite(favorite_id):
    favorite = User_Game_Favorite.query.get(favorite_id)
    if not favorite:
        raise APIException("Favorite not found", 404)
    return jsonify(favorite.serialize()), 200

# POST new favorite


@api.route('/favorites', methods=['POST'])
def create_favorite():
    data = request.get_json()
    if not data.get("user_id") or not data.get("game_id"):
        raise APIException("Missing user_id or game_id", 400)

    user_id = data["user_id"]
    game_id = data["game_id"]

    # Validar que el usuario y el juego existen
    user = User.query.get(user_id)
    game = Game.query.get(game_id)

    if not user:
        raise APIException("User not found", 404)
    if not game:
        raise APIException("Game not found", 404)

    # Comprobar si ya existe una relación de favorito
    existing_favorite = User_Game_Favorite.query.filter_by(
        user_id=user_id, game_id=game_id).first()
    if existing_favorite:
        raise APIException("Favorite already exists", 409)

    new_favorite = User_Game_Favorite(user_id=user_id, game_id=game_id)
    db.session.add(new_favorite)
    db.session.commit()
    return jsonify(new_favorite.serialize()), 201

# PUT update favorite


@api.route('/favorites/<int:favorite_id>', methods=['PUT'])
def update_favorite(favorite_id):
    favorite = User_Game_Favorite.query.get(favorite_id)
    if not favorite:
        raise APIException("Favorite not found", 404)

    data = request.get_json()
    favorite.user_id = data.get("user_id", favorite.user_id)
    favorite.game_id = data.get("game_id", favorite.game_id)

    db.session.commit()
    return jsonify(favorite.serialize()), 200

# DELETE favorite


@api.route('/favorites/<int:favorite_id>', methods=['DELETE'])
def delete_favorite(favorite_id):
    favorite = User_Game_Favorite.query.get(favorite_id)
    if not favorite:
        raise APIException("Favorite not found", 404)

    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"message": f"Favorite {favorite_id} deleted"}), 200


@api.route('/non-favorites', methods=['POST'])
def add_non_favorite():
    data = request.get_json()
    user_id = data.get("user_id")
    game_id = data.get("game_id")

    if not user_id or not game_id:
        return jsonify({"error": "user_id and game_id are required"}), 400

    relation = NonFavoriteGame(user_id=user_id, game_id=game_id)
    db.session.add(relation)
    db.session.commit()

    return jsonify(relation.serialize()), 201


@api.route('/non-favorites/<int:id>', methods=['DELETE'])
def delete_non_favorite(id):
    relation = NonFavoriteGame.query.get(id)
    if not relation:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(relation)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200


@api.route('/users/<int:user_id>/non-favorites', methods=['GET'])
def get_user_non_favorites(user_id):
    relations = NonFavoriteGame.query.filter_by(user_id=user_id).all()
    return jsonify([r.serialize() for r in relations]), 200


@api.route('/non-favorites', methods=['GET'])
def get_all_non_favorites():
    relations = NonFavoriteGame.query.all()
    return jsonify([r.serialize() for r in relations]), 200

@api.route("/admin-login", methods=["POST"])
def admin_login():
    name = request.json.get("name", None)
    password = request.json.get("password", None)

    adminUser = db.session.execute(select(AdminUser).where(AdminUser.name == name)).scalar_one_or_none()

    if adminUser is None:
        return jsonify({"msg": "Bad name or password"}), 401

    if password != adminUser.password:
        return jsonify({"msg": "Bad name or password"}), 401

    access_token = create_access_token(identity=name)
    return jsonify(access_token=access_token)
