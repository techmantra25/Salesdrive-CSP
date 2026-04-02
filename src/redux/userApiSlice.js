import { apiSlice } from "./apiSlice";
import { BACKEND_URL, EMP_URL, USERS_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => ({
        url: BACKEND_URL + `${USERS_URL}/me`,
        method: "GET",
      }),
    }),
    getMeEmployee: builder.query({
      query: () => ({
        url: BACKEND_URL + `${EMP_URL}/profile`,
        method: "GET",
      }),
    }),
    login: builder.mutation({
      query: (data) => ({
        url: BACKEND_URL + `${USERS_URL}/login`,
        method: "POST",
        body: data,
      }),
    }),
    employeeLogin: builder.mutation({
      query: (data) => ({
        url: BACKEND_URL + `${EMP_URL}/login`,
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: BACKEND_URL + `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: BACKEND_URL + `${USERS_URL}/register`,
        method: "POST",
        body: data,
      }),
    }),
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: BACKEND_URL + `${USERS_URL}/update`,
        method: "PUT",
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: BACKEND_URL + `${USERS_URL}/forgot-password`,
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: BACKEND_URL + `${USERS_URL}/reset-password/${data.resetToken}`,
        method: "PATCH",
        body: data,
      }),
    }),
    getUserPermission: builder.query({

      query: (userId) => ({
        url: BACKEND_URL + `/api/v1/get-permissions/${userId}`,
        method: "GET",
      }),
    }),

  }),
});

export const {
  useGetMeQuery,
  useGetMeEmployeeQuery,
  useLoginMutation,
  useEmployeeLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useUpdateUserProfileMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLazyGetUserPermissionQuery
} = userApiSlice;
