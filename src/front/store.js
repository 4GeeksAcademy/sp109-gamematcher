export const initialStore = () => {
  return {
    message: null,
    games: [],
    platforms: [],
    genres: [],
    users: [],
    gamePlatforms: [],
    gameGenres: [],
    userPlatformPreferences: [],
    userGenrePreferences: [],
    rawgGames: [],
    isAdminAuthenticated: false,
    adminToken: null,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    case "set_games":
      return {
        ...store,
        games: action.payload,
      };

    case "set_platforms":
      return {
        ...store,
        platforms: action.payload,
      };

    case "set_genres":
      return {
        ...store,
        genres: action.payload,
      };

    case "set_users":
      return {
        ...store,
        users: action.payload,
      };

    case "set_gamePlatforms":
      return {
        ...store,
        gamePlatforms: action.payload,
      };

    case "set_gameGenres":
      return {
        ...store,
        gameGenres: action.payload,
      };

    case "set_userPlatformPreferences":
      return {
        ...store,
        userPlatformPreferences: action.payload,
      };

    case "set_userGenrePreferences":
      return {
        ...store,
        userGenrePreferences: action.payload,
      };

    case "set_rawg_games":
      return {
        ...store,
        rawgGames: action.payload,
      };

    case "ADMIN_LOGIN":
      return {
        ...store,
        isAdminAuthenticated: true,
        adminToken: action.payload,
      };

    case "ADMIN_LOGOUT":
      return {
        ...store,
        isAdminAuthenticated: false,
        adminToken: null,
      };

    default:
      throw Error("Unknown action.");
  }
}

