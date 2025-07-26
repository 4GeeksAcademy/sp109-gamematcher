"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Game
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
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
