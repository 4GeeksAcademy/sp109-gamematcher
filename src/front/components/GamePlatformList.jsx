import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const GamePlatformList = () => {
    const { store, dispatch } = useGlobalReducer();

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [formData, setFormData] = useState({ game_id: "", platform_id: "" });

    useEffect(() => {
        fetchAssociations();
        fetchGames();
        fetchPlatforms();
    }, []);

    const fetchAssociations = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/game-platforms`);
            const data = await res.json();
            dispatch({ type: "set_gamePlatforms", payload: data });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchGames = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/games`);
            const data = await res.json();
            dispatch({ type: "set_games", payload: data });
        } catch (error) {
            console.error("Error loading games:", error);
        }
    };

    const fetchPlatforms = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/platforms`);
            const data = await res.json();
            dispatch({ type: "set_platforms", payload: data });
        } catch (error) {
            console.error("Error loading platforms:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${backendUrl}/api/game-platforms/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                dispatch({
                    type: "set_gamePlatforms",
                    payload: store.gamePlatforms.filter((assoc) => assoc.id !== id),
                });
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.game_id || !formData.platform_id) return;

        try {
            const res = await fetch(`${backendUrl}/api/game-platforms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const newAssoc = await res.json();
                dispatch({
                    type: "set_gamePlatforms",
                    payload: [...store.gamePlatforms, newAssoc],
                });
                setFormData({ game_id: "", platform_id: "" }); // reset form
            } else {
                const error = await res.json();
                alert(error.error || "Error creating association.");
            }
        } catch (error) {
            alert(error.message);
        }
    };


    return (
        <div className="container my-4">
            <h2 className="mb-4">Game ↔ Platform Associations</h2>

            <form className="row g-2 mb-4" onSubmit={handleSubmit}>
                <div className="col-md-5">
                    <select
                        name="game_id"
                        className="form-select"
                        value={formData.game_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a game</option>
                        {store.games?.map((game) => (
                            <option key={game.id} value={game.id}>
                                {game.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-5">
                    <select
                        name="platform_id"
                        className="form-select"
                        value={formData.platform_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a platform</option>
                        {store.platforms?.map((platform) => (
                            <option key={platform.id} value={platform.id}>
                                {platform.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-2 d-grid">
                    <button type="submit" className="btn btn-primary">
                        ➕ Add
                    </button>
                </div>
            </form>

            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Game</th>
                        <th>Platform</th>
                        <th className="text-center" style={{ width: "50px" }}></th>
                    </tr>
                </thead>
                <tbody>
                    {store.gamePlatforms?.length > 0 ? (
                        store.gamePlatforms.map((assoc) => (
                            <tr key={assoc.id}>
                                <td>{assoc.game?.name || assoc.game_id}</td>
                                <td>{assoc.platform?.name || assoc.platform_id}</td>
                                <td className="text-center">
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(assoc.id)}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center">
                                No associations yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default GamePlatformList;