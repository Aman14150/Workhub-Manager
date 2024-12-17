import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FaUser, FaUserLock } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Added icons
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slices/authSlice"; // Import the logout action
import { getInitials } from "../utils";
import axios from "axios";
import { toast } from 'sonner';

const UserAvatar = () => {
  const [open, setOpen] = useState(false); // For Profile Modal
  const [openPassword, setOpenPassword] = useState(false); // For Change Password Modal
  const [showOldPassword, setShowOldPassword] = useState(false); // For old password visibility
  const [showNewPassword, setShowNewPassword] = useState(false); // For new password visibility
  const { user } = useSelector((state) => state.auth); // Get user info from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      await axios.post("/api/user/logout"); // Call the logout endpoint
      dispatch(logout()); // Clear user from Redux
      toast.success("User Logged Out Successfully!");
      navigate("/login"); // Redirect to login
    } catch (error) {
      console.error("Logout failed:", error.response?.data?.message || error.message);
      toast.error("Failed logging out");
    }
  };


  const changePasswordHandler = async (e) => {
    e.preventDefault();
    const oldPassword = e.target.oldPassword.value;
    const newPassword = e.target.newPassword.value;
  
    try {
      const response = await axios.put("/api/user/change-password", {
        oldPassword,
        newPassword,
      });
      toast.success("Password changed successfully!"); // Show success toast
      setOpenPassword(false); // Close Change Password Modal
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password"); // Show error toast
    }
  }; 

  return (
    <>
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="w-10 h-10 2xl:w-12 2xl:h-12 items-center justify-center rounded-full bg-blue-600">
              <span className="text-white font-semibold">
                {getInitials(user?.name)}
              </span>
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-gray-100 rounded-md bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none">
              <div className="p-4">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setOpen(true)} // Open Profile Modal
                      className="text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-base"
                    >
                      <FaUser className="mr-2" aria-hidden="true" />
                      Profile
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setOpenPassword(true)} // Open Change Password Modal
                      className="text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-base"
                    >
                      <FaUserLock className="mr-2" aria-hidden="true" />
                      Change Password
                    </button>
                  )}
                </Menu.Item>

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logoutHandler} // Handle Logout
                      className="text-red-600 group flex w-full items-center rounded-md px-2 py-2 text-base"
                    >
                      <IoLogOutOutline className="mr-2" aria-hidden="true" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Profile Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h2 className="text-xl font-bold mb-4">User Profile</h2>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Mobile No:</strong> {user?.mobileNo || "Not Available"}</p>
            <p><strong>Title:</strong> {user?.title || "Not Available"}</p>
            <p><strong>Role:</strong> {user?.role || "Not Available"}</p>
            <p><strong>Password:</strong> {user?.password || "Not Available"}</p>
            <button
              onClick={() => setOpen(false)} // Close Profile Modal
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {openPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={changePasswordHandler}>
              <div className="mb-4 relative">
                <label className="block mb-1 text-gray-700">Old Password</label>
                <input
                  type={showOldPassword ? "text" : "password"} // Toggle type
                  name="oldPassword"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)} // Toggle visibility
                  className="absolute right-5 top-10 text-gray-600"
                >
                  {showOldPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </button>
              </div>
              <div className="mb-4 relative">
                <label className="block mb-1 text-gray-700">New Password</label>
                <input
                  type={showNewPassword ? "text" : "password"} // Toggle type
                  name="newPassword"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)} // Toggle visibility
                  className="absolute right-5 top-10 text-gray-600"
                >
                  {showNewPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpenPassword(false)} // Close Change Password Modal
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit" // Submit Change Password Form
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserAvatar;
