import React, { useState, useEffect } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList";
import SelectList from "../SelectList";
import { BiImages } from "react-icons/bi";
import Button from "../Button";
import axios from "axios";
import { toast } from "sonner";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORIRY = ["HIGH", "MEDIUM", "NORMAL"];

const AddTask = ({ open, setOpen, task, handleAddTask, handleUpdateTask }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [assets, setAssets] = useState(task?.assets || []);
  const [team, setTeam] = useState(task?.team || []);
  const [stage, setStage] = useState(task?.stage || LISTS[0]);
  const [priority, setPriority] = useState(task?.priority?.toUpperCase() || PRIORIRY[2]);

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        date: task.date,
        priority: task.priority,
        team: task.team,
        assets: task.assets,
        taskstage: task.stage,
      });
    }
  }, [task, reset]);

  const submitHandler = async (data) => {
    try {
      const { title, date } = data;
  
      // Convert FileList to an array (if not already done)
      const files = Array.from(assets || []);
  
      // Prepare FormData
      const formData = new FormData();
      formData.append("title", title);
      formData.append("date", date);
      formData.append("team", JSON.stringify(team));
      formData.append("stage", stage);
      formData.append("priority", priority);
  
      files.forEach((file) => formData.append("assets", file));
  
      // Debug FormData
      console.log("FormData Entries: ");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
  
      let response;
      if (task?._id) {
        // Update Task
        response = await axios.put(`/api/task/update/${task._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("updated response",response) 
        console.log("updated response id",task?._id)
        handleUpdateTask(response.data.task);
        toast.success("Task updated successfully");
      } else {
        // Create Task
        response = await axios.post("/api/task/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        handleAddTask(response.data.task);
        toast.success("Task created successfully");
      }
  
      clearForm();
      setOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Failed to save task");
    }
  };
  
  

  const clearForm = () => {
    reset({
      title: "",
      date: "",
    });
    setAssets([]);
    setTeam([]);
    setStage(LISTS[0]);
    setPriority(PRIORIRY[2]);
  };
  

  // // Handle file uploads
  const handleSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(Boolean);
    setAssets((prevAssets) => [...prevAssets, ...selectedFiles]); // Append selected files
  };
  

  return (
    <ModalWrapper
      open={open}
      setOpen={(value) => {
        if (!value) clearForm(); // Clear the form when the modal is closed
        setOpen(value);
      }}
    >
      <form onSubmit={handleSubmit(submitHandler)}>
        <Dialog.Title
          as="h2"
          className="text-base font-bold leading-6 text-gray-900 mb-4"
        >
          {task?._id ? "Update Task" : "Add Task"}
        </Dialog.Title>

        <div className="mt-2 flex flex-col gap-6">
          <Textbox
            placeholder="Task Title"
            type="text"
            name="title"
            label="Task Title"
            className="w-full rounded"
            register={register("title", { required: "Title is required" })}
            error={errors.title ? errors.title.message : ""}
          />

          <UserList setTeam={setTeam} team={team} />

          <div className="flex gap-4">
            <SelectList
              label="Task Stage"
              lists={LISTS}
              selected={stage}
              setSelected={setStage}
            />

            <div className="w-full">
              <Textbox
                placeholder="Date"
                type="date"
                name="date"
                label="Due Date"
                className="w-full rounded"
                register={register("date", { required: "Date is required!" })}
                error={errors.date ? errors.date.message : ""}
              />
            </div>
          </div>

          <div className="flex gap-5">
            <SelectList
              label="Priority Level"
              lists={PRIORIRY}
              selected={priority}
              setSelected={setPriority}
            />

            <div className="w-full flex items-center justify-center mt-4">
              <label
                className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4"
                htmlFor="imgUpload"
              >
              <input
                type="file"
                className="hidden"
                id="imgUpload"
                {...register("assets")}
                onChange={(e) => handleSelect(e)}
                accept=".jpg,.png,.jpeg,.pdf,.doc,.docx,.xls,.xlsx"
                multiple={true}
              />


                <BiImages />
                <span>Add Assets</span>
              </label>
            </div>
          </div>

          {/* Display selected files (assets) */}
          {assets.length > 0 && (
            <div className="mt-4 flex flex-col gap-4">
              <h3 className="text-sm font-semibold">Selected Assets:</h3>
              <div className="flex flex-wrap gap-2">
                {assets.map((file, index) => (
                  <span
                    key={index}
                    className="text-sm text-gray-700 bg-gray-200 px-2 py-1 rounded"
                  >
                    {file.name}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="bg-gray-300 text-black px-4 py-2 text-sm rounded hover:bg-gray-600"
                onClick={() => setAssets([])} // Clear assets
              >
                Clear Assets
              </button>
            </div>
          )}

          <div className="bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4">
            <Button
              label={task?._id ? "Update" : "Create"}
              type="submit"
              className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
            />

            <Button
              type="button"
              className="bg-gray-300 px-5 text-sm font-semibold text-gray-900 sm:w-auto"
              onClick={() => {
                clearForm();
                setOpen(false);
              }}
              label="Cancel"
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddTask;

