import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import ModalWrapper from "./ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "./Textbox";
import Loading from "./Loader";
import Button from "./Button";
import axios from "axios";
import { BiShow, BiHide } from "react-icons/bi";
import { toast } from "sonner";

const EditUser = ({ open, setOpen, userData, handleEditUser }) => {
  const { user } = useSelector((state) => state.auth);
  const isLoading = false,
    isUpdating = false;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    if (userData) {
      reset({
        ...userData,
        password: "",
        isAdmin: userData.isAdmin || false,
      });
    }
  }, [userData, reset]);

  const [showPassword, setShowPassword] = useState(false);

  const handleOnSubmit = async (data) => {
    try {
      const payload = { ...data, _id: userData?._id };
      if (!data.password) delete payload.password; // Remove password if not updated

      const response = await axios.put(`/api/user/profile`, payload);

      if (response.status === 200 && response.data?.user) {
        toast.success(response.data.message || "User updated successfully!");

        // Extract updated user and pass to parent handler
        handleEditUser(response.data.user);

        setOpen(false); // Close modal
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "An error occurred!");
    }
  };

  const handleCancel = () => {
    reset();
    setOpen(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)} className="">
        <Dialog.Title as="h2" className="text-base font-bold leading-6 text-gray-900 mb-4">
          Update Profile
        </Dialog.Title>

        <div className="mt-2 flex flex-col gap-6">
          <Textbox
            placeholder="Full name"
            type="text"
            name="name"
            label="Full Name"
            className="w-full rounded"
            register={register("name", {
              required: "Full name is required!",
            })}
            error={errors.name ? errors.name.message : ""}
          />
          <Textbox
            placeholder="Title"
            type="text"
            name="title"
            label="Title"
            className="w-full rounded"
            register={register("title", {
              required: "Title is required!",
            })}
            error={errors.title ? errors.title.message : ""}
          />
          <Textbox
            placeholder="Email Address"
            type="email"
            name="email"
            label="Email Address"
            className="w-full rounded"
            register={register("email", {
              required: "Email Address is required!",
            })}
            error={errors.email ? errors.email.message : ""}
          />
          <Textbox
            placeholder="Mobile Number"
            type="text"
            name="mobileNo"
            label="Mobile Number"
            className="w-full rounded"
            register={register("mobileNo", {
              required: "Mobile number is required!",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Enter a valid 10-digit mobile number!",
              },
            })}
            error={errors.mobileNo ? errors.mobileNo.message : ""}
          />
          <div className="relative">
            <Textbox
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              label="Password"
              className="w-full rounded"
              register={register("password", {
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long!",
                },
              })}
              error={errors.password ? errors.password.message : ""}
            />
            <div
              className="absolute inset-y-0 right-3 mt-6 flex items-center cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <BiShow size={20} /> : <BiHide size={20} />}
            </div>
          </div>

          <Textbox
            placeholder="Role"
            type="text"
            name="role"
            label="Role"
            className="w-full rounded"
            register={register("role", {
              required: "User role is required!",
            })}
            error={errors.role ? errors.role.message : ""}
          />
        </div>

        {isLoading || isUpdating ? (
          <div className="py-5">
            <Loading />
          </div>
        ) : (
          <div className="py-3 mt-4 sm:flex sm:flex-row-reverse">
            <Button
              type="submit"
              className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
              label="Update"
            />
            <Button
              type="button"
              className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
              onClick={handleCancel}
              label="Cancel"
            />
          </div>
        )}
      </form>
    </ModalWrapper>
  );
};

export default EditUser;
