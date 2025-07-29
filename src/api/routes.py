"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Game, Genre, Platform, AdminUser
from api.utils import generate_sitemap, APIException
from flask_cors import CORS


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


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

    new_game = Game(
        name=data["name"],
        description=data.get("description")
    )

    db.session.add(new_game)
    db.session.commit()

    return jsonify(new_game.serialize()), 201


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

# GET all admins
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
        name=data["name"]
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
