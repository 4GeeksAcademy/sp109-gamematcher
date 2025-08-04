import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const UserPlatformPreferenceList = () => {
    const { store, dispatch } = useGlobalReducer();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [formData, setFormData] = useState({ user_id: "", platform_id: "" });
    const user = store.user;

    useEffect(() => {
        fetchPreferences();
        fetchUsers();
        fetchPlatforms();
    }, []);

    const fetchPreferences = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/user-platform-preferences`);
            const data = await res.json();
            dispatch({ type: "set_userPlatformPreferences", payload: data });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/users`);
            const data = await res.json();
            dispatch({ type: "set_users", payload: data });
        } catch (error) {
            console.error("Error loading users:", error);
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
            const res = await fetch(`${backendUrl}/api/user-platform-preferences/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                dispatch({
                    type: "set_userPlatformPreferences",
                    payload: store.userPlatformPreferences.filter((assoc) => assoc.id !== id),
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
        if (!formData.user_id || !formData.platform_id) return;

        try {
            const res = await fetch(`${backendUrl}/api/user-platform-preferences`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const newAssoc = await res.json();
                dispatch({
                    type: "set_userPlatformPreferences",
                    payload: [...store.userPlatformPreferences, newAssoc],
                });
                setFormData({ user_id: "", platform_id: "" });
            } else {
                const error = await res.json();
                alert(error.error || "Error creating association.");
            }
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        if (user && user.role !== "admin") {
            setFormData((prev) => ({ ...prev, user_id: user.id }));
        }
    }, [user]);

    return (
        <div className="container my-4">
            <h2 className="mb-4">User ↔ Platform Preferences</h2>

            <form className="row g-2 mb-4" onSubmit={handleSubmit}>
                <div className="col-md-5">
                    {user?.role !== "admin" ? (
                        <>
                            <div className="form-control my-2 bg-light">
                                {user?.name || user?.nickname || "Unknown user"}
                            </div>
                            <input type="hidden" name="user_id" value={user?.id} />
                        </>
                    ) : (
                        <select
                            name="user_id"
                            className="form-select"
                            value={formData.user_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a user</option>
                            {store.users?.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.nickname || u.name}
                                </option>
                            ))}
                        </select>
                    )}
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
                        <th>User</th>
                        <th>Platform</th>
                        <th className="text-center" style={{ width: "50px" }}></th>
                    </tr>
                </thead>
                <tbody>
                    {store.userPlatformPreferences?.length > 0 ? (
                        store.userPlatformPreferences.map((assoc) => (
                            <tr key={assoc.id}>
                                <td>{assoc.user?.nickname || assoc.user_nickname}</td>
                                <td>{assoc.platform?.name || assoc.platform_name}</td>
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
                                No preferences set.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserPlatformPreferenceList;