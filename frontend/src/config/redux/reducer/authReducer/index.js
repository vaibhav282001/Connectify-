import { createSlice } from "@reduxjs/toolkit";
import { getAboutUser, getAllUsers, getMyConnectionRequests, getConnetionRequest, loginUser, registerUser } from "../../action/authAction";
// or "@/config/redux/action/authAction";

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  isTokenThere: false,
  loggedIn: false,
  profileFetched: false,
  connections: [],
  connectionRequests: [],
  pendingSent: [],
  all_users: [],
  all_profiles_fetched: false
};

console.log("loginUser =", loginUser);
console.log("registerUser =", registerUser);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    handleLoginUser: (state) => {
      state.message = "Hello";
    },
    emptyMessage: (state) => {
      state.message = "";
      state.isError = false;
      state.isSuccess = false;
    },
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking on the server's door...";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.user = action.payload;
        state.message = "Login successful!";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.loggedIn = false;
        state.message = action.payload?.message || action.error.message;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering user...";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = false;
        state.message = "Registration is Successfull, Please Login...";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message =
          action.payload?.message ||
          action.error?.message ||
          "Registration failed";
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.user = action.payload.user;
      })
      .addCase(getAboutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.profileFetched = false;
        state.message = action.payload?.message || "Could not load profile";
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload.profiles;
      })
      .addCase(getConnetionRequest.fulfilled, (state, action) =>{
        state.connections = action.payload;
      })
      .addCase(getConnetionRequest.rejected, (state, action) =>{
        state.message = action.payload;
      })
      .addCase(getMyConnectionRequests.fulfilled, (state, action) =>{
        state.connectionRequests = action.payload.pendingReceived || [];
        state.pendingSent = action.payload.pendingSent || [];
        state.connections = action.payload.accepted || [];
      })
      .addCase(getMyConnectionRequests.rejected, (state, action) =>{
        state.message = action.payload;
      })

  },
});

export const { reset, emptyMessage, setTokenIsThere, setTokenIsNotThere } =
  authSlice.actions;
export default authSlice.reducer;
