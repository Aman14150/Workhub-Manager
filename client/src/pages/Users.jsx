import React, { useState, useEffect } from "react";
import axios from "axios";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import { getInitials } from "../utils";
import clsx from "clsx";
import ConfirmatioDialog, { UserAction } from "../components/Dialogs";
import AddUser from "../components/AddUser";
import { toast } from "sonner";

const Users = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]); // Store fetched users
  const [loading, setLoading] = useState(false); // Loading state for fetching

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/user/get-team");
        setUsers(response.data || []); 
      } catch (error) {
        console.error("Error fetching users:", error);
        alert(error.response?.data?.message || "Failed to fetch users!");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = (newUser) => {
    // Update the users state with the newly added user
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const userActionHandler = () => {};

  const deleteHandler = async () => {
    try {
      await axios.delete(`/api/user/${selected}`);
      setUsers((prevUsers) => prevUsers.filter(user => user._id !== selected));
      toast.success("User has been deleted!");
    } catch (error) {
      toast.error("Error deleting user.");
      console.error(error);
    } finally {
      setOpenDialog(false);
    }
  };

  const deleteClick = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const editClick = (el) => {
    setSelected(el);
    setOpen(true);
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Full Name</th>
        <th className="py-2">Title</th>
        <th className="py-2 ">Email</th>
        <th className="py-2">Role</th>
        <th className="py-2">Active</th>
        <th className="py-2 text-center">Action</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
      <td className="p-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-blue-700">
            <span className="text-xs md:text-sm text-center">
              {getInitials(user.name)}
            </span>
          </div>
          {user.name}
        </div>
      </td>

      <td className="p-2">{user.title}</td>
      <td className="p-2">{user.email || "user.emal.com"}</td>
      <td className="p-2">{user.role}</td>

      <td>
        <button
          className={clsx(
            "w-fit px-4 py-1 rounded-full",
            user?.isActive ? "bg-blue-200" : "bg-yellow-100"
          )}
        >
          {user?.isActive ? "Active" : "Inactive"}
        </button>
      </td>

      <td className="p-2 flex gap-4 justify-end">
        <Button
          className="text-blue-600 hover:text-blue-500 font-semibold sm:px-0"
          label="Edit"
          type="button"
          onClick={() => editClick(user)}
        />

        <Button
          className="text-red-700 hover:text-red-500 font-semibold sm:px-0"
          label="Delete"
          type="button"
          onClick={() => deleteClick(user?._id)}
        />
      </td>
    </tr>
  );

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6">
        <div className="flex items-center justify-between mb-8">
          <Title title="Team Members" />
          <Button
            label="Add New User"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md 2xl:py-2.5"
            onClick={() => setOpen(true)}
          />
        </div>

        <div className="bg-white px-2 md:px-4 py-4 shadow-md rounded">
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (
              <table className="w-full mb-5">
                <TableHeader />
                <tbody>
                  {users.map((user, index) => (
                    <TableRow key={index} user={user} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <AddUser
        open={open}
        setOpen={setOpen}
        userData={selected}
        handleAddUser={handleAddUser} // Pass callback to handle adding user
      />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />

      <UserAction
        open={openAction}
        setOpen={setOpenAction}
        onClick={userActionHandler}
      />
    </>
  );
};

export default Users;