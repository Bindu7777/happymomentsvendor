import React from "react";
import { InputText } from "primereact/inputtext";
import { useForm } from "react-hook-form";
import { Divider } from "primereact/divider";
import { auth } from "@/firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useUserStore } from "@/store/userStore";
import { useNavigate } from "react-router-dom";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

 const setUser = useUserStore((state) => state.setUser);
 const user = useUserStore((state) => state.user);
 const navigate = useNavigate();
  const onSubmit = async ({ username, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        username,
        password
      );
      console.log("✅ Login successful");
      setUser(userCredential.user);
      console.log(user);
      navigate("/");
    } catch (err) {
      console.log("errorrr", err.message);
      setError("username", {
        type: "manual",
        message: "Invalid username or password",
      });
      setError("password", {
        type: "manual",
        message: "Invalid username or password",
      });
    }
  };

  return (
    <div className="bg-[#E6E6FA] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl md:h-[96vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Image Section */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
            alt="Login visual"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Login Form */}
        <div className="flex-1 p-6 md:p-12 flex flex-col justify-start items-center bg-white">
          <img
            src="favicon.ico"
            alt="Happy Moments"
            className="w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 mb-4"
          />

          <div className="font-semibold text-2xl md:text-3xl mb-6 text-center w-full">
            Sign in
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
            {/* Username Field */}
            <div>
              <InputText
                id="username"
                {...register("username", {
                  required: "Username is required",
                })}
                placeholder="Username"
                className="w-full border border-black rounded-md p-3"
              />
              {errors.username && (
                <small className="text-red-500">{String(errors.username?.message)}</small>
              )}
            </div>

            {/* Password Field */}
            <div>
              <InputText
                id="password"
                type="password"
                {...register("password", {
                  required: "Password is required",
                })}
                placeholder="Password"
                className="w-full border border-black rounded-md p-3"
              />
              {errors.password && (
                <small className="text-red-500">{String(errors.password?.message)}</small>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="relative inline-flex items-center justify-center p-0.5 mt-2 mb-4 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
              >
                <span className="relative px-6 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                  Sign in
                </span>
              </button>
            </div>
          </form>

          <Divider className="w-full max-w-sm" />

          {/* Footer Links */}
          <div className="text-sm text-gray-500 space-x-2">
            <a href="#!" className="hover:underline">
              Terms of use
            </a>
            <span>|</span>
            <a href="#!" className="hover:underline">
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
