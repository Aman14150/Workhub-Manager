import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Menu, Transition } from "@headlessui/react";
import ConfirmatioDialog from "../Dialogs";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "sonner";


const TaskDialog = ({ task, setTasks }) => {
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);

  const { user } = useSelector((state) => state.auth); // Fetch user data from Redux
  const isAdmin = user?.isAdmin;

  const navigate = useNavigate();

  const deleteClicks = (id) => {
    setSelected(id);
    console.log("Deleting task with ID:", id);
    setOpenDialog(true);
  };

  const deleteHandler = async () => {
    try {
      await axios.put(`/api/task/${selected}`, { isTrashed: true }); // Mark task as trashed
  
      const updatedResponse = await axios.get('/api/task');
      setTasks(updatedResponse.data.tasks); 
      toast.success("Task has been moved to trash!");
      setOpenDialog(false);
    } catch (error) {
      toast.error("Error in deleting task.");
      console.error(error);
    }
  };
  
  const changeStage = async (newStage) => {
    try {
      const response = await axios.put(`/api/task/changestate/${task._id}/stage`, { stage: newStage });

      console.log("response",response)
      console.log("response.data",response.data.task)
  
      // Refetch tasks after stage update
      const updatedResponse = await axios.get('/api/task');
      console.log("updated response",updatedResponse)
      setTasks(updatedResponse.data.tasks); // Update state with new tasks

      toast.success(`Task stage changed to ${newStage}!`);
    } catch (error) {
      toast.error("Error in changing task stage.");
      console.error(error);
    }
  };
  
  const items = [
    {
      label: "Open Task",
      icon: <AiTwotoneFolderOpen className='mr-2 h-5 w-5' aria-hidden='true' />,
      onClick: () => navigate(`/task/${task._id}`),
      visibleTo: "all",
    },
    {
      label: "Change Stage",
      icon: null,
      onClick: null, // Dropdown handled separately
      visibleTo: "admin",
      dropdown: true,
    },
  ];

  const stageOptions = ["todo", "in progress", "completed"];

  return (
    <>
      <div>
        <Menu as='div' className='relative inline-block text-left'>
          <Menu.Button className='inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-600'>
            <BsThreeDots />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'>

            <Menu.Items className='absolute p-4 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'>
              <div className='px-1 py-1 space-y-2'>
                {items.map(
                  (el) =>
                    (isAdmin && el.visibleTo === "admin") || el.visibleTo === "all" ? (
                      <Menu.Item key={el.label}>
                        {el.dropdown ? (
                          <div>
                            <span className='block px-2 py-2 text-sm font-medium text-gray-900'>
                              {el.label}
                            </span>
                            <div className='ml-4'>
                              {stageOptions.map((stage) => (
                                <button
                                  key={stage}
                                  onClick={() => changeStage(stage)}
                                  className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200'>
                                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={el?.onClick}
                            className={`${
                              el.active ? "bg-blue-500 text-white" : "text-gray-900"
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                            {el.icon}
                            {el.label}
                          </button>
                        )}
                      </Menu.Item>
                    ) : null
                )}
              </div>

              {isAdmin && (
                <div className='px-1 py-1'>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => deleteClicks(task._id)}
                        className={`${
                          active ? "bg-blue-500 text-white" : "text-red-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                        <RiDeleteBin6Line className='mr-2 h-5 w-5 text-red-400' />
                        Delete
                      </button>
                    )}
                  </Menu.Item>
                </div>
              )}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* <AddTask open={openEdit} setOpen={setOpenEdit} task={task} key={new Date().getTime()} /> */}

      <ConfirmatioDialog open={openDialog} setOpen={setOpenDialog} onClick={deleteHandler} />
    </>
  );
};

export default TaskDialog;
