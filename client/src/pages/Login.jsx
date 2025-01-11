import React, { useEffect, useState } from "react"; // Added useState
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setCredentials } from "../redux/slices/authSlice";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Added icons
import { toast } from 'sonner';

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] = useState(false); // Added state for password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

  // Set default axios settings for cookies (for all requests)
  axios.defaults.withCredentials = true;

  const submitHandler = async (data) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/user/login`, data, { withCredentials: true });

      const user = response.data;
      dispatch(setCredentials(user)); // Update Redux state
  
      toast.success("Login Successful! Welcome to your Dashboard"); // Success toast
      navigate("/dashboard"); // Redirect to dashboard
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "An error occurred. Please try again."); // Error toast
    }
  };  

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-gradient-to-r from-yellow-400 to-white-800 bg-[length:400%_400%] animate-gradient">
      <div className="w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center">
        {/* Left side */}
        <div className="h-full w-full lg:w-2/3 flex flex-col items-center justify-center">
          <div className="w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20">
          <p className="flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-800">
              <span>WorkHub Manager</span>
            </p>
            <span className="flex gap-1 py-1 px-2 border rounded-full text-sm md:text-base border-gray-400 text-gray-700">
              <strong>Manage all your task in one place!</strong>
            </span>
            
            <div className="cell">
              <div className="circle rotate-in-up-left"></div>
            </div>
          </div>
        </div>
  
        {/* Right side */}
        <div className="w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center ">
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14"
          >
            <div>
              <p className="text-blue-700 text-3xl font-bold text-center">
                Welcome back!
              </p>
              <p className="text-center text-base text-gray-600">
                Keep all your credentials safe.
              </p>
            </div>
  
            <div className="flex flex-col gap-y-5">
              <Textbox
                placeholder="email@example.com"
                type="email"
                name="email"
                label="Email Address"
                className="w-full rounded-full"
                register={register("email", {
                  required: "Email Address is required!",
                })}
                error={errors.email ? errors.email.message : ""}
              />
  
              <div className="relative">
                <Textbox
                  placeholder="your password"
                  type={showPassword ? "text" : "password"} // Dynamically change type
                  name="password"
                  label="Password"
                  className="w-full rounded-full"
                  register={register("password", {
                    required: "Password is required!",
                  })}
                  error={errors.password ? errors.password.message : ""}
                />
                <button
                  type="button"
                  className="absolute right-4 top-10 text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </button>
              </div>
             {/*
              <span className="text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer">
                Forget Password?
              </span>
              */}
              <Button
                type="submit"
                label="Submit"
                className="w-full h-10 bg-blue-700 text-white rounded-full"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );  
};

export default Login;
