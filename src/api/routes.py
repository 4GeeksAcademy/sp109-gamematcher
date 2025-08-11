"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import (
    db, User, Game, Genre, Platform, GamePlatform, AdminUser, GameGenre,
    UserPlatformPreference, UserGameFavorite, UserGenrePreference, NonFavoriteGame,
    OnboardingProgress
)
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from sqlalchemy import select, func

api = Blueprint('api', __name__)

# CORS
CORS(
    api,
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allow_headers=['Content-Type', 'Authorization'],
    origins=['*']
)

# ------------------------------ Misc ------------------------------ #


@api.route('/hello', methods=['GET', 'POST'])
def handle_hello():
    return jsonify({"message": "Hello! Desde el back"}), 200

# ------------------------------ Games ----------------------------- #


@api.route('/games', methods=['GET'])
def get_all_games():
    games = Game.query.all()
    return jsonify([g.serialize() for g in games]), 200


@api.route('/games/<int:game_id>', methods=['GET'])
def get_one_game(game_id):
    game = Game.query.get(game_id)
    if not game:
        raise APIException("Game not found", status_code=404)
    return jsonify(game.serialize()), 200


@api.route('/games', methods=['POST'])
def create_game():
    data = request.get_json() or {}

    # 1) Validació
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Game name is required"}), 400

    # 2) Duplicats (prioritza rawg_id; si no hi ha, per nom case-insensitive)
    if data.get("rawg_id") is not None:
        existing_game = Game.query.filter_by(rawg_id=data["rawg_id"]).first()
    else:
        existing_game = Game.query.filter(
            db.func.lower(Game.name) == name.lower()
        ).first()

    if existing_game:
        return jsonify(existing_game.serialize()), 200

    # 3) Creació del joc
    new_game = Game(
        name=name,
        description=data.get("description"),
        background_image=data.get("background_image"),
        released=data.get("released"),
        rating=data.get("rating"),
        rawg_id=data.get("rawg_id"),
    )
    db.session.add(new_game)
    db.session.flush()  # obtenir new_game.id abans de relacionar

    # 4) Relacions amb PLATAFORMES (per IDs o per noms)
    platform_ids = data.get("platform_ids", []) or []
    platforms_names = data.get("platforms", []) or []

    if platform_ids:
        for pid in platform_ids:
            platform = Platform.query.get(pid)
            if platform:
                db.session.add(GamePlatform(game_id=new_game.id, platform_id=pid))
            else:
                print(f"⚠️ Plataforma amb id {pid} no trobada")
    elif platforms_names:
        for pname in platforms_names:
            platform = Platform.query.filter(
                db.func.lower(Platform.name) == pname.lower()
            ).first()
            if platform:
                db.session.add(GamePlatform(game_id=new_game.id, platform_id=platform.id))
            else:
                print(f"⚠️ Plataforma amb nom '{pname}' no trobada")

    # 5) Relacions amb GÈNERES (per IDs o per noms)
    genre_ids = data.get("genre_ids", []) or []
    genres_names = data.get("genres", []) or []

    if genre_ids:
        for gid in genre_ids:
            genre = Genre.query.get(gid)
            if genre:
                db.session.add(GameGenre(game_id=new_game.id, genre_id=gid))
            else:
                print(f"⚠️ Gènere amb id {gid} no trobat")
    elif genres_names:
        for gname in genres_names:
            genre = Genre.query.filter(
                db.func.lower(Genre.name) == gname.lower()
            ).first()
            if genre:
                db.session.add(GameGenre(game_id=new_game.id, genre_id=genre.id))
            else:
                print(f"⚠️ Gènere amb nom '{gname}' no trobat")

    # 6) Commit
    try:
        db.session.commit()
        return jsonify(new_game.serialize()), 201
    except Exception as e:
        db.session.rollback()
        print("❌ Error creant joc:", e)
        return jsonify({"error": "Error al crear el joc"}), 500

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


