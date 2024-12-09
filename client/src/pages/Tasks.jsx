import React, { useState, useEffect } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useParams } from "react-router-dom";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import Tabs from "../components/Tabs";
import TaskTitle from "../components/TaskTitle";
import BoardView from "../components/BoardView";
import Table from "../components/task/Table";
import AddTask from "../components/task/AddTask";
import axios from "axios";
import { useSelector } from "react-redux"; // To fetch admin status from Redux

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const Tasks = () => {
  const params = useParams();

  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  
  const { user } = useSelector((state) => state.auth); // Fetch user data from Redux
  const isAdmin = user?.isAdmin; // Check admin status dynamically

  const handleAddTask = async (newTask) => {
    try {
      // Add the new task optimistically
      setTasks((prevTasks) => [...prevTasks, newTask]);
  
      // Optionally, refetch the tasks to ensure consistency
      await fetchTasks(); // Refetch tasks after adding the new task
    } catch (error) {
      console.error("Error adding task", error);
      // Optionally, show a toast notification
    }
  };

  const status = params?.status || "";

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/task");

      if (response.data.status) {
        let fetchedTasks = response.data.tasks;

        if (!isAdmin) {
          fetchedTasks = fetchedTasks.filter((task) =>
            task.team.some((member) => member._id === user._id)
          );
        }

        if (status) {
          fetchedTasks = fetchedTasks.filter((task) => task.stage === status);
        }

        setTasks(fetchedTasks);
      } else {
        alert("Failed to fetch tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [status]);

  return loading ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Title title={status ? `${status} Tasks` : "All Tasks"} />

        {isAdmin && ( // Button is only visible if user is admin
          <Button
            onClick={() => setOpen(true)}
            label="Create Task"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5"
          />
        )}
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {!status && (
          <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
            <TaskTitle label="To Do" className={TASK_TYPE.todo} />
            <TaskTitle label="In Progress" className={TASK_TYPE["in progress"]} />
            <TaskTitle label="Completed" className={TASK_TYPE.completed} />
          </div>
        )}

        {selected !== 1 ? (
          <BoardView tasks={tasks} />
        ) : (
          <div className="w-full">  
            <Table tasks={tasks} />
          </div>
        )}
      </Tabs>

      <AddTask open={open} setOpen={setOpen} handleAddTask={handleAddTask} />
    </div>
  );
};

export default Tasks;