@api.route('/games/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    game = Game.query.get(game_id)
    if not game:
        raise APIException("Game not found", status_code=404)
    try:
        GamePlatform.query.filter_by(game_id=game_id).delete()
        GameGenre.query.filter_by(game_id=game_id).delete()
        favs = UserGameFavorite.query.filter_by(game_id=game_id).all()
        for f in favs:
            db.session.delete(f)
        NonFavoriteGame.query.filter_by(game_id=game_id).delete()
        db.session.delete(game)
        db.session.commit()
        return jsonify({"message": f"Game {game_id} and all related data deleted"}), 200
    except Exception as e:
        db.session.rollback()
        raise APIException(f"Error deleting game: {str(e)}", status_code=500)

# ------------------------------ Genres ---------------------------- #

@api.route('/genres', methods=['GET'])
def get_all_genres():
    genres = Genre.query.all()
    return jsonify([g.serialize() for g in genres]), 200


@api.route('/genres/<int:genre_id>', methods=['GET'])
def get_one_genre(genre_id):
    genre = Genre.query.get(genre_id)
    if not genre:
        raise APIException("Genre not found", status_code=404)
    return jsonify(genre.serialize()), 200


@api.route('/genres', methods=['POST'])
def create_genre():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        raise APIException("Genre name is required", status_code=400)

    existing = Genre.query.filter(
        func.lower(Genre.name) == name.lower()).first()
    if existing:
        return jsonify(existing.serialize()), 200

    new_genre = Genre(
        name=name,
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


@api.route('/genres/<int:genre_id>', methods=['DELETE'])
def delete_genre(genre_id):
    genre = Genre.query.get(genre_id)
    if not genre:
        raise APIException("Genre not found", status_code=404)

    try:
        # Eliminar relaciones game-genre
        GameGenre.query.filter_by(genre_id=genre_id).delete()
        # Eliminar preferencias de usuario-género
        UserGenrePreference.query.filter_by(genre_id=genre_id).delete()
        # Eliminar el género
        db.session.delete(genre)
        db.session.commit()

        return jsonify({"message": f"Genre {genre_id} and all related data deleted"}), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(f"Error deleting genre: {str(e)}", status_code=500)

# ------------------------------ Platforms ------------------------- #

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
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        raise APIException("Platform name is required", status_code=400)

    existing = Platform.query.filter(
        func.lower(Platform.name) == name.lower()).first()
    if existing:
        return jsonify(existing.serialize()), 200

    new_platform = Platform(
        name=name,
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

    try:
        GamePlatform.query.filter_by(platform_id=platform_id).delete()
        UserPlatformPreference.query.filter_by(
            platform_id=platform_id).delete()
        db.session.delete(platform)
        db.session.commit()
        return jsonify({"message": f"Platform {platform_id} and all related data deleted"}), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error deleting platform: {str(e)}", status_code=500)

# ------------------------------ Users ----------------------------- #

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
    user = User(nickname=data["nickname"],
                email=data["email"], password=data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.serialize()), 201


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
        user_favorites = UserGameFavorite.query.filter_by(
            user_id=user_id).all()
        for fav in user_favorites:
            db.session.delete(fav)
        NonFavoriteGame.query.filter_by(user_id=user_id).delete()
        OnboardingProgress.query.filter_by(user_id=user_id).delete()
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"User {user_id} and all related data deleted"}), 200
    except Exception as e:
        db.session.rollback()
        raise APIException(f"Error deleting user: {str(e)}", status_code=500)

# ----------------------- Game-Platform links ---------------------- #


@api.route('/game-platforms', methods=['GET'])
def get_all_game_platforms():
    links = GamePlatform.query.all()
    return jsonify([l.serialize() for l in links]), 200


@api.route('/game-platforms', methods=['POST'])
def create_game_platform():
    data = request.get_json() or {}
    game_id = data.get("game_id")
    platform_id = data.get("platform_id")
    if not game_id or not platform_id:
        return jsonify({"error": "game_id and platform_id are required"}), 400

    if not Game.query.get(game_id) or not Platform.query.get(platform_id):
        return jsonify({"error": "Invalid game_id or platform_id"}), 404

    existing = GamePlatform.query.filter_by(
        game_id=game_id, platform_id=platform_id).first()
    if existing:
        return jsonify(existing.serialize()), 200  # mantenim el teu retorn

    rel = GamePlatform(game_id=game_id, platform_id=platform_id)
    db.session.add(rel)
    db.session.commit()
    return jsonify(rel.serialize()), 201


@api.route('/game-platforms/<int:link_id>', methods=['DELETE'])
def delete_game_platform(link_id):
    link = GamePlatform.query.get(link_id)
    if not link:
        return jsonify({"error": "GamePlatform relation not found"}), 404
    db.session.delete(link)
    db.session.commit()
    return jsonify({"message": f"Deleted GamePlatform with id {link_id}"}), 200


@api.route('/game-platforms/game/<int:game_id>', methods=['GET'])
def get_platforms_for_game(game_id):
    links = GamePlatform.query.filter_by(game_id=game_id).all()
    return jsonify([l.serialize() for l in links]), 200


@api.route('/game-platforms/platform/<int:platform_id>', methods=['GET'])
def get_games_for_platform(platform_id):
    links = GamePlatform.query.filter_by(platform_id=platform_id).all()
    return jsonify([l.serialize() for l in links]), 200

# ----------------------- Admin Users ------------------------------ #


@api.route('/admins', methods=['GET'])
def get_all_admin_users():
    admins = AdminUser.query.all()
    return jsonify([a.serialize() for a in admins]), 200


@api.route('/admins/<int:admin_id>', methods=['GET'])
def get_admin_user(admin_id):
    admin = AdminUser.query.get(admin_id)
    if not admin:
        raise APIException("Admin not found", status_code=404)
    return jsonify(admin.serialize()), 200


@api.route('/admins', methods=['POST'])
def create_admin_user():
    data = request.get_json()
    if not data.get("email") or not data.get("name"):
        raise APIException("Missing fields", status_code=400)
    admin = AdminUser(email=data["email"],
                      name=data["name"], password=data["password"])
    db.session.add(admin)
    db.session.commit()
    return jsonify(admin.serialize()), 201


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


@api.route('/admins/<int:admin_id>', methods=['DELETE'])
def delete_admin_user(admin_id):
    admin = AdminUser.query.get(admin_id)
    if not admin:
        raise APIException("Admin not found", status_code=404)
    db.session.delete(admin)
    db.session.commit()
    return jsonify({"message": f"Admin {admin_id} deleted"}), 200

# ----------------------- Game-Genre links ------------------------- #


@api.route('/game-genres', methods=['GET'])
def get_all_game_genres():
    links = GameGenre.query.all()
    return jsonify([l.serialize() for l in links]), 200


@api.route('/game-genres', methods=['POST'])
def create_game_genre():
    data = request.get_json() or {}
    game_id = int(data.get("game_id")) if data.get(
        "game_id") is not None else None
    genre_id = int(data.get("genre_id")) if data.get(
        "genre_id") is not None else None

    if not game_id or not genre_id:
        return jsonify({"error": "game_id and genre_id are required"}), 400

    if not Game.query.get(game_id) or not Genre.query.get(genre_id):
        return jsonify({"error": "Invalid game_id or genre_id"}), 404

    existing = GameGenre.query.filter_by(
        game_id=game_id, genre_id=genre_id).first()
    if existing:
        return jsonify(existing.serialize()), 200

    rel = GameGenre(game_id=game_id, genre_id=genre_id)
    db.session.add(rel)
    db.session.commit()
    return jsonify(rel.serialize()), 201


@api.route('/game-genres/<int:link_id>', methods=['DELETE'])
def delete_game_genre(link_id):
    link = GameGenre.query.get(link_id)
    if not link:
        return jsonify({"error": "GameGenre relation not found"}), 404
    db.session.delete(link)
    db.session.commit()
    return jsonify({"message": f"Deleted GameGenre with id {link_id}"}), 200


@api.route('/game-genres/game/<int:game_id>', methods=['GET'])
def get_genres_for_game(game_id):
    links = GameGenre.query.filter_by(game_id=game_id).all()
    return jsonify([l.serialize() for l in links]), 200


@api.route('/game-genres/genre/<int:genre_id>', methods=['GET'])
def get_games_for_genre(genre_id):
    links = GameGenre.query.filter_by(genre_id=genre_id).all()
    return jsonify([l.serialize() for l in links]), 200

# ----------------------- User-Platform prefs ---------------------- #


@api.route('/user-platform-preferences', methods=['GET'])
def get_user_platform_preferences():
    user_id = request.args.get('user_id', type=int)
    print(">>> Received user_id:", user_id)

    if user_id is not None:
        preferences = UserPlatformPreference.query.filter_by(
            user_id=user_id).all()
    else:
        preferences = UserPlatformPreference.query.all()

    return jsonify([p.serialize() for p in preferences]), 200


@api.route('/user-platform-preferences', methods=['POST'])
def create_user_platform_preference():
    data = request.get_json()
    user_id = data.get("user_id")
    platform_id = data.get("platform_id")
    if not user_id or not platform_id:
        return jsonify({"error": "user_id and platform_id are required"}), 400
    if not User.query.get(user_id) or not Platform.query.get(platform_id):
        return jsonify({"error": "Invalid user_id or platform_id"}), 404

    existing_preference = UserPlatformPreference.query.filter_by(
        user_id=user_id, platform_id=platform_id).first()
    if existing_preference:
        return jsonify(existing_preference.serialize()), 200

    new_preference = UserPlatformPreference(
        user_id=user_id, platform_id=platform_id)
    db.session.add(new_preference)
    db.session.commit()
    return jsonify(new_preference.serialize()), 201


@api.route('/user-platform-preferences/<int:pref_id>', methods=['DELETE'])
def delete_user_platform_preference(pref_id):
    pref = UserPlatformPreference.query.get(pref_id)
    if not pref:
        return jsonify({"error": "UserPlatformPreference not found"}), 404
    db.session.delete(pref)
    db.session.commit()
    return jsonify({"message": f"Deleted UserPlatformPreference with id {pref_id}"}), 200


@api.route('/user-platform-preferences/user/<int:user_id>', methods=['GET'])
def get_preferences_for_user(user_id):
    prefs = UserPlatformPreference.query.filter_by(user_id=user_id).all()
    return jsonify([p.serialize() for p in prefs]), 200


@api.route('/user-platform-preferences/platform/<int:platform_id>', methods=['GET'])
def get_users_for_platform_preference(platform_id):
    prefs = UserPlatformPreference.query.filter_by(
        platform_id=platform_id).all()
    return jsonify([p.serialize() for p in prefs]), 200

# ----------------------- Favorites / Non-Favorites ---------------- #


@api.route('/favorites', methods=['GET'])
def get_all_favorites():
    favs = UserGameFavorite.query.all()
    return jsonify([f.serialize() for f in favs]), 200


@api.route('/favorites/<int:fav_id>', methods=['GET'])
def get_favorite(fav_id):
    fav = UserGameFavorite.query.get(fav_id)
    if not fav:
        raise APIException("Favorite not found", 404)
    return jsonify(fav.serialize()), 200


@api.route('/favorites', methods=['POST'])
def create_favorite():
    data = request.get_json()
    user_id = data.get("user_id")
    game_id = data.get("game_id")
    if not user_id or not game_id:
        raise APIException("Missing user_id or game_id", 400)
    if not User.query.get(user_id):
        raise APIException("User not found", 404)
    if not Game.query.get(game_id):
        raise APIException("Game not found", 404)

    existing_favorite = UserGameFavorite.query.filter_by(
        user_id=user_id, game_id=game_id).first()
    if existing_favorite:
        return jsonify(existing_favorite.serialize()), 200

    new_favorite = UserGameFavorite(user_id=user_id, game_id=game_id)
    db.session.add(new_favorite)
    db.session.commit()
    return jsonify(new_favorite.serialize()), 201


@api.route('/favorites/<int:fav_id>', methods=['PUT'])
def update_favorite(fav_id):
    fav = UserGameFavorite.query.get(fav_id)
    if not fav:
        raise APIException("Favorite not found", 404)
    data = request.get_json()
    fav.user_id = data.get("user_id", fav.user_id)
    fav.game_id = data.get("game_id", fav.game_id)
    db.session.commit()
    return jsonify(fav.serialize()), 200


@api.route('/favorites/<int:fav_id>', methods=['DELETE'])
def delete_favorite(fav_id):
    fav = UserGameFavorite.query.get(fav_id)
    if not fav:
        raise APIException("Favorite not found", 404)
    db.session.delete(fav)
    db.session.commit()
    return jsonify({"message": f"Favorite {fav_id} deleted"}), 200


@api.route('/non-favorites', methods=['POST'])
def add_non_favorite():
    data = request.get_json()
    user_id = data.get("user_id")
    game_id = data.get("game_id")
    if not user_id or not game_id:
        return jsonify({"error": "user_id and game_id are required"}), 400

    existing_non_favorite = NonFavoriteGame.query.filter_by(
        user_id=user_id, game_id=game_id).first()
    if existing_non_favorite:
        return jsonify(existing_non_favorite.serialize()), 200

    relation = NonFavoriteGame(user_id=user_id, game_id=game_id)
    db.session.add(relation)
    db.session.commit()
    return jsonify(relation.serialize()), 201


@api.route('/non-favorites/<int:rel_id>', methods=['DELETE'])
def delete_non_favorite(rel_id):
    rel = NonFavoriteGame.query.get(rel_id)
    if not rel:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(rel)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200


@api.route('/users/<int:user_id>/non-favorites', methods=['GET'])
def get_user_non_favorites(user_id):
    rels = NonFavoriteGame.query.filter_by(user_id=user_id).all()
    return jsonify([r.serialize() for r in rels]), 200


@api.route('/non-favorites', methods=['GET'])
def get_all_non_favorites():
    rels = NonFavoriteGame.query.all()
    return jsonify([r.serialize() for r in rels]), 200

# ----------------------- Auth ------------------------------ #


@api.route("/admin-login", methods=["POST"])
def admin_login():
    name = request.json.get("name")
    password = request.json.get("password")
    admin = db.session.execute(select(AdminUser).where(
        AdminUser.name == name)).scalar_one_or_none()
    if admin is None or password != admin.password:
        return jsonify({"msg": "Nombre o contraseña incorrectos"}), 401
    access_token = create_access_token(identity=name)
    return jsonify(access_token=access_token, user_type="admin"), 200


@api.route("/user-login", methods=["POST"])
def user_login():
    nickname = request.json.get("nickname")
    password = request.json.get("password")
    user = db.session.execute(select(User).where(
        User.nickname == nickname)).scalar_one_or_none()
    if user is None or password != user.password:
        return jsonify({"msg": "Nickname o contraseña incorrectos"}), 401
    access_token = create_access_token(identity=nickname)
    return jsonify(access_token=access_token, user_type="user"), 200

# ----------------------- User-Genre prefs ------------------------- #


@api.route('/user-genre-preferences', methods=['GET'])
def get_all_user_genre_preferences():
    user_id = request.args.get('user_id', type=int)

    if user_id is not None:
        preferences = UserGenrePreference.query.filter_by(
            user_id=user_id).all()
    else:
        preferences = UserGenrePreference.query.all()

    return jsonify([p.serialize() for p in preferences]), 200


@api.route('/user-genre-preferences/<int:id>', methods=['GET'])
def get_user_genre_preference(id):
    preference = UserGenrePreference.query.get(id)
    if not preference:
        return jsonify({"error": "UserGenrePreference not found"}), 404
    return jsonify(preference.serialize()), 200


@api.route('/user-genre-preferences', methods=['POST'])
def create_user_genre_preference():
    data = request.get_json()
    user_id = data.get("user_id")
    genre_id = data.get("genre_id")

    if not user_id or not genre_id:
        return jsonify({"error": "user_id and genre_id are required"}), 400

    user = User.query.get(user_id)
    genre = Genre.query.get(genre_id)

    if not user or not genre:
        return jsonify({"error": "Invalid user_id or genre_id"}), 404

    existing_preference = UserGenrePreference.query.filter_by(
        user_id=user_id, genre_id=genre_id).first()
    if existing_preference:
        return jsonify(existing_preference.serialize()), 200

    new_preference = UserGenrePreference(user_id=user_id, genre_id=genre_id)
    db.session.add(new_preference)
    db.session.commit()
    return jsonify(new_preference.serialize()), 201


@api.route('/user-genre-preferences/<int:id>', methods=['PUT'])
def update_user_genre_preference(id):
    data = request.get_json()
    preference = UserGenrePreference.query.get(id)

    if not preference:
        return jsonify({"error": "UserGenrePreference not found"}), 404

    user_id = data.get("user_id")
    genre_id = data.get("genre_id")

    if user_id:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Invalid user_id"}), 404
        preference.user_id = user_id

    if genre_id:
        genre = Genre.query.get(genre_id)
        if not genre:
            return jsonify({"error": "Invalid genre_id"}), 404
        preference.genre_id = genre_id

    db.session.commit()
    return jsonify(preference.serialize()), 200


@api.route('/user-genre-preferences/<int:id>', methods=['DELETE'])
def delete_user_genre_preference(id):
    relation = UserGenrePreference.query.get(id)
    if not relation:
        return jsonify({"error": "UserGenrePreference not found"}), 404
    db.session.delete(relation)
    db.session.commit()
    return jsonify({"message": f"Deleted UserGenrePreference with id {id}"}), 200

# ----------------------- Admin bootstrap (dev) -------------------- #


@api.route("/create-admin", methods=["POST"])
def create_admin():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    name = request.json.get("name", None)

    if not email or not password or not name:
        return jsonify({"msg": "Email, password y name son requeridos"}), 400

    existing_admin = db.session.execute(
        select(AdminUser).where(AdminUser.email == email)
    ).scalar_one_or_none()
    if existing_admin:
        return jsonify({"msg": "El email ya está registrado"}), 400

    new_admin = AdminUser(email=email, password=password, name=name)
    db.session.add(new_admin)
    db.session.commit()

    return jsonify({"msg": "Admin creado exitosamente", "email": email}), 201


@api.route("/verify-token", methods=["GET"])
@jwt_required()
def verify_token():
    """
    Verifica el JWT y retorna info del usuario autenticado.
    Incluye profile_image_url para mantener la imagen en sesión.
    """
    current_identity = get_jwt_identity()

    # Admin?
    admin = db.session.execute(select(AdminUser).where(
        AdminUser.name == current_identity)).scalar_one_or_none()
    if admin:
        return jsonify({
            "id": admin.id,
            "name": admin.name,
            "nickname": None,
            "email": admin.email,
            "role": "admin",
            "profile_image_url": None
        }), 200

    # Usuario normal
    user = db.session.execute(select(User).where(
        User.nickname == current_identity)).scalar_one_or_none()
    if user:
        return jsonify({
            "id": user.id,
            "name": user.nickname,
            "nickname": user.nickname,
            "email": user.email,
            "role": user.role or "user",
            "profile_image_url": user.profile_image_url
        }), 200

    return jsonify({"msg": "Token inválido o usuario no encontrado"}), 401

# ----------------------- Recommendations ------------------------- #
# Utilidades


def get_user_preferences(user_id):
    genre_prefs = UserGenrePreference.query.filter_by(user_id=user_id).all()
    preferred_genre_ids = [p.genre_id for p in genre_prefs]
    platform_prefs = UserPlatformPreference.query.filter_by(
        user_id=user_id).all()
    preferred_platform_ids = [p.platform_id for p in platform_prefs]
    return preferred_genre_ids, preferred_platform_ids


def get_user_excluded_games(user_id):
    favorites = UserGameFavorite.query.filter_by(user_id=user_id).all()
    favorite_game_ids = [f.game_id for f in favorites]
    non_favs = NonFavoriteGame.query.filter_by(user_id=user_id).all()
    non_fav_ids = [n.game_id for n in non_favs]
    return list(set(favorite_game_ids + non_fav_ids))


def get_user_excluded_rawg_games(user_id):
    """Obtiene IDs de RAWG de juegos que el usuario ya evaluó (favoritos + no-favoritos)"""
    try:
        excluded_rawg_ids = []

        favorites = db.session.execute(
            select(Game.rawg_id).select_from(
                UserGameFavorite.__table__.join(Game.__table__)
            ).where(
                UserGameFavorite.user_id == user_id,
                Game.rawg_id.isnot(None)
            )
        ).scalars().all()
        excluded_rawg_ids.extend([fav for fav in favorites if fav])

        non_favorites = db.session.execute(
            select(Game.rawg_id).select_from(
                NonFavoriteGame.__table__.join(Game.__table__)
            ).where(
                NonFavoriteGame.user_id == user_id,
                Game.rawg_id.isnot(None)
            )
        ).scalars().all()
        excluded_rawg_ids.extend(
            [non_fav for non_fav in non_favorites if non_fav])

        excluded_rawg_ids = list(set(excluded_rawg_ids))

        print(
            f"🔍 Usuario {user_id}: {len(excluded_rawg_ids)} juegos excluidos por RAWG ID")
        print(f"📋 IDs excluidos: {excluded_rawg_ids}")

        return excluded_rawg_ids

    except Exception as e:
        print(f"❌ Error obteniendo juegos excluidos: {e}")
        return []

# Contexto para RAWG (evita colisión de endpoint)


@api.route('/games/recommendations/context', methods=['GET'])
@jwt_required()
def get_game_recommendations_context():
    """Devuelve preferencias y exclusiones para que el frontend consulte RAWG."""
    try:
        current_user_identity = get_jwt_identity()
        user = db.session.execute(select(User).where(
            User.nickname == current_user_identity)).scalar_one_or_none()

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        preferred_genre_ids, preferred_platform_ids = get_user_preferences(
            user.id)
        excluded_rawg_ids = get_user_excluded_rawg_games(user.id)

        preferred_genres = []
        if preferred_genre_ids:
            genres = db.session.execute(
                select(Genre).where(Genre.id.in_(preferred_genre_ids))
            ).scalars().all()
            preferred_genres = [genre.name.lower() for genre in genres]

        preferred_platforms = []
        if preferred_platform_ids:
            platforms = db.session.execute(
                select(Platform).where(Platform.id.in_(preferred_platform_ids))
            ).scalars().all()
            preferred_platforms = [platform.name for platform in platforms]

        response_data = {
            "user_id": user.id,
            "preferred_genres": preferred_genres,
            "preferred_platforms": preferred_platforms,
            "excluded_rawg_ids": excluded_rawg_ids,
            "use_rawg": True
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"❌ Error al obtener preferencias: {str(e)}")
        return jsonify({"error": f"Error al obtener preferencias: {str(e)}"}), 500

# Recomendaciones locales (DB)
@api.route('/games/recommendations', methods=['GET'])
@jwt_required()
def get_game_recommendations():
    try:
        current_identity = get_jwt_identity()
        user = db.session.execute(select(User).where(
            User.nickname == current_identity)).scalar_one_or_none()
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        preferred_genre_ids, preferred_platform_ids = get_user_preferences(
            user.id)
        excluded_ids = get_user_excluded_games(user.id)

        query = Game.query
        if excluded_ids:
            query = query.filter(~Game.id.in_(excluded_ids))
        if preferred_genre_ids:
            query = query.join(GameGenre).filter(
                GameGenre.genre_id.in_(preferred_genre_ids))
        if preferred_platform_ids:
            query = query.join(GamePlatform).filter(
                GamePlatform.platform_id.in_(preferred_platform_ids))

        recommended = query.order_by(Game.rating.desc()).limit(25).all()

        if len(recommended) < 25:
            remaining = 25 - len(recommended)
            already = [g.id for g in recommended]
            excluded_ids = list(set(excluded_ids + already))
            extra = Game.query.filter(~Game.id.in_(excluded_ids)).order_by(
                Game.rating.desc()).limit(remaining).all()
            recommended.extend(extra)

        return jsonify([g.serialize() for g in recommended]), 200
    except Exception as e:
        return jsonify({"error": f"Error al generar recomendaciones: {str(e)}"}), 500

# ----------------------- Profile Image --------------------------- #

@api.route('/users/<int:user_id>/profile-image', methods=['PUT'])
@jwt_required()
def update_profile_image(user_id):
    current_identity = get_jwt_identity()
    user = db.session.execute(select(User).where(
        User.nickname == current_identity)).scalar_one_or_none()
    if user is None:
        return jsonify({"msg": "User not found"}), 404
    if user.id != user_id:
        return jsonify({"msg": "Unauthorized"}), 401

    if not request.content_type or not request.content_type.startswith("application/json"):
        return jsonify({"msg": "Unsupported Content-Type, expected application/json"}), 415

    data = request.get_json(silent=True) or {}
    profile_image_url = data.get("profile_image_url")
    if not profile_image_url:
        return jsonify({"msg": "No image URL provided"}), 400

    user.profile_image_url = profile_image_url
    db.session.commit()
    return jsonify({"msg": "Profile image updated successfully", "profile_image_url": user.profile_image_url}), 200
